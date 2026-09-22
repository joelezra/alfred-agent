import { regime, type ScenarioSpec } from './generator.js';

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;

/**
 * The catalogue's default timeframe.
 *
 * It has to be long enough in market time for a real edge to clear a round
 * trip. Two thousand hourly bars is about twelve weeks — at the default costs a
 * position held a day or two can plausibly pay for itself, which makes a pass
 * possible. Run the same catalogue at a minute (`--interval 1m`) to test a
 * strategy that claims to work there; the cost floor will tell you whether the
 * timeframe itself is viable before you look at the strategy at all.
 */
const DEFAULT_INTERVAL_MS = HOUR;
const DEFAULT_BARS = 2000;

function base(
  spec: Partial<ScenarioSpec> &
    Pick<ScenarioSpec, 'id' | 'description' | 'breaks' | 'regimes'>,
): ScenarioSpec {
  return {
    bars: DEFAULT_BARS,
    intervalMs: DEFAULT_INTERVAL_MS,
    startPrice: 100,
    baseVolume: 50_000,
    ...spec,
  };
}

/**
 * The suite.
 *
 * Each entry exists to kill a specific kind of wishful thinking. A strategy
 * that only works in `bull-trend` is a long position with extra steps; one that
 * only works in `quiet-drift` has been fitted to an absence of movement.
 */
