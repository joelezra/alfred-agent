export * from './types.js';
export { createRng, type Rng } from './rng.js';
export { SealedView, LookaheadError } from './guards/sealed-view.js';
export { createBarGuard, type GuardState } from './guards/bar-guard.js';
export {
  auditLookahead,
  divergeAfter,
  type LookaheadAuditResult,
} from './guards/lookahead-audit.js';
export {
  runBacktest,
  resolveConfig,
  DEFAULT_COSTS,
  DEFAULT_ENGINE,
  type RunResult,
  type RunOptions,
  type RunConfigOverrides,
  type Decision,
} from './engine/engine.js';
export { Portfolio } from './engine/portfolio.js';
export { Broker } from './engine/broker.js';
export { Microstructure, VolatilityTracker } from './market/microstructure.js';
export {
  computeStats,
  periodReturns,
  maxDrawdown,
  type PerformanceStats,
} from './metrics/stats.js';
export {
  deflatedSharpe,
  expectedMaxSharpe,
  normalCdf,
} from './metrics/deflated.js';
export {
  generateBars,
  validateBars,
  regime,
  type ScenarioSpec,
  type RegimeSpec,
} from './scenarios/generator.js';
export {
  SCENARIOS,
  scenarioById,
  parseInterval,
  INTERVALS,
} from './scenarios/catalog.js';
export {
  runSuite,
  STRESS_VARIANTS,
  type SuiteResult,
} from './harness/suite.js';
export {
  evaluateGates,
  DEFAULT_THRESHOLDS,
  type Verdict,
  type GateResult,
} from './harness/gates.js';
export { renderMarkdown, renderJson } from './harness/report.js';
export { walkForward, type WalkForwardResult } from './harness/walkforward.js';
export { costFloor, type CostFloorResult } from './harness/cost-floor.js';
export { STRATEGIES, strategyByName } from './strategies/registry.js';
export { naiveScalper } from './strategies/naive-scalper.js';
export { smaTrend } from './strategies/sma-trend.js';
export { adaptiveTrend } from './strategies/adaptive-trend.js';
export { oracle, cheater } from './strategies/oracle.js';
export { sma, atr, sizeFor } from './strategies/indicators.js';
