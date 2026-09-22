/**
 * Core domain types for the trading centre.
 *
 * Everything here is deliberately small and explicit. The engine hands
 * strategies a *sealed* view of these types — never the raw arrays — so that
 * lookahead is impossible by construction rather than by convention.
 */

export type Millis = number;

/** A completed OHLCV bar. Only visible to a strategy once `closeTime` has passed. */
export interface Bar {
  openTime: Millis;
  closeTime: Millis;
  open: number;
  high: number;
  low: number;
  close: number;
  /** Base-asset volume traded during the bar. Caps how much we can realistically fill. */
  volume: number;
}

export type Side = 'buy' | 'sell';
export type OrderType = 'market' | 'limit' | 'stop';
export type OrderStatus =
  | 'pending'
  | 'working'
  | 'partial'
  | 'filled'
  | 'cancelled'
  | 'rejected';

export interface Bracket {
  /** Absolute price. Exits the position if touched. */
  stopLoss?: number;
  takeProfit?: number;
}

export interface OrderRequest {
  side: Side;
  /** Absolute quantity, always positive. Direction comes from `side`. */
  qty: number;
  type: OrderType;
  limitPrice?: number;
  stopPrice?: number;
  bracket?: Bracket;
  /** Auto-cancel after this many bars working. Defaults to `Infinity`. */
  expiresInBars?: number;
  /**
   * May only shrink the open position, never open or reverse one. Exits should
   * always set this: a close that arrives after the position is already flat
   * would otherwise open an equal and opposite one.
   */
  reduceOnly?: boolean;
  tag?: string;
}

export interface Order extends OrderRequest {
  id: string;
  /** Bar close at which the strategy decided. Never a price timestamp. */
  createdAt: Millis;
  /** `createdAt` + modelled latency. The order cannot interact before this. */
  eligibleAt: Millis;
  status: OrderStatus;
  filledQty: number;
  avgFillPrice: number;
  barsWorked: number;
  rejectReason?: string;
}

export interface Fill {
  orderId: string;
  ts: Millis;
  side: Side;
  qty: number;
  price: number;
  /** Absolute currency cost of commission for this fill. */
  fee: number;
  /** Signed distance from the reference price, in basis points. Always a cost. */
  slippageBps: number;
  tag?: string;
}

export interface PositionSnapshot {
  qty: number;
  avgPrice: number;
  /** Mark-to-market of the open position at the current close. */
  unrealizedPnl: number;
  realizedPnl: number;
}

/** A completed round trip, reconstructed from position changes. */
export interface Trade {
  entryTs: Millis;
  exitTs: Millis;
  side: Side;
  qty: number;
  entryPrice: number;
  exitPrice: number;
  /** P&L at the prices actually filled — spread and impact are already in it. */
  grossPnl: number;
  fees: number;
  /** Currency cost of spread, impact and adverse selection on both legs. */
  slippage: number;
  netPnl: number;
  /** Net return on the notional put at risk, in basis points. */
  netBps: number;
  barsHeld: number;
}

/**
 * Execution assumptions. Every field here is a way a backtest can lie, so they
 * are all mandatory and all applied on every fill.
 */
export interface CostModel {
  /** Commission for liquidity-taking orders, in bps of notional. */
  takerFeeBps: number;
  /** Commission for resting orders that get hit, in bps of notional. */
  makerFeeBps: number;
  /** Baseline half-spread is `baseSpreadBps / 2`. Crossing it is unavoidable. */
  baseSpreadBps: number;
  /** Spread widens with realised volatility: `base * (1 + coef * volRatio)`. */
  spreadVolCoef: number;
  /** Square-root market impact coefficient, in bps at full participation. */
  impactCoef: number;
  /**
   * Charged on every *resting* (maker) fill, in bps. Limit orders get filled
   * precisely when the market is about to run them over; without this term a
   * maker-side scalper looks free and the backtest is fiction.
   */
  adverseSelectionBps: number;
  /** Hard cap on the fraction of a bar's volume we are allowed to take. */
  maxParticipation: number;
  /** Decision-to-exchange delay. Orders cannot interact before `createdAt + this`. */
  latencyMs: number;
  /** Uniform jitter added to `latencyMs`, drawn from the venue RNG stream. */
  latencyJitterMs: number;
  /** Overnight financing on gross exposure, in bps per day. */
  borrowBpsPerDay: number;
  tickSize: number;
  /**
   * When true a limit order needs the bar to trade *through* its price by at
   * least one tick before it fills. Touch-fills are the single most common
   * source of fake backtest alpha.
   */
  requireTradeThrough: boolean;
}

export interface EngineConfig {
  initialCash: number;
  costs: CostModel;
  allowShort: boolean;
  /** Gross notional as a multiple of equity. Breaching it rejects the order. */
  maxLeverage: number;
  /** Bars the engine feeds the strategy before its orders are accepted. */
  warmupBars: number;
}

/** Read-only, point-in-time window over the data. Cannot reach past `now()`. */
export interface MarketView {
  /** Close time of the most recently closed bar. The strategy's "present". */
  now(): Millis;
  /** Number of bars that have closed so far. */
  readonly length: number;
  /** `bar(0)` is the most recently closed bar, `bar(1)` the one before it. */
  bar(offset?: number): Bar;
  closes(n: number): number[];
  highs(n: number): number[];
  lows(n: number): number[];
  volumes(n: number): number[];
  position(): PositionSnapshot;
  equity(): number;
  cash(): number;
}

export interface TradingApi {
  submit(request: OrderRequest): string;
  cancel(orderId: string): void;
  cancelAll(): void;
  workingOrders(): readonly Order[];
  /** Convenience: market order that flattens the current position. */
  closePosition(tag?: string): void;
}

export interface StrategyContext {
  params: Readonly<Record<string, number>>;
  /** A dedicated RNG stream. Strategies must never use `Math.random`. */
  random(): number;
  log(message: string): void;
}

export interface Strategy {
  readonly id: string;
  /** Bars of history the strategy needs before it can act. */
  readonly warmupBars?: number;
  init?(ctx: StrategyContext): void;
  onBar(view: MarketView, api: TradingApi): void;
  onFill?(fill: Fill): void;
}

export type StrategyFactory = (params?: Record<string, number>) => Strategy;

export interface EquityPoint {
  ts: Millis;
  equity: number;
  position: number;
  price: number;
}
