import type { MarketView, Strategy, TradingApi } from '../types.js';
import { hourOfDay } from '../scenarios/generator.js';
import {
  adx,
  atr,
  bandwidthPercentile,
  bollinger,
  lastSwing,
  rsi,
  sma,
  type SwingPoint,
} from './indicators.js';

/**
 * Which hours of the clock the strategy is allowed to open a position in.
 *
 * Restricting a strategy to certain hours is a claim about intraday structure,
 * and a very easy one to fit to noise — there are only twenty-four of them and
 * a backtest will always find some that look better than others. So the choice
 * is a handful of named windows with a reason behind each, not a free search
 * over subsets.
 */
export const SESSION_MODES = [
  { id: 0, label: 'all-hours', hours: null },
  {
    id: 1,
    label: 'avoid-opens',
    // Skip the London and New York opens, when accumulated overnight orders
    // execute and ranges tend to expand rather than hold.
    hours: [0, 1, 2, 3, 4, 5, 6, 10, 11, 12, 16, 17, 18, 19, 20, 21, 22, 23],
  },
  {
    id: 2,
    label: 'quiet-only',
    // The lull: Asia hours and the post-New-York fade.
    hours: [0, 1, 2, 3, 4, 5, 18, 19, 20, 21, 22, 23],
  },
  {
    id: 3,
    label: 'liquid-only',
    // The opposite bet: only trade when the book is deep, and pay for it in
    // reversion quality.
    hours: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  },
] as const;

function hoursFor(mode: number): readonly number[] | null {
  return (SESSION_MODES.find((m) => m.id === mode) ?? SESSION_MODES[0]).hours;
}

/**
 * Bollinger band touch, RSI confirmation, at a confirmed swing, in a market
 * calm enough to come back.
 *
 * The trade is the obvious one: price stretches to the outer band, RSI agrees
 * it is stretched, and you take the move back to the middle. What makes or
 * breaks it is everything around that trade, because the failure mode is
 * specific and brutal — in a trend, price *walks* the band for bar after bar
 * and a reversion entry is simply a position on the wrong side of a move that
 * has not finished. Four filters exist to refuse those:
 *
 *  - **Not trending.** ADX below `maxAdx`, and the middle band close to flat.
 *    A band touch with ADX at 30 and bands expanding is the start of a
 *    breakout, not the end of a stretch.
 *  - **Not extreme, not dead.** Bandwidth has to sit in the middle of its own
 *    recent range. At the top, volatility is expanding and the band is not a
 *    wall. At the bottom, the bands are so tight there is nothing to collect.
 *  - **At structure.** There has to be a *confirmed* swing near the entry —
 *    somewhere price has already turned. Confirmation costs `swingStrength`
 *    bars of lag, so the pivot is always in the past. That is the honest price
 *    of the filter, and it is why the stop goes beyond the swing rather than an
 *    arbitrary distance: if that level fails, the reason for the trade is gone.
 *  - **At the right time.** See `SESSION_MODES`.
 *
 * Exits are staged: half at the middle band, the rest at the opposite band,
 * with a structural stop and a time stop for trades that go nowhere. The
 * targets are taken with market orders when a bar closes through them rather
 * than with resting limits — that pays the spread instead of earning it, which
 * is the conservative way to be wrong about fill quality.
 */
