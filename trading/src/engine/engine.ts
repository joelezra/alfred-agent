import type {
  Bar,
  EngineConfig,
  Fill,
  Order,
  OrderRequest,
  Strategy,
  TradingApi,
  Trade,
  EquityPoint,
} from '../types.js';
import { Microstructure, VolatilityTracker } from '../market/microstructure.js';
import { SealedView } from '../guards/sealed-view.js';
import { Portfolio } from './portfolio.js';
import { Broker } from './broker.js';
import { createRng } from '../rng.js';

/** One line of the decision log, used by the lookahead audit. */
export interface Decision {
  barIndex: number;
  ts: number;
  side: string;
  qty: number;
  type: string;
  price: number;
}

export interface RunResult {
  strategyId: string;
  barCount: number;
  equityCurve: readonly EquityPoint[];
  trades: readonly Trade[];
  fills: readonly Fill[];
  decisions: readonly Decision[];
  rejections: readonly string[];
  finalEquity: number;
  initialCash: number;
  totalFees: number;
  totalSlippageCost: number;
  grossTraded: number;
  barIntervalMs: number;
}

const DAY_MS = 86_400_000;

export const DEFAULT_COSTS: EngineConfig['costs'] = {
  takerFeeBps: 5,
  makerFeeBps: 1,
  baseSpreadBps: 2,
  spreadVolCoef: 3,
  impactCoef: 8,
  adverseSelectionBps: 1.5,
  maxParticipation: 0.05,
  latencyMs: 250,
  latencyJitterMs: 150,
  borrowBpsPerDay: 2,
  tickSize: 0.01,
  requireTradeThrough: true,
};

export const DEFAULT_ENGINE: EngineConfig = {
  initialCash: 100_000,
  costs: DEFAULT_COSTS,
  allowShort: true,
  maxLeverage: 3,
  warmupBars: 50,
};

/** Engine settings with a partial cost model, merged over the defaults. */
export interface RunConfigOverrides extends Omit<
  Partial<EngineConfig>,
  'costs'
> {
  costs?: Partial<EngineConfig['costs']>;
}

export interface RunOptions {
  config?: RunConfigOverrides;
  seed?: number | string;
  params?: Record<string, number>;
  /** Extra decision-to-venue delay layered on top of the cost model, in ms. */
  extraLatencyMs?: number;
  /** Multiplies every explicit cost. Used by the cost-sensitivity gate. */
  costMultiplier?: number;
}

export function resolveConfig(options: RunOptions = {}): EngineConfig {
  const costs = {
    ...DEFAULT_COSTS,
    ...(options.config?.costs ?? {}),
  };
  const multiplier = options.costMultiplier ?? 1;
  if (multiplier !== 1) {
    costs.takerFeeBps *= multiplier;
    costs.makerFeeBps *= multiplier;
    costs.baseSpreadBps *= multiplier;
    costs.impactCoef *= multiplier;
    costs.adverseSelectionBps *= multiplier;
    costs.borrowBpsPerDay *= multiplier;
  }
  if (options.extraLatencyMs) costs.latencyMs += options.extraLatencyMs;
  return {
    ...DEFAULT_ENGINE,
    ...(options.config ?? {}),
    costs,
  };
}

/**
 * Event-driven replay: one bar at a time, forward only.
 *
 * This is the "plays history forward" harness and the backtester — they are the
 * same object. The strategy is handed a sealed view that physically cannot
 * reach past the current bar, and its orders are queued for the *next* bar.
 */
export function runBacktest(
  strategy: Strategy,
  bars: readonly Bar[],
  options: RunOptions = {},
): RunResult {
  if (bars.length < 2) throw new Error('a run needs at least two bars');

  const config = resolveConfig(options);
  const seed = options.seed ?? 1;
  const venueRng = createRng(seed, 'venue');
  const strategyRng = createRng(seed, 'strategy');

  const micro = new Microstructure(config.costs, venueRng);
  const portfolio = new Portfolio(config.initialCash);
  const broker = new Broker(micro, portfolio, {
    allowShort: config.allowShort,
    maxLeverage: config.maxLeverage,
  });
  const view = new SealedView(bars, {
    position: () => portfolio.snapshot(),
    equity: () => portfolio.equity(),
    cash: () => portfolio.cash,
  });
  const vol = new VolatilityTracker();
  const decisions: Decision[] = [];

  let currentBarIndex = 0;
  const api: TradingApi = {
    submit(request: OrderRequest): string {
      const bar = bars[currentBarIndex]!;
      decisions.push({
        barIndex: currentBarIndex,
        ts: bar.closeTime,
        side: request.side,
        qty: request.qty,
        type: request.type,
        price: request.limitPrice ?? request.stopPrice ?? bar.close,
      });
      return broker.submit(request, bar.closeTime, bar.close);
    },
    cancel: (id) => broker.cancel(id),
    cancelAll: () => broker.cancelAll(),
    workingOrders: (): readonly Order[] => broker.working(),
    closePosition(tag?: string): void {
      const qty = portfolio.qty;
      if (qty === 0) return;
      api.submit({
        side: qty > 0 ? 'sell' : 'buy',
        qty: Math.abs(qty),
        type: 'market',
        reduceOnly: true,
        tag: tag ?? 'close',
      });
    },
  };

  strategy.init?.({
    params: options.params ?? {},
    random: () => strategyRng.next(),
    log: () => {},
  });

  const warmup = Math.max(config.warmupBars, strategy.warmupBars ?? 0);
  const barIntervalMs = bars[1]!.closeTime - bars[0]!.closeTime;
  let lastFinancingDay = Math.floor(bars[0]!.closeTime / DAY_MS);

  for (let i = 0; i < bars.length; i++) {
    const bar = bars[i]!;
    currentBarIndex = i;

    // 1. Orders placed on earlier bars meet this bar.
    const fills = broker.processBar(bar, vol.ratio());

    // 2. Mark to market, then charge financing on anything held overnight.
    portfolio.mark(bar.close, bar.closeTime, i);
    const day = Math.floor(bar.closeTime / DAY_MS);
    if (day !== lastFinancingDay) {
      portfolio.chargeFinancing(
        config.costs.borrowBpsPerDay,
        day - lastFinancingDay,
      );
      lastFinancingDay = day;
    }

    if (strategy.onFill) for (const fill of fills) strategy.onFill(fill);

    // 3. Volatility is measured on bars that have already closed.
    if (i > 0) vol.push(bars[i - 1]!.close, bar.close);

    // 4. Only now does the strategy learn that this bar exists.
    view.seal(i + 1);
    if (i >= warmup && i < bars.length - 1) {
      strategy.onBar(view, api);
    }
  }

  const lastBar = bars[bars.length - 1]!;
  broker.cancelAll();
  broker.liquidate(lastBar, vol.ratio());
  portfolio.mark(lastBar.close, lastBar.closeTime, bars.length - 1);

  return {
    strategyId: strategy.id,
    barCount: bars.length,
    equityCurve: portfolio.equityCurve,
    trades: portfolio.trades,
    fills: broker.fills,
    decisions,
    rejections: broker.rejections,
    finalEquity: portfolio.equity(),
    initialCash: config.initialCash,
    totalFees: portfolio.totalFees,
    totalSlippageCost: portfolio.totalSlippageCost,
    grossTraded: portfolio.grossTraded,
    barIntervalMs,
  };
}
