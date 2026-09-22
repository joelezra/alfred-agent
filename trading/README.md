# Trading centre

A place to train an AI to write trading strategies, and a test suite strict
enough that passing it means something.

Three parts:

| Part | What it is |
|---|---|
| **Engine** (`src/engine`, `src/guards`) | Event-driven replay. Feeds a strategy one bar at a time and makes lookahead structurally impossible. |
| **Scenarios** (`src/scenarios`) | Fifteen synthetic market conditions — trends, ranges, crashes, gaps, thin books, wide spreads, slow venues, and two with intraday session structure. |
| **Harness** (`src/harness`) | Runs a strategy through all of them under five cost regimes and turns the result into a pass or a fail with reasons. |

```bash
npm run trading -- scenarios                              # what the catalogue contains
npm run trading -- backtest --strategy sma-trend --scenario bull-trend
npm run trading -- harness  --strategy naive-scalper      # the full verdict
npm run trading -- audit    --strategy sma-trend          # lookahead check only
npm run trading -- walkforward --strategy sma-trend
npm run test:trading                                      # 72 tests
```

`harness` exits non-zero when a blocking gate fails, so it drops straight into CI
or an agent loop.

---

## Is "playing history forward" just a backtest?

Almost. The distinction that matters is not replay versus backtest, it is
**vectorised versus event-driven**.

A vectorised backtest computes signals across a whole price series at once —
`df['signal'] = df['close'] > df['close'].rolling(20).mean()` — and then sums the
returns. It is fast, and it is where most fake alpha comes from, because nothing
in it prevents row *n* from depending on row *n+1*. An off-by-one in a shift, an
indicator centred instead of trailing, a label joined on the wrong timestamp: all
of them silently produce a beautiful equity curve.

Event-driven replay hands the strategy one bar, takes its orders, moves the
clock, and repeats. That is what this engine does, and it is both the replay
harness and the backtester — they are the same object. So yes: what you want is
a backtest, done the honest way.

What genuinely *isn't* a backtest, and is also here:

- **Walk-forward** (`src/harness/walkforward.ts`) — fit parameters on one window,
  score them on the next, roll forward. A single backtest cannot tell you whether
  you tuned well or tuned to noise; this can.
- **Scenario simulation** (`src/scenarios`) — markets that never happened but
  could. History has one path. You need the ones it didn't take.
- **Forward testing** — same engine, live feed, no orders. Not built here; the
  `Strategy` interface is deliberately the same shape a live loop would need.

---

## How the engine stops a backtest cheating

Nine mechanisms, all on by default. Each corresponds to a specific way backtests
flatter themselves.

**1. The sealed view.** A strategy never receives the bar array. It gets a
`MarketView` where `bar(0)` is the most recently *closed* bar and `bar(-1)`
throws. There is no index that reaches tomorrow.

**2. The bar guard.** If a strategy is handed the raw series anyway — by a helper,
a feature builder, a closure — the audit hands it a `Proxy` that throws on any
element read past the clock, and names the bar it tried to read. This is how
lookahead actually gets into real code, and it is caught deterministically.

**3. Next-bar execution.** An order decided on the close of bar T cannot touch bar
T. It arrives part-way into bar T+1, and the further latency pushes it, the less
of that bar's range remains available to it. A one-second delay on a minute bar
measurably worsens the fill.

**4. Trade-through, not touch.** A limit order fills only if the bar trades
*through* its price by a tick. Touch-fills are the single most common source of
imaginary edge.

**5. Stops fill at the gap.** A stop at 105 on a bar that opens at 120 fills at
120. Continuous-price risk models are how accounts die.

**6. Pessimistic bracket resolution.** When one bar spans both the stop and the
target, the stop wins.

**7. Participation caps.** No order may take more than 5% of a bar's volume. The
rest stays working. This is what capacity limits feel like, and it is why the
`thin-liquidity` scenario hurts.

**8. Costs on every fill.** Commission, half-spread (widening with realised
volatility), square-root market impact, adverse selection on resting orders, and
daily financing on gross exposure. Resting orders skip the spread and pay for
being picked off instead — without that term, maker-side scalping looks free.

**9. Flat at the end.** Any open position is liquidated at full taker cost. A
position marked to market at the final close books a profit you never took.

Plus: strictly seeded RNG on separate streams, so venue jitter cannot shift the
market path; and `validateBars`, which rejects overlapping, non-finite or
impossible OHLC before anything runs.

### The audit

`npm run trading -- audit --strategy X` runs three checks:

