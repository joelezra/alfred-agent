import type { MarketView } from '../types.js';

export function sma(values: readonly number[], period: number): number {
  if (values.length < period) return NaN;
  const slice = values.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

/** Average true range over the last `period` closed bars. */
export function atr(view: MarketView, period: number): number {
  if (view.length < period + 1) return NaN;
  let sum = 0;
  for (let i = 0; i < period; i++) {
    const current = view.bar(i);
    const previous = view.bar(i + 1);
    sum += Math.max(
      current.high - current.low,
      Math.abs(current.high - previous.close),
      Math.abs(current.low - previous.close),
    );
  }
  return sum / period;
}

/** Quantity that puts `fraction` of equity to work at `price`. */
export function sizeFor(
  equity: number,
  price: number,
  fraction: number,
): number {
  if (price <= 0) return 0;
  return Math.max(0, (equity * fraction) / price);
}
