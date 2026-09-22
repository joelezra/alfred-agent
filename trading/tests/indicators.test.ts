import { describe, expect, it } from 'vitest';
import {
  adx,
  bandwidthPercentile,
  bollinger,
  lastSwing,
  rsi,
} from '../src/strategies/indicators.js';
import { SealedView } from '../src/guards/sealed-view.js';
import type { Bar } from '../src/types.js';

const account = {
  position: () => ({ qty: 0, avgPrice: 0, unrealizedPnl: 0, realizedPnl: 0 }),
  equity: () => 100_000,
  cash: () => 100_000,
};

/** Build a view over bars derived from a close series. */
function viewOf(
  closes: number[],
  shape?: (i: number, close: number) => Partial<Bar>,
): SealedView {
  const bars: Bar[] = closes.map((close, i) => ({
    openTime: i * 3_600_000,
    closeTime: (i + 1) * 3_600_000,
    open: i === 0 ? close : closes[i - 1]!,
    high: Math.max(close, i === 0 ? close : closes[i - 1]!),
    low: Math.min(close, i === 0 ? close : closes[i - 1]!),
    close,
    volume: 1000,
    ...(shape?.(i, close) ?? {}),
  }));
  const view = new SealedView(bars, account);
  view.seal(bars.length);
  return view;
}

describe('RSI', () => {
  it('is 100 when every bar closes higher', () => {
    const view = viewOf(Array.from({ length: 120 }, (_, i) => 100 + i));
    expect(rsi(view, 14)).toBeCloseTo(100, 6);
  });

  it('is 0 when every bar closes lower', () => {
    const view = viewOf(Array.from({ length: 120 }, (_, i) => 300 - i));
    expect(rsi(view, 14)).toBeCloseTo(0, 6);
  });

  it('is 50 on a flat series', () => {
    const view = viewOf(new Array(120).fill(100));
    expect(rsi(view, 14)).toBe(50);
  });

  it('falls below 30 after a sharp sell-off and recovers above it', () => {
    const rising = Array.from({ length: 100 }, (_, i) => 100 + i * 0.1);
    const selloff = Array.from({ length: 12 }, (_, i) => 110 - (i + 1) * 1.2);
    const oversold = rsi(viewOf([...rising, ...selloff]), 14);
    expect(oversold).toBeLessThan(30);

    const rebound = Array.from({ length: 14 }, (_, i) => 95.6 + (i + 1) * 1.0);
    expect(
      rsi(viewOf([...rising, ...selloff, ...rebound]), 14),
    ).toBeGreaterThan(oversold + 20);
  });

  it('needs history before it reports anything', () => {
    expect(rsi(viewOf([100, 101, 102]), 14)).toBeNaN();
  });
});

describe('Bollinger bands', () => {
  it('centres on the simple moving average with symmetric bands', () => {
    const closes = Array.from({ length: 20 }, (_, i) => i + 1);
    const bands = bollinger(closes, 20, 2)!;
    expect(bands.mid).toBeCloseTo(10.5, 10);
    // Population sd of 1..20 is sqrt(33.25).
    const sd = Math.sqrt(33.25);
    expect(bands.upper).toBeCloseTo(10.5 + 2 * sd, 10);
    expect(bands.lower).toBeCloseTo(10.5 - 2 * sd, 10);
    expect(bands.upper - bands.mid).toBeCloseTo(bands.mid - bands.lower, 10);
  });

  it('reports %B as the position of price inside the channel', () => {
    const flat = bollinger(new Array(20).fill(100), 20, 2)!;
    // Zero dispersion: price is exactly at the middle, and %B is defined, not NaN.
    expect(flat.percentB).toBe(0.5);
    expect(flat.bandwidth).toBe(0);

    const closes = [...new Array(19).fill(100), 110];
    const stretched = bollinger(closes, 20, 2)!;
    expect(stretched.percentB).toBeGreaterThan(0.9);
    expect(stretched.bandwidth).toBeGreaterThan(0);
  });

  it('returns null before it has a full window', () => {
    expect(bollinger([1, 2, 3], 20, 2)).toBeNull();
  });
});

