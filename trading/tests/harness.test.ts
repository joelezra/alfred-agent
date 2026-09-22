import { describe, expect, it } from 'vitest';
import { runSuite } from '../src/harness/suite.js';
import { evaluateGates, DEFAULT_THRESHOLDS } from '../src/harness/gates.js';
import { renderJson, renderMarkdown } from '../src/harness/report.js';
import { costFloor } from '../src/harness/cost-floor.js';
import { generateBars } from '../src/scenarios/generator.js';
import { scenarioById, MINUTE, HOUR } from '../src/scenarios/catalog.js';
import { naiveScalper } from '../src/strategies/naive-scalper.js';
import { adaptiveTrend } from '../src/strategies/adaptive-trend.js';
import { smaTrend } from '../src/strategies/sma-trend.js';
import { walkForward } from '../src/harness/walkforward.js';

const QUICK = { seeds: [1, 2], bars: 1500 };

describe('the harness discriminates', () => {
  // The headline claim: this rejects a scalping strategy that would not work,
  // and does not reject everything.
  const scalper = evaluateGates(runSuite(naiveScalper, QUICK));
  const adaptive = evaluateGates(runSuite(adaptiveTrend, QUICK));

  it('rejects the naive scalper', () => {
    expect(scalper.passed).toBe(false);
    const failed = scalper.blockingFailures.map((g) => g.id);
    expect(failed).toContain('edge-vs-cost');
    expect(failed).toContain('net-positive');
    expect(failed.length).toBeGreaterThanOrEqual(4);
  });

  it('separates a considered strategy from a careless one on risk control', () => {
    expect(adaptive.blockingFailures.length).toBeLessThan(
      scalper.blockingFailures.length,
    );
    // The risk-control gates are the ones that hold at any sample size: a
    // strategy that sizes for risk and stands down clears them, one that does
    // not fails all three. `edge-vs-cost` is deliberately not asserted here —
    // it is a mean over trades, so at this reduced seed count and run length
    // it is noisy enough to flip. The full-defaults test below covers it.
    for (const id of ['drawdown', 'tail-risk', 'seed-stability']) {
      expect(scalper.blockingFailures.map((g) => g.id)).toContain(id);
      expect(adaptive.blockingFailures.map((g) => g.id)).not.toContain(id);
    }
  });

  it('passes the reference strategy at the catalogue defaults', () => {
    // Deterministic, and deliberately tied to the shipped defaults: if a change
    // to the costs, the scenarios or the gates makes this fail, the harness has
    // been recalibrated and someone should decide whether that was intended.
    // It clears the blocking gates but not the advisory ones — it is a
    // reference, not a recommendation.
    const verdict = evaluateGates(runSuite(adaptiveTrend));
    expect(verdict.passed).toBe(true);
    expect(verdict.advisoryFailures.length).toBeGreaterThan(0);
  });

  it('clears both of lookahead — losing money is not cheating', () => {
    for (const verdict of [scalper, adaptive]) {
      const gate = verdict.gates.find((g) => g.id === 'lookahead-clean')!;
      expect(gate.passed).toBe(true);
    }
  });

  it('produces a report that names what failed and why', () => {
    const suite = runSuite(naiveScalper, {
      ...QUICK,
      scenarioIds: ['chop-range', 'bull-trend'],
    });
    const markdown = renderMarkdown(suite, evaluateGates(suite));
    expect(markdown).toContain('# Harness report');
    expect(markdown).toContain('Raw edge clears the toll');
    expect(markdown).toContain('Cost floor');
    expect(() =>
      JSON.parse(renderJson(suite, evaluateGates(suite))),
    ).not.toThrow();
  });
});

