import { describe, expect, it } from 'vitest';
import { runBacktest } from '../src/engine/engine.js';
import { computeStats } from '../src/metrics/stats.js';
import { auditLookahead } from '../src/guards/lookahead-audit.js';
import {
  FX_SESSIONS,
  VOL_ONLY_SESSIONS,
  generateBars,
  hourOfDay,
} from '../src/scenarios/generator.js';
import { scenarioById } from '../src/scenarios/catalog.js';
import {
  bbRsiReversion,
  SESSION_MODES,
} from '../src/strategies/bb-rsi-reversion.js';

describe('session profiles', () => {
  it('puts more volatility and volume into the session opens', () => {
    const bars = generateBars(
      { ...scenarioById('session-reversion'), bars: 3000 },
      1,
    );
    const byHour = new Map<number, { moves: number[]; volumes: number[] }>();
    for (const bar of bars) {
      const hour = hourOfDay(bar.closeTime);
      const entry = byHour.get(hour) ?? { moves: [], volumes: [] };
      entry.moves.push(Math.abs(bar.close / bar.open - 1));
      entry.volumes.push(bar.volume);
      byHour.set(hour, entry);
    }
    const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
    // 13:00 UTC is the New York open; 03:00 is the middle of the Asian lull.
    expect(mean(byHour.get(13)!.moves)).toBeGreaterThan(
      mean(byHour.get(3)!.moves) * 1.5,
    );
    expect(mean(byHour.get(13)!.volumes)).toBeGreaterThan(
      mean(byHour.get(3)!.volumes) * 2,
    );
  });

  it('gives the control scenario the same volatility shape but no reversion edge', () => {
    expect(VOL_ONLY_SESSIONS.volByHour).toEqual(FX_SESSIONS.volByHour);
    expect(VOL_ONLY_SESSIONS.volumeByHour).toEqual(FX_SESSIONS.volumeByHour);
    expect(new Set(VOL_ONLY_SESSIONS.reversionByHour)).toEqual(new Set([1]));
    expect(new Set(FX_SESSIONS.reversionByHour).size).toBeGreaterThan(1);
  });

  it('reads the hour off the bar close in UTC', () => {
    expect(hourOfDay(Date.UTC(2024, 0, 1, 13, 0, 0))).toBe(13);
    expect(hourOfDay(Date.UTC(2024, 5, 30, 0, 0, 0))).toBe(0);
  });
});

describe('bb-rsi-reversion', () => {
  const spec = { ...scenarioById('session-reversion'), bars: 2500 };
  const bars = generateBars(spec, 1);

  it('never reads a bar the clock has not reached', () => {
    // It uses confirmed swing pivots and the wall clock, both of which are easy
    // to implement with an off-by-one that sees the future.
    const audit = auditLookahead(() => bbRsiReversion(), bars, {
      cuts: [0.5, 0.75],
    });
    expect(audit.guardViolations).toHaveLength(0);
    expect(audit.findings).toHaveLength(0);
  });

  it('only opens positions inside the hours its session mode allows', () => {
    const quiet = SESSION_MODES.find((m) => m.id === 2)!;
    const result = runBacktest(bbRsiReversion({ sessionMode: 2 }), bars, {
      seed: 1,
    });
    const entries = result.fills.filter((f) => f.tag === 'bb-rsi');
    expect(entries.length).toBeGreaterThan(5);

    const HOUR = 3_600_000;
    for (const fill of entries) {
      // The fill lands on the bar after the decision, so the hour that was
      // filtered on is the one before this bar closed. Exits are free to land
      // anywhere; only entries are gated.
      expect(quiet.hours).toContain(hourOfDay(fill.ts - HOUR));
    }
  });

  it('trades less as the session window narrows', () => {
    const counts = SESSION_MODES.map(
      (mode) =>
        runBacktest(bbRsiReversion({ sessionMode: mode.id }), bars, { seed: 1 })
          .trades.length,
    );
    expect(counts[0]).toBeGreaterThanOrEqual(counts[2]!);
    expect(counts[2]).toBeGreaterThan(0);
  });

  it('earns its edge in a reverting market and loses it in a trend', () => {
    const reverting = computeStats(
      runBacktest(
        bbRsiReversion(),
        generateBars({ ...scenarioById('chop-range'), bars: 2500 }, 1),
        {
          seed: 1,
        },
      ),
    );
    const trending = computeStats(
      runBacktest(
        bbRsiReversion(),
        generateBars({ ...scenarioById('bull-trend'), bars: 2500 }, 1),
        {
          seed: 1,
        },
      ),
    );
    expect(reverting.grossEdgeBps).toBeGreaterThan(reverting.costPerTradeBps);
    expect(reverting.grossEdgeBps).toBeGreaterThan(trending.grossEdgeBps);
  });

  it('keeps most trades off the stop, which the tight-stop version did not', () => {
    // Regression: anchoring the stop to the nearest swing at one ATR stopped
    // out 75% of trades and cut gross edge to a third.
    const result = runBacktest(bbRsiReversion(), bars, { seed: 1 });
    const exits = result.fills.filter((f) => f.tag && f.tag !== 'bb-rsi');
    const stopped = exits.filter((f) => f.tag === 'bracket-stop').length;
    expect(exits.length).toBeGreaterThan(10);
    expect(stopped / exits.length).toBeLessThan(0.7);
  });

  it('does not put its largest positions behind its thinnest edges', () => {
    // Regression: risk-only sizing is inversely proportional to volatility, so
    // it bet most where a fixed cost ate the most of the move — equal-weighted
    // expectancy was +73bps while size-weighted was -2bps.
    const trades = [1, 2, 3].flatMap(
      (seed) =>
        runBacktest(bbRsiReversion(), generateBars(spec, seed), { seed })
          .trades,
    );
    expect(trades.length).toBeGreaterThan(30);

    const notionals = trades.map((t) => t.qty * t.entryPrice);
    const cut = [...notionals].sort((a, b) => a - b)[
      Math.floor(notionals.length / 2)
    ]!;
    const mean = (xs: number[]) =>
      xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
    const large = mean(
      trades.filter((t) => t.qty * t.entryPrice > cut).map((t) => t.netBps),
    );
    const small = mean(
      trades.filter((t) => t.qty * t.entryPrice <= cut).map((t) => t.netBps),
    );

    // Large positions need not beat small ones, but they must not be the ones
    // reliably losing money.
    expect(large).toBeGreaterThan(small - Math.abs(small) - 150);
    expect(large).toBeGreaterThan(-100);
  });
});
