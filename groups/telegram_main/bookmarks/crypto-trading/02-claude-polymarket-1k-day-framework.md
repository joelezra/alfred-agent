# Claude + Polymarket — $1K/Day Automation Framework

**Bookmarked:** Mar 31, 2026 (01:17 MYT)
**Author:** @kirillk_web3 (Kirill) — 30k views, 180 likes, 231 bookmarks
**Tweet ID:** 2038667029180301330
**Category:** Crypto / Trading Automation
**Type:** Technical Framework / Reference
**Actionable:** YES — system architecture is clear and buildable

---

## The Core Insight

> "Once this runs, you're not trading anymore — you're running infrastructure."

The mental shift: from active trader to infrastructure operator. The system finds mispriced probabilities, enters, waits for repricing, exits, repeats. Small edge × many trades × risk control = $1K/day target.

---

## System Architecture

```
{ VPS }         → Runs 24/7, never goes offline
{ Claude }      → Reads signals, makes entry decisions
{ Simmer }      → Connects to Polymarket API
{ Strategies }  → Fast loop, weather, copytrading
{ Execution }   → Auto entry, auto exit
{ Risk }        → Drawdown & loss limits
{ Telegram }    → Alerts & logs
{ Compounding } → Small edges stack over time
```

---

## How It Makes Money

The mechanism:
1. Find a market where the true probability differs from the market-implied probability
2. Enter a position at the mispriced odds
3. Wait for the market to reprice (other traders catch up)
4. Exit when the mispricing is corrected
5. Repeat with the profit

**At scale:** $1K/day doesn't require a 1000% win. It requires:
- Small consistent edge (5-10% per trade)
- Many trades per day
- Strict risk control preventing any single loss from wiping out the day's gains

---

## The 3 Strategies

### Fast Loop
High-frequency scanning of all active Polymarket markets. Flags any market where Claude's probability estimate diverges from the market price by more than a threshold. Speed is the edge — enter before other bots correct the price.

### Weather Markets
Prediction markets on meteorological outcomes (rainfall, temperature records, etc.). These are systematically mispriced because most Polymarket participants don't have good weather forecasting models. Using weather API data + Claude analysis creates a consistent edge.

### Copytrading
Identify the top-performing Polymarket accounts (like the [0x8dxd] bot from the other bookmark). Mirror their position entries with a slight delay. You lose some edge but reduce the research cost — let them do the analysis, you follow the signal.

---

## The VPS Requirement

This system must run 24/7 — Polymarket is always open. A VPS (Virtual Private Server) running in a US or EU data centre gives:
- Low latency to Polymarket servers
- Always-on operation
- Isolated environment from your personal machine

**Cost:** ~$5-20/month for a basic VPS (DigitalOcean, Vultr, Hetzner)

---

## Simmer

Simmer is a Polymarket trading API wrapper — provides programmatic access to:
- Market listings and prices
- Order book depth
- Position entry/exit
- Portfolio tracking

Essential for automation since direct API interaction with Polymarket requires handling Web3/blockchain complexity.

---

## The Compounding Logic

> "Small misprice × many trades × risk control = $1K/day framework"

If the system makes 20 trades per day with an average $50 profit each → $1K. Or 100 trades at $10 each. The compounding kicks in when profits are reinvested — same percentage edge on a larger bankroll = larger absolute gains.

**At 1% daily return compounding:** $10K → $37K in 3 months → $1.3M in a year (theoretical; real markets have capacity limits and edge erosion over time)

---

## Risk Considerations

**This isn't a get-rich-quick scheme. Real risks:**
- Polymarket liquidity is thin in many markets — can't always exit at desired price
- Edge can erode as more bots enter the same markets
- Model risk — Claude's probability estimates may be wrong in systematic ways
- Regulatory risk — prediction markets exist in legal grey areas in many jurisdictions
- Smart contract risk — funds are held in Polymarket's contracts

**The kill-switch is essential:** Without hard drawdown limits, one bad week of model errors wipes out months of gains.

---

## Relationship to ICT Trading

The same principles that make the Polymarket framework work apply to your ICT trading system:
- Claude reads signals (charts vs. market prices)
- System decides entry/exit (4H OB zone vs. mispriced probability)
- Risk management is mechanical (Kelly sizing vs. confluence scoring)
- Telegram alerts/logs for monitoring
- Infrastructure mindset — you're running a system, not making judgment calls

The architecture is almost identical. The underlying market is different.
