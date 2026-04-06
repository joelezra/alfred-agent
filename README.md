# Alfred — Personal AI Assistant

> A personal AI assistant that lives in my Telegram chat, keeps me up to date on tech Twitter, researches markets and trends across social platforms, and can create and post content when I need it.
> Built on [NanoClaw](https://github.com/qwibitai/nanoclaw) + Claude Agent SDK. Runs in isolated Linux containers.

---

## What This Is

Alfred is my always-on personal assistant. I message it from Telegram and it handles everything from staying on top of what's happening in tech to deep research across the internet. It runs Claude agents in isolated Linux containers with access to social media CLIs, browser automation, and web search.

**What I use it for day-to-day:**

- **Stay current on tech** — Alfred digests my Twitter bookmarks on a schedule, clusters them by theme, and sends me a prioritized summary of what matters and what to act on
- **Research anything** — "What's the state of email marketing tools right now?" and it goes deep across Reddit, Twitter, TikTok, and the open web, then files structured reports
- **Market intelligence** — competitor analysis, trend tracking, community sentiment across platforms
- **Content creation** — when I need to post, it can generate TikTok slideshows end-to-end (AI images, overlays, posting, analytics)
- **Agent teams** — for complex questions, I spin up a team of specialized agents that collaborate and report back in the same Telegram group

---

## How It Works

```
                    ┌─────────────────────────────────────────────────┐
                    │              Container (Linux VM)                │
  Telegram ──────>  │                                                 │
       │            │   Claude Agent SDK (Opus / Sonnet / Haiku)      │
       v            │       │                                         │
    SQLite ──────>  │       ├── twitter-cli   (bookmarks, search,     │
       │            │       │                  threads, timelines)     │
       v            │       ├── reddit-cli    (subreddits, threads,   │
  Orchestrator ──>  │       │                  sentiment)              │
  (Node.js)         │       ├── tiktok-cli    (trends, hashtags,      │
                    │       │                  creators, downloads)    │
                    │       ├── agent-browser  (Playwright + Chromium) │
                    │       ├── yt-dlp         (YouTube)               │
                    │       └── web search/fetch                       │
                    │                                                 │
                    │   Only group folder mounted. No host access.    │
                    └─────────────────────────────────────────────────┘
```

Single Node.js process on the host. Each agent runs in its own isolated Linux container — only its group folder is mounted, no shared memory, no sandbox escapes. Credentials injected at request time, never stored in containers.

---

## Twitter Bookmark Digest

This is the feature I use most. I bookmark tweets throughout the day — interesting threads, tools, takes, research. Alfred pulls them on a schedule, reads every linked article and thread, clusters everything by theme, and sends me a digest.

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

It's not just a list. Each digest includes:
- **Priority-ranked action items** — what to do now vs. file for later
- **Thematic clustering** across bookmarks from different days
- **Deep-dive files** for each major topic with full analysis
- **Cross-references** between related bookmarks

Example from a real digest:

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

This keeps me on top of what's happening in AI/tech without doomscrolling. I bookmark, Alfred does the rest.

---

## Deep Research

When I need to go deep on a topic, Alfred has CLI tools and full browser automation to research across platforms:

| Tool | What It Does |
|------|-------------|
| **twitter** | Search, bookmarks, threads, user analysis, timelines, followers |
| **reddit** | Subreddit deep-dives, thread analysis, sentiment, community discussions |
| **tiktok** | Trending content, hashtag research, creator profiles, video downloads |
| **agent-browser** | Full Playwright browser — navigate any website, click, fill forms, screenshot, extract data |
| **Web Search** | Real-time search across the entire web |

All tools are bundled inside the container — no external dependencies.

**Example:** I asked Alfred to research bloated SaaS markets with displacement opportunities. It went across Reddit complaint threads, Twitter discussions, TikTok creator commentary, and company blogs — then produced:

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
├── MASTER-OPPORTUNITIES.md                # Ranked scorecard with scores
└── CONCEPT-EXTENSIONS.md                  # Extended analysis
```

---

## Content Creation Pipeline

When I need to actually post content, Alfred handles the full pipeline:

```
Competitor Research → Hook Strategy → AI Image Gen → Text Overlays → Post → Analytics → Iterate
```

- **AI image generation** via Google Imagen — character-consistent 6-slide sequences
- **Text overlays** — reaction-style copy, not generic labels
- **Automated posting** via Postiz — TikTok + cross-post to Instagram, YouTube, Threads
- **Daily analytics** with a feedback loop that tracks what's working and iterates

This isn't the main thing I use Alfred for, but when I need content out, I don't have to context-switch out of Telegram to do it.

---

## Agent Teams

For complex research or multi-angle analysis, I spin up a team of Claude agents in a single Telegram group. Each gets its own bot identity:

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Analyst    │  │  Researcher  │  │  Strategist  │
│  (Haiku)     │  │  (Sonnet)    │  │  (Opus)      │
│  Fast lookups│  │  Deep dives  │  │  Synthesis   │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────── Telegram Group Chat ───────┘
```

Each agent picks the right model tier for its role — Opus for complex reasoning, Haiku for quick lookups. They communicate internally and report to the group with short, actionable updates. Each maintains persistent memory across sessions.

---

## Scheduled Automation

Alfred runs tasks on cron schedules without me asking:

- **Bookmark digest** — pulls and analyzes my Twitter bookmarks daily
- **Tech briefing** — compiles AI/tech news from Twitter, Hacker News, and TechCrunch
- **Trend monitoring** — tracks specific topics across platforms and alerts on significant movement

All scheduled via natural language: *"Every weekday at 9am, compile AI developments from my Twitter feed and HN and message me a briefing."*

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
| Image Generation | Google Imagen |
| Posting & Analytics | Postiz API |
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
│   │   ├── twitter/                  # X — search, bookmarks, threads, posting
│   │   ├── reddit/                   # Reddit — threads, search, analysis
│   │   ├── tiktok/                   # TikTok — trends, creators, downloads
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

## Design Decisions

**Container isolation over permission checks.** Every agent runs in its own Linux container. Only mounted directories are visible. OS-level isolation, not application-level allowlists.

**Persistent memory.** Each group has its own `CLAUDE.md` and memory files that survive across sessions. Alfred learns preferences, tracks people, and builds context over time.

**Small enough to understand.** One process, a handful of source files, no microservices. The entire codebase fits in a single Claude context window.

**Model routing.** Agent teams pick the right model for each subtask — Opus for complex reasoning, Haiku for lookups. Cost-effective without sacrificing quality where it matters.

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

Built on [NanoClaw](https://github.com/qwibitai/nanoclaw) by [QwibitAI](https://github.com/qwibitai) — the container isolation framework, message routing, and skill system that makes this possible.

## License

MIT
