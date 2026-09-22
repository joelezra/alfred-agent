import type { StrategyFactory } from '../types.js';
import { naiveScalper } from './naive-scalper.js';
import { smaTrend } from './sma-trend.js';
import { adaptiveTrend } from './adaptive-trend.js';
import { bbRsiReversion } from './bb-rsi-reversion.js';

/**
 * Strategies the CLI can run by name.
 *
 * Add yours here. `cheater` is deliberately absent — it needs the raw series to
 * do its cheating, so it only exists inside the audit tests.
 */
export const STRATEGIES: Record<string, StrategyFactory> = {
  'naive-scalper': naiveScalper,
  'sma-trend': smaTrend,
  'adaptive-trend': adaptiveTrend,
  'bb-rsi-reversion': bbRsiReversion,
};

export function strategyByName(name: string): StrategyFactory {
  const factory = STRATEGIES[name];
  if (!factory) {
    throw new Error(
      `unknown strategy "${name}". Known: ${Object.keys(STRATEGIES).join(', ')}`,
    );
  }
  return factory;
}
