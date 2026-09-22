import type { Strategy, StrategyContext } from '../types.js';
import { sizeFor } from './indicators.js';

/**
 * The strategy this whole harness exists to reject.
 *
 * Three bars in the same direction, take a position, target eight basis points,
 * stop eight basis points, give up after ten bars. On a chart with no costs it
 * looks like a money printer. Once the spread, the fee, the impact and the
 * latency are charged on every one of its hundreds of round trips, the edge it
 * is reaching for is smaller than the toll it pays to reach for it.
 *
 * Keep it. It is the canary: any change to the cost model that lets this pass
 * has broken the harness.
 */
export function naiveScalper(params: Record<string, number> = {}): Strategy {
  const lookback = params.lookback ?? 3;
  const targetBps = params.targetBps ?? 8;
  const stopBps = params.stopBps ?? 8;
  const maxBars = params.maxBars ?? 10;
  const sizeFraction = params.sizeFraction ?? 0.5;

  let barsInTrade = 0;

  return {
    id: 'naive-scalper',
    warmupBars: lookback + 2,

    init(_ctx: StrategyContext): void {
      barsInTrade = 0;
    },

    onBar(view, api): void {
      const position = view.position();

      if (position.qty !== 0) {
        barsInTrade += 1;
        if (barsInTrade >= maxBars) {
          api.closePosition('timeout');
          barsInTrade = 0;
        }
        return;
      }

      barsInTrade = 0;
      if (api.workingOrders().length > 0) return;

      const closes = view.closes(lookback + 1);
      if (closes.length < lookback + 1) return;

      let rising = true;
      let falling = true;
      for (let i = 1; i < closes.length; i++) {
        if (closes[i]! <= closes[i - 1]!) rising = false;
        if (closes[i]! >= closes[i - 1]!) falling = false;
      }
      if (!rising && !falling) return;

      const price = view.bar().close;
      const qty = sizeFor(view.equity(), price, sizeFraction);
      if (qty <= 0) return;

      const side = rising ? 'buy' : 'sell';
      const direction = rising ? 1 : -1;
      api.submit({
        side,
        qty,
        type: 'market',
        tag: 'scalp',
        bracket: {
          takeProfit: price * (1 + (direction * targetBps) / 10_000),
          stopLoss: price * (1 - (direction * stopBps) / 10_000),
        },
      });
    },
  };
}
