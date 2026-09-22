import { describe, expect, it } from 'vitest';
import { runBacktest, DEFAULT_COSTS } from '../src/engine/engine.js';
import type { Bar, MarketView, Strategy, TradingApi } from '../src/types.js';

/** Bars built from explicit closes, with a configurable open for bar `gapAt`. */
function makeBars(closes: number[], overrides: Partial<Bar>[] = []): Bar[] {
  return closes.map((close, i) => ({
    openTime: i * 60_000,
    closeTime: (i + 1) * 60_000,
    open: i === 0 ? close : closes[i - 1]!,
    high: Math.max(close, i === 0 ? close : closes[i - 1]!),
    low: Math.min(close, i === 0 ? close : closes[i - 1]!),
    close,
    volume: 1_000_000,
    ...(overrides[i] ?? {}),
  }));
}

function once(
  action: (view: MarketView, api: TradingApi) => void,
  atBar: number,
): Strategy {
  let bar = 0;
  return {
    id: 'once',
    warmupBars: 0,
    onBar(view, api) {
      if (bar === atBar) action(view, api);
      bar++;
    },
  };
}

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

describe('next-bar execution', () => {
  it('never fills an order at the close of the bar that decided it', () => {
    // Bar 2 closes at 102. Bar 3 opens at 102 and closes at 500: if the engine
    // filled on the decision bar we would see ~102 either way, so the gap is
    // pushed into bar 3's *open* to make the difference unmissable.
    const bars = makeBars(
      [100, 101, 102, 500, 500, 500],
      [{}, {}, {}, { open: 480, low: 480, high: 520 }],
    );
    const result = runBacktest(
      once(
        (_view, api) => api.submit({ side: 'buy', qty: 10, type: 'market' }),
        2,
      ),
      bars,
      { config: { warmupBars: 0, costs: frictionless } },
    );

    const entry = result.fills[0]!;
    expect(entry.qty).toBe(10);
    expect(entry.price).toBeCloseTo(480, 6);
    expect(entry.price).not.toBeCloseTo(102, 2);
  });

  it('charges the spread, the fee and the impact on a round trip', () => {
    const bars = makeBars([100, 100, 100, 100, 100, 100]);
    const costs = {
      ...frictionless,
      takerFeeBps: 5,
      baseSpreadBps: 4,
      impactCoef: 0,
    };
    const result = runBacktest(
      once(
        (_view, api) => api.submit({ side: 'buy', qty: 100, type: 'market' }),
        1,
      ),
      bars,
      { config: { warmupBars: 0, costs } },
    );

    // Bought over the mid, sold under it, paid commission twice: strictly worse
    // than the 100 → 100 round trip the price series alone would suggest.
    expect(result.finalEquity).toBeLessThan(result.initialCash);
    const roundTripCost = result.initialCash - result.finalEquity;
    // 2 bps half-spread each way plus 5 bps fee each way, on 10,000 notional.
    expect(roundTripCost).toBeGreaterThan(10);
    expect(roundTripCost).toBeLessThan(20);
  });

  it('leaves equity untouched when the strategy does nothing', () => {
    const bars = makeBars([100, 110, 90, 120, 95, 105]);
    const result = runBacktest(
      { id: 'flat', warmupBars: 0, onBar: () => {} },
      bars,
      { config: { warmupBars: 0, costs: DEFAULT_COSTS } },
    );
    expect(result.finalEquity).toBe(result.initialCash);
    expect(result.trades).toHaveLength(0);
  });

  it('flattens any open position at the end of the run', () => {
    const bars = makeBars([100, 101, 102, 103, 104, 105]);
    const result = runBacktest(
      once(
        (_view, api) => api.submit({ side: 'buy', qty: 10, type: 'market' }),
        1,
      ),
      bars,
      { config: { warmupBars: 0, costs: frictionless } },
    );
    expect(result.fills.at(-1)!.tag).toBe('eod-flat');
    expect(result.equityCurve.at(-1)!.position).toBe(0);
  });
});

