import { describe, expect, it } from 'vitest';
import { auditLookahead, divergeAfter } from '../src/guards/lookahead-audit.js';
import { generateBars, validateBars } from '../src/scenarios/generator.js';
import { scenarioById, MINUTE } from '../src/scenarios/catalog.js';
import { cheater, oracle } from '../src/strategies/oracle.js';
import { smaTrend } from '../src/strategies/sma-trend.js';
import { naiveScalper } from '../src/strategies/naive-scalper.js';
import { runBacktest } from '../src/engine/engine.js';
import { computeStats } from '../src/metrics/stats.js';

const spec = { ...scenarioById('regime-flip'), bars: 1500 };
const bars = generateBars(spec, 1);

describe('divergeAfter', () => {
  it('keeps the past byte-identical and replaces the future', () => {
    const forked = divergeAfter(bars, 500, 'seed');
    expect(forked.slice(0, 501)).toEqual(bars.slice(0, 501));
    expect(forked.slice(501)).not.toEqual(bars.slice(501));
    expect(forked).toHaveLength(bars.length);
    expect(() => validateBars(forked)).not.toThrow();
  });
});

describe('auditLookahead', () => {
  it('catches a strategy that reads the next bar', () => {
    const audit = auditLookahead((series) => cheater(series), bars, {
      cuts: [0.4, 0.7],
    });
    expect(audit.clean).toBe(false);
    expect(audit.guardViolations.length).toBeGreaterThan(0);
    expect(audit.notes.join(' ')).toContain('ahead of the clock');
  });

  it('names the bar where the peek happened', () => {
    const audit = auditLookahead((series) => cheater(series), bars, {
      cuts: [0.5],
    });
    expect(audit.guardViolations[0]).toMatch(
      /read bar \d+ while only bars up to \d+ had closed/,
    );
  });

  it('clears a strategy that only uses the sealed view', () => {
    const audit = auditLookahead(() => smaTrend(), bars, { cuts: [0.4, 0.7] });
    expect(audit.findings).toHaveLength(0);
    expect(audit.guardViolations).toHaveLength(0);
  });

  it('clears the scalper of lookahead even though it loses money', () => {
    const audit = auditLookahead(() => naiveScalper(), bars, { cuts: [0.5] });
    expect(audit.findings).toHaveLength(0);
    expect(audit.guardViolations).toHaveLength(0);
  });
});

describe('perfect foresight is not enough on its own', () => {
  // On one-minute bars a single bar simply does not move far enough to pay for
  // a round trip. This is the whole argument against the scalping strategy, and
  // it does not depend on how good the signal is.
  const fastBars = generateBars({ ...spec, intervalMs: MINUTE, bars: 2000 }, 1);

  it('still loses money trading every bar, because costs do not care how right you are', () => {
    const stats = computeStats(
      runBacktest(cheater(fastBars), fastBars, { seed: 1 }),
    );
    // The direction call is right by construction, so the raw edge is positive.
    expect(stats.grossEdgeBps).toBeGreaterThan(0);
    // And it is smaller than the round-trip toll, so the net edge is not.
    expect(stats.costPerTradeBps).toBeGreaterThan(stats.grossEdgeBps);
    expect(stats.expectancyBps).toBeLessThan(0);
    expect(stats.totalReturn).toBeLessThan(0);
  });

  it('makes money on the same bars once it holds long enough to clear the toll', () => {
    const patient = computeStats(
      runBacktest(oracle(fastBars, { horizon: 120 }), fastBars, { seed: 1 }),
    );
    expect(patient.expectancyBps).toBeGreaterThan(0);
    expect(patient.totalReturn).toBeGreaterThan(0);
  });
});