describe('bandwidth percentile', () => {
  it('ranks a volatility expansion near the top of its own history', () => {
    const calm = Array.from(
      { length: 200 },
      (_, i) => 100 + Math.sin(i / 5) * 0.2,
    );
    const expansion = Array.from(
      { length: 20 },
      (_, i) => 100 + Math.sin(i / 2) * 8,
    );
    expect(
      bandwidthPercentile([...calm, ...expansion], 20, 2, 100),
    ).toBeGreaterThan(0.9);
  });

  it('ranks a compression near the bottom', () => {
    const noisy = Array.from(
      { length: 200 },
      (_, i) => 100 + Math.sin(i / 2) * 5,
    );
    const squeeze = new Array(25).fill(100);
    expect(
      bandwidthPercentile([...noisy, ...squeeze], 20, 2, 100),
    ).toBeLessThan(0.15);
  });

  it('matches a direct computation of the same series', () => {
    const closes = Array.from(
      { length: 200 },
      (_, i) => 100 + Math.sin(i / 7) * 3 + i * 0.01,
    );
    const fast = bandwidthPercentile(closes, 20, 2, 50);

    const widths: number[] = [];
    for (let end = closes.length - 50; end <= closes.length; end++) {
      widths.push(bollinger(closes.slice(0, end), 20, 2)!.bandwidth);
    }
    const current = widths.pop()!;
    const slow = widths.filter((w) => w <= current).length / widths.length;
    expect(fast).toBeCloseTo(slow, 10);
  });
});

describe('ADX', () => {
  it('reads high in a clean trend and low in a range', () => {
    const trend = viewOf(Array.from({ length: 150 }, (_, i) => 100 + i * 0.5));
    const range = viewOf(
      Array.from({ length: 150 }, (_, i) => 100 + Math.sin(i / 2) * 2),
    );
    expect(adx(trend, 14)).toBeGreaterThan(40);
    expect(adx(range, 14)).toBeLessThan(30);
    expect(adx(trend, 14)).toBeGreaterThan(adx(range, 14));
  });

  it('needs history before it reports anything', () => {
    expect(adx(viewOf([100, 101, 102, 103]), 14)).toBeNaN();
  });
});

describe('swing pivots', () => {
  // Bars whose highs and lows track the close exactly, so a V has one
  // unambiguous low rather than a tie on either side of it.
  const clean = (closes: number[]) =>
    viewOf(closes, (_i, close) => ({
      open: close,
      high: close + 0.5,
      low: close - 0.5,
    }));

  // Down to 100 at index 10, then back up. 21 bars, so the pivot is 10 back.
  const vShape = [
    ...Array.from({ length: 11 }, (_, i) => 110 - i),
    ...Array.from({ length: 10 }, (_, i) => 101 + i),
  ];

  it('finds a confirmed low and reports how long ago it printed', () => {
    const swing = lastSwing(clean(vShape), 'low', 3)!;
    expect(swing).not.toBeNull();
    expect(swing.barsAgo).toBe(10);
    expect(swing.price).toBeCloseTo(99.5, 6);
  });

  it('will not report a pivot that the right-hand bars have not confirmed yet', () => {
    // The lowest low is the final bar. It cannot be a confirmed swing low,
    // because the bars that would confirm it have not happened.
    const closes = [...Array.from({ length: 20 }, (_, i) => 110 - i * 0.1), 50];
    const swing = lastSwing(clean(closes), 'low', 3);
    expect(swing?.barsAgo ?? Infinity).toBeGreaterThanOrEqual(3);
    if (swing) expect(swing.price).toBeGreaterThan(100);
  });

  it('never returns a pivot closer than its own strength', () => {
    for (const strength of [1, 2, 3, 5, 8]) {
      const swing = lastSwing(clean(vShape), 'low', strength);
      if (swing) expect(swing.barsAgo).toBeGreaterThanOrEqual(strength);
    }
  });

  it('returns null when the series is too short to confirm anything', () => {
    // Needs 2 * strength + 1 bars before a pivot can exist at all.
    expect(lastSwing(clean(vShape), 'low', 11)).toBeNull();
  });

  it('finds swing highs as the mirror image', () => {
    const inverted = [
      ...Array.from({ length: 11 }, (_, i) => 100 + i),
      ...Array.from({ length: 10 }, (_, i) => 109 - i),
    ];
    const swing = lastSwing(clean(inverted), 'high', 3)!;
    expect(swing.barsAgo).toBe(10);
    expect(swing.price).toBeCloseTo(110.5, 6);
  });

  it('returns null when nothing qualifies', () => {
    const monotonic = Array.from({ length: 40 }, (_, i) => 100 + i);
    expect(lastSwing(clean(monotonic), 'low', 3)).toBeNull();
  });
});
