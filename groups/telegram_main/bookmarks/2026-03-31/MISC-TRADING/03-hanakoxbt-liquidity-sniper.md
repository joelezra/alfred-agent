# Hanako's Claude-Built Liquidity Sniper Terminal: Prediction Market Mean Reversion Bot

**Source:** https://twitter.com/hanakoxbt/status/2039010981288845745
**Author:** @hanakoxbt (Hanako) — verified crypto/prediction market trader on X, active Polymarket/Kalshi participant
**Date:** 2026-03-31
**Category:** Trading / AI Tools / Prediction Markets
**Type:** Actionable / Reference
**Engagement:** 172,040 views, 1,171 bookmarks, 681 likes, 74 retweets

---

## TL;DR

Hanako claims their Claude-built Liquidity Sniper terminal generated +$3,082 overnight by executing 251 trades across 500 prediction market contracts in under two hours, targeting low-liquidity overreactions with an 88.8% win rate and 17-minute average revert time. The bot is built in Rust. The copytrade link and Telegram are promoted. Skepticism is warranted: the numbers show no slippage, fees, or adverse selection accounting, and critics call out the 88.8% win rate and "no dips" P&L curve as fiction or at minimum heavily cherry-picked. However, the underlying strategy — liquidity sniper mean reversion on prediction markets — is a real, documented edge.

---

## Key Claims

- Claimed P&L: +$3,082 in a single overnight session
- Markets scanned: 500
- Scan rate: every 30 seconds
- Active snipes: 251 in under 2 hours
- Win rate: 88.8%
- Average revert time: 17 minutes
- Language: Rust (confirmed by @hanakoxbt in replies)
- Built with Claude (and "both Claude Code and Codex tbh" per reply)
- Strategy: Enter when liquidity is low AND price has overshot; exit when it reverts

### Trade Examples Cited:
- Hurricane FL: panic-sold on forecast drop, book went thin, entered at $0.35, reverted to $0.42 in 11 minutes, +$287
- Trump OH: breaking news spike on emotion, caught the overreaction, entered $0.59, reverted, +$194
- Senate bill: market moved on rumor, zero liquidity on ask side, sniped at $8.45, reverted 112%, +$371

### Spike Feed Examples:
- mech Miami flood +15.5% — SNIPE (thin book + price wrong)
- info Dogecoin +7.9% — SKIP (liquidity fine)
- mech eth>5k Q2 +5.8% — SNIPE

---

## Deep Dive

### What Is a Liquidity Sniper in This Context?

In prediction markets (Kalshi, Polymarket, Manifold), prices are determined by order book depth. When a news event triggers panic or euphoria, retail participants rush to trade before the book refills. This creates a temporary mispricing: the price overshoots the true probability because the order book is thin and each trade moves price more than it should. A liquidity sniper identifies these moments via:

1. Monitoring order book depth continuously (Hanako scans every 30 seconds)
2. Detecting when a price spike is accompanied by a thin book — distinguishing from genuine information moves where liquidity holds
3. Entering against the direction of the spike (fading the overreaction)
4. Exiting when the price reverts to the mean (typically when liquidity returns)

The key signal is the combination: BOTH thin liquidity AND overshooting price. SKIP means liquidity is fine (so the price move may be real). SNIPE means both conditions are met.

### Is This Strategy Real?

Yes. The academic and practitioner literature on prediction markets documents this edge well:

- Kalshi and Polymarket leaderboard analysis: 14 of the top 20 profitable wallets are bots (per TradingView/Finance Magnates reporting, 2026)
- The Finance Magnates / TradingView "Prediction Markets Are Turning Into a Bot Playground" piece documents bots exploiting thin book mispricings systematically
- The Claude AI Trading Bots Medium piece (March 2026) documents a Claude-powered agent growing $1,000 to $14,216 in 48 hours in a viral experiment (though similarly unverified)
- Multiple open-source GitHub projects doing Kalshi/Polymarket mean reversion exist (ryanfrigo/kalshi-ai-trading-bot, OctagonAI/kalshi-deep-trading-bot)

