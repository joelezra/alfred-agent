import type { Bar, OrderRequest, Strategy, TradingApi } from '../types.js';
import { createRng } from '../rng.js';
import { createBarGuard, type GuardState } from './bar-guard.js';
import { LookaheadError } from './sealed-view.js';
import {
  runBacktest,
  type Decision,
  type RunOptions,
} from '../engine/engine.js';
import { computeStats } from '../metrics/stats.js';

export interface AuditFinding {
  cutIndex: number;
  /** Index into the decision log where the two runs first disagreed. */
  divergedAt: number;
  expected: Decision;
  actual: Decision;
}

export interface LookaheadAuditResult {
  clean: boolean;
  cutsTested: number[];
  findings: AuditFinding[];
  /** Direct reads of unclosed bars, caught by the guarded series. */
  guardViolations: string[];
  /** Ratio of net P&L when every decision is delayed by one bar. */
  shiftedPnlRatio: number;
  timingFragile: boolean;
  notes: string[];
}

/**
 * Replace everything after `cutIndex` with a different but statistically similar
 * path. Any strategy reading only the sealed view cannot tell the difference.
 */
export function divergeAfter(
  bars: readonly Bar[],
  cutIndex: number,
  seed: number | string,
): Bar[] {
  const rng = createRng(seed, 'diverge');
  const out = bars.slice(0, cutIndex + 1).map((b) => ({ ...b }));

  const tail = bars.slice(cutIndex + 1);
  const returns = tail.map((bar, i) => {
    const prev = i === 0 ? bars[cutIndex]!.close : tail[i - 1]!.close;
    return Math.log(bar.close / prev);
  });
  // Shuffle and flip: same volatility, different history.
  for (let i = returns.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [returns[i], returns[j]] = [returns[j]!, returns[i]!];
  }

  let prevClose = bars[cutIndex]!.close;
  for (let i = 0; i < tail.length; i++) {
    const source = tail[i]!;
    const relativeRange =
      (source.high - source.low) / Math.max(1e-9, source.close);
    const open = prevClose;
    const close =
      prevClose * Math.exp(returns[i]! * (rng.chance(0.5) ? 1 : -1));
    const mid = (open + close) / 2;
    const wick = mid * relativeRange * 0.3;
    out.push({
      openTime: source.openTime,
      closeTime: source.closeTime,
      open,
      high: Math.max(open, close) + wick,
      low: Math.max(1e-9, Math.min(open, close) - wick),
      close,
      volume: source.volume,
    });
    prevClose = close;
  }
  return out;
}

function sameDecision(a: Decision, b: Decision): boolean {
  return (
    a.barIndex === b.barIndex &&
    a.side === b.side &&
    a.type === b.type &&
    Math.abs(a.qty - b.qty) < 1e-6 &&
    Math.abs(a.price - b.price) < 1e-6
  );
}

/** Wraps a strategy so every order it places is held back one bar. */
function delayByOneBar(inner: Strategy): Strategy {
  let queued: OrderRequest[] = [];
  return {
    id: `${inner.id}+1bar`,
    warmupBars: inner.warmupBars,
    init: (ctx) => inner.init?.(ctx),
    onFill: (fill) => inner.onFill?.(fill),
    onBar(view, api): void {
      for (const request of queued) api.submit(request);
      queued = [];
      const capture: TradingApi = {
        submit(request) {
          queued.push(request);
          return 'deferred';
        },
        cancel: (id) => api.cancel(id),
        cancelAll: () => api.cancelAll(),
        workingOrders: () => api.workingOrders(),
        closePosition(tag) {
          const qty = view.position().qty;
          if (qty === 0) return;
          queued.push({
            side: qty > 0 ? 'sell' : 'buy',
            qty: Math.abs(qty),
            type: 'market',
            reduceOnly: true,
            tag: tag ?? 'close',
          });
        },
      };
      inner.onBar(view, capture);
    },
  };
}

export interface AuditOptions extends RunOptions {
  /** Fractions of the series at which to fork the future. */
  cuts?: number[];
  /** Below this ratio of surviving P&L, the edge is suspiciously timing-bound. */
  shiftThreshold?: number;
}

