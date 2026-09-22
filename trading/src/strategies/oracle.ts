import type { Bar, Strategy } from '../types.js';
import { sizeFor } from './indicators.js';

/**
 * Perfect foresight. Test fixture and benchmark — never a candidate.
 *
 * It closes over the raw series and reads `horizon` bars ahead, which is
 * exactly how lookahead gets into real code: a helper handed the whole
 * dataframe, an indicator computed over the full history, a label joined on the
 * wrong timestamp. `auditLookahead` must catch it. If it ever stops catching
 * it, the audit is broken and every clean report it has produced is worthless.
 *
 * It has a second job. Run it at a given holding period and it answers the
 * question no amount of strategy tuning can argue with: with the costs you
 * actually pay, is there enough movement at this frequency to pay for trading
 * at it? If the oracle loses money over ten-bar holds, nothing you write that
 * holds for ten bars will make money either.
 */
export function oracle(
  bars: readonly Bar[],
  params: Record<string, number> = {},
): Strategy {
  const horizon = Math.max(1, Math.round(params.horizon ?? 1));
  const minMoveBps = params.minMoveBps ?? 0;
  const sizeFraction = params.sizeFraction ?? 0.9;

  let index = 0;
  let barsHeld = 0;

  return {
    id: horizon === 1 ? 'oracle-1bar' : `oracle-${horizon}bar`,
    warmupBars: 1,

    init(): void {
      index = 0;
      barsHeld = 0;
    },

    onBar(view, api): void {
      while (index < bars.length - 1 && bars[index]!.closeTime < view.now())
        index++;

      const position = view.position();
      if (position.qty !== 0) {
        barsHeld += 1;
        if (barsHeld < horizon) return;
        api.closePosition('horizon');
        barsHeld = 0;
        return;
      }

      // An order decided now fills on the next bar and is closed `horizon`
      // bars later, so the move that matters runs between those two fills —
      // not from the current close, which this strategy can never trade at.
      const entryBar = bars[Math.min(bars.length - 1, index + 1)]!;
      const exitBar = bars[Math.min(bars.length - 1, index + 1 + horizon)]!;
      const moveBps = ((exitBar.open - entryBar.open) / entryBar.open) * 10_000;
      if (Math.abs(moveBps) < minMoveBps) return;

      const qty = sizeFor(view.equity(), view.bar().close, sizeFraction);
      if (qty <= 0) return;
      barsHeld = 0;
      api.submit({
        side: moveBps > 0 ? 'buy' : 'sell',
        qty,
        type: 'market',
        tag: 'oracle',
      });
    },
  };
}

/** The one-bar oracle, kept under its honest name for the audit tests. */
export function cheater(bars: readonly Bar[]): Strategy {
  return oracle(bars, { horizon: 1 });
}
