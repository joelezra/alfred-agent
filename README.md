# Alfred — Agentic Marketing System

> AI agents that research, create, post, and optimize social media content autonomously.
> Built on [NanoClaw](https://github.com/qwibitai/nanoclaw) + Claude Agent SDK. Runs in isolated Linux containers.

---

## What This Is

Alfred is my personal AI agent system for **agentic social media marketing**. It runs Claude agents in isolated containers that can:

- Research trends across **TikTok**, **Reddit**, and **X (Twitter)** in real-time
- Digest my **Twitter bookmarks** — pull, cluster by theme, extract actionable insights, file deep research
- Generate and post **TikTok slideshows** — AI image generation, text overlays, automated posting, cross-posting to Instagram/YouTube
- Run **deep research sessions** — browser automation + web search for market analysis, competitor tracking, content gaps
- Orchestrate **agent teams** — multiple Claude agents collaborate in a Telegram group, each with their own bot identity and specialization
- **Self-optimize** with a feedback loop — daily analytics, hook performance tracking, A/B testing

Everything runs from a single Telegram chat. I message Alfred, it spins up containers, does the work, and reports back.

---

## How It Works

```
                    ┌─────────────────────────────────────────────────┐
                    │              Container (Linux VM)                │
  Telegram ──────>  │                                                 │
       │            │   Claude Agent SDK (Opus / Sonnet / Haiku)      │
       v            │       │                                         │
    SQLite ──────>  │       ├── twitter-cli   (bookmarks, search,     │
       │            │       │                  threads, posting)       │
       v            │       ├── reddit-cli    (subreddits, threads,   │
  Orchestrator ──>  │       │                  sentiment)              │
  (Node.js)         │       ├── tiktok-cli    (trends, hashtags,      │
                    │       │                  creators, downloads)    │
                    │       ├── agent-browser  (Playwright + Chromium) │
                    │       ├── yt-dlp         (YouTube)               │
                    │       └── larry-marketing (slideshow pipeline)   │
                    │                                                 │
                    │   Only group folder mounted. No host access.    │
                    └─────────────────────────────────────────────────┘
```

Single Node.js process on the host. Agents execute in isolated Linux containers (Docker or Apple Container on macOS). Each group has its own container with only its folder mounted — no shared memory, no sandbox escapes. Credentials injected at request time, never stored in containers.

---

## Twitter Bookmark Digest

Alfred pulls my X bookmarks on a schedule, clusters them by theme, and produces a research summary with prioritized action items.

**What it outputs:**

```
bookmarks/
├── 2026-03-31/                           # Date-bucketed deep dives
│   ├── 01-karpathy-llm-council-skill.md
│   ├── 02-reddit-threads-to-revenue.md
│   ├── 03-apps-for-women-appkittie.md
│   └── 04-claude-code-employee-overrides.md
├── ai-agents-workflows/                  # Thematic clusters
├── crypto-trading/
├── revenue-business/
├── learning-resources/
├── INDEX.md                              # Full categorized index
└── SUMMARY.md                            # Actionable digest
```

The summary isn't a flat list. It includes:
- **Priority-ranked action items** (do now / apply to ongoing work / file for later)
- **Thematic clustering** across bookmarks from different days
- **Deep-dive files** for each major topic with full analysis
- **Cross-references** between related bookmarks

Example output from a real digest:

```markdown
## What's Actually Actionable Right Now

### Do immediately
1. Update your CLAUDE.md — the employee-grade overrides from the leak
   include a FORCED VERIFICATION rule (29-30% false-claims rate fix)

### Apply to ongoing work
3. Filter every business idea through the moat framework
   — "Hard to do, or hard to get?" AI makes "hard to do" worthless.
4. Use Reddit frustration threads as product specs
   — Find the thread where 500+ people complained. That's your spec.
```

---

## TikTok Marketing Pipeline

End-to-end automated slideshow generation and posting:

```
Competitor Research ──> Hook Strategy ──> AI Image Gen ──> Text Overlays ──> Post ──> Analytics ──> Iterate
                                            │                   │              │           │
                                     Google Imagen        Reaction-style    Postiz     Daily
                                     (Nano Banana Pro)    copy overlays     API        report
                                     1024x1536 portrait   "Wait... this     Cross-     with
                                     6-slide sequences    actually works??" post to    feedback
                                     character-consistent                   IG/YT      loop
```

### The 6-Slide Formula

1. **Hook** — stop the scroll (person + conflict/curiosity)
2. **Problem** — amplify the pain point
3. **Discovery** — introduce the solution naturally
4. **Result 1** — show transformation
5. **Result 2** — reinforce with another angle
6. **CTA** — call to action

### Feedback Loop

| Views | Conversions | Action |
|-------|-------------|--------|
| High | High | **Scale** — 3 variations, test posting times |
| High | Low | **Fix CTA** — test different slide 6 CTAs |
| Low | High | **Fix Hook** — radically different hooks, keep CTA |
| Low | Low | **Full Reset** — new format, audience angle |

Analytics tracked daily. Hook performance scored and iterated automatically.

---

## Deep Research

Alfred has CLI tools and browser automation for cross-platform intelligence gathering:

| Tool | Capabilities |
|------|-------------|
| **twitter** | Search, bookmarks, threads, user analysis, timeline, followers, posting |
| **reddit** | Subreddit analysis, thread deep-dives, sentiment, competitor research |
| **tiktok** | Trending content, hashtag research, creator profiles, video downloads |
| **agent-browser** | Full Playwright browser — navigate, click, fill forms, screenshot, extract data from any website |
| **Web Search** | Real-time search across the entire web |

All tools are bundled inside the container — no external dependencies on the host.

**Example: Market opportunity research**

I asked Alfred to research bloated SaaS markets with displacement opportunities. It produced:

```
research/
├── market-research/
│   ├── email-marketing-tools.md      # Klaviyo billing scandal = mass exodus
│   ├── social-media-tools.md         # Metricool $17M ARR with zero paid ads
│   ├── design-tools.md               # Adobe FTC lawsuit + CapCut ban = vacuum
│   ├── helpdesk-livechat-tools.md    # Intercom $0.99/AI resolution trap
│   ├── testimonial-tools.md          # Senja $1M ARR with 2 people
│   └── ... (12 categories total)
├── distribution/
│   └── organic-tiktok-reels-playbook.md   # Tactiq: 150K users for $1,820 ad spend
├── MASTER-OPPORTUNITIES.md                # Ranked scorecard
└── CONCEPT-EXTENSIONS.md                  # Extended analysis
```

---

## Agent Teams (Swarms)

Multiple Claude agents work as a team in a single Telegram group. Each gets its own bot identity:

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Analyst    │  │  Researcher  │  │  Strategist  │
│  (Haiku)     │  │  (Sonnet)    │  │  (Opus)      │
│  Fast lookups│  │  Deep dives  │  │  Synthesis   │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────── Telegram Group Chat ───────┘
```

Each agent:
- Has its own Telegram bot token and visible identity
- Uses the right model tier (Opus for complex reasoning, Haiku for quick lookups)
- Communicates with teammates via internal messaging
- Reports to the group independently with short, actionable updates
- Maintains its own persistent memory

---

## Stack

| Component | Technology |
|-----------|-----------|
| Agent Engine | [Claude Agent SDK](https://docs.anthropic.com/en/docs/agents-sdk) (Opus / Sonnet / Haiku) |
| Framework | [NanoClaw](https://github.com/qwibitai/nanoclaw) (Node.js + TypeScript) |
| Container Runtime | Docker or Apple Container (macOS native) |
| Messaging | Telegram via Grammy SDK |
| Storage | SQLite (better-sqlite3) |
| Social CLIs | twitter-cli, reddit-cli, tiktok-cli (Python, bundled in container) |
| Browser | Playwright + Chromium via agent-browser |
| Image Generation | Google Imagen (Nano Banana Pro) |
| Posting & Analytics | Postiz API (TikTok, Instagram, YouTube, Threads) |
| Video | yt-dlp |
| Scheduling | Cron-based task scheduler |

---

## Project Structure

```
alfred-agent/
├── src/                              # Host orchestrator
│   ├── index.ts                      # Message loop, state, agent invocation
│   ├── channels/
│   │   ├── registry.ts               # Channel self-registration
│   │   └── telegram.ts               # Telegram integration
│   ├── container-runner.ts           # Container lifecycle & mounts
│   ├── task-scheduler.ts             # Cron scheduling
│   ├── ipc.ts                        # Container <-> Host IPC
│   ├── router.ts                     # Message formatting & routing
│   ├── db.ts                         # SQLite (messages, groups, sessions)
│   ├── group-queue.ts                # Per-group queue + concurrency
│   └── mount-security.ts             # Mount path validation
│
├── container/                        # Agent container (Linux)
│   ├── agent-runner/src/index.ts     # Claude SDK wrapper
│   ├── reddit-cli/                   # Reddit CLI (no API key needed)
│   ├── tiktok-cli/                   # TikTok CLI
│   ├── skills/
│   │   ├── twitter/                  # X (Twitter) - post, search, bookmarks
│   │   ├── reddit/                   # Reddit - threads, search, analysis
│   │   ├── tiktok/                   # TikTok - trends, creators, downloads
│   │   └── agent-browser/            # Playwright browser automation
│   └── Dockerfile
│
├── groups/                           # Isolated per-group contexts
│   ├── telegram_main/
│   │   ├── bookmarks/                # Twitter bookmark digests
│   │   ├── research/                 # Deep research sessions
│   │   ├── CLAUDE.md                 # Group memory & instructions
│   │   └── memory.md                 # Persistent agent learnings
│   ├── telegram_swarm/               # Agent teams group
│   └── global/CLAUDE.md              # Shared across all groups
│
├── .claude/skills/                   # Installable capabilities
│   ├── larry-marketing/              # TikTok slideshow pipeline
│   ├── x-integration/                # X browser automation
│   ├── add-telegram-swarm/           # Agent teams setup
│   ├── add-gmail/                    # Email integration
│   └── ... (20+ skills)
│
└── docs/
    ├── SPEC.md                       # Full architecture spec
    └── SECURITY.md                   # Security model & isolation
```

---

## Key Design Decisions

**Container isolation over permission checks.** Every agent runs in its own Linux container. It can only see what's explicitly mounted. This is OS-level isolation, not application-level allowlists.

**Skills over features.** New capabilities are added as git branches that transform the codebase, not bolted-on features. You end up with clean code that does exactly what you need.

**Small enough to understand.** One process, a handful of source files, no microservices. The entire codebase fits in a single Claude context window.

**Persistent memory per group.** Each group has its own `CLAUDE.md` that survives across sessions. The agent learns preferences, tracks people, and builds institutional memory over time.

**Model routing.** Agent teams pick the right model for each task — Opus for complex reasoning, Sonnet for implementation, Haiku for lookups. Cost-effective without sacrificing quality.

---

## Setup

```bash
git clone https://github.com/joelezra/alfred-agent.git
cd alfred-agent
claude          # Opens Claude Code
# Then type: /setup
```

**Requirements:** macOS or Linux, Node.js 20+, [Claude Code](https://claude.ai/download), Docker or [Apple Container](https://github.com/apple/container)

---

## Credits

Built on [NanoClaw](https://github.com/qwibitai/nanoclaw) by [QwibitAI](https://github.com/qwibitai) — the container isolation framework, message routing, and skill system that makes all of this possible.

## License

MIT