/**
 * Prove that a strategy cannot see the future.
 *
 * Run it twice over two datasets that are identical up to a cut point and
 * unrelated afterwards. A strategy confined to the sealed view must produce
 * byte-identical decisions up to that cut. One that closed over the raw series,
 * computed an indicator across the whole history, or joined a label on the wrong
 * timestamp will not — and the first disagreement names the bar where it looked.
 *
 * The second check delays every order by one bar. A real edge degrades; an edge
 * that was quietly reading the bar it trades on disappears.
 */
export function auditLookahead(
  makeStrategy: (bars: readonly Bar[]) => Strategy,
  bars: readonly Bar[],
  options: AuditOptions = {},
): LookaheadAuditResult {
  const cuts = (options.cuts ?? [0.3, 0.45, 0.55, 0.65, 0.75, 0.85]).map(
    (fraction) => Math.floor(bars.length * fraction),
  );
  const findings: AuditFinding[] = [];
  const notes: string[] = [];

  // Check one: hand the strategy a series that refuses to be read ahead of the
  // clock. Anything holding the raw bars is caught on its first peek.
  const guardState: GuardState = { sealed: -1, violations: [] };
  const guarded = createBarGuard(bars, guardState);
  try {
    const inner = makeStrategy(guarded);
    const watched: Strategy = {
      id: inner.id,
      warmupBars: inner.warmupBars,
      init: (ctx) => inner.init?.(ctx),
      onFill: (fill) => inner.onFill?.(fill),
      onBar(view, api) {
        guardState.sealed = view.length - 1;
        inner.onBar(view, api);
      },
    };
    runBacktest(watched, bars, options);
  } catch (error) {
    if (!(error instanceof LookaheadError)) throw error;
  }

  // Check two: fork the future. A strategy confined to the sealed view cannot
  // tell the two datasets apart, so its past decisions must be identical.
  const reference = runBacktest(makeStrategy(bars), bars, options);

  for (const cut of cuts) {
    const forked = divergeAfter(bars, cut, `cut-${cut}`);
    const candidate = runBacktest(makeStrategy(forked), forked, options);

    const a = reference.decisions.filter((d) => d.barIndex <= cut);
    const b = candidate.decisions.filter((d) => d.barIndex <= cut);
    const limit = Math.max(a.length, b.length);

    for (let i = 0; i < limit; i++) {
      const expected = a[i];
      const actual = b[i];
      if (!expected || !actual || !sameDecision(expected, actual)) {
        findings.push({
          cutIndex: cut,
          divergedAt: i,
          expected: expected ?? {
            barIndex: -1,
            ts: 0,
            side: '-',
            qty: 0,
            type: 'none',
            price: 0,
          },
          actual: actual ?? {
            barIndex: -1,
            ts: 0,
            side: '-',
            qty: 0,
            type: 'none',
            price: 0,
          },
        });
        break;
      }
    }
  }

  const shifted = runBacktest(delayByOneBar(makeStrategy(bars)), bars, options);
  const referencePnl = computeStats(reference).netPnl;
  const shiftedPnl = computeStats(shifted).netPnl;
  const shiftedPnlRatio =
    Math.abs(referencePnl) < 1e-9 ? 1 : shiftedPnl / referencePnl;

  const threshold = options.shiftThreshold ?? 0.1;
  const timingFragile = referencePnl > 0 && shiftedPnlRatio < threshold;

  if (guardState.violations.length > 0) {
    notes.push(
      `Read the raw series ahead of the clock: ${guardState.violations[0]}. The strategy is holding data the simulation has not reached.`,
    );
  }
  if (findings.length > 0) {
    notes.push(
      `Decisions changed when only future data changed. The strategy is reading bars it should not be able to see (first divergence at bar ${findings[0]!.expected.barIndex}).`,
    );
  }
  if (timingFragile) {
    notes.push(
      `Delaying every order by one bar keeps only ${(shiftedPnlRatio * 100).toFixed(1)}% of the P&L. An edge that lives entirely inside a single bar usually is not an edge.`,
    );
  }

  return {
    clean:
      findings.length === 0 &&
      guardState.violations.length === 0 &&
      !timingFragile,
    cutsTested: cuts,
    findings,
    guardViolations: guardState.violations,
    shiftedPnlRatio,
    timingFragile,
    notes,
  };
}