describe('order types', () => {
  it('requires a limit order to trade through its price, not merely touch it', () => {
    const touching = makeBars(
      [100, 100, 100, 100],
      [{}, {}, { low: 99.0, open: 100, high: 100 }],
    );
    const through = makeBars(
      [100, 100, 100, 100],
      [{}, {}, { low: 98.0, open: 100, high: 100 }],
    );
    const buyLimit = (limitPrice: number) =>
      once(
        (_view, api) =>
          api.submit({ side: 'buy', qty: 10, type: 'limit', limitPrice }),
        1,
      );

    const costs = { ...frictionless, tickSize: 0.5, requireTradeThrough: true };
    // Limit at 99.0: the touching bar reaches exactly 99.0 and stops there.
    const touched = runBacktest(buyLimit(99.0), touching, {
      config: { warmupBars: 0, costs },
    });
    const traded = runBacktest(buyLimit(99.0), through, {
      config: { warmupBars: 0, costs },
    });

    expect(touched.trades).toHaveLength(0);
    expect(traded.fills.length).toBeGreaterThan(0);
  });

  it('fills a stop at the gap rather than at the stop price', () => {
    const bars = makeBars(
      [100, 100, 100, 100],
      [{}, {}, { open: 120, low: 119, high: 125 }],
    );
    const result = runBacktest(
      once(
        (_view, api) =>
          api.submit({ side: 'buy', qty: 10, type: 'stop', stopPrice: 105 }),
        1,
      ),
      bars,
      { config: { warmupBars: 0, costs: frictionless } },
    );
    expect(result.fills[0]!.price).toBeCloseTo(120, 6);
  });

  it('caps a fill at the permitted share of the bar volume', () => {
    const bars = makeBars([100, 100, 100, 100, 100, 100]).map((b) => ({
      ...b,
      volume: 1000,
    }));
    const costs = { ...frictionless, maxParticipation: 0.05 };
    const result = runBacktest(
      once(
        (_view, api) => api.submit({ side: 'buy', qty: 500, type: 'market' }),
        1,
      ),
      bars,
      { config: { warmupBars: 0, costs } },
    );
    // 5% of 1000 is 50 units per bar, so a 500-unit order cannot clear at once.
    const entryFills = result.fills.filter((f) => f.side === 'buy');
    expect(entryFills.length).toBeGreaterThan(1);
    expect(Math.max(...entryFills.map((f) => f.qty))).toBeLessThanOrEqual(
      50 + 1e-9,
    );
  });

  it('rejects an order that would breach the leverage limit', () => {
    const bars = makeBars([100, 100, 100, 100]);
    const result = runBacktest(
      once(
        (_view, api) =>
          api.submit({ side: 'buy', qty: 100_000, type: 'market' }),
        1,
      ),
      bars,
      { config: { warmupBars: 0, costs: frictionless, maxLeverage: 2 } },
    );
    expect(result.rejections).toHaveLength(1);
    expect(result.rejections[0]).toContain('leverage');
    expect(result.trades).toHaveLength(0);
  });

  it('rejects a short when shorting is disabled', () => {
    const bars = makeBars([100, 100, 100, 100]);
    const result = runBacktest(
      once(
        (_view, api) => api.submit({ side: 'sell', qty: 10, type: 'market' }),
        1,
      ),
      bars,
      { config: { warmupBars: 0, costs: frictionless, allowShort: false } },
    );
    expect(result.rejections[0]).toContain('shorting is disabled');
  });
});

describe('latency', () => {
  it('drags a market fill further into the bar as latency grows', () => {
    const bars = makeBars(
      [100, 100, 100, 100],
      [{}, {}, { open: 100, close: 140, high: 140, low: 100 }],
    );
    // `once` keeps its own bar counter, so each run needs a fresh instance.
    const buy = () =>
      once(
        (_view, api) => api.submit({ side: 'buy', qty: 10, type: 'market' }),
        1,
      );

    const fast = runBacktest(buy(), bars, {
      config: { warmupBars: 0, costs: { ...frictionless, latencyMs: 0 } },
    });
    const slow = runBacktest(buy(), bars, {
      // Half a bar of delay on 60s bars.
      config: { warmupBars: 0, costs: { ...frictionless, latencyMs: 30_000 } },
    });

    expect(fast.fills[0]!.price).toBeCloseTo(100, 6);
    expect(slow.fills[0]!.price).toBeGreaterThan(fast.fills[0]!.price);
    expect(slow.fills[0]!.price).toBeCloseTo(120, 6);
  });
});
