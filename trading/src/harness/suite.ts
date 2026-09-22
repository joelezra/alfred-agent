import type { Bar, StrategyFactory } from '../types.js';
import {
  generateBars,
  validateBars,
  type ScenarioSpec,
} from '../scenarios/generator.js';
import { SCENARIOS, scenarioById } from '../scenarios/catalog.js';
import { runBacktest, type RunOptions } from '../engine/engine.js';
import {
  computeStats,
  periodReturns,
  type PerformanceStats,
} from '../metrics/stats.js';
import {
  auditLookahead,
  type LookaheadAuditResult,
} from '../guards/lookahead-audit.js';
import { costFloor, type CostFloorResult } from './cost-floor.js';

/** A named way of making life harder for the strategy. */
export interface StressVariant {
  id: string;
  description: string;
  options: RunOptions;
  /** Divides every bar's volume, shrinking how much of it we may take. */
  volumeDivisor?: number;
}

export const STRESS_VARIANTS: StressVariant[] = [
  {
    id: 'baseline',
    description: 'Costs and latency as configured.',
    options: {},
  },
  {
    id: 'costs-2x',
    description: 'Every explicit cost doubled.',
    options: { costMultiplier: 2 },
  },
  {
    id: 'costs-3x',
    description: 'Every explicit cost tripled.',
    options: { costMultiplier: 3 },
  },
  {
    id: 'latency-slow',
    description: 'One extra second between decision and fill.',
    options: { extraLatencyMs: 1000 },
  },
  {
    id: 'capacity',
    description: 'One tenth of the available volume, so size starts to hurt.',
    options: {},
    volumeDivisor: 10,
  },
];

export interface SeedOutcome {
  seed: number;
  stats: PerformanceStats;
  returns: number[];
}

export interface VariantOutcome {
  variantId: string;
  medianReturn: number;
  medianSharpe: number;
  medianExpectancyBps: number;
  medianGrossEdgeBps: number;
  medianCostPerTradeBps: number;
  medianMaxDrawdown: number;
  medianTrades: number;
  medianBarsHeld: number;
  seeds: SeedOutcome[];
}

export interface ScenarioOutcome {
  scenarioId: string;
  description: string;
  breaks: string;
  variants: Record<string, VariantOutcome>;
}

export interface SuiteResult {
  strategyId: string;
  scenarioIds: string[];
  seeds: number[];
  scenarios: ScenarioOutcome[];
  audit: LookaheadAuditResult;
  costFloor: CostFloorResult;
  /** Total round trips across every baseline run. Statistical power lives here. */
  totalBaselineTrades: number;
  /** Median per-bar Sharpe across baseline runs. */
  medianPeriodSharpe: number;
  /** Spread of per-bar Sharpe across baseline runs — how much luck moves it. */
  sharpeDispersion: number;
  /** Median return observations per baseline run. */
  medianObservations: number;
  medianSkew: number;
  medianExcessKurtosis: number;
  runCount: number;
  elapsedMs: number;
}

export function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1]! + sorted[mid]!) / 2
    : sorted[mid]!;
}

export function percentile(values: readonly number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.floor(p * (sorted.length - 1))),
  );
  return sorted[index]!;
}

function scaleVolume(bars: readonly Bar[], divisor: number): Bar[] {
  return bars.map((bar) => ({ ...bar, volume: bar.volume / divisor }));
}

function mergeOptions(
  scenario: ScenarioSpec,
  variant: StressVariant,
  base: RunOptions,
): RunOptions {
  return {
    ...base,
    ...variant.options,
    config: {
      ...(base.config ?? {}),
      ...(variant.options.config ?? {}),
      costs: {
        ...(base.config?.costs ?? {}),
        ...(scenario.costOverrides ?? {}),
        ...(variant.options.config?.costs ?? {}),
      },
    },
  };
}

export interface SuiteOptions extends RunOptions {
  seeds?: number[];
  scenarioIds?: string[];
  variants?: StressVariant[];
  /** Run the whole catalogue at this bar size instead of each scenario's default. */
  intervalMs?: number;
  /** Run the whole catalogue for this many bars instead of each scenario's default. */
  bars?: number;
}

/**
 * Run a strategy through the whole catalogue.
 *
 * Every scenario is generated fresh from its seed, so the strategy has never
 * seen this data and cannot have been fitted to it. Each one runs under every
 * stress variant, because a strategy that only survives at today's fee tier and
 * today's latency is a strategy that survives until Tuesday.
 */
