import { deflatedSharpe } from '../metrics/deflated.js';
import {
  median,
  percentile,
  type SuiteResult,
  type VariantOutcome,
} from './suite.js';

export type GateSeverity = 'blocking' | 'advisory';

export interface GateResult {
  id: string;
  title: string;
  severity: GateSeverity;
  passed: boolean;
  observed: string;
  threshold: string;
  /** Why this gate exists, in one sentence. */
  rationale: string;
}

export interface Verdict {
  strategyId: string;
  passed: boolean;
  gates: GateResult[];
  blockingFailures: GateResult[];
  advisoryFailures: GateResult[];
  summary: string;
}

export interface GateThresholds {
  /** Round trips pooled across every baseline run. */
  minTotalTrades: number;
  /** Minimum round trips in the median scenario, so power is not all from one. */
  minMedianTrades: number;
  minScenarioBreadth: number;
  maxWorstDrawdown: number;
  minWorstScenarioReturn: number;
  /** Raw edge must be at least this multiple of the round-trip toll. */
  minEdgeToCostRatio: number;
  minSeedTailReturn: number;
  minDeflatedSharpe: number;
  /** How many strategy variants were tried before this one. Be honest. */
  trials: number;
  /** Override for the Sharpe spread; by default the suite's own is used. */
  sharpeDispersion?: number;
}

export const DEFAULT_THRESHOLDS: GateThresholds = {
  minTotalTrades: 200,
  minMedianTrades: 8,
  minScenarioBreadth: 0.5,
  maxWorstDrawdown: 0.35,
  minWorstScenarioReturn: -0.25,
  minEdgeToCostRatio: 2,
  minSeedTailReturn: -0.2,
  minDeflatedSharpe: 0.95,
  trials: 20,
};

const pct = (x: number): string => `${(x * 100).toFixed(2)}%`;
const bps = (x: number): string => `${x.toFixed(2)}bps`;

function variants(suite: SuiteResult, id: string): VariantOutcome[] {
  return suite.scenarios
    .map((scenario) => scenario.variants[id])
    .filter((v): v is VariantOutcome => v !== undefined);
}

function medianReturnOf(suite: SuiteResult, variantId: string): number {
  return median(variants(suite, variantId).map((v) => v.medianReturn));
}

/**
 * Turn a pile of numbers into a decision.
 *
 * Blocking gates are the ones where failure means "do not run this with money".
 * Advisory gates are where failure means "you have been warned". The split
 * matters: a harness that flags everything is a harness people learn to ignore.
 */