describe('gate wiring', () => {
  // A gate set that can never pass is as useless as one that always passes.
  function syntheticSuite(good: boolean) {
    const stats = {
      totalReturn: good ? 0.2 : -0.2,
      periodSharpe: good ? 0.05 : -0.05,
      sharpe: good ? 4 : -4,
      maxDrawdown: good ? 0.1 : 0.6,
      trades: 40,
      grossEdgeBps: good ? 100 : 5,
      costPerTradeBps: 20,
      expectancyBps: good ? 80 : -15,
      avgBarsHeld: 50,
      skew: 0,
      excessKurtosis: 0,
    };
    const variant = (id: string) => ({
      variantId: id,
      medianReturn: stats.totalReturn,
      medianSharpe: stats.sharpe,
      medianExpectancyBps: stats.expectancyBps,
      medianGrossEdgeBps: stats.grossEdgeBps,
      medianCostPerTradeBps: stats.costPerTradeBps,
      medianMaxDrawdown: stats.maxDrawdown,
      medianTrades: stats.trades,
      medianBarsHeld: stats.avgBarsHeld,
      seeds: [{ seed: 1, stats: stats as never, returns: [] }],
    });
    return {
      strategyId: 'synthetic',
      scenarioIds: ['a'],
      seeds: [1],
      scenarios: [
        {
          scenarioId: 'a',
          description: '',
          breaks: '',
          variants: Object.fromEntries(
            [
              'baseline',
              'costs-2x',
              'costs-3x',
              'latency-slow',
              'capacity',
            ].map((id) => [id, variant(id)]),
          ),
        },
      ],
      audit: {
        clean: true,
        cutsTested: [],
        findings: [],
        guardViolations: [],
        shiftedPnlRatio: 0.9,
        timingFragile: false,
        notes: [],
      },
      costFloor: { horizons: [], shortestViableHorizon: 5 },
      totalBaselineTrades: 400,
      medianPeriodSharpe: stats.periodSharpe,
      sharpeDispersion: 0.005,
      medianObservations: 1500,
      medianSkew: 0,
      medianExcessKurtosis: 0,
      runCount: 1,
      elapsedMs: 1,
    } as never;
  }

  it('passes a strategy that is good on every axis', () => {
    const verdict = evaluateGates(syntheticSuite(true));
    expect(verdict.passed).toBe(true);
    expect(verdict.blockingFailures).toHaveLength(0);
  });

  it('fails one that is bad on every axis', () => {
    const verdict = evaluateGates(syntheticSuite(false));
    expect(verdict.passed).toBe(false);
    expect(verdict.blockingFailures.length).toBeGreaterThan(3);
  });

  it('exposes its thresholds for tightening', () => {
    const verdict = evaluateGates(syntheticSuite(true), {
      maxWorstDrawdown: 0.05,
    });
    expect(verdict.blockingFailures.map((g) => g.id)).toContain('drawdown');
    expect(DEFAULT_THRESHOLDS.maxWorstDrawdown).toBe(0.35);
  });
});

describe('cost floor', () => {
  it('rises as the bars get shorter, because costs do not', () => {
    const spec = scenarioById('regime-flip');
    const hourly = costFloor(
      generateBars({ ...spec, intervalMs: HOUR, bars: 2000 }, 1),
      { seed: 1 },
    );
    const minutely = costFloor(
      generateBars({ ...spec, intervalMs: MINUTE, bars: 2000 }, 1),
      { seed: 1 },
    );

    expect(hourly.shortestViableHorizon).not.toBeNull();
    // On one-minute bars the same market cannot pay for a fast round trip.
    expect(minutely.shortestViableHorizon ?? Infinity).toBeGreaterThan(
      hourly.shortestViableHorizon!,
    );
  });

  it('reports the horizon where perfect foresight starts to pay', () => {
    const bars = generateBars({ ...scenarioById('bull-trend'), bars: 1500 }, 1);
    const floor = costFloor(bars, { seed: 1 });
    const viable = floor.horizons.filter((h) => h.viable);
    expect(viable.length).toBeGreaterThan(0);
    for (const h of viable) expect(h.oracleExpectancyBps).toBeGreaterThan(0);
  });
});

describe('walk-forward', () => {
  it('scores each fold on data its parameters never saw', () => {
    const bars = generateBars(
      { ...scenarioById('regime-flip'), bars: 4000 },
      1,
    );
    const result = walkForward(smaTrend, bars, {
      grid: [
        { fast: 10, slow: 60 },
        { fast: 40, slow: 200 },
      ],
      folds: 3,
    });
    expect(result.folds.length).toBeGreaterThan(0);
    for (const fold of result.folds) {
      // Train and test windows must not overlap, or the score is in-sample.
      expect(fold.trainRange[1]).toBeLessThanOrEqual(fold.testRange[0]);
    }
    expect(result.trials).toBe(2 * result.folds.length);
  });

  it('refuses to report an efficiency ratio when the fit found nothing', () => {
    const flat = generateBars(
      { ...scenarioById('quiet-drift'), bars: 3000 },
      5,
    );
    const result = walkForward(smaTrend, flat, {
      grid: [{ fast: 20, slow: 100 }],
      folds: 3,
    });
    // The ratio is only ever reported when there was an in-sample result worth
    // dividing by. Asserted as an invariant so it holds whatever this draw does.
    expect(result.efficiency === null || result.meanInSample > 0.005).toBe(
      true,
    );
    expect(result.meanInSample <= 0.005 ? result.efficiency : 0).not.toBeNaN();
  });
});
