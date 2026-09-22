import { describe, expect, it } from 'vitest';
import { runBacktest, DEFAULT_COSTS } from '../src/engine/engine.js';
import { generateBars } from '../src/scenarios/generator.js';
import { SCENARIOS, scenarioById } from '../src/scenarios/catalog.js';
import { naiveScalper } from '../src/strategies/naive-scalper.js';
import { smaTrend } from '../src/strategies/sma-trend.js';
import type { Bar, MarketView, Strategy, TradingApi } from '../src/types.js';

const frictionless = {
  ...DEFAULT_COSTS,
  takerFeeBps: 0,
  makerFeeBps: 0,
  baseSpreadBps: 0,
  spreadVolCoef: 0,
  impactCoef: 0,
  adverseSelectionBps: 0,
  borrowBpsPerDay: 0,
  latencyMs: 0,
  latencyJitterMs: 0,
};

function flatBars(n: number, price = 100): Bar[] {
  return Array.from({ length: n }, (_, i) => ({
    openTime: i * 60_000,
    closeTime: (i + 1) * 60_000,
    open: price,
    high: price,
    low: price,
    close: price,
    volume: 1_000_000,
  }));
}

function scripted(
  actions: Record<number, (view: MarketView, api: TradingApi) => void>,
): Strategy {
  let bar = 0;
  return {
    id: 'scripted',
    warmupBars: 0,
    onBar(view, api) {
      actions[bar]?.(view, api);
      bar++;
    },
  };
}

describe('exposure is bounded, always', () => {
  // Regression: a bracket used to survive a position flip and then add to the
  // new position every bar, which compounded into billions of units of notional.
  it('never lets gross exposure exceed the leverage limit, in any scenario', () => {
    for (const spec of SCENARIOS) {
      const bars = generateBars({ ...spec, bars: 1200 }, 2);
      const result = runBacktest(naiveScalper(), bars, {
        seed: 2,
        config: { maxLeverage: 3, costs: spec.costOverrides },
      });
      for (const point of result.equityCurve) {
        const gross = Math.abs(point.position) * point.price;
        // Equity can dip between the check and the fill, so allow a little slack
        // — but nothing like the unbounded growth this test was written for.
        expect(gross).toBeLessThan(Math.max(point.equity, 0) * 3 * 1.5 + 1_000);
      }
    }
  });

  it('keeps the trend strategy inside the same bound', () => {
    const bars = generateBars(
      { ...scenarioById('regime-flip'), bars: 2000 },
      1,
    );
    const result = runBacktest(smaTrend(), bars, {
      seed: 1,
      config: { maxLeverage: 2 },
    });
    const worst = Math.max(
      ...result.equityCurve.map(
        (p) => (Math.abs(p.position) * p.price) / Math.max(1, p.equity),
      ),
    );
    expect(worst).toBeLessThan(2 * 1.5);
  });
});

describe('reduce-only exits', () => {
  // Regression: a bracket exit and a strategy's own close could both fire on the
  // same bar; the second one opened an equal and opposite position.
  it('cannot reverse a position that is already flat', () => {
    const bars = flatBars(8);
    const result = runBacktest(
      scripted({
        1: (_view, api) => api.submit({ side: 'buy', qty: 10, type: 'market' }),
        // Two closes for one position. The second must do nothing.
        3: (_view, api) => api.closePosition('first'),
        4: (_view, api) =>
          api.submit({
            side: 'sell',
            qty: 10,
            type: 'market',
            reduceOnly: true,
            tag: 'second',
          }),
      }),
      bars,
      { config: { warmupBars: 0, costs: frictionless } },
    );

    expect(result.equityCurve.at(-1)!.position).toBe(0);
    const sells = result.fills.filter((f) => f.side === 'sell');
    expect(sells).toHaveLength(1);
    expect(result.rejections.length + sells.length).toBeLessThanOrEqual(2);
  });

  it('caps a reduce-only order at the size of the open position', () => {
    const bars = flatBars(8);
    const result = runBacktest(
      scripted({
        1: (_view, api) => api.submit({ side: 'buy', qty: 10, type: 'market' }),
        3: (_view, api) =>
          api.submit({
            side: 'sell',
            qty: 1000,
            type: 'market',
            reduceOnly: true,
          }),
      }),
      bars,
      { config: { warmupBars: 0, costs: frictionless } },
    );
    const sell = result.fills.find((f) => f.side === 'sell')!;
    expect(sell.qty).toBe(10);
    expect(result.equityCurve.at(-1)!.position).toBe(0);
  });
});

describe('stale brackets', () => {
  it('drops a bracket once the position it protected is gone', () => {
    // Long with a stop below, then flip short by hand. The old stop must not
    // fire against the new short position.
    const bars = flatBars(3, 100).concat(
      flatBars(6, 100).map((b, i) => ({
        ...b,
        openTime: (i + 3) * 60_000,
        closeTime: (i + 4) * 60_000,
        low: 90,
        high: 110,
      })),
    );
    const result = runBacktest(
      scripted({
        1: (_view, api) =>
          api.submit({
            side: 'buy',
            qty: 10,
            type: 'market',
            bracket: { stopLoss: 95 },
          }),
        2: (_view, api) =>
          api.submit({ side: 'sell', qty: 20, type: 'market' }),
      }),
      bars,
      { config: { warmupBars: 0, costs: frictionless } },
    );

    // Ends flat after the end-of-run liquidation, and never ran away.
    expect(result.equityCurve.at(-1)!.position).toBe(0);
    expect(
      Math.max(...result.equityCurve.map((p) => Math.abs(p.position))),
    ).toBeLessThanOrEqual(20);
  });
});
