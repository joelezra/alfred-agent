# GStack vs NanoClaw vs Conductor — Claude Code Setup Landscape 2026

**Source:** Comparative research across GitHub, conductor.build, and community coverage
**Author:** N/A (landscape research)
**Bookmarked:** 2026-03-31
**Category:** AI / Claude Code Technical
**Type:** Reference
**Engagement:** gstack: 20,000+ stars; Conductor: active Mac app; NanoClaw: production system in this environment

---

## TL;DR

Three distinct approaches dominate the "how to run Claude Code as a serious development environment" landscape in 2026: gstack (Garry Tan's role-based skill pack for structured workflows), Conductor (a Mac app for parallel multi-session management), and NanoClaw (multi-channel communication layer for AI agents). They are not direct competitors — they operate at different layers of the stack. The winning architecture in 2026 is gstack + Conductor for development workflows, with NanoClaw or Paperclip handling the orchestration/communication layer.

## Key Claims

- gstack: structured workflow via slash commands (Think→Plan→Build→Review→Test→Ship→Reflect); MIT; free
- Conductor: parallel session manager for Mac; free to run (you pay API costs); manages git worktrees; visual dashboard
- NanoClaw (OpenClaw derivative): multi-channel communication layer (Telegram/WhatsApp/Discord); 247K+ stars for OpenClaw base
- Three distinct layers: workflow structure (gstack) / parallel execution (Conductor) / communication/memory (NanoClaw)
- Additional players: Shipyard.build, Vibe Kanban, Gastown, Claude Squad, Antigravity, Cursor Background Agents
- Conductor v0.43.0 added Codex Skills + Plan Mode + Fast Mode; v0.44.0 added sidebar rebuild with GitHub status

## Deep Dive

### Layer Architecture of the Claude Code Ecosystem

The most important insight in comparing these tools is that they operate at different layers:

```
Layer 4: Communication & Memory  — NanoClaw / Paperclip / Hermes
Layer 3: Orchestration            — Conductor / Shipyard / Claude Squad
Layer 2: Workflow Structure       — gstack / free-code skills / custom CLAUDE.md
Layer 1: Agent Core               — Claude Code / OpenClaw / Codex / Cursor
```

You can (and should) stack multiple layers. gstack + Conductor is the most recommended combination in the community. NanoClaw/Paperclip adds the organization layer on top.

### GStack (Layer 2: Workflow Structure)

**What it is:** A collection of Markdown-based slash command definitions for Claude Code. 28–31 commands organized as specialized roles.

**Core strengths:**
- Role-based cognitive modes: each command puts Claude into a specific specialist mindset
- Sprint structure enforcement: Think → Plan → Build → Review → Test → Ship → Reflect
- Safety guardrails: `/careful`, `/freeze`, `/guard`, `/investigate`
- Security audits: `/cso` (OWASP + STRIDE) as a one-command slash command
- Browser automation: `/browse` (Bun + Playwright, ~100ms/command)
- Free, MIT, 30-second install

**Core weakness:**
- It's prompts. Highly capable Claude users already have their own versions of this.
- Productivity claims only materialize with Conductor running parallel sessions
- No persistent memory / session state management (handled by CLAUDE.md architecture)

**Best for:** Individual developers or small teams using Claude Code who want structured workflows without building their own skill system.

### Conductor (Layer 3: Orchestration)

**What it is:** Mac app for running multiple Claude Code and Codex agents in parallel, each in their own isolated git worktree.

**URL:** https://www.conductor.build/

**Core strengths:**
- Parallel session management: 3–8 parallel features on the same repo simultaneously
- Visual dashboard: see at a glance what each agent is doing
- Git worktree isolation: no conflicts between parallel sessions
- Diff-first review UI: review and merge changes efficiently
- GitHub status integration: merged/failing CI/conflicts visible at a glance
- Apple Silicon and Intel Mac support
- Free to run (you pay API costs via your existing Claude login)

**Recent updates (March 2026):**
- v0.43.0: Codex Skills support, Plan Mode, Fast Mode; Quick Start with gstack initialization
- v0.44.0: rebuilt sidebar, updated composer, GitHub status integration, tool approval settings in Settings → Account

**Core weakness:**
- macOS only (Apple Silicon + Intel) — excludes Linux/Windows users
- Requires managing multiple terminal/session contexts
- The visual dashboard adds some overhead vs. raw Claude Code

**Best for:** Mac-based developers who want to run multiple Claude Code agents simultaneously on the same repo. The "gstack + Conductor" combination is the community's most-recommended power setup.

**Pricing:**
- Conductor app: Free
- Claude Code: $20/mo (Pro), $100/mo (Max 5x), $200/mo (Max 20x)
- API: pay-per-token
- For 3-agent teams: Max 5x minimum recommended; Max 20x for all-day multi-agent

### NanoClaw (Layer 4: Communication & Memory)

**What it is:** (Based on context from this environment) A multi-channel AI agent communication layer, derived from OpenClaw. Handles Telegram, WhatsApp, Discord, and other channel routing. Supports multi-agent team coordination with dedicated bot identities per agent.

**The NanoClaw context in this environment:**
NanoClaw is the production system running in this workspace. It provides:
- Multi-channel message routing (Telegram primary in this environment)
- `mcp__nanoclaw__send_message` with `sender` parameter for dedicated bot identities
- Task scheduling: `schedule_task`, `pause_task`, `resume_task`, `cancel_task`
- Group management: `register_group`
- Multi-agent team coordination with lead agent patterns

**OpenClaw base (Peter Steinberger):**
- 247,000+ GitHub stars
- Started as Clawdbot (Nov 2025) → Moltbot → OpenClaw (Jan 29, 2026)
- Model-agnostic: Claude, GPT-4o, Gemini, local via Ollama
- Persistent memory across sessions
- 52+ built-in skills via ClawHub marketplace
- SOUL.md: behavioral guidelines (equivalent to Claude Code's CLAUDE.md)

**Core strengths vs. gstack/Conductor:**
- Multi-channel: runs across Telegram, WhatsApp, Discord, iMessage, Slack, browser
- Persistent memory: doesn't reset between sessions (unlike Claude Code)
- Model-agnostic: not locked to Claude
- Community skills marketplace (ClawHub)
- Team memory and AGENTS.md for multi-agent workflows

**Core weakness vs. gstack:**
- More general-purpose, less optimized for pure coding workflows
- Setup is more complex
- Not as tightly integrated with git/PR workflows

### The Other Players

**Shipyard.build**
URL: https://shipyard.build/blog/claude-code-multi-agent/
Multi-agent orchestration for Claude Code. Focused on production-grade multi-agent deployments rather than local dev setup.

**Vibe Kanban**
Claude Code-native kanban board for managing parallel agent workstreams. Visual task management for multi-agent development.

**Gastown**
Multi-agent orchestration tool in the Claude Code ecosystem. Less documented but appears in multiple comparison lists.

**Claude Squad**
Multiple Claude Code instances orchestrated from a single interface. Similar to Conductor but cross-platform.

**Antigravity**
Referenced in multi-agent tooling comparisons; minimal public documentation available.

**Cursor Background Agents**
Cursor IDE's built-in background agent functionality. Competes with Conductor at the IDE level rather than terminal level.

### Comparative Architecture Analysis

| Dimension | gstack | Conductor | NanoClaw/OpenClaw | Paperclip |
|---|---|---|---|---|
| **Layer** | Workflow structure | Session orchestration | Communication/memory | Company layer |
| **Agent type** | Claude Code | Claude Code + Codex | Any model | Any agent |
| **Parallelism** | Via Conductor | Native | Hub-spoke | Org chart |
| **Persistence** | None (CLAUDE.md) | Git worktrees | Native memory | PARA-based files |
| **Platform** | Cross-platform | macOS only | Cross-platform | Cross-platform |
| **Channel** | Terminal | Terminal + UI | Multi-channel | Dashboard |
| **Cost** | Free | Free + API costs | Free (self-host) | Free (self-host) |
| **Install time** | 30 seconds | App install | Server setup | npx onboard |
| **Governance** | None | Tool approvals | None | Board approval gates |

### The Winning Architecture (2026 Community Consensus)

For coding work specifically:
- **Tier 1 (interactive)**: gstack for structured single-session work
- **Tier 2 (parallel sprints)**: gstack + Conductor for parallel development
- **Tier 3 (overnight/backlog)**: Paperclip or Claude Squad for sustained autonomous work

For broader AI operations (beyond just coding):
- NanoClaw/OpenClaw + Paperclip as the communication and company layers
- gstack for the actual coding sessions those agents invoke

### Cost Comparison for Teams

| Scenario | gstack alone | gstack + Conductor | OpenClaw self-hosted |
|---|---|---|---|
| 1 developer | $20/mo (Pro) | $20/mo (Pro) | ~$10-20/mo API |
| 10 developer team | $200/mo | $200/mo | ~$120-240/yr flat |
| Power user (all-day multi-agent) | $200/mo (Max 20x) | $200/mo (Max 20x) | Variable |

OpenClaw self-hosted is significantly cheaper for teams because you pay per API call rather than per seat.

## Key Links

- gstack: https://github.com/garrytan/gstack
- Conductor: https://www.conductor.build/
- Conductor changelog: https://www.conductor.build/changelog
- Conductor docs: https://docs.conductor.build
- OpenClaw (base for NanoClaw): https://github.com/steinbergpeter/openclaw (247K stars)
- Shipyard multi-agent guide: https://shipyard.build/blog/claude-code-multi-agent/
- Best alternative analysis: https://codeconductor.ai/blog/claude-code-alternative/
- Goose vs gstack comparison: https://codeconductor.ai/blog/goose-ai-vs-gstack/
- Addy Osmani on code agent orchestration: https://addyosmani.com/blog/code-agent-orchestra/
- gstack + OpenClaw guide: https://openclawapi.org/en/blog/2026-03-24-gstack-beginners-guide

## Actionable Takeaways

1. **The right question is not "which one" but "which layer am I missing"** — assess what you currently have and add the missing layer rather than picking one tool
2. **If you're on Mac and doing serious coding work**: gstack + Conductor is the highest-ROI combination; Conductor is free and adds parallel execution without changing your workflow
3. **If you need multi-channel or non-coding agent operations**: NanoClaw/OpenClaw adds what Claude Code lacks — persistent memory, multi-channel routing, model flexibility
4. **If you're managing multiple agent workstreams**: Paperclip adds governance and cost control that no other tool provides
5. **For teams (10+ people)**: OpenClaw self-hosted is $3,600–$4,800/yr cheaper than Claude Code Pro per seat
6. **The future state**: Anthropic's AGENT_TRIGGERS and BRIDGE_MODE (from free-code unlock) will eventually bring orchestration features natively into Claude Code, potentially reducing the need for external orchestration tools

## Connections

- gstack details in `01-garry-tan-gstack`
- Paperclip details in `04-paperclip-zero-human-company`
- NanoClaw architecture referenced throughout `/workspace/group/bookmarks/2026-03-31/14-self-improving-agents/RESEARCH.md` for OpenClaw base
- Conductor directly referenced in `/workspace/group/bookmarks/2026-04-01/` free-code bookmarks
- The AGENT_TRIGGERS and BRIDGE_MODE features from `07-free-code-fork-unlock` will eventually make external orchestration tools less necessary