1. **Guarded read** — the proxy above.
2. **Forked future** — run the strategy twice over two datasets identical up to a
   cut point and unrelated after it. A strategy confined to the sealed view
   cannot tell them apart, so its decisions before the cut must be identical. Six
   cuts by default; the first disagreement names the bar.
3. **One-bar delay** — hold every order back one bar. A real edge degrades. An
   edge that was quietly reading the bar it trades on disappears.

---

## The cost floor — how to turn down a scalping strategy in one number

Before looking at any strategy, ask what the market allows. The harness runs a
strategy with **perfect foresight** at a range of holding periods, paying exactly
the same spread, fees, impact and latency as everyone else:

| Hold (bars) | Oracle return | Edge/trade | Cost/trade | Viable |
|---:|---:|---:|---:|:--:|
| 1 | −64.43% | −11.8bps | 17.6bps | ❌ |
| 5 | −15.23% | −5.6bps | 18.8bps | ❌ |
| 10 | −2.27% | −1.5bps | 19.0bps | ❌ |
| 30 | 3.72% | 6.5bps | 19.1bps | ✅ |
| 60 | 6.05% | 20.5bps | 19.0bps | ✅ |

*`regime-flip`, one-minute bars, default costs — reproduce with*
*`npm run trading -- harness --strategy naive-scalper --interval 1m --scenarios regime-flip --seeds 1`*

That is not a statement about a strategy. It is a statement about the market: on
one-minute bars at these costs, **nothing held for under thirty bars can make
money, however good its signal**, because a bar does not move far enough to pay
for a round trip. A scalping strategy proposing five-bar holds here is dead
before you read its logic, and no amount of tuning changes it.

Tighten your costs and the floor drops. That is the honest way to argue for a
fast strategy: show the cost structure that makes it possible.

---

## The scenarios

Each exists to kill a specific kind of wishful thinking.

| Scenario | Built to expose |
|---|---|
| `bull-trend` | Nothing — a control. Losing here means you are structurally short or over-trading. |
| `bear-grind` | Long-only strategies and dip buyers without stop discipline. |
| `chop-range` | Trend following, breakouts, anything needing follow-through. |
| `high-vol-whipsaw` | Tight stops and anything assuming the next bar continues this one. |
| `flash-crash` | Mean-reversion buyers, static sizing, stops placed inside the noise. |
| `gap-risk` | Stops assumed to fill at their price; continuous-price risk models. |
| `thin-liquidity` | Anything assuming it gets filled. Capacity and partial fills. |
| `spread-blowout` | Strategies whose edge is smaller than the spread. |
| `latency-spike` | Edges that live inside the first seconds of a move. |
| `fee-hike` | Profit that is a thin margin over today's fee schedule. |
| `regime-flip` | Parameters fitted to one regime; no way to stand down. |
| `quiet-drift` | Trading on a schedule rather than on an edge. |
| `news-shock` | Holding through events without sizing for the tail. |
| `session-reversion` | Reversion strategies that trade 02:00 the same way as 08:00, and session filters fitted to nothing. |
| `session-flat` | Session filters that are really curve fits — the same volatility shape, but no time-of-day edge to find. |

Prices come from an intrabar random walk with mean reversion, a persistent AR(1)
trend, clustered volatility and jumps. OHLC is read off that path rather than
invented, so wicks, gaps and stop-outs behave the way they do on a chart. Same
seed, same bars, always.

Two scenarios carry a **session profile** (`SessionProfile`): per-UTC-hour
multipliers on volatility, volume and how hard ranges hold. `FX_SESSIONS` has the
usual shape — Asia quiet, London open at 07:00, New York at 13:00, the overlap
busiest — with reversion *weakest* at the opens, when ranges break. Without this
in the simulator, a strategy that says "only trade these hours" cannot be tested
either way. `session-flat` is its control: identical volatility and volume shape,
but reversion uniform across the clock, so any time-of-day edge found there is
noise by construction.

Default timeframe is **hourly bars over twelve weeks** — long enough in market
time that a real edge can clear a round trip. Run the same catalogue anywhere
else with `--interval 1m|5m|15m|1h|4h|1d`. A strategy should be tested at the
timeframe it claims.

---

## The gates

Ten blocking, five advisory. Blocking means *do not run this with money*.

| Gate | Passes when |
|---|---|
| Cannot see the future | No unclosed bar read, no divergence across forked futures |
| Enough trades | ≥200 round trips pooled, ≥8 in the median scenario |
| Raw edge clears the toll | Gross edge per trade ≥ 2× the round-trip cost |
| Makes money across the catalogue | Median scenario return > 0 |
| Works in more than one market | ≥50% of scenarios positive |
| Survives its worst scenario | Worst median return ≥ −25% |
| Drawdown stays survivable | Worst median drawdown ≤ 35% |
| Still profitable at double the costs | Median return > 0 at 2× costs |
| Still profitable one second slower | Median return > 0 with +1s latency |
| Bad luck is not ruinous | 20th-percentile seed ≥ −20% |
| *(advisory)* Triple costs, capacity, one-bar delay, cost floor, deflated Sharpe | |

