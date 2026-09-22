import type { Strategy } from '../types.js';
import { atr } from './indicators.js';

function ema(values: readonly number[], period: number): number {
  if (values.length === 0) return NaN;
  const k = 2 / (period + 1);
  let out = values[0]!;
  for (let i = 1; i < values.length; i++) out = values[i]! * k + out * (1 - k);
  return out;
}

/**
 * Trend following that knows what it costs to trade.
 *
 * Two things separate this from the crossover baseline, and both come straight
 * out of what the harness rejects strategies for:
 *
 *  - It will not open a position unless the move it expects is several times
 *    the round trip it is about to pay. Most bars, that means doing nothing.
 *  - It sizes by risk rather than by capital, so a position in a violent
 *    regime is smaller than the same signal in a calm one, and it stands down
 *    entirely when volatility dislocates.
 *
 * It is still a simple trend follower and it still loses money in a range. The
 * point is that it loses a survivable amount.
 */
export function adaptiveTrend(params: Record<string, number> = {}): Strategy {
  const fast = params.fast ?? 60;
  const slow = params.slow ?? 240;
  const minEdgeBps = params.minEdgeBps ?? 60;
  const stopAtr = params.stopAtr ?? 3;
  const riskFraction = params.riskFraction ?? 0.01;
  const maxGross = params.maxGross ?? 1;
  const standDownVolRatio = params.standDownVolRatio ?? 2.5;

  return {
    id: 'adaptive-trend',
    warmupBars: slow + 60,

    onBar(view, api): void {
      const closes = view.closes(slow);
      if (closes.length < slow) return;

      const price = view.bar().close;
      const shortAtr = atr(view, 20);
      const longAtr = atr(view, 100);
      if (
        !Number.isFinite(shortAtr) ||
        !Number.isFinite(longAtr) ||
        longAtr <= 0
      )
        return;

      const gapBps = ((ema(closes, fast) - ema(closes, slow)) / price) * 10_000;
      const position = view.position();
      const dislocated = shortAtr / longAtr > standDownVolRatio;

      // Leave when the reason for being here has gone, or when the market stops
      // behaving like the one this signal was measured in.
      if (position.qty !== 0) {
        const stillAligned = Math.sign(gapBps) === Math.sign(position.qty);
        if (!stillAligned || Math.abs(gapBps) < minEdgeBps / 2 || dislocated) {
          api.cancelAll();
          api.closePosition('signal-gone');
        }
        return;
      }

      if (dislocated) return;
      // The expected move has to be worth several round trips, not one.
      if (Math.abs(gapBps) < minEdgeBps) return;
      if (api.workingOrders().length > 0) return;

      const stopDistance = stopAtr * shortAtr;
      if (stopDistance <= 0) return;

      const riskQty = (view.equity() * riskFraction) / stopDistance;
      const capQty = (view.equity() * maxGross) / price;
      const qty = Math.min(riskQty, capQty);
      if (qty <= 0) return;

      const long = gapBps > 0;
      api.submit({
        side: long ? 'buy' : 'sell',
        qty,
        type: 'market',
        tag: 'adaptive',
        bracket: {
          stopLoss: long ? price - stopDistance : price + stopDistance,
        },
      });
    },
  };
}
