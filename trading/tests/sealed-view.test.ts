import { describe, expect, it } from 'vitest';
import { SealedView, LookaheadError } from '../src/guards/sealed-view.js';
import type { Bar } from '../src/types.js';

function bars(n: number): Bar[] {
  return Array.from({ length: n }, (_, i) => ({
    openTime: i * 60_000,
    closeTime: (i + 1) * 60_000,
    open: 100 + i,
    high: 101 + i,
    low: 99 + i,
    close: 100.5 + i,
    volume: 1000,
  }));
}

const account = {
  position: () => ({ qty: 0, avgPrice: 0, unrealizedPnl: 0, realizedPnl: 0 }),
  equity: () => 100_000,
  cash: () => 100_000,
};

describe('SealedView', () => {
  it('refuses to hand out a bar that has not closed', () => {
    const view = new SealedView(bars(10), account);
    view.seal(3);
    expect(view.length).toBe(3);
    expect(() => view.bar(-1)).toThrow(LookaheadError);
    expect(() => view.bar(3)).toThrow(LookaheadError);
  });

  it('indexes backwards from the most recent closed bar', () => {
    const series = bars(10);
    const view = new SealedView(series, account);
    view.seal(5);
    expect(view.bar(0)).toEqual(series[4]);
    expect(view.bar(4)).toEqual(series[0]);
    expect(view.now()).toBe(series[4]!.closeTime);
  });

  it('returns series oldest-first and never longer than the sealed window', () => {
    const view = new SealedView(bars(10), account);
    view.seal(3);
    const closes = view.closes(5);
    expect(closes).toHaveLength(3);
    expect(closes[0]).toBeLessThan(closes[2]!);
  });

  it('will not let the clock run backwards', () => {
    const view = new SealedView(bars(10), account);
    view.seal(5);
    expect(() => view.seal(4)).toThrow(LookaheadError);
  });

  it('throws before any bar has closed', () => {
    const view = new SealedView(bars(10), account);
    expect(() => view.now()).toThrow(LookaheadError);
  });
});
