import type { Bar } from '../types.js';
import { runBacktest, type RunOptions } from '../engine/engine.js';
import { computeStats } from '../metrics/stats.js';
import { oracle } from '../strategies/oracle.js';

export interface HorizonResult {
  horizonBars: number;
  /** Total return of a strategy that knows every future price, after costs. */
  oracleReturn: number;
  oracleExpectancyBps: number;
  costPerTradeBps: number;
  trades: number;
  viable: boolean;
}

export interface CostFloorResult {
  horizons: HorizonResult[];
  /** Shortest holding period at which perfect foresight still turns a profit. */
  shortestViableHorizon: number | null;
}

const DEFAULT_HORIZONS = [1, 2, 5, 10, 30, 60, 240];

/**
 * How fast can you trade this market before the costs eat everything?
 *
 * The answer does not depend on how clever the strategy is, so it cannot be
 * argued with. A perfect predictor is run at each holding period, paying the
 * same spread, fees, impact and latency as everyone else. The shortest horizon
 * it can still profit at is the floor: below it, no strategy works, however
 * good its signal, because the signal is worth less than the toll.
 *
 * This is the fastest honest way to turn down a scalping strategy.
 */
export function costFloor(
  bars: readonly Bar[],
  options: RunOptions & { horizons?: number[] } = {},
): CostFloorResult {
  const horizons = options.horizons ?? DEFAULT_HORIZONS;
  const results: HorizonResult[] = [];

  for (const horizon of horizons) {
    const result = runBacktest(oracle(bars, { horizon }), bars, options);
    const stats = computeStats(result);
    results.push({
      horizonBars: horizon,
      oracleReturn: stats.totalReturn,
      oracleExpectancyBps: stats.expectancyBps,
      costPerTradeBps: stats.costPerTradeBps,
      trades: stats.trades,
      viable: stats.expectancyBps > 0,
    });
  }

  const viable = results.find((r) => r.viable);
  return {
    horizons: results,
    shortestViableHorizon: viable ? viable.horizonBars : null,
  };
}