export const SCENARIOS: ScenarioSpec[] = [
  base({
    id: 'bull-trend',
    description: 'Steady uptrend, moderate volatility, healthy liquidity.',
    breaks:
      'Nothing. If a strategy loses here it is structurally short or over-trading.',
    regimes: [regime({ label: 'bull', drift: 1.2, vol: 0.45, momentum: 0.97 })],
  }),
  base({
    id: 'bear-grind',
    description:
      'Slow persistent decline with occasional sharp relief rallies.',
    breaks: 'Long-only strategies and dip buyers with no stop discipline.',
    regimes: [
      regime({
        label: 'grind',
        drift: -0.9,
        vol: 0.55,
        momentum: 0.96,
        weight: 4,
      }),
      regime({
        label: 'relief',
        drift: 1.8,
        vol: 0.8,
        momentum: 0.9,
        weight: 1,
      }),
    ],
  }),
  base({
    id: 'chop-range',
    description:
      'Hard mean reversion around a slow anchor. No sustained direction.',
    breaks:
      'Trend following, breakout entries, anything that needs follow-through.',
    regimes: [
      regime({
        label: 'range',
        drift: 0,
        vol: 0.4,
        meanReversion: 0.08,
        momentum: -0.3,
      }),
    ],
  }),
  base({
    id: 'high-vol-whipsaw',
    description:
      'Violent two-sided volatility with alternating bar-to-bar direction.',
    breaks:
      'Tight stops, scalpers, and anything that assumes the next bar continues this one.',
    regimes: [
      regime({
        label: 'whipsaw',
        vol: 1.4,
        momentum: -0.55,
        volPersistence: 0.85,
        volOfVol: 0.6,
      }),
    ],
  }),
  base({
    id: 'flash-crash',
    description:
      'Calm, then a violent one-way dislocation, then a partial recovery.',
    breaks:
      'Mean-reversion buyers, static position sizing, and stops placed inside the noise.',
    costOverrides: { baseSpreadBps: 4, spreadVolCoef: 8, impactCoef: 20 },
    regimes: [
      regime({ label: 'calm', vol: 0.3, momentum: 0.95, weight: 5 }),
      regime({
        label: 'dislocation',
        drift: -40,
        vol: 4,
        momentum: 0.98,
        jumpProb: 0.08,
        jumpMeanBps: 60,
        jumpSdBps: 120,
        liquidity: 0.3,
        weight: 1,
      }),
      regime({
        label: 'recovery',
        drift: 6,
        vol: 1.6,
        momentum: 0.9,
        weight: 2,
      }),
    ],
  }),
  base({
    id: 'gap-risk',
    description: 'Frequent discontinuous jumps in both directions.',
    breaks:
      'Stop orders assumed to fill at their price; any risk model built on continuous prices.',
    regimes: [
      regime({
        label: 'gappy',
        vol: 0.5,
        jumpProb: 0.02,
        jumpMeanBps: 40,
        jumpSdBps: 80,
      }),
    ],
  }),
  base({
    id: 'thin-liquidity',
    description: 'Normal price action on five per cent of the usual volume.',
    breaks:
      'Anything that assumes it can get filled. Exposes capacity and partial fills.',
    costOverrides: { impactCoef: 25 },
    regimes: [regime({ label: 'thin', vol: 0.6, liquidity: 0.05 })],
  }),
  base({
    id: 'spread-blowout',
    description:
      'Ordinary prices, but the quoted spread is five times its normal width.',
    breaks:
      'High-frequency and scalping strategies whose edge is smaller than the spread.',
    costOverrides: {
      baseSpreadBps: 10,
      spreadVolCoef: 6,
      adverseSelectionBps: 4,
    },
    regimes: [regime({ label: 'wide', vol: 0.6 })],
  }),
  base({
    id: 'latency-spike',
    description:
      'A venue that takes one and a half seconds to acknowledge an order.',
    breaks: 'Any edge that lives inside the first seconds of a move.',
    costOverrides: { latencyMs: 1500, latencyJitterMs: 900 },
    regimes: [regime({ label: 'slow-venue', vol: 0.7, momentum: 0.9 })],
  }),
  base({
    id: 'fee-hike',
    description:
      'Same market, three times the commission — a lost fee tier or taker-only flow.',
    breaks:
      'Strategies whose profit is a thin margin over their current fee schedule.',
    costOverrides: { takerFeeBps: 15, makerFeeBps: 4 },
    regimes: [regime({ label: 'normal', vol: 0.5, momentum: 0.93 })],
  }),
  base({
    id: 'regime-flip',
    description:
      'Trend up, then range, then trend down. The character changes mid-run.',
    breaks:
      'Parameters fitted to one regime; strategies with no way to stand down.',
    regimes: [
      regime({ label: 'up', drift: 1.5, vol: 0.45, momentum: 0.97, weight: 1 }),
      regime({
        label: 'range',
        drift: 0,
        vol: 0.35,
        meanReversion: 0.1,
        momentum: -0.2,
        weight: 1,
      }),
      regime({
        label: 'down',
        drift: -1.5,
        vol: 0.7,
        momentum: 0.97,
        weight: 1,
      }),
    ],
  }),
  base({
    id: 'quiet-drift',
    description:
      'Very low volatility. Almost nothing happens, and costs still accrue.',
    breaks: 'Strategies that trade on a schedule rather than on an edge.',
    regimes: [regime({ label: 'quiet', vol: 0.12, momentum: 0.9 })],
  }),
  base({
    id: 'news-shock',
    description:
      'Repeated two-sided headline jumps with volatility clustering around them.',
    breaks: 'Anything holding through events without sizing for the tail.',
    costOverrides: { baseSpreadBps: 5, spreadVolCoef: 10 },
    regimes: [
      regime({
        label: 'headlines',
        vol: 0.8,
        jumpProb: 0.01,
        jumpMeanBps: 90,
        jumpSdBps: 150,
        volPersistence: 0.9,
        volOfVol: 0.5,
      }),
    ],
  }),
];

/** Timeframe names accepted on the command line. */
export const INTERVALS: Record<string, number> = {
  '1m': MINUTE,
  '5m': 5 * MINUTE,
  '15m': 15 * MINUTE,
  '1h': HOUR,
  '4h': 4 * HOUR,
  '1d': 24 * HOUR,
};

export function parseInterval(name: string): number {
  const ms = INTERVALS[name];
  if (!ms) {
    throw new Error(
      `unknown interval "${name}". Known: ${Object.keys(INTERVALS).join(', ')}`,
    );
  }
  return ms;
}

export function scenarioById(id: string): ScenarioSpec {
  const found = SCENARIOS.find((s) => s.id === id);
  if (!found) {
    throw new Error(
      `unknown scenario "${id}". Known: ${SCENARIOS.map((s) => s.id).join(', ')}`,
    );
  }
  return found;
}
