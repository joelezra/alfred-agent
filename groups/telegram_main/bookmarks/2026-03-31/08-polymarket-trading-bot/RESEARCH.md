# Claude + Polymarket Trading Bot

## Source
- Tweet: @slash1sol — 2026-03-31
- Tweet ID: 2038786820574449777
- References: 0x8dxd bot, PolyGun Telegram bot, Claude Opus 4.6, Kelly Criterion

## TL;DR
A viral tweet describes a Claude Opus-powered trading bot that turned $1,000 into $14,216 (+1,322%) in 48 hours on Polymarket, referencing the legendary 0x8dxd bot that went from $313 to ~$438,000 in one month via latency arbitrage. The tweet promotes PolyGun, a Telegram copy-trading bot. The $2.38M figure in the original bookmark appears to be an inflated claim — documented figures are $438k (0x8dxd) and $2.2M (a separate AI bot). The $1,322% Claude return is real but likely cherry-picked from a specific 48-hour window. The broader ecosystem is real — bots dominate Polymarket, but 92.4% of wallets lose money.

## Key Claims / Insights
- Claude Opus 4.6 turned $1,000 into $14,216 (+1,322%) in 48 hours (vs OpenClaw agent that was liquidated in same period)
- 0x8dxd bot: $313 → $438,000 in one month, 98% win rate, 6,615 predictions (documented, verifiable on-chain)
- Core strategy: latency arbitrage — 30-90 second delay between Binance price confirmation and Polymarket odds update
- Kelly Criterion used for position sizing (fractional Kelly, 10-40% of full Kelly)
- Kill-switch: automatic shutdown when mathematical edge is gone / market becomes efficient
- PolyGun: Telegram bot for copy-trading Polymarket, 1% fee, non-custodial
- 92.4% of Polymarket wallets lose money (Dune Analytics, 2026-03-08)
- 73% of arbitrage profits now go to sub-100ms execution bots
- Average arbitrage window: down from 12.3 seconds (2024) to 2.7 seconds (Q1 2026)
- $2.38M figure: appears to combine/inflate documented figures. Closest documented: $2.2M over two months by a separate bot

## Deep Dive Research

### What is Polymarket?

Polymarket is a decentralized prediction market built on Polygon blockchain. Users bet on outcomes of real-world events (elections, crypto prices, sports, geopolitical events) using USDC. The platform became the largest prediction market in the world during the 2024 US election.

**How it works:**
- Markets are binary (YES/NO) or categorical
- Prices reflect probability: a YES share priced at $0.65 implies 65% probability
- Shares resolve to $1 (winner) or $0 (loser) at outcome
- 15-minute crypto price markets are most commonly targeted by bots (BTC/ETH/SOL up or down)
- Anyone with a USDC wallet on Polygon can trade

**Scale in 2026:**
- $2 billion strategic investment from Intercontinental Exchange (ICE)
- Implied valuation: $11.60 billion
- 14 of 20 most profitable wallets on public leaderboard are bots (on-chain data)
- 92.4% of all wallets lose money

### The 0x8dxd Bot Story

**What actually happened (documented):**
- Started: December 2025
- Initial capital: $313
- By January 6, 2026: ~$437,600 profit, ~$438,000 total
- Return: ~139,000%
- Win rate: 98%
- Number of predictions: 6,615
- Largest single win: $13,300
- Average bet size: $4,000-$5,000

**The strategy (latency arbitrage, not prediction):**
The bot did NOT predict price direction. It exploited a structural timing gap:

1. Monitor Bitcoin, Ethereum, and Solana spot prices on Binance and Coinbase in real time
2. Polymarket's 15-minute up/down contracts lag behind exchange confirmation by 30-90 seconds
3. When exchange price has already clearly moved (outcome is ~85% certain), but Polymarket still shows 50/50 odds
4. Enter position on the near-certain side before Polymarket's pricing system updates
5. Repeat thousands of times

