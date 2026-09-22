---
name: trading-centre
description: Write, test and grade trading strategies against the backtest harness in trading/. Use when asked to build, improve, evaluate or reject a trading strategy, to run a backtest, to check a strategy for lookahead, or when someone proposes a scalping or high-frequency approach. Read this before writing any strategy code.
---

# Trading centre

The project mounts a strategy harness at `trading/`. It is an event-driven
backtester plus thirteen synthetic market conditions plus a set of pass/fail
gates. Full documentation is in `trading/README.md` — read it before writing a
strategy.

**Main-channel check:** this needs the project mounted. Run:

```bash
test -d /workspace/project/trading && echo "AVAILABLE" || echo "NOT_AVAILABLE"
```

If `NOT_AVAILABLE`, say the trading centre is only available in the main chat
and stop.

## The loop

1. Write the strategy in `trading/src/strategies/<name>.ts` and register it in
   `trading/src/strategies/registry.ts`.
2. Run the harness and read the machine-readable verdict:

```bash
cd /workspace/project
npm run trading -- harness --strategy <name> --json /tmp/verdict.json
```

3. Every failing gate carries a `rationale` saying what it is protecting against
   and an `observed` value saying by how much you missed. Fix the cause, not the
   threshold.
4. Repeat until `passed` is true. The command exits non-zero while it is not.

## Before proposing a fast strategy

Check whether the timeframe is viable at all, before writing any logic:

```bash
npm run trading -- harness --strategy <name> --interval 1m --json /tmp/verdict.json
```

Read `costFloor` in the JSON. It reports what a strategy with **perfect
foresight** earns at each holding period, paying the same costs. If the shortest
viable horizon is 30 bars and the proposal holds for 5, the proposal cannot work
— not because the signal is weak but because the market does not move far enough
in five bars to pay for a round trip. Say so plainly and give the number.

## Rules you must follow when writing a strategy

- Read prices only through the `MarketView` passed to `onBar`. `bar(0)` is the
  last **closed** bar. Never accept, import or close over a raw `Bar[]`.
- Never use `Math.random`. Use `ctx.random()` from `init` so runs reproduce.
- Assume every order fills on the *next* bar, worse than the price you saw.
- Size by risk, not by capital, and have a condition that makes you stand down.

The audit will catch a violation of the first rule and name the bar where it
happened. It is not a warning — a strategy that reads unclosed bars has no
result, only a number.

## Reporting a result

Give the verdict line, the gates that failed with their observed values, and one
sentence on the cause. Do not report a strategy as working because it made money
in a backtest: say which gates it cleared. If it failed, say what would have to
change about the strategy — or about the cost structure — for it to pass.

Never loosen a threshold in `trading/src/harness/gates.ts` to make a strategy
pass. If a threshold genuinely looks wrong, say so and let a human decide.
