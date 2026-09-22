import type { Strategy } from '../types.js';
import { atr, sizeFor, sma } from './indicators.js';

/**
 * A plain moving-average crossover with an ATR stop.
 *
 * Not clever and not meant to be. It trades rarely enough that costs do not
 * dominate, makes money in trends, and gives it back in ranges — which makes it
 * a useful control: a new strategy that cannot beat this is not worth the risk
 * of running it.
 */
export function smaTrend(params: Record<string, number> = {}): Strategy {
  const fast = params.fast ?? 20;
  const slow = params.slow ?? 100;
  const stopAtr = params.stopAtr ?? 2.5;
  const sizeFraction = params.sizeFraction ?? 0.9;

  let lastSignal = 0;

  return {
    id: 'sma-trend',
    warmupBars: slow + 2,

    init(): void {
      lastSignal = 0;
    },

    onBar(view, api): void {
      const closes = view.closes(slow);
      const fastMa = sma(closes, fast);
      const slowMa = sma(closes, slow);
      if (!Number.isFinite(fastMa) || !Number.isFinite(slowMa)) return;

      const signal = fastMa > slowMa ? 1 : -1;
      if (signal === lastSignal) return;
      lastSignal = signal;

      const price = view.bar().close;
      const range = atr(view, 14);
      if (!Number.isFinite(range) || range <= 0) return;

      const position = view.position();
      if (position.qty !== 0) {
        api.cancelAll();
        api.closePosition('flip');
      }

      const qty = sizeFor(view.equity(), price, sizeFraction);
      if (qty <= 0) return;

      api.submit({
        side: signal > 0 ? 'buy' : 'sell',
        qty,
        type: 'market',
        tag: 'trend',
        bracket: {
          stopLoss:
            signal > 0 ? price - stopAtr * range : price + stopAtr * range,
        },
      });
    },
  };
}