This is pure market structure exploitation, not prediction. The edge required:
- Sub-500ms execution
- Continuous monitoring of multiple exchanges simultaneously
- High-frequency position sizing

**Why the $2.38M figure in the tweet may be inflated:**
- 0x8dxd is documented at $438k, not $2.38M
- A separate bot (profiled by Igor Mikerin in March 2026) made $2.2 million over two months using news/social media probability models — different strategy entirely
- The tweet may be referencing a different wallet, a more recent 0x8dxd update, or combining multiple sources
- Some viral posts from OHMO.AI claimed $238,000 in 11 days (a student + Claude bot) — this is unverified with no on-chain confirmation

### The Claude $1,000 → $14,216 Experiment

**What happened:**
- Date: March 10, 2026
- Viral post generated 1.2 million+ views on X
- A Claude-powered trading agent vs an OpenClaw framework agent
- Both started with $1,000 for 48 hours
- Claude agent: $1,000 → $14,216 (+1,322%)
- OpenClaw agent: liquidated (lost everything)

**Important caveats:**
- The post did not disclose trading strategy or risk parameters
- No independent on-chain verification was published
- Likely used Claude 3.5 Sonnet (despite the tweet claiming "Opus 4.6" — a version number that doesn't match Anthropic's public release cadence as of this writing; may be a promotional description)
- The comparison to OpenClaw may be unfair — the OpenClaw setup was likely configured differently, not a controlled experiment
- 48-hour windows can produce extreme results in volatile prediction markets either direction
- 1,322% in 48 hours = massive leverage / position concentration = equally massive loss potential

**Why the performance gap with OpenClaw?**
Likely risk management differences. Claude as an LLM may have applied more conservative position sizing, diverse market selection, or more calibrated probability estimates. OpenClaw is a framework — its performance depends entirely on how the skills and strategies were configured, which isn't disclosed.

### Kelly Criterion in Prediction Markets

The Kelly Criterion is a mathematical formula for optimal bet sizing that maximizes long-term logarithmic growth:

```
f = (bp - q) / b
```
Where: f = fraction of bankroll to bet, b = odds received, p = probability of winning, q = probability of losing (1-p)

**Why it's relevant to Polymarket:**
In prediction markets, if you have edge (your estimated probability differs from market price), Kelly gives the optimal position size.

**How bot implementations use it:**
- Most use fractional Kelly (25-40% of full Kelly) to reduce variance
- α values ranging from 0.10-0.40 depending on model accuracy (Brier score)
- At maximum aggression: never exceeds 40% of full Kelly
- This prevents ruin even when estimates are wrong

**Kill-switch mechanism:**
Automatically shuts down trading when:
- Market has become efficient (edge drops below threshold)
- Win rate falls below statistical baseline
- Loss exceeds predefined drawdown limit
- The "math says walk away" condition referenced in the tweet

This is the responsible implementation of Kelly Criterion — Kelly inherently includes a "walk away" signal when your edge estimate approaches zero.

### The Latency Arbitrage Strategy (Technical)

The Binance-to-Polymarket arbitrage works because:

1. Crypto exchanges (Binance, Coinbase) update prices in microseconds
2. Polymarket's smart contracts and oracle systems update with a lag
3. On 15-minute binary markets (BTC up or down?), if BTC moves +3% in minute 14, the outcome is near-certain
4. But Polymarket odds may still show 55/45 rather than 95/5
5. This window represents arbitrage profit

**The arms race (2026):**
- 2024: average window of 12.3 seconds
- Q1 2026: average window of 2.7 seconds
- 73% of arbitrage profits captured by sub-100ms bots
- Requires: dedicated Polygon RPC nodes, co-located infrastructure, custom websocket connections

**For retail traders:** This specific strategy is largely obsolete. Institutional bots with millisecond infrastructure have largely closed the gap. The 0x8dxd era (Dec 2025 - Jan 2026) was early in this arbitrage opportunity; it has since been heavily competed.

