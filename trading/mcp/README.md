# MCP servers for the trading centre

Short version: **connect TradingView, don't connect a backtesting MCP, and leave
execution until you have something worth executing.**

---

## TradingView MCP — yes, for research

TradingView shipped an official MCP server (public beta, September 2026).

- **Endpoint:** `https://mcp.tradingview.com/mcp`
- **Auth:** OAuth against your TradingView account. No API keys.
- **Plan:** Essential tier or higher.
- **Tools:** quotes and price history, the Screener, fundamentals, news and SEC
  filings, economic calendars and data series, earnings call transcripts,
  watchlist and alert management.

Add it:

```bash
claude mcp add --transport http tradingview https://mcp.tradingview.com/mcp
```

Or copy [`../../config-examples/trading-mcp.json`](../../config-examples/trading-mcp.json)
into `.mcp.json` at the repo root. First use opens a browser to authenticate.

**What it is good for:** letting the agent form a view. Which instruments are
moving, what the fundamentals and news say, what the calendar holds this week,
what a screener turns up. That is genuine context a strategy author needs.

**What it is not good for, and this matters:**

- Market data in the beta is **delayed**, and requests are rate-limited.
- There is **no order execution** and **no backtesting**.
- There is no bulk historical download. You cannot build a point-in-time bar
  store out of it.

So use it for research and never as the data source underneath a backtest. A
backtest fed from a delayed, rate-limited, individually-queried API will silently
acquire survivorship and timing artefacts — exactly the contamination the engine
in this directory exists to prevent.

---

## TradeKit — probably not what you want yet

There is no MCP server called exactly "TradeKit". The closest, in case one is
what you had in mind:

| Project | What it actually is | Backtesting? |
|---|---|---|
| [`okx/agent-trade-kit`](https://github.com/okx/agent-trade-kit) — "OKX Agent Trade Kit" | 167 tools over OKX: spot, swap, futures, options, grid bots, market data, indicators. Local process, your API keys, `--read-only` flag available. | No — live and paper execution only |
| [`nkrvivek/traderkit`](https://github.com/nkrvivek/traderkit) | 33 tools of risk gates: position caps, wash-sale rules, regime-based sizing, execution discipline. | No |
| [`hackingthemarkets/tradekit`](https://github.com/hackingthemarkets/tradekit) | Python libraries and server components for market data pipelines. Not an MCP server. | No |

The OKX one is the strongest guess and it is a good execution layer — but it is
an execution layer. It has nothing to contribute to training, and connecting a
server that can place real orders to an agent that is still learning to write
strategies is a bad trade. Add it when a strategy has cleared the harness and you
want paper fills against a real venue.

---

## Backtesting MCPs — deliberately not used

Several MCP servers will run a Pine Script strategy through TradingView's
Strategy Tester and hand back trades, win rate and drawdown
([one example](https://mcpservers.org/servers/vtlk/tv-pinescript-backtest-engine-mcp)).
They are convenient. They should not be the thing that decides whether a strategy
is good.

The reason is the whole argument of this directory: **a backtest's honesty lives
entirely in its fill model, and you cannot audit a fill model you cannot read.**
TradingView's Strategy Tester in particular is optimistic in ways that are well
known and that matter most to exactly the fast strategies you want to reject — it
fills limit orders on touch, assumes unlimited size at the quoted price, models
no market impact, no partial fills, no latency and no adverse selection. A
scalping strategy can look excellent there and lose money on every one of those
five counts.

The engine here charges all five, on every fill, by default. That is the point of
it. Use a Pine Script backtest as a second opinion if you like — a strategy that
looks good in TradingView and fails here has been told something useful — but the
gate that decides is `npm run trading -- harness`.

---

## Recommended setup

| Stage | Connect |
|---|---|
| Training the agent to write strategies | Nothing. The harness is self-contained and deterministic. |
| Researching instruments and regimes | TradingView MCP |
| Paper trading a strategy that passed | An execution MCP (OKX Agent Trade Kit or your broker's), read-only first |
| Live | Same, with real risk limits, after paper results match harness expectations |

Credentials for any of these go through the OneCLI gateway like everything else
in this repo — see the root [`CLAUDE.md`](../../CLAUDE.md). Never put exchange
keys in `.mcp.json`.