The underlying mechanism is legitimate. The specific numbers (88.8% win rate, no drawdown) are the suspicious part.

### Skepticism Analysis (from @FakeEdgeHunter reply)

The most substantive critique in the thread: "88.8% win, no dips = fiction. No slippage, queue position, fill rate, fees, latency. Thin books don't mean free money — they mean adverse selection. 251 trades/2h? You're the liquidity, not the sniper. Referral = exit liquidity."

These are valid concerns:
- In thin books, your own orders move the price, reducing realized profit vs. paper profit
- Fill rates below 100% mean your best setups may not execute fully
- 251 snipes in 2 hours = one every ~30 seconds — plausible given 30-second scan rate but aggressive
- The P&L curve showing "no dips, just stairs" is statistically implausible for 251 trades

### What's Not Available

- Source code is not public (no GitHub link provided, no open source)
- Copytrade link provided (https://t.co/PTZuvewZE6) — this appears to be a referral to copy the positions, likely on a prediction market platform
- Telegram group linked (https://t.me/+75nMf005jRpjMDU1) — private, presumably for signal sharing
- No audited P&L, no transaction IDs, no verifiable on-chain data
- @xiaonweb: no market data websocket source disclosed (reply left unanswered)

### Context: Market Type

The examples — "Hurricane FL," "Trump OH," "Senate bill" — are clearly prediction market (Kalshi/Polymarket) style event contracts, not crypto or stock markets. This is important because:
- These markets have known thin liquidity vs. crypto perps
- Regulatory status: Kalshi is a CFTC-registered Designated Contract Market — winnings may be taxable as capital gains
- Market depth compounds: bots playing this game will eventually eat each other's alpha as the edge becomes crowded

---

## Key Links

- Tweet: https://twitter.com/hanakoxbt/status/2039010981288845745
- Telegram (trades): https://t.me/+75nMf005jRpjMDU1
- Finance Magnates on prediction market bots: https://www.financemagnates.com/trending/prediction-markets-are-turning-into-a-bot-playground/
- Claude trading bot viral experiment: https://medium.com/@weare1010/claude-ai-trading-bots-are-making-hundreds-of-thousands-on-polymarket-2840efb9f2cd
- Kalshi AI trading bot (open source example): https://github.com/ryanfrigo/kalshi-ai-trading-bot
- OctagonAI deep trading bot: https://github.com/OctagonAI/kalshi-deep-trading-bot
- PredMarkets (reply suggesting extension): https://twitter.com/PredMarketsCom

---

## Actionable Takeaways

1. The core strategy (thin book + overshoot → fade → mean reversion) is a real, replicable edge on prediction markets. The terminal can be built; the strategy is not novel.
2. Key signal to implement: scan for price moves where the book depth simultaneously falls — not just price moves alone. The SKIP/SNIPE distinction is the signal.
3. Rust is the right language for this (low latency, deterministic memory, thread safety) — Hanako confirmed this is Rust.
4. The 30-second scan rate is probably not fast enough to front-run sophisticated bots. Sub-second websocket monitoring is the competitive moat.
5. Do not copy the claimed win rate or P&L as realistic. Build your own backtest with actual fill simulation and adverse selection penalties.
6. The real question: what data source provides the order book depth feed for Kalshi/Polymarket at sub-minute granularity? That's the moat — Hanako did not disclose this.
7. Regulatory note: Kalshi is CFTC-registered, so winnings are real-money regulated. Size position risk accordingly.

---

## Connections

- Connects to Block's AI world models (Bookmark 2): same concept at micro-scale — AI reading real-time behavioral signals to find mispricings rather than relying on slow human analysis
- The "market overreacts" thesis is the same as what Block's customer world model detects in financial product demand — structural information asymmetry exploited by faster signal processing
- Multiple open-source prediction market bots exist (see Key Links) that could be adapted to this strategy without building from scratch