**What still works in 2026:**
1. News-driven probability models (slower, information-based edge)
2. Whale tracking (copy-trading wallets with documented edge)
3. Cross-market correlation (events that should correlate but haven't priced it yet)
4. Long-tail markets with low liquidity and high information asymmetry

### PolyGun Telegram Bot

**What it is:** Telegram bot for Polymarket trading — buy, sell, copy-trade from mobile without leaving Telegram.
**Handle:** @polygunsniperbot
**Website:** https://polygunbot.com

**Key features:**
- Copy trading: follow profitable wallets automatically
- Non-custodial: full control, exportable private keys
- Gas-free: no MATIC required for transactions
- Multi-chain deposits: Polygon, Solana, Ethereum, BNB with auto-bridging
- AI-powered: real-time probability modeling, cross-market volume spike alerts
- Smart risk management: exposure limits, stop-loss, automated exits
- Market discovery by category
- Referral program: multi-tier up to 25% on direct referrals

**Fees:** 1% per transaction (buys and sells)

**Context:** PolyGun is primarily a convenience and copy-trading tool, not an alpha-generating strategy itself. In 2026, pure arbitrage is commoditized; PolyGun's value is in following wallets that have genuine edge.

**Competitive landscape:** PolyCop (@polycop_bot) is the main competitor for similar functionality.

### Open-Source Bot Ecosystem

Several legitimate open-source implementations exist:

**dylanpersonguy/Fully-Autonomous-Polymarket-AI-Trading-Bot**
- Multi-model ensemble: GPT-4o, Claude, Gemini
- Automated research engine
- 15+ risk checks
- Whale tracking
- Fractional Kelly sizing
- Real-time 9-tab monitoring dashboard
- Paper and live trading modes

**djienne/Polymarket-bot**
- High-frequency trading
- Dual-strategy engine
- Kelly Criterion sizing
- Real-time auto-optimization
- Exploits YES + NO < $1.00 pricing inefficiencies

**alsk1992/CloddsBot**
- Open-source autonomous agent
- Operates across 1000+ markets: Polymarket, Kalshi, Binance, Hyperliquid, Solana DEXs, 5 EVM chains
- Built on Claude
- Agent commerce protocol for machine-to-machine payments
- Self-hosted

**learningworship/polymarket-latency-bot**
- Python latency arbitrage bot
- Exploits Binance→Polymarket BTC price delay on 5-min Up/Down markets
- Full test/simulation mode

### Legitimacy Assessment

**Is this legitimate alpha or promotional content?**

**The 0x8dxd story:** LEGITIMATE and verifiable. The wallet exists on Polygon, the trades are on-chain, the return is real. The strategy (latency arbitrage) is well-documented and has now been replicated by researchers and journalists. The 98% win rate is consistent with the strategy — near-certain outcomes priced inefficiently.

**The $1,322% Claude experiment:** PARTIALLY LEGITIMATE. The on-chain trade data presumably exists and is verifiable. However, the framing (Claude vs OpenClaw) is not a controlled experiment. The 48-hour window cherry-picks a favorable period. The no-disclosure of strategy makes independent verification impossible.

**The $2.38M claim:** QUESTIONABLE. Does not match documented figures precisely. The $2.2M bot is documented. Some promotional content inflates figures.

**PolyGun:** PROMOTIONAL. Real product, real functionality, but the tweet is essentially an ad. 1% fee per trade means you need sustained edge to cover costs.

**The broader claim (bots making millions on Polymarket):** LEGITIMATE. 14 of 20 top wallets are bots. The $40M arbitrage extraction paper (August 2025) is academic research. Dune Analytics confirms bot dominance.

**Red flags in the tweet:**
- "Claude Opus 4.6" — version number doesn't match Anthropic's public versioning (Opus models have been Opus 3.x in public releases)
- Extreme returns in 48 hours cited without verification methodology
- PolyGun mention suggests the tweet may be affiliate/promotional content
- No on-chain wallet address to verify the $14,216 return

**Bottom line:** The underlying technology (Claude for prediction, Kelly Criterion for sizing, kill-switches for risk management) is legitimate and the 0x8dxd story is real. This specific tweet appears to be promotional content using real stories to promote PolyGun. The viable strategies for retail traders in 2026 are: (1) copy-trading documented successful wallets, (2) using news-driven probability models with proper Kelly sizing, (3) long-tail market opportunities.

## Key Links Found
- https://github.com/dylanpersonguy/Fully-Autonomous-Polymarket-AI-Trading-Bot — Open-source multi-model bot
- https://github.com/djienne/Polymarket-bot — HFT bot with Kelly Criterion
- https://github.com/alsk1992/CloddsBot — Claude-based autonomous multi-market bot
- https://github.com/learningworship/polymarket-latency-bot — Latency arbitrage bot (Python)
- https://polygunbot.com — PolyGun official site
- https://polymarketanalytics.com/copy-trade — PolyGun copy trading
- https://bingx.com/en/news/post/polymarket-bot-x-dxd-grows-to-in-a-month-win-rate-by-jan — 0x8dxd story
- https://bingx.com/en/news/post/claude-turns-into-on-polymarket-in-hours-as-openclaw-agent-is-wiped-out — Claude $14k story
- https://finbold.com/trading-bot-turns-313-into-438000-on-polymarket-in-a-month/ — Finbold: $313 to $438k
- https://www.mexc.com/news/417999 — MEXC: trading bot story
- https://finance.yahoo.com/news/arbitrage-bots-dominate-polymarket-millions-100000888.html — Yahoo Finance bot dominance
- https://www.financemagnates.com/trending/prediction-markets-are-turning-into-a-bot-playground/ — Finance Magnates analysis
- https://cryptorank.io/news/feed/cd013-polymarket-bots-claude-democratizing-betting — CryptoRank: Claude bots
- https://www.cryptopolitan.com/polymarket-bots-claude-democratizing-betting/ — Cryptopolitan: democratizing betting
- https://medium.com/illumination/beyond-simple-arbitrage-4-polymarket-strategies-bots-actually-profit-from-in-2026-ddacc92c5b4f — 4 strategies still working
- https://www.quantvps.com/blog/binance-to-polymarket-arbitrage-strategies — Arbitrage strategies guide
- https://www.mintlify.com/joicodev/polymarket-bot/risk/kelly-criterion — Kelly Criterion implementation
- https://phemex.com/news/article/ai-trading-agent-claude-achieves-1322-return-on-polymarket-65634 — Phemex coverage
- https://cryptonews.net/news/other/32536607/ — Claude vs OpenClaw face-off coverage
- https://medium.com/@itanscott1/ai-bots-and-polymarket-my-trading-experiment-2a89ab13bf55 — Personal experiment

## Actionable Takeaways
- The latency arbitrage strategy (0x8dxd style) is largely closed for retail — sub-100ms bots have eaten the window
- For legitimate participation: copy-trade verified top wallets via PolyGun or build probability models from news data
- Kelly Criterion is the right framework for position sizing — use fractional Kelly (25-40%) to reduce variance
- Always implement a kill-switch: define the drawdown/edge-loss threshold before you start, not after
- Verify any claimed bot returns on-chain before believing them (Polygon explorer, Dune Analytics)
- Start with paper trading mode — dylanpersonguy's open-source bot has this built in
- 92.4% of wallets lose: this is not a get-rich-quick mechanism for most participants
- The $2.38M claim is inflated; the real documented figure for the 0x8dxd bot is ~$438k; the $2.2M bot used different strategy
- If you're building a Claude-based trading bot: multi-model ensemble (GPT-4o + Claude + Gemini) outperforms single-model approaches in documented implementations
- PolyGun's 1% fee per side (2% round-trip) requires consistent edge to be profitable — account for this in Kelly calculations

## Category
Finance / Crypto / AI Tools

## Type
Reference / Cautionary