export function bbRsiReversion(params: Record<string, number> = {}): Strategy {
  const bbPeriod = params.bbPeriod ?? 20;
  const bbMult = params.bbMult ?? 2;
  // RSI(2) with 10/90, not RSI(14) with 30/70. Measured on these markets,
  // RSI(14) reaches 30 on 3.6% of bars and its 1st percentile is 27.7 — it
  // barely gets there at all, because reaching 30 needs a sustained run of
  // losses and a mean-reverting market does not provide one. Requiring it
  // *and* a two-sigma band touch leaves almost nothing, and what survives
  // tends to be a trend, which is the regime the other filters exist to
  // exclude. A short lookback is the documented fix (Connors' RSI(2)) and
  // fires roughly ten times as often here.
  const rsiPeriod = params.rsiPeriod ?? 2;
  const rsiOversold = params.rsiOversold ?? 10;
  const rsiOverbought = params.rsiOverbought ?? 100 - rsiOversold;
  const bandTouch = params.bandTouch ?? 0.05;
  const maxAdx = params.maxAdx ?? 22;
  const bwLookback = params.bwLookback ?? 100;
  const minBwPct = params.minBwPct ?? 0.15;
  const maxBwPct = params.maxBwPct ?? 0.8;
  // Flatness of the middle band, measured against the width of the channel
  // rather than in absolute basis points, so the same number means the same
  // thing on a quiet instrument and a wild one.
  const maxMidSlopeBandFraction = params.maxMidSlopeBandFraction ?? 0.35;
  const swingStrength = params.swingStrength ?? 3;
  const swingLookback = params.swingLookback ?? 25;
  const swingProximityAtr = params.swingProximityAtr ?? 1.5;
  /**
   * Where the stop goes. Measured, this is the single decision that decides
   * whether the strategy works: with a stop anchored tightly to the nearest
   * swing, 75% of trades stopped out and only 24% ever reached a target, so
   * the strategy was paying a full round trip to find out that a two-sigma
   * stretch is noisy.
   *
   *   0  beyond the confirmed swing, by `stopAtr` ATR
   *   1  from the entry, by `stopAtr` ATR, ignoring where the swing sits
   *   2  whichever of the two is further away (the default)
   *
   * Mode 2 at two ATR takes the stop-out rate from 75% to 44% and gross edge
   * per trade from 23bps to 78bps. The swing alone is not enough because it
   * can print adjacent to the entry, which produces a stop so tight that
   * ordinary noise closes the trade.
   */
  const stopMode = params.stopMode ?? 2;
  const stopAtr = params.stopAtr ?? 2;
  /** Skip the trade unless the target is this many times the risk. */
  const minRewardRisk = params.minRewardRisk ?? 0;
  /**
   * What a round trip costs, in basis points, and how many times over the
   * move to the middle band has to cover it.
   *
   * This exists because sizing by risk alone gets the relationship between
   * size and edge backwards. Position size is inversely proportional to the
   * stop distance, so the biggest positions get taken when volatility is
   * lowest — which is exactly when a fixed commission and spread eat the most
   * of the move. Measured without this filter: trades larger than the median
   * averaged -56bps while smaller ones averaged +202bps, so equal-weighted
   * expectancy was +73bps while the actual size-weighted result was -2bps.
   */
  const roundTripCostBps = params.roundTripCostBps ?? 20;
  const minEdgeMultiple = params.minEdgeMultiple ?? 0;
  /**
   * Scale the position by how much the expected move beats the round trip,
   * instead of purely by the stop distance. Risk-based sizing alone is
   * inversely proportional to volatility, which puts the most capital behind
   * the thinnest edges.
   */
  const sizeByEdge = (params.sizeByEdge ?? 1) > 0;
  const edgeSizingCap = params.edgeSizingCap ?? 6;
  const scaleOutFraction = params.scaleOutFraction ?? 0.5;
  const maxBarsInTrade = params.maxBarsInTrade ?? 48;
  const riskFraction = params.riskFraction ?? 0.0075;
  const maxGross = params.maxGross ?? 1;
  // Optional "do not fight the longer trend" filter, off by default. The
  // classic form (Connors uses the 200-day average) pairs a long-trend filter
  // with a shallow RSI pullback. It does not transfer to a two-sigma band
  // touch: a stretch that far below the middle is usually below the long
  // average too, so the filter removes precisely the setups this strategy
  // exists to take. Measured, it cut gross edge per trade from 26bps to 5bps.
  // Set a period to turn it on; 0 leaves it off.
  const trendFilterPeriod = params.trendFilterPeriod ?? 0;
  const sessionMode = params.sessionMode ?? 0;
  const allowShort = (params.allowShort ?? 1) > 0;

  const sessionHours = hoursFor(sessionMode);
  const historyNeeded = Math.max(bbPeriod + bwLookback, trendFilterPeriod);
  const slopeLookback = Math.max(2, Math.round(bbPeriod / 2));

  let barsInTrade = 0;
  let scaledOut = false;
  let targetMid = 0;
  let targetFar = 0;

  const reset = (): void => {
    barsInTrade = 0;
    scaledOut = false;
    targetMid = 0;
    targetFar = 0;
  };

  return {
    id: 'bb-rsi-reversion',
    warmupBars: historyNeeded + 40,

    init: reset,

    onBar(view: MarketView, api: TradingApi): void {
      const closes = view.closes(historyNeeded);
      if (closes.length < historyNeeded) return;

      const bands = bollinger(closes, bbPeriod, bbMult);
      if (!bands) return;
      const price = view.bar().close;
      const range = atr(view, 14);
      if (!Number.isFinite(range) || range <= 0) return;

      const position = view.position();

      if (position.qty !== 0) {
        barsInTrade += 1;
        const isLong = position.qty > 0;

        // Staged exits. The middle band is the trade's actual thesis; the far
        // band is a bonus that often does not arrive.
        if (!scaledOut && (isLong ? price >= targetMid : price <= targetMid)) {
          scaledOut = true;
          if (scaleOutFraction < 1) {
            api.submit({
              side: isLong ? 'sell' : 'buy',
              qty: Math.abs(position.qty) * scaleOutFraction,
              type: 'market',
              reduceOnly: true,
              tag: 'target-mid',
            });
            return;
          }
        }
        if (scaledOut && (isLong ? price >= targetFar : price <= targetFar)) {
          api.cancelAll();
          api.closePosition('target-far');
          reset();
          return;
        }
        if (barsInTrade >= maxBarsInTrade) {
          api.cancelAll();
          api.closePosition('time-stop');
          reset();
        }
        return;
      }

      reset();
      if (api.workingOrders().length > 0) return;

      // --- Regime: is this a market that comes back at all? ----------------
      const trendStrength = adx(view, 14);
      if (!Number.isFinite(trendStrength) || trendStrength >= maxAdx) return;

      const bwPct = bandwidthPercentile(closes, bbPeriod, bbMult, bwLookback);
      if (!Number.isFinite(bwPct) || bwPct < minBwPct || bwPct > maxBwPct)
        return;

      const earlier = bollinger(
        closes.slice(0, closes.length - slopeLookback),
        bbPeriod,
        bbMult,
      );
      if (!earlier) return;
      const channel = bands.upper - bands.lower;
      if (channel <= 0) return;
      const midSlope = Math.abs(bands.mid - earlier.mid) / channel;
      if (midSlope > maxMidSlopeBandFraction) return;

      // --- Timing ----------------------------------------------------------
      if (sessionHours && !sessionHours.includes(hourOfDay(view.now()))) return;

      // --- Signal ----------------------------------------------------------
      const momentum = rsi(view, rsiPeriod);
      if (!Number.isFinite(momentum)) return;

      let trendOkLong = true;
      let trendOkShort = true;
      if (trendFilterPeriod > 0) {
        const trendMa = sma(closes, trendFilterPeriod);
        if (!Number.isFinite(trendMa)) return;
        trendOkLong = price >= trendMa;
        trendOkShort = price <= trendMa;
      }

      const longSetup =
        bands.percentB <= bandTouch && momentum <= rsiOversold && trendOkLong;
      const shortSetup =
        allowShort &&
        bands.percentB >= 1 - bandTouch &&
        momentum >= rsiOverbought &&
        trendOkShort;
      if (!longSetup && !shortSetup) return;

      // --- Structure: has price already turned somewhere near here? --------
      const swing: SwingPoint | null = lastSwing(
        view,
        longSetup ? 'low' : 'high',
        swingStrength,
        swingLookback,
      );
      if (!swing) return;
      if (Math.abs(swing.price - price) > swingProximityAtr * range) return;

      const direction = longSetup ? 1 : -1;
      const swingStop = swing.price - direction * stopAtr * range;
      const entryStop = price - direction * stopAtr * range;
      const stopPrice =
        stopMode === 1
          ? entryStop
          : stopMode === 2
            ? longSetup
              ? Math.min(swingStop, entryStop)
              : Math.max(swingStop, entryStop)
            : swingStop;

      const stopDistance = Math.abs(price - stopPrice);
      if (stopDistance <= 0) return;

      const rewardDistance = Math.abs(bands.mid - price);
      if (minRewardRisk > 0 && rewardDistance < minRewardRisk * stopDistance)
        return;

      const rewardBps = (rewardDistance / price) * 10_000;
      if (minEdgeMultiple > 0 && rewardBps < minEdgeMultiple * roundTripCostBps)
        return;

      const edgeScale = sizeByEdge
        ? Math.min(
            1,
            Math.max(
              0,
              (rewardBps - roundTripCostBps) /
                (edgeSizingCap * roundTripCostBps),
            ),
          )
        : 1;
      const qty =
        Math.min(
          (view.equity() * riskFraction) / stopDistance,
          (view.equity() * maxGross) / price,
        ) * edgeScale;
      if (qty <= 0) return;

      targetMid = bands.mid;
      targetFar = longSetup ? bands.upper : bands.lower;
      barsInTrade = 0;
      scaledOut = false;

      api.submit({
        side: longSetup ? 'buy' : 'sell',
        qty,
        type: 'market',
        tag: 'bb-rsi',
        bracket: { stopLoss: stopPrice },
      });
    },
  };
}
