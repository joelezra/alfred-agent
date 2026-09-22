# Bollinger + RSI reversion: what the harness found

The strategy as specified: price touches the outer Bollinger band in a session
that is not extremely volatile or trending, RSI agrees the move is stretched,
there is a swing nearby, the clock is right — trade the return to the middle
band, then the far one.

It was built (`src/strategies/bb-rsi-reversion.ts`), run through the fifteen
scenarios under five cost regimes, and tuned by walk-forward. **It fails four
blocking gates.** The interesting part is not the verdict, it is the six
measurements underneath it — five of which are about the parts of the strategy
nobody argues about.

All figures below are reproducible from the committed code at the shipped
defaults.

---

## Verdict

| | Gate | Observed |
|---|---|---|
| ✅ | Raw edge clears the toll | 47.2bps gross vs 16.9bps cost (**2.79×**) |
| ✅ | Cannot see the future | clean |
| ✅ | Enough trades | 1192 total, 26 in the median scenario |
| ✅ | Survives its worst scenario | −8.98% |
| ✅ | Drawdown stays survivable | 9.64% |
| ✅ | Bad luck is not ruinous | −6.14% at the 20th-percentile seed |
| ❌ | Makes money across the catalogue | −2.73% |
| ❌ | Works in more than one market | 4/15 scenarios positive |
| ❌ | Still profitable at double the costs | −4.18% |
| ❌ | Still profitable one second slower | −2.73% |

Per-trade economics and risk control are fine. It fails on breadth: the reversion
gains are real, and the trending and dislocating regimes cancel them.

Gross edge per trade, by scenario:

| Where it works | | Where it does not | |
|---|---:|---|---:|
| `high-vol-whipsaw` | +253bps | `spread-blowout` | −39bps |
| `chop-range` | +137bps | `quiet-drift` | +11bps |
| `regime-flip` | +94bps | `fee-hike` | +33bps |
| `gap-risk` | +78bps | `bull-trend` | +33bps |
| `news-shock` | +70bps | `thin-liquidity` | +38bps |

Note `flash-crash`: +100bps gross edge per trade and a −5.19% return. When those
two disagree, finding 3 is why.

---

## 1. RSI(14) confirms almost none of the band touches

Across the whole catalogue, counting bars that pass the regime filters:

| | bars passing regime filters | of which band touch | of which RSI also extreme |
|---|---:|---:|---:|
| RSI(14), 30/70 | 6703 | 1319 | **71** (5.4%) |
| RSI(2), 10/90 | 6703 | 1319 | **907** (69%) |

RSI(14) confirms one band touch in twenty. Its 1st percentile over a reverting
market is 26.1 — it only just reaches the classic threshold at the extreme tail.

The mechanism is structural, not a quirk of these markets. Reaching RSI(14) ≤ 30
requires a sustained run of losses across fourteen bars; a mean-reverting market
by definition does not provide one. So "wait for the band touch *and* RSI below
30" is a far rarer event than it looks on a chart, and the few that do fire tend
to be trends — the regime every other filter exists to exclude.

The fix is the documented one: a short lookback. Connors' RSI(2) below 10 is the
standard mean-reversion form and confirms 69% of touches instead of 5%. That is
the default now. **If you want RSI(14), you are choosing roughly twenty times
fewer trades, most of them in the wrong regime.**

## 2. The stop decided this strategy, not the entry

Exit reasons on the original design, across 1457 round trips: **76% hit the
stop**, 15% reached the middle band, 9% the far band.

The cause was geometry. The stop sat one ATR beyond the nearest confirmed swing,
and a swing frequently prints adjacent to the entry — giving a stop so tight that
ordinary noise closed the trade. Targets meanwhile sat 110 to 361 bps away
(median 193) against a 19bps round trip. The target was never the problem.

Taking the wider of a swing-anchored and an entry-anchored stop, at two ATR:

| | stop-out rate | median gross edge/trade |
|---|---:|---:|
| swing-anchored, 1 ATR | 76% | 19.4bps |
| wider of the two, 2 ATR | **46%** | **47.4bps** |

A 2.4× improvement in gross edge from one change to the exit. Nothing about the
entry logic moved. If you are going to spend effort on one part of a reversion
strategy, spend it here.

## 3. The sizing rule bets hardest on the thinnest edges

This is the one worth taking away, and it is **not fixed**.

| | equal-weighted | **size-weighted** | large positions | small positions |
|---|---:|---:|---:|---:|
| risk sizing only | +61.0bps | **−12.3bps** | −71.8bps | +193.2bps |
| edge-scaled sizing | +61.4bps | **−10.7bps** | −56.3bps | +178.8bps |

Risk-based sizing sets quantity as `risk / stopDistance`, so position size is
inversely proportional to volatility. The largest positions get taken when
volatility is lowest — exactly when a fixed ~17bps of commission and spread eats
the largest share of the move. The strategy makes money on its small positions
and gives it back on its large ones.

A per-trade table reading **+61bps** describes a portfolio nobody traded. The
number that corresponds to the actual equity curve is **−12bps**.

Scaling size by how far the expected move beats the round trip helps at the
margin (−12.3 → −10.7bps) and does not solve it. The anti-correlation is
structural: it comes from sizing on risk while costs are roughly fixed in bps.
Fixing it properly means sizing on expected edge *net of the current cost of
trading*, which means the strategy has to know what it is paying.

