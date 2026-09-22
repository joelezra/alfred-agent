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

/**
 * Wilder's RSI.
 *
 * Seeded with a simple average over the first `period` changes, then smoothed,
 * which is what every charting package means by "RSI(14)". The extra history is
 * there so the smoothing has converged by the time the value is used — read it
 * off a fresh window and it will not match the chart.
 */
export function rsi(view: MarketView, period = 14): number {
  const window = period * 6;
  const closes = view.closes(window + 1);
  if (closes.length < period + 2) return NaN;

  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const change = closes[i]! - closes[i - 1]!;
    if (change > 0) gains += change;
    else losses -= change;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i]! - closes[i - 1]!;
    avgGain = (avgGain * (period - 1) + Math.max(change, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-change, 0)) / period;
  }

  if (avgLoss === 0) return avgGain === 0 ? 50 : 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export interface BollingerBands {
  mid: number;
  upper: number;
  lower: number;
  /** (upper - lower) / mid. How wide the market currently is. */
  bandwidth: number;
  /** Where price sits in the channel: 0 at the lower band, 1 at the upper. */
  percentB: number;
}

function meanAndSd(values: readonly number[]): { mean: number; sd: number } {
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  // Population standard deviation, which is what Bollinger Bands use.
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / n;
  return { mean, sd: Math.sqrt(variance) };
}

export function bollinger(
  closes: readonly number[],
  period = 20,
  multiplier = 2,
): BollingerBands | null {
  if (closes.length < period) return null;
  const window = closes.slice(-period);
  const { mean, sd } = meanAndSd(window);
  const upper = mean + multiplier * sd;
  const lower = mean - multiplier * sd;
  const price = closes[closes.length - 1]!;
  const width = upper - lower;
  return {
    mid: mean,
    upper,
    lower,
    bandwidth: mean === 0 ? 0 : width / mean,
    percentB: width === 0 ? 0.5 : (price - lower) / width,
  };
}

/**
 * Where today's bandwidth sits against its own recent history, 0 to 1.
 *
 * This is the "is volatility extreme right now" question, asked in a way that
 * travels between instruments: an absolute bandwidth means nothing without
 * knowing what is normal for this market.
 *
 * Computed from prefix sums so the whole series costs one pass rather than one
 * per bar — the naive version dominates the runtime of a scenario sweep.
 */
export function bandwidthPercentile(
  closes: readonly number[],
  period = 20,
  multiplier = 2,
  lookback = 100,
): number {
  if (closes.length < period + lookback) return NaN;

  const n = closes.length;
  const sum = new Float64Array(n + 1);
  const sumSq = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) {
    sum[i + 1] = sum[i]! + closes[i]!;
    sumSq[i + 1] = sumSq[i]! + closes[i]! * closes[i]!;
  }

  const bandwidthAt = (end: number): number => {
    const start = end - period;
    const mean = (sum[end]! - sum[start]!) / period;
    const variance = (sumSq[end]! - sumSq[start]!) / period - mean * mean;
    const sd = Math.sqrt(Math.max(0, variance));
    return mean === 0 ? 0 : (2 * multiplier * sd) / mean;
  };

  const current = bandwidthAt(n);
  let below = 0;
  let counted = 0;
  for (let end = n - lookback; end < n; end++) {
    if (bandwidthAt(end) <= current) below++;
    counted++;
  }
  return counted === 0 ? NaN : below / counted;
}

/**
 * Wilder's ADX — trend strength without direction.
 *
 * The standard regime gate for mean reversion: below about 20 the market is
 * ranging and a band touch tends to revert; above 25 with bands expanding, the
 * same touch is more often the start of a breakout that will run you over.
 */
export function adx(view: MarketView, period = 14): number {
  const window = period * 5;
  if (view.length < window + 2) return NaN;

  const highs: number[] = [];
  const lows: number[] = [];
  const closes: number[] = [];
  for (let i = window; i >= 0; i--) {
    const bar = view.bar(i);
    highs.push(bar.high);
    lows.push(bar.low);
    closes.push(bar.close);
  }

  const trs: number[] = [];
  const plusDms: number[] = [];
  const minusDms: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    const upMove = highs[i]! - highs[i - 1]!;
    const downMove = lows[i - 1]! - lows[i]!;
    plusDms.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDms.push(downMove > upMove && downMove > 0 ? downMove : 0);
    trs.push(
      Math.max(
        highs[i]! - lows[i]!,
        Math.abs(highs[i]! - closes[i - 1]!),
        Math.abs(lows[i]! - closes[i - 1]!),
      ),
    );
  }
  if (trs.length < period * 2) return NaN;

  const wilder = (values: readonly number[]): number[] => {
    const out: number[] = [];
    let running = values.slice(0, period).reduce((a, b) => a + b, 0);
    out.push(running);
    for (let i = period; i < values.length; i++) {
      running = running - running / period + values[i]!;
      out.push(running);
    }
    return out;
  };

  const smoothedTr = wilder(trs);
  const smoothedPlus = wilder(plusDms);
  const smoothedMinus = wilder(minusDms);

  const dxs: number[] = [];
  for (let i = 0; i < smoothedTr.length; i++) {
    const tr = smoothedTr[i]!;
    if (tr === 0) continue;
    const plusDi = (100 * smoothedPlus[i]!) / tr;
    const minusDi = (100 * smoothedMinus[i]!) / tr;
    const total = plusDi + minusDi;
    if (total === 0) continue;
    dxs.push((100 * Math.abs(plusDi - minusDi)) / total);
  }
  if (dxs.length < period) return NaN;

  let value = dxs.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < dxs.length; i++) {
    value = (value * (period - 1) + dxs[i]!) / period;
  }
  return value;
}

export interface SwingPoint {
  /** How many closed bars ago the pivot printed. Never less than `strength`. */
  barsAgo: number;
  price: number;
}

/**
 * The most recent *confirmed* swing low or high.
 *
 * A swing point is only a swing point once the bars on its right have closed.
 * A pivot with strength 3 is knowable three bars after it printed, and no
 * sooner — anything that claims otherwise is labelling the past with the
 * future. That lag is not a defect to engineer away, it is the cost of an
 * objective definition, and it is why `barsAgo` is returned: a strategy acting
 * on a pivot is acting on something that already happened.
 */
export function lastSwing(
  view: MarketView,
  kind: 'low' | 'high',
  strength = 3,
  maxLookback = 60,
): SwingPoint | null {
  const needed = strength * 2 + 1;
  if (view.length < needed) return null;

  const limit = Math.min(maxLookback, view.length - strength - 1);
  for (let centre = strength; centre <= limit; centre++) {
    const pivot = view.bar(centre);
    const value = kind === 'low' ? pivot.low : pivot.high;
    let isPivot = true;

    for (let offset = 1; offset <= strength; offset++) {
      const before = view.bar(centre + offset);
      const after = view.bar(centre - offset);
      const beforeValue = kind === 'low' ? before.low : before.high;
      const afterValue = kind === 'low' ? after.low : after.high;
      const beaten =
        kind === 'low'
          ? beforeValue <= value || afterValue <= value
          : beforeValue >= value || afterValue >= value;
      if (beaten) {
        isPivot = false;
        break;
      }
    }

    if (isPivot) return { barsAgo: centre, price: value };
  }
  return null;
}
