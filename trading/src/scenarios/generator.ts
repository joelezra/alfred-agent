import type { Bar, CostModel } from '../types.js';
import { createRng } from '../rng.js';

const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * One market regime. Chain several of them and the market changes character
 * part-way through a run, which is the thing a static backtest never tests.
 */
export interface RegimeSpec {
  label: string;
  /** Relative length. A run splits its bars between regimes by these weights. */
  weight: number;
  /** Annualised drift. */
  drift: number;
  /** Annualised volatility. */
  vol: number;
  /** Pull back toward a slow anchor each bar. 0 = random walk, 0.05 = tight range. */
  meanReversion: number;
  /** AR(1) coefficient on the trend component. ~0.98 trends, negative whipsaws. */
  momentum: number;
  /** Persistence of the volatility process. High values cluster volatility. */
  volPersistence: number;
  volOfVol: number;
  jumpProb: number;
  jumpMeanBps: number;
  jumpSdBps: number;
  /** Multiplier on baseline volume. Below 1 makes fills expensive. */
  liquidity: number;
}

export interface ScenarioSpec {
  id: string;
  description: string;
  /** Plain-English statement of what this scenario is built to expose. */
  breaks: string;
  bars: number;
  intervalMs: number;
  startPrice: number;
  baseVolume: number;
  regimes: RegimeSpec[];
  /** Venue conditions specific to this scenario (wide spreads, slow venue, ...). */
  costOverrides?: Partial<CostModel>;
}

export const BASE_REGIME: RegimeSpec = {
  label: 'neutral',
  weight: 1,
  drift: 0,
  vol: 0.5,
  meanReversion: 0,
  momentum: 0.9,
  volPersistence: 0.95,
  volOfVol: 0.25,
  jumpProb: 0,
  jumpMeanBps: 0,
  jumpSdBps: 0,
  liquidity: 1,
};

export function regime(overrides: Partial<RegimeSpec>): RegimeSpec {
  return { ...BASE_REGIME, ...overrides };
}

/** Sub-steps per bar. The intrabar path is what makes highs, lows and stops real. */
const SUB_STEPS = 12;

/**
 * Generate a bar series.
 *
 * Prices come from an intrabar random walk with mean reversion, a persistent
 * trend component, clustered volatility and jumps. OHLC is read off the path
 * rather than invented, so wicks, gaps and stop-outs behave the way they do on
 * a real chart. Same seed, same bars, always.
 */
export function generateBars(spec: ScenarioSpec, seed: number | string): Bar[] {
  const rng = createRng(seed, `market:${spec.id}`);
  const barsPerYear = YEAR_MS / spec.intervalMs;
  const totalWeight = spec.regimes.reduce((a, r) => a + r.weight, 0);

  const schedule: RegimeSpec[] = [];
  for (const r of spec.regimes) {
    const count = Math.max(1, Math.round((r.weight / totalWeight) * spec.bars));
    for (let i = 0; i < count; i++) schedule.push(r);
  }
  while (schedule.length < spec.bars)
    schedule.push(spec.regimes[spec.regimes.length - 1]!);
  schedule.length = spec.bars;

  const bars: Bar[] = [];
  let logPrice = Math.log(spec.startPrice);
  let anchor = logPrice;
  let trend = 0;
  let volState = 1;
  let startTime = Date.UTC(2024, 0, 1);

  for (let i = 0; i < spec.bars; i++) {
    const r = schedule[i]!;
    const sigmaBar = (r.vol / Math.sqrt(barsPerYear)) * volState;
    const muBar = r.drift / barsPerYear;

    // Trend is an AR(1) process, so momentum persists instead of flickering.
    trend =
      r.momentum * trend + (1 - Math.abs(r.momentum)) * sigmaBar * rng.normal();

    const open = Math.exp(logPrice);
    let high = open;
    let low = open;

    for (let s = 0; s < SUB_STEPS; s++) {
      const pull = -r.meanReversion * (logPrice - anchor);
      const step =
        (muBar + trend + pull) / SUB_STEPS +
        (sigmaBar / Math.sqrt(SUB_STEPS)) * rng.normal();
      logPrice += step;
      const px = Math.exp(logPrice);
      if (px > high) high = px;
      if (px < low) low = px;
    }

    if (r.jumpProb > 0 && rng.chance(r.jumpProb)) {
      const direction = rng.chance(0.5) ? 1 : -1;
      const size =
        (r.jumpMeanBps * direction + r.jumpSdBps * rng.normal()) / 10_000;
      logPrice += size;
      const px = Math.exp(logPrice);
      if (px > high) high = px;
      if (px < low) low = px;
    }

    const close = Math.exp(logPrice);
    anchor += 0.02 * (logPrice - anchor);

    // Log-AR(1) volatility: quiet stretches and violent stretches, like the real thing.
    volState = Math.exp(
      r.volPersistence * Math.log(volState) +
        (1 - r.volPersistence) * r.volOfVol * rng.normal(),
    );
    volState = Math.min(8, Math.max(0.15, volState));

    const move = Math.abs(close / open - 1);
    const volume =
      spec.baseVolume *
      r.liquidity *
      (0.6 + 2.5 * (move / Math.max(1e-9, sigmaBar))) *
      Math.exp(0.35 * rng.normal());

    bars.push({
      openTime: startTime,
      closeTime: startTime + spec.intervalMs,
      open,
      high: Math.max(high, open, close),
      low: Math.min(low, open, close),
      close,
      volume: Math.max(spec.baseVolume * 0.01, volume),
    });
    startTime += spec.intervalMs;
  }

  return bars;
}

/** Cheap integrity check. A feed that fails this cannot be backtested honestly. */
export function validateBars(bars: readonly Bar[]): void {
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i]!;
    if (![b.open, b.high, b.low, b.close, b.volume].every(Number.isFinite)) {
      throw new Error(`bar ${i} contains a non-finite value`);
    }
    if (
      b.high < Math.max(b.open, b.close) ||
      b.low > Math.min(b.open, b.close)
    ) {
      throw new Error(
        `bar ${i} has an OHLC range that cannot contain its own prices`,
      );
    }
    if (b.closeTime <= b.openTime)
      throw new Error(`bar ${i} closes before it opens`);
    if (i > 0 && b.openTime < bars[i - 1]!.closeTime) {
      throw new Error(`bar ${i} overlaps the previous bar`);
    }
  }
}
