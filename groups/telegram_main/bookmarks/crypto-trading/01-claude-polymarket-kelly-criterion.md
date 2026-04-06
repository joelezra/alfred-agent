# Claude-Powered Polymarket Bot — $1K → $14K with Kelly Criterion

**Bookmarked:** Mar 31, 2026 (09:13 MYT)
**Author:** @slash1sol (slash1s) — 202k views, 770 likes, 1.5k bookmarks
**Tweet ID:** 2038786820574449777
**Category:** Crypto / Trading Automation
**Type:** Reference / Inspiration
**Actionable:** Conceptually YES — the risk management principles are applicable anywhere

---

## The Core Claim

Two Claude Opus 4.6-powered bots. Same $1,000 starting capital. Same Polymarket markets. Same 48-hour window.

- **Bot A:** $1,000 → $14,216 (+1,322%)
- **Bot B:** $1,000 → $0

The difference wasn't the model. It wasn't market selection. It was **risk management baked into the code.**

---

## What the Winning Bot Did Differently

1. **Kelly Criterion** applied to every single position
2. **Ruthless position-size caps**
3. **Automatic kill-switch** the moment drawdown hit the limit
4. **Full shutdown** the moment the math said "walk away"

> "That's exactly why I'm now copying the sharpest Polymarket performers on full autopilot through PolyGun"

---

## The [0x8dxd] Bot Reference

The tweet references a legendary Polymarket account:
- Caught a **2-3 second latency gap** between Binance and Polymarket
- Ran **98%+ win rate** across tens of thousands of trades
- Turned **$313 → $2.38 million** with military-grade risk management

This bot exploited price discovery speed differences — Binance prices update instantly; Polymarket takes 2-3 seconds to reflect the same price movement. In those 2-3 seconds, there's a guaranteed arbitrage if you can execute fast enough.

---

## The Kelly Criterion (Why It Matters)

The Kelly Criterion is a mathematical formula for optimal bet sizing:

```
f* = (bp - q) / b

Where:
f* = fraction of bankroll to bet
b = odds received on the bet (decimal - 1)
p = probability of winning
q = probability of losing (1 - p)
```

**Why it matters:** Most traders either:
- Bet too small (leaves money on the table)
- Bet too large (ruins the account on a losing streak)

Kelly Criterion finds the mathematically optimal size that maximises long-run growth while managing ruin risk. With a 60% win rate and 2:1 payout, Kelly says bet ~20% of bankroll. Most people either bet 5% (too conservative) or 50% (reckless).

**Applied to Polymarket:** If your model says Event X has 65% probability and the market is pricing it at 55%, Kelly tells you exactly how much to allocate.

---

## The MACD + Incubation Phase

The tweet mentions "proprietary MACD filters" and a "strict incubation phase":
- **MACD (Moving Average Convergence Divergence)** applied to prediction market price movements — identifying momentum shifts in market sentiment
- **Incubation phase:** A period where the bot monitors a market without acting, building a confidence model before entering any position
- Combined: only enter when both the directional signal (MACD) AND the probability edge (Kelly) are confirmed

This is the same discipline structure as ICT trading — wait for confluence before entering, never trade on one signal alone.

---

## The Risk Management Architecture

```
Position sizing → Kelly Criterion
Max position cap → 20% of bankroll (regardless of Kelly output)
Drawdown limit → Auto kill-switch triggers at -X%
Absolute shutdown → If math says "no edge right now" → stop trading
```

The kill-switch is the most important piece. Most traders override their own rules. Coding the kill-switch means there's no override possible — the math enforces discipline mechanically.

---

## Applicability Beyond Polymarket

The principles here apply directly to:
- **ICT trading system** — position sizing via Kelly, kill-switch when confluence is below threshold
- **Any algorithmic trading** — the bot that went to zero made the same mistake: no hard stop
- **Business decisions** — Kelly-style thinking: only commit resources proportional to your edge

---

## The Deeper Point

> "Manual trading against machines like these is suicide in 2026."

This is true in Polymarket, increasingly true in forex, and will be true everywhere as AI-powered systematic trading becomes standard. The edge isn't intelligence — it's **discipline that can't be overridden by emotion.**

The bot that went to zero was probably making the same trades as the winning bot at times. It just held on too long, sized too large, or didn't have the kill-switch.
