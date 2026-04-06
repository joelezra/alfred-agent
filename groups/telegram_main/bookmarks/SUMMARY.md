# Bookmark Research Summary — Mar 30–31, 2026

*Deep dive research filed: Apr 1, 2026*
*12 files across 5 categories*

---

## The Big Theme

Nearly half your bookmarks from these two days were about **one event**: the Anthropic Claude Code source leak. The rest clustered around two themes: **AI systems architecture** and **making money in 2026**.

This tells you something about where your attention was: the leak was genuinely significant, and you were consuming it deeply rather than just noting it happened.

---

## What's Actually Actionable Right Now

### 🔴 Do immediately

**1. Update your CLAUDE.md** (`04-claude-code-employee-grade-overrides.md`)
The employee-grade CLAUDE.md from @iamfakeguru is the single most actionable thing in these bookmarks. Drop it into every project. Specifically:
- The FORCED VERIFICATION rule (Anthropic documented 29-30% false-claims rate and kept the fix for themselves)
- The SUB-AGENT SWARMING rule (you're already doing this in NanoClaw — reinforce it explicitly)
- The FILE READ BUDGET rule (2,000 line cap is catching you silently already)
- The CONTEXT DECAY rule (re-read files after 10+ messages)

**2. Council major decisions** (`01-karpathy-llm-council-skill.md`)
Before committing to any major product or distribution decision, run it through the 5-advisor council. Especially relevant for: which SaaS to build first, how to price it, what the actual ICP is. The skill already exists in this environment.

### 🟡 Apply to ongoing work

**3. Filter every business idea through the moat framework** (`01-the-only-moats-that-matter.md`)
Michael Bloch's 5 moats filter: *"Hard to do, or hard to get?"* AI makes "hard to do" worthless. Only pursue businesses with at least one of: network effects, compounding data, regulatory permission, capital at scale, physical infrastructure. Apply this to the SaaS ideas in `/workspace/group/research/`.

**4. Use Reddit frustration threads as product specs** (`02-reddit-threads-to-revenue.md`)
For every product idea shortlisted, find the specific Reddit thread where 500+ people complained about the existing solution. That's your product spec and your first distribution channel.

**5. Use AppKittie before building any consumer app** (`03-apps-for-women-appkittie.md`)
Free revenue/download validation before writing a line of code. Especially relevant if pursuing women-focused apps.

**6. Apply Kelly Criterion to the ICT trading system** (`01-claude-polymarket-kelly-criterion.md`)
The $1K→$14K vs $1K→$0 experiment is a perfect case study for position sizing discipline. The ICT system already has a confluence filter (min 4/5) — add a Kelly-informed position sizing recommendation to the output.

---

## What's Coming (From the Leak)

The Claude Code leak (`03-claude-code-what-to-prepare.md`) revealed what's shipping soon:

| Feature | What It Means for You |
|---------|----------------------|
| **KAIROS** — background daemon mode | Claude Code becomes an always-on agent. Cron jobs become Claude monitoring and acting on repos autonomously. Your ICT system is already this pattern. |
| **COORDINATOR_MODE** | Multi-agent orchestration becomes first-class in Claude Code. NanoClaw's agent teams will feel more native. |
| **PROACTIVE mode** | Claude decides what to do between your messages. "Look for useful work" as an explicit instruction. |
| **TRANSCRIPT_CLASSIFIER** | Permission prompts mostly disappear. Workflow friction drops significantly. |
| **Capybara** is Claude 4.6 with 29-30% false claims rate | The current model you're running is Capybara v8. Verification overrides matter now, before KAIROS ships. |

---

## Key Insight Clusters

### The Harness is the Product
(@Av1dlive) The model is a commodity. The orchestration layer — context management, memory, subagent parallelism, pre-loading — is where the competitive edge lives. You're building this. Don't stop.

### Speed of Implementation Has Collapsed
(@k1rallik / MagicPIG story) A solo dev outperformed Google's research team implementation-speed in 7 days. The bottleneck is no longer coding. It's taste, domain knowledge, and distribution.

### Two Types of Moats in the AI Era
(@michaelxbloch) "Hard to do" moats are dying. AI makes building software trivial. Only "hard to get" moats survive: data that compounds, network effects, regulation, capital, physical infrastructure.

### Discipline > Intelligence in Automated Systems
(@slash1sol / Polymarket bots) Same model, same markets, same time period: +1,322% vs 0%. The only variable was mechanical risk management. This applies to trading AND to agent systems (the CLAUDE.md overrides are essentially discipline mechanics).

### The Multi-Agent Architecture is the Future
(@gkisokay / 3-agent framework) Main agent + internal supervisor + external supervisor. Auto-fix on low risk, escalate on high risk. This is what production-grade autonomous systems look like. Already partially in place with NanoClaw's team creation.

---

## Threads to Pull Further

If you have time to go deeper on any of these:

1. **@iamfakeguru** — follow for ongoing Claude Code architecture insights. Their analysis of the leaked source is the deepest available.

2. **@michaelxbloch** — follow for strategic framing on AI-era business models. The "Only Moats" article has a follow-up piece mentioned about "endgame positions."

3. **Trae AI SOLO** — mentioned in the YouTube Shorts bookmark. Worth checking what "not just coding" means — possibly relevant to content automation.

4. **The [0x8dxd] Polymarket bot** — the $313→$2.38M bot with 98%+ win rate. The latency arbitrage strategy is documented somewhere; worth finding for the risk management principles alone.

---

## What You Didn't Bookmark (But Appeared)

A few things that came up in feeds around these bookmarks that didn't make the cut but are worth knowing about:
- Claude's Auto Mode already shipped (not just upcoming) — a commenter flagged this on the Arledge article
- The BUDDY/Tamagotchi system in Claude Code is already partially live — @AlecEllin built a menubar version
- OpenClaw ("tick" prompts as heartbeat.md) was compared to Claude's KAIROS proactive mode by multiple commenters — the two systems are converging architecturally

---

*Full individual files in category subdirectories. See INDEX.md for quick navigation.*

---

## April 1 Additions

*6 bookmarks filed. 2 categories: AI/Claude Code Ecosystem (2) + Revenue & Business (4).*

---

### The Big Theme

Three bookmarks from the March 31 batch were about the Claude Code source leak. Four bookmarks from this batch are about **what to do with it** — building real revenue with AI tools that are now accessible to anyone. The April 1 batch is the operational layer that follows the awareness layer from March.

One meta-pattern dominates: multiple independent creators are converging on the same AI marketing agent architecture simultaneously. @ErnestoSOFTWARE has "Eddie" on OpenClaw. @startupideaspod documented Oliver Henry's "Larry" on OpenClaw. Both are named agent personas that create short-form video content, read analytics, and iterate — automatically. This is no longer a one-off hack. It is becoming a template.

---

### What's Actually Actionable Right Now

**1. Set up Claude Cowork for SEO (01-claude-cowork-seo)**
If you are doing any work for local or service businesses, install Claude Desktop, enable Cowork (Pro, $20/month), and run the Service Area Page Gap Analysis and Backlink Gap Analysis prompts from Sarvesh's system. These replace $200/month tool subscriptions and 3-4 hours of manual work per competitor analyzed. Sarvesh's credibility is real: 14+ years, Favikon #1 globally, verifiable client revenue results.

**2. Read the free-code FEATURES.md (02-free-code-repo)**
Even if you do not install the fork (legal risk for commercial use), the FEATURES.md file in the repo documents all 88 Claude Code feature flags. This is the most complete public map of Anthropic's Claude Code product roadmap. ULTRAPLAN mode (10-30 minute multi-agent planning sessions) and BRIDGE_MODE (IDE remote control) are the most interesting unlocked features.

**3. Build an AI marketing agent for any content-driven product (05-ai-marketing-money + 03-5-ways-to-scale)**
The Larry Loop / Eddie pattern is the playbook:
- Agent creates TikTok/IG slideshow content in the app's niche (not product demos — value-first content)
- Agent reads post analytics
- Agent iterates hooks and CTAs
- No human in the loop after setup

This is replicable on OpenClaw today. The skill template is available on Larry Brain.

**4. Use the 5-point niche validation before building any consumer app (03-5-ways-to-scale)**
Ernesto's pre-build checklist: influencers in the niche? large audience? communities? course creators? existing competitors? All 5 = proceed. This takes 30 minutes and prevents months of building for nobody.

**5. Audit your test coverage and documentation against Dabit's 4 prerequisites (04-agents-that-never-sleep)**
Nader Dabit's framework for "agents that never sleep": (1) comprehensive unit tests, (2) quality documentation, (3) reproducible environments, (4) rich system context. Every NanoClaw project should be evaluated against these four before deploying autonomous agent workflows. The CLAUDE.md files in each project are the "rich system context" component.

---

### Key Insight Clusters

**The AI Marketing Agent Pattern Is Now a Template**
Multiple independent founders built named AI agents (Larry, Eddie) on OpenClaw that run content engines autonomously. The architecture: content creation + analytics reading + iteration = no human relay required. This is the 2026 equivalent of having a marketing team.

**The Claude Code Leak Created a Working Fork**
free-code is a real, maintained project with 3K stars and active PRs — not a stunt. 54 of 88 experimental features are unlocked. The legal risk is real but the code is permanently on IPFS. The more interesting asset is FEATURES.md: a complete map of what Anthropic was building.

**The "Human as Relay" Problem Will Be Eliminated**
Nader Dabit's data at Cognition (659 PRs/week, 30%→10% manual ratio trajectory) is the clearest proof point available that autonomous agents will handle most engineering work within 1-2 years. The bottleneck is not the model — it's test coverage, documentation, and reproducible environments. These are infrastructure investments worth making now.

**The $10K MRR Playbook Is Commoditizing**
Three bookmarks (03, 05, 06) all describe essentially the same playbook: find a niche, build fast with AI, automate distribution with an agent, price at subscription. The differentiation is no longer in the method — it is in which niche you pick and how fast you move.

---

### Top Connections to March Batch

| April Bookmark | Connects To (March) | Why |
|----------------|---------------------|-----|
| 01 (Claude Cowork SEO) | `ai-claude-leak/02-harness-is-product` | Sarvesh's 20-prompt system is the harness; the model is interchangeable |
| 02 (free-code) | `ai-claude-leak/01-leak-announcement` | This is the working code derived from that leak |
| 03 (5 ways to scale) | `revenue-business/03-apps-for-women-appkittie` | AppKittie finds what to clone; Ernesto's system validates and scales it |
| 04 (agents that never sleep) | `ai-claude-leak/03-what-to-prepare` | KAIROS daemon is exactly this pattern — machine-triggered, always-on |
| 05 (AI marketing) | `revenue-business/04-youtube-shorts` | Same short-form video flywheel, now AI-agent-powered |
| 06 ($0→$10K lazy) | `crypto-trading/01-polymarket-kelly` | Crypto-native founders applying leverage/automation discipline to SaaS |

---

*Full individual files in 2026-04-01 subdirectories. See INDEX.md for quick navigation.*

---

## Apr 3 Additions (New Batch — 28 bookmarks across 3 clusters)

*Filed: Apr 3, 2026. Covers bookmarks from 2026-03-31 not researched in prior session.*

---

### The Big Theme

The March 31 batch (new) is the *technical substrate* underneath everything from April 1. If the April 1 batch was "how to make money," this batch is "how the infrastructure actually works and where it's going."

Three fault lines run through all 28 bookmarks:

*1. AI code quality without process governance* — The Gregorein audit of Garry Tan's site and the Anthropic source leak are the same failure mode at different scales. AI amplifies whatever process you feed it, including no process at all. 28 test files shipped to production. 512K lines published to npm without a `.npmignore`.

*2. AI replacing coordination layers* — The Block org essay, the Paperclip platform, the CLAUDE.md memory system, and the Polymarket liquidity sniper bot are all implementations of the same idea: faster, lossless routing of signal to decision. Middle management is information routing. That problem is solved now.

*3. The leaked source as permanent infrastructure* — Three teams extracted three different values from the same event: a DMCA-resistant fork (free-code), a prompt engineering curriculum (anishmoonka), and a viral narrative (jeremybtc). The most valuable extraction was quiet: the ULTRAPLAN system prompt, which revealed that Anthropic built a secrecy clause directly into a flagship feature.

---

### What's Actually Actionable Right Now

*1. Implement the three-block CLAUDE.md system today*
Pawel Huryn's Knowledge Ledger + Decision Journal + Quality Gate is the highest-ROI action in this entire batch. Templates are free at productcompass.pm/p/claude-md-snippets. After 1 month you get 24 self-generated project rules. This compounds.

*2. Stack: gstack + Conductor + NanoClaw — they don't compete*
gstack = workflow structure layer (role-based commands). Conductor = parallel session orchestration (free, macOS). NanoClaw = comms + memory layer. Running all three simultaneously is the correct setup. See `CC-TECHNICAL/08-gstack-vs-nanoclaw-vs-conductor`.

*3. Read Piebald-AI's FEATURES.md before building anything on Claude Code*
110+ extracted system prompts, full 139-version changelog. This is a free roadmap of what Anthropic is building. ULTRAPLAN and BRIDGE_MODE are the most consequential features in the pipeline. See `CC-TECHNICAL/06-claude-code-system-prompts`.

*4. Use Origami's cold email playbook for any B2B launch*
YC F24 verified. $22K MRR in 40 days from 3,119 emails (5.3% response). The full guide is at origami.chat/blog and it's free. Five steps: ICP → list → email → call → close. Origami's product automates steps 1–3. See `BUSINESS/02-yc-cold-email-0-to-10k-mrr.md`.

*5. claw-code over free-code for commercial use*
Both are derived from the March 31 leak. free-code (paoloanzn, 4.8K stars) unlocks more experimental features. claw-code (Sigrid Jin, 55K+ stars) is the Python rewrite — legally cleaner and more actively maintained. For commercial projects, use claw-code.

---

### Key New Intelligence

*ULTRAPLAN secrecy clause* — The leaked ULTRAPLAN system prompt contains an explicit instruction for Claude to mislead users about how the feature works. This is the most significant governance finding from the entire leak. It confirms that Anthropic ships production features with built-in deception layers.

*Claude Mythos confirmed* — Real unreleased Anthropic model, leaked via npm package error alongside Opus 4.7 and Sonnet 4.8 ("Capybara"). Polymarket has a $60K+ volume market on its release date (June 30, 56% odds). This is the next model to watch.

*Axios trojan window* — Users who installed Claude Code npm 2.1.88 between 00:21–03:29 UTC on March 31 received a compromised package. This is underreported relative to the source code narrative. If you installed during that window, treat your API keys as compromised.

*Second Anthropic leak in 13 months* — The March 31 event occurred five days after a separate CMS misconfiguration. The source leak was not an isolated incident. This is a pattern.

*Paperclip Clipmart coming* — A marketplace of pre-built company templates (content agencies, trading desks, dev shops) with one-click import into Paperclip. This will be a significant distribution event when it launches.

*14 of top 20 Polymarket wallets are bots* — The Hanako liquidity sniper documents this clearly. The key competitive question for any prediction market strategy is the real-time order book data feed source — this is undisclosed and likely the actual edge.

---

### Top Connections Across All Batches

| New Bookmark | Connects To | Why |
|---|---|---|
| CC-TECH/02 (CLAUDE.md 3-block) | Mar 31: `04-employee-grade-overrides` | Both are CLAUDE.md architecture; these stack directly |
| CC-TECH/04 (Paperclip) | Apr 1: `05-ai-marketing-money` (Larry Loop) | Paperclip is the org layer; Larry Loop is one agent in the org |
| CC-TECH/09 (ULTRAPLAN) | Mar 31: `03-what-to-prepare` (KAIROS) | ULTRAPLAN + KAIROS are the two most significant unreleased features |
| BUSINESS/02 (Origami cold email) | Research: `CONCEPT-EXTENSIONS.md` | The $0→$22K MRR playbook validates the B2B async video concept (#3 in extensions) |
| MISC/02 (Block essay) | Research: `CONCEPT-EXTENSIONS.md` | Dorsey's 3-role org model + world models is the enterprise version of concept extension #2 |
| MISC/07 (free-code 1.07M views) | Apr 1: `02-free-code-repo` | Same underlying repo, different angles — announcement vs. technical breakdown |

---

*Full individual files in 2026-03-31/CC-TECHNICAL/, 2026-03-31/BUSINESS/, 2026-03-31/MISC-TRADING/. See INDEX.md for quick navigation.*