Two deserve explanation.

**Raw edge clears the toll.** A signal worth less than twice what it costs to act
on has no margin for a worse day — a lost fee tier, a wider spread, a slower
venue. This is the gate that kills most fast strategies, and it kills them on
arithmetic rather than opinion.

**Deflated Sharpe** (advisory). If you try two hundred variants, the best looks
excellent whether or not any has an edge. This asks whether the Sharpe beats what
the luckiest of `--trials N` coin flips would produce, using the Sharpe dispersion
the suite actually observed across seeds. Be honest about `--trials`; the default
of 20 is generous.

---

## Reference strategies

Three ship, and what they do is the point:

- **`naive-scalper`** — three bars up, buy, target eight basis points. Fails
  eight blocking gates. Keep it: it is the canary. Any change to the cost model
  that lets this pass has broken the harness.
- **`sma-trend`** — plain crossover with an ATR stop. Fails on tail risk and
  drawdown. A useful control: a new strategy that cannot beat this is not worth
  the risk of running.
- **`bb-rsi-reversion`** — Bollinger band touch plus RSI, at a confirmed swing,
  filtered for regime and session. Fails four blocking gates. See
  [`docs/bb-rsi-findings.md`](docs/bb-rsi-findings.md) for what the harness
  found and why it matters more than the verdict.
- **`adaptive-trend`** — will not open unless the expected move is several times
  the round trip, sizes by risk rather than capital, stands down when volatility
  dislocates. Clears all ten blocking gates. It still trips two advisory ones:
  it goes slightly negative at triple costs, and its deflated Sharpe is 0.017,
  meaning twenty honest attempts at this would likely produce something that
  looks as good. It is a reference that the gates are passable, not a
  recommendation — it passes narrowly and it knows it.

That spread is deliberate. A harness that rejects everything is a rejection
machine, not a training signal; `trading/tests/harness.test.ts` asserts both that
the scalper fails and that `adaptive-trend` passes at the shipped defaults. If a
change to costs, scenarios or thresholds breaks either, the harness has been
recalibrated and someone should decide whether that was intended.

---

## Writing a strategy

```ts
import type { Strategy } from './src/types.js';

export function myStrategy(params: Record<string, number> = {}): Strategy {
  const lookback = params.lookback ?? 50;

  return {
    id: 'my-strategy',
    warmupBars: lookback + 10,

    onBar(view, api) {
      const closes = view.closes(lookback);   // oldest first, never the future
      const price = view.bar().close;         // last CLOSED bar
      if (view.position().qty !== 0) return;

      api.submit({
        side: 'buy',
        qty: (view.equity() * 0.5) / price,
        type: 'market',
        bracket: { stopLoss: price * 0.98 },
      });
    },
  };
}
```

Register it in `src/strategies/registry.ts`, then:

```bash
npm run trading -- harness --strategy my-strategy --json verdict.json
```

Rules the engine enforces for you: orders fill on the next bar, exits are
reduce-only so a late close cannot reverse you, and brackets are dropped when the
position they protected is gone. Rules it cannot enforce: don't use
`Math.random` (use `ctx.random()` from `init`), and don't accept the bar array
from anywhere — if you do, the audit will find it.

---

## Data

The catalogue is synthetic and that is on purpose: a strategy cannot have been
fitted to data generated after it was written. For real history, produce
`Bar[]` — `openTime`, `closeTime`, OHLC, `volume` — run `validateBars` over it,
and pass it to `runBacktest`. Everything else is unchanged.

Do not use the TradingView MCP as a backtest data source. See [`mcp/`](mcp/).

## Layout

```
trading/
  cli.ts                      commands
  src/types.ts                Bar, Order, Fill, Strategy, CostModel
  src/rng.ts                  seeded, per-stream RNG
  src/guards/                 sealed view, bar guard, lookahead audit
  src/market/                 spread, impact, latency, volatility tracking
  src/engine/                 broker, portfolio, replay loop
  src/metrics/                performance stats, deflated Sharpe
  src/scenarios/              generator, session profiles, the fifteen conditions
  src/harness/                suite, gates, cost floor, walk-forward, report
  src/strategies/             references, oracle, registry
  tests/                      72 tests, including the calibration ones
```