export function evaluateGates(
  suite: SuiteResult,
  overrides: Partial<GateThresholds> = {},
): Verdict {
  const t = { ...DEFAULT_THRESHOLDS, ...overrides };
  const baseline = variants(suite, 'baseline');
  const gates: GateResult[] = [];

  const medianTrades = median(baseline.map((v) => v.medianTrades));
  const positiveScenarios = baseline.filter((v) => v.medianReturn > 0).length;
  const breadth =
    baseline.length === 0 ? 0 : positiveScenarios / baseline.length;
  const worstReturn = Math.min(...baseline.map((v) => v.medianReturn));
  const worstDrawdown = Math.max(...baseline.map((v) => v.medianMaxDrawdown));
  const grossEdge = median(baseline.map((v) => v.medianGrossEdgeBps));
  const perTradeCost = median(baseline.map((v) => v.medianCostPerTradeBps));
  const edgeRatio = perTradeCost <= 0 ? Infinity : grossEdge / perTradeCost;
  const seedReturns = baseline.flatMap((v) =>
    v.seeds.map((s) => s.stats.totalReturn),
  );
  const seedTail = percentile(seedReturns, 0.2);

  const dsr = deflatedSharpe({
    periodSharpe: suite.medianPeriodSharpe,
    observations: suite.medianObservations,
    skew: suite.medianSkew,
    excessKurtosis: suite.medianExcessKurtosis,
    trials: t.trials,
    sharpeDispersion: t.sharpeDispersion ?? suite.sharpeDispersion,
  });

  gates.push({
    id: 'lookahead-clean',
    title: 'Cannot see the future',
    severity: 'blocking',
    passed:
      suite.audit.findings.length === 0 &&
      suite.audit.guardViolations.length === 0,
    observed:
      suite.audit.guardViolations.length > 0
        ? `read unclosed bars (${suite.audit.guardViolations[0]})`
        : suite.audit.findings.length === 0
          ? 'no unclosed bar was read, and decisions held across forked futures'
          : `${suite.audit.findings.length} divergence(s); first at bar ${suite.audit.findings[0]!.expected.barIndex}`,
    threshold: 'no future reads, zero divergences',
    rationale:
      'The raw series must refuse to be read ahead of the clock, and re-running against a forked future must not change a single past decision.',
  });

  gates.push({
    id: 'sample-size',
    title: 'Enough trades to mean anything',
    severity: 'blocking',
    passed:
      suite.totalBaselineTrades >= t.minTotalTrades &&
      medianTrades >= t.minMedianTrades,
    observed: `${suite.totalBaselineTrades} trades in total, ${medianTrades.toFixed(0)} in the median scenario`,
    threshold: `>= ${t.minTotalTrades} total and >= ${t.minMedianTrades} per scenario`,
    rationale: 'Six lucky trades is an anecdote, not an edge.',
  });

  gates.push({
    id: 'edge-vs-cost',
    title: 'Raw edge clears the toll',
    severity: 'blocking',
    passed: edgeRatio >= t.minEdgeToCostRatio,
    observed: `${bps(grossEdge)} gross vs ${bps(perTradeCost)} cost (${
      Number.isFinite(edgeRatio) ? edgeRatio.toFixed(2) : 'inf'
    }x)`,
    threshold: `>= ${t.minEdgeToCostRatio}x`,
    rationale:
      'A signal worth less than twice what it costs to act on has no margin for a worse day.',
  });

  gates.push({
    id: 'net-positive',
    title: 'Makes money across the catalogue',
    severity: 'blocking',
    passed: medianReturnOf(suite, 'baseline') > 0,
    observed: pct(medianReturnOf(suite, 'baseline')),
    threshold: '> 0%',
    rationale: 'The median scenario is the ordinary case, not the good one.',
  });

  gates.push({
    id: 'breadth',
    title: 'Works in more than one market',
    severity: 'blocking',
    passed: breadth >= t.minScenarioBreadth,
    observed: `${positiveScenarios}/${baseline.length} scenarios positive`,
    threshold: `>= ${(t.minScenarioBreadth * 100).toFixed(0)}%`,
    rationale:
      'A strategy that only works in a trend is a long position with extra steps.',
  });

  gates.push({
    id: 'tail-risk',
    title: 'Survives its worst scenario',
    severity: 'blocking',
    passed: worstReturn >= t.minWorstScenarioReturn,
    observed: pct(worstReturn),
    threshold: `>= ${pct(t.minWorstScenarioReturn)}`,
    rationale:
      'The worst scenario in this list is milder than the worst real week.',
  });

  gates.push({
    id: 'drawdown',
    title: 'Drawdown stays survivable',
    severity: 'blocking',
    passed: worstDrawdown <= t.maxWorstDrawdown,
    observed: pct(worstDrawdown),
    threshold: `<= ${pct(t.maxWorstDrawdown)}`,
    rationale:
      'A drawdown you would switch off during is a loss you would take.',
  });

  gates.push({
    id: 'cost-resilience',
    title: 'Still profitable at double the costs',
    severity: 'blocking',
    passed: medianReturnOf(suite, 'costs-2x') > 0,
    observed: pct(medianReturnOf(suite, 'costs-2x')),
    threshold: '> 0%',
    rationale:
      'Spreads widen, fee tiers get lost, and venues change. An edge that needs perfect pricing is not one.',
  });

  gates.push({
    id: 'latency-resilience',
    title: 'Still profitable one second slower',
    severity: 'blocking',
    passed: medianReturnOf(suite, 'latency-slow') > 0,
    observed: pct(medianReturnOf(suite, 'latency-slow')),
    threshold: '> 0%',
    rationale:
      'If a second of delay destroys the edge, you are in a race you have not built the infrastructure to win.',
  });

  gates.push({
    id: 'seed-stability',
    title: 'Bad luck is not ruinous',
    severity: 'blocking',
    passed: seedTail >= t.minSeedTailReturn,
    observed: `${pct(seedTail)} at the 20th percentile seed`,
    threshold: `>= ${pct(t.minSeedTailReturn)}`,
    rationale:
      'The same strategy on a different draw of the same market should not blow up.',
  });

  gates.push({
    id: 'cost-cliff',
    title: 'Degrades gracefully at triple costs',
    severity: 'advisory',
    passed: medianReturnOf(suite, 'costs-3x') > 0,
    observed: pct(medianReturnOf(suite, 'costs-3x')),
    threshold: '> 0%',
    rationale: 'Shows whether the margin is thin or comfortable.',
  });

  gates.push({
    id: 'capacity',
    title: 'Holds up on a tenth of the volume',
    severity: 'advisory',
    passed: medianReturnOf(suite, 'capacity') > 0,
    observed: pct(medianReturnOf(suite, 'capacity')),
    threshold: '> 0%',
    rationale:
      'Tells you how much size the edge can carry before impact eats it.',
  });

  gates.push({
    id: 'timing-robust',
    title: 'Edge survives a one-bar delay',
    severity: 'advisory',
    passed: !suite.audit.timingFragile,
    observed: `${(suite.audit.shiftedPnlRatio * 100).toFixed(1)}% of P&L retained`,
    threshold: '> 10% retained',
    rationale:
      'An edge that vanishes when orders are delayed one bar was probably reading that bar.',
  });

  const medianHold = median(baseline.map((v) => v.medianBarsHeld));
  const floor = suite.costFloor.shortestViableHorizon;
  const frequencyViable = floor === null ? false : medianHold >= floor;
  gates.push({
    id: 'frequency-viable',
    title: 'Trades slowly enough to pay for itself',
    severity: 'advisory',
    passed: frequencyViable,
    observed:
      floor === null
        ? `holds ${medianHold.toFixed(1)} bars; perfect foresight loses money at every horizon tested`
        : `holds ${medianHold.toFixed(1)} bars; the cost floor is ${floor} bars`,
    threshold: 'hold >= cost floor',
    rationale:
      'Below the cost floor even a perfect predictor loses money, so the holding period is the problem, not the signal.',
  });

  gates.push({
    id: 'not-overfit',
    title: 'Beats the luckiest coin flip',
    severity: 'advisory',
    passed: dsr >= t.minDeflatedSharpe,
    observed: `deflated Sharpe probability ${dsr.toFixed(3)} (assuming ${t.trials} trials)`,
    threshold: `>= ${t.minDeflatedSharpe}`,
    rationale:
      'With enough variants, something always looks good. This asks whether this one looks good enough.',
  });

  const blockingFailures = gates.filter(
    (g) => !g.passed && g.severity === 'blocking',
  );
  const advisoryFailures = gates.filter(
    (g) => !g.passed && g.severity === 'advisory',
  );
  const passed = blockingFailures.length === 0;

  return {
    strategyId: suite.strategyId,
    passed,
    gates,
    blockingFailures,
    advisoryFailures,
    summary: passed
      ? `PASS — cleared ${gates.filter((g) => g.passed).length}/${gates.length} gates${
          advisoryFailures.length > 0
            ? ` with ${advisoryFailures.length} advisory warning(s)`
            : ''
        }.`
      : `FAIL — ${blockingFailures.length} blocking gate(s): ${blockingFailures
          .map((g) => g.id)
          .join(', ')}.`,
  };
}