**If you take one thing from this document:** report expectancy size-weighted, or
you are measuring a portfolio you did not trade.

## 4. Session timing: the machinery works, the evidence does not

Median net bps per trade over 5 seeds (trade count in brackets):

| | all hours | avoid opens | quiet only | liquid only |
|---|---:|---:|---:|---:|
| `session-reversion` (structure **exists**) | 17 (116) | −1 (81) | **21** (52) | 10 (76) |
| `session-flat` (**no** structure exists) | 30 (116) | 20 (79) | 44 (46) | **62** (82) |

Read the bottom row first. `session-flat` has the same U-shaped volatility and
volume through the day, but ranges hold equally well at every hour — there is no
time-of-day edge to find, by construction. It nevertheless shows a spread of 20
to 62 bps across session windows, **larger than the spread in the row where the
effect is real**, and its best window is `liquid-only`, which is second-worst
where the structure actually exists.

So at 46–116 trades per configuration, the session filter cannot distinguish
structure from noise — and the noise is louder than the signal. An earlier
version of these scenarios had much stronger intraday reversion, and there the
ordering came out correctly (quiet-only best, liquid-only worst, monotone). The
effect is detectable when it is large. At a realistic size it is not.

The honest ways forward: many more trades, or an a-priori reason to prefer a
window — a fixing, a known liquidity pattern, a scheduled event — rather than
the window that backtested best. Picking hours off a backtest of this size is
curve fitting with extra steps.

## 5. Tuning the filters does not generalise

Walk-forward, 27 parameter sets over the regime filters, 4 folds, 108 trials:

| tuned on | mean in-sample | mean out-of-sample | efficiency | consistency | distinct params chosen |
|---|---:|---:|---:|---:|---:|
| `regime-flip` | +5.14% | **−0.30%** | −0.06 | 50% | 4 of 4 folds |
| `session-reversion` | +2.74% | **−2.31%** | −0.85 | 0% | 3 of 4 folds |

Every fold picks different parameters, and out-of-sample is zero or worse. The
parameters are not the problem, and a grid search over them will only produce a
number that feels earned.

## 6. Two filters that sounded right and were not

**Connors' 200-period trend filter** (only buy above the long average) cut median
gross edge from 47.4 to 31.0bps and trade count from 1193 to 425. It does not
transfer: Connors pairs it with a *shallow* RSI pullback, whereas a two-sigma
band touch is usually below the long average by construction, so the filter
removes precisely the setups the strategy exists to take. Off by default,
available as `trendFilterPeriod`.

**A volatility-acceleration stand-down** (skip when short ATR / long ATR > 1.8)
fired **0 times in 7172 eligible bars** — ADX and bandwidth already excluded
everything it would have caught. Deleted rather than shipped. Dead safety code is
worse than none, because it looks like protection.

---

## What would have to change

Not parameters. Two structural things:

1. **Regime classification has to get better.** ADX, bandwidth percentile and
   middle-band slope do not separate "stretched and coming back" from "trending
   and not finished". The losses in trending regimes cancel real gains
   elsewhere. For a reversion strategy this is the whole game, and it is
   currently the weakest part.
2. **Sizing has to track edge net of current cost.** Half-done, and the half that
   is done moved the result from −12.3 to −10.7bps. A version that reads the
   prevailing spread and sizes against it would go further.

A third option is to stop trying to make it work everywhere: detect the ranging
regime and switch the strategy off entirely outside it. The per-trade numbers say
that version makes money. The harness cannot tell you whether the regime is
detectable *in advance*, which is the same hard problem wearing a different hat.

## Caveats

The scenarios are synthetic. That is deliberate — a strategy cannot be fitted to
data generated after it was written, and the session structure had to be put in
on purpose to be testable at all. But it means this tests **robustness and
cost-viability, not whether the edge exists in your market**. The reversion in
`chop-range` is there because the generator puts it there.

What transfers: findings 1, 2 and 3 are about the interaction of indicators,
geometry and costs, and hold regardless of where the prices came from. Findings 4
and 5 are statements about sample size, and get worse with real data, not better.

What does not transfer: the per-scenario returns. They are not a forecast.

## Sources

- [Connors' 2-period RSI](https://www.quantifiedstrategies.com/rsi-2-strategy/) — the short-lookback mean-reversion form, and the 200-day trend filter it is normally paired with
- [RSI(2) on StockCharts](https://chartschool.stockcharts.com/table-of-contents/trading-strategies-and-models/trading-strategies/rsi-2)
- [Bollinger %B with ADX as a regime gate](https://crosstrade.io/learn/trading-strategies/bollinger-mean-reversion) — band touch plus ADX below 20, and the band-walking failure mode
- [Swing high/low confirmation lag](https://www.luxalgo.com/library/concept/swing-high-low/) — why a pivot of strength *n* is only knowable *n* bars later
- [Session open/close behaviour](https://www.luxalgo.com/library/concept/session-open-close-behaviors/) and [FX intraday seasonality](https://www.sciencedirect.com/science/article/abs/pii/S0889158306000463) — the U-shapes the session profile encodes
