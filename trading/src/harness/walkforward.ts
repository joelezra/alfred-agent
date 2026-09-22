import type { Bar, StrategyFactory } from '../types.js';
import { runBacktest, type RunOptions } from '../engine/engine.js';
import { computeStats } from '../metrics/stats.js';

export interface WalkForwardFold {
  fold: number;
  trainRange: [number, number];
  testRange: [number, number];
  chosenParams: Record<string, number>;
  inSampleReturn: number;
  outOfSampleReturn: number;
}

export interface WalkForwardResult {
  folds: WalkForwardFold[];
  meanInSample: number;
  meanOutOfSample: number;
  /**
   * Out-of-sample over in-sample. Below ~0.3 the fit is mostly to noise. Null
   * when in-sample is too close to zero for the ratio to mean anything — a
   * fitting process that found nothing cannot be graded on how well it held up.
   */
  efficiency: number | null;
  /** Share of folds that made money out of sample. */
  consistency: number;
  /** Parameter sets tried × folds — feed this to the deflated Sharpe as `trials`. */
  trials: number;
}

export interface WalkForwardOptions extends RunOptions {
  folds?: number;
  /** Share of each window used for fitting. The rest is untouched until scoring. */
  trainRatio?: number;
  /** Candidate parameter sets. Fitting means picking one of these on train data. */
  grid: Record<string, number>[];
}

/**
 * Rolling fit-then-test.
 *
 * This is the part a single backtest cannot do. Tuning a strategy on a history
 * and then reporting its performance on that same history measures how well you
 * tuned, not how well it works. Here each fold picks parameters on its training
 * window and is scored only on the window that follows — data the fit never saw.
 *
 * Read `efficiency`: if out-of-sample keeps a decent share of in-sample, the
 * parameters mean something. If it collapses, you fitted the noise.
 */
export function walkForward(
  factory: StrategyFactory,
  bars: readonly Bar[],
  options: WalkForwardOptions,
): WalkForwardResult {
  const foldCount = options.folds ?? 4;
  const trainRatio = options.trainRatio ?? 0.7;
  if (options.grid.length === 0)
    throw new Error('walk-forward needs at least one parameter set');

  const windowSize = Math.floor(bars.length / foldCount);
  if (windowSize < 200) throw new Error('not enough bars for this many folds');

  const folds: WalkForwardFold[] = [];

  for (let f = 0; f < foldCount; f++) {
    const start = f * windowSize;
    const end = start + windowSize;
    const split = start + Math.floor(windowSize * trainRatio);
    const train = bars.slice(start, split);
    const test = bars.slice(split, end);
    if (train.length < 100 || test.length < 50) continue;

    let best = { params: options.grid[0]!, score: -Infinity };
    for (const params of options.grid) {
      const result = runBacktest(factory(params), train, {
        ...options,
        params,
      });
      const score = computeStats(result).totalReturn;
      if (score > best.score) best = { params, score };
    }

    const oos = runBacktest(factory(best.params), test, {
      ...options,
      params: best.params,
    });
    folds.push({
      fold: f,
      trainRange: [start, split],
      testRange: [split, end],
      chosenParams: best.params,
      inSampleReturn: best.score,
      outOfSampleReturn: computeStats(oos).totalReturn,
    });
  }

  const meanInSample =
    folds.reduce((a, f) => a + f.inSampleReturn, 0) / Math.max(1, folds.length);
  const meanOutOfSample =
    folds.reduce((a, f) => a + f.outOfSampleReturn, 0) /
    Math.max(1, folds.length);

  return {
    folds,
    meanInSample,
    meanOutOfSample,
    efficiency: meanInSample <= 0.005 ? null : meanOutOfSample / meanInSample,
    consistency:
      folds.length === 0
        ? 0
        : folds.filter((f) => f.outOfSampleReturn > 0).length / folds.length,
    trials: options.grid.length * Math.max(1, folds.length),
  };
}