export function runSuite(
  factory: StrategyFactory,
  options: SuiteOptions = {},
): SuiteResult {
  const started = Date.now();
  const seeds = options.seeds ?? [1, 2, 3];
  const catalogue = options.scenarioIds?.length
    ? options.scenarioIds.map(scenarioById)
    : SCENARIOS;
  const specs = catalogue.map((spec) => ({
    ...spec,
    intervalMs: options.intervalMs ?? spec.intervalMs,
    bars: options.bars ?? spec.bars,
  }));
  const variants = options.variants ?? STRESS_VARIANTS;

  const scenarios: ScenarioOutcome[] = [];
  const baselineRuns: SeedOutcome[] = [];
  let runCount = 0;

  for (const spec of specs) {
    const outcome: ScenarioOutcome = {
      scenarioId: spec.id,
      description: spec.description,
      breaks: spec.breaks,
      variants: {},
    };

    for (const variant of variants) {
      const seedOutcomes: SeedOutcome[] = [];
      for (const seed of seeds) {
        let bars = generateBars(spec, seed);
        if (variant.volumeDivisor)
          bars = scaleVolume(bars, variant.volumeDivisor);
        const result = runBacktest(factory(options.params), bars, {
          ...mergeOptions(spec, variant, options),
          seed,
        });
        runCount += 1;
        const stats = computeStats(result);
        const returns = periodReturns(result.equityCurve);
        seedOutcomes.push({ seed, stats, returns });
        if (variant.id === 'baseline')
          baselineRuns.push({ seed, stats, returns });
      }

      outcome.variants[variant.id] = {
        variantId: variant.id,
        medianReturn: median(seedOutcomes.map((s) => s.stats.totalReturn)),
        medianSharpe: median(seedOutcomes.map((s) => s.stats.sharpe)),
        medianExpectancyBps: median(
          seedOutcomes.map((s) => s.stats.expectancyBps),
        ),
        medianGrossEdgeBps: median(
          seedOutcomes.map((s) => s.stats.grossEdgeBps),
        ),
        medianCostPerTradeBps: median(
          seedOutcomes.map((s) => s.stats.costPerTradeBps),
        ),
        medianMaxDrawdown: median(seedOutcomes.map((s) => s.stats.maxDrawdown)),
        medianTrades: median(seedOutcomes.map((s) => s.stats.trades)),
        medianBarsHeld: median(seedOutcomes.map((s) => s.stats.avgBarsHeld)),
        seeds: seedOutcomes,
      };
    }

    scenarios.push(outcome);
  }

  // The audit runs on a regime-changing series, where a peeking strategy has
  // the most to gain and is therefore easiest to catch.
  const auditSpec = specs.find((s) => s.id === 'regime-flip') ?? specs[0]!;
  const auditBars = generateBars(auditSpec, seeds[0]!);
  validateBars(auditBars);
  const audit = auditLookahead(() => factory(options.params), auditBars, {
    ...options,
    seed: seeds[0],
  });
  runCount += 5;

  // What the market itself permits, before any strategy is considered.
  const floor = costFloor(auditBars, { ...options, seed: seeds[0] });
  runCount += floor.horizons.length;

  // Sharpe dispersion is estimated from the runs themselves rather than
  // assumed: it is exactly how much this strategy's Sharpe moves when nothing
  // changes but the draw, which is what the deflation needs to discount.
  const sharpes = baselineRuns.map((r) => r.stats.periodSharpe);
  const sharpeMean =
    sharpes.reduce((a, b) => a + b, 0) / Math.max(1, sharpes.length);
  const sharpeDispersion =
    sharpes.length < 2
      ? 0
      : Math.sqrt(
          sharpes.reduce((acc, x) => acc + (x - sharpeMean) ** 2, 0) /
            (sharpes.length - 1),
        );

  return {
    strategyId: factory(options.params).id,
    scenarioIds: specs.map((s) => s.id),
    seeds,
    scenarios,
    audit,
    costFloor: floor,
    totalBaselineTrades: baselineRuns.reduce((a, r) => a + r.stats.trades, 0),
    medianPeriodSharpe: median(sharpes),
    sharpeDispersion,
    medianObservations: median(baselineRuns.map((r) => r.returns.length)),
    medianSkew: median(baselineRuns.map((r) => r.stats.skew)),
    medianExcessKurtosis: median(
      baselineRuns.map((r) => r.stats.excessKurtosis),
    ),
    runCount,
    elapsedMs: Date.now() - started,
  };
}
