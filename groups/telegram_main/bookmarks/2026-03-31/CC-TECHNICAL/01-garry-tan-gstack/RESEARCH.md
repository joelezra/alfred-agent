# Garry Tan gstack — Claude Code Virtual Engineering Team

**Source:** https://x.com/garrytan/status/2038555792052506941
**Author:** @garrytan — Garry Tan, President & CEO of Y Combinator
**Bookmarked:** 2026-03-31
**Category:** AI / Claude Code Technical
**Type:** Actionable
**Engagement:** 20,000+ GitHub stars in 48 hours, trended on Product Hunt

---

## TL;DR

Garry Tan open-sourced gstack on March 12, 2026 — an MIT-licensed toolkit that turns Claude Code into a virtual engineering team of specialized roles. He claims 600,000+ lines of production code in 60 days (10,000–20,000 LOC/day) using 10–15 parallel Conductor sessions. A user @Gregorein audited his production website and found a 6.42MB homepage with 169 requests, sparking a sharp debate about AI slop vs. AI-assisted productivity.

## Key Claims

- 28–31 slash commands (skills) organized as: CEO, Engineering Manager, Designer, QA Lead, Security Officer, Release Engineer
- Sprint structure: Think → Plan → Build → Review → Test → Ship → Reflect
- `/browse` skill: real Chromium browser automation, ~100ms per command, headed and headless modes
- 600,000+ lines of production code in 60 days, 35% tests, using parallel Conductor sessions
- One-paste global install: `git clone ~/.claude/skills/gstack && ./setup`
- Works with Claude Code, Codex, Gemini CLI, Cursor, Factory Droid
- MIT licensed, telemetry opt-in and off by default

## Deep Dive

### What gstack is

gstack is not a new product — it is a collection of Markdown-based slash command definitions that slot into Claude Code's native custom command infrastructure. Each "skill" is a role-framed Markdown file that instructs Claude to behave as a specialized team member. The insight is structural: instead of using Claude as a single generic assistant, gstack assigns it distinct cognitive modes with explicit responsibilities.

### The Full Skills List

**Planning skills:**
- `/office-hours` — product strategy forcing questions, reframes the idea
- `/plan-ceo-review` — scope review with four expansion modes
- `/plan-eng-review` — locks architecture and data flow
- `/plan-design-review` — interactive design audit with decision checkpoints
- `/design-consultation` — builds design systems from scratch

**Execution skills:**
- `/review` — finds production bugs; auto-fixes obvious issues
- `/qa` — tests in real browser, generates regression tests
- `/ship` — runs tests, audits coverage, opens PRs
- `/land-and-deploy` — merges and verifies production health
- `/investigate` — systematic root-cause debugging, auto-freezes scope

**Design skills:**
- `/design-shotgun` — generates multiple visual variants
- `/design-html` — produces production HTML with text reflow

**Power tools:**
- `/browse` — real Chromium browser, ~100ms command latency
- `/connect-chrome` — launches Chrome with Side Panel extension + activity feed
- `/careful` — warns before any destructive command (`rm -rf`, `DROP TABLE`, force-push)
- `/freeze` — locks edits to one directory, preventing Claude from "fixing" unrelated code
- `/guard` — activates both `/careful` and `/freeze`
- `/codex` — second opinion from OpenAI's Codex CLI
- `/cso` — security audit (OWASP Top 10 + STRIDE)

### The /browse Skill (200ms browser automation)

The `/browse` skill is one of the most technically distinctive:
- **Headed mode**: `$B connect` launches your actual Chrome as a visible window you can watch
- **Side Panel extension**: activity feed and chat sidebar for directing Claude in real-time
- **Browser handoff**: if Claude hits a CAPTCHA or auth wall, you solve it manually and resume
- **Cookie import**: `/setup-browser-cookies` lets Claude authenticate with your existing sessions
- **Headless fallback**: works without display for CI/CD

The ~100ms per command figure comes from using Bun + Playwright under the hood. Bun's fast startup time (vs. Node.js) is the key to the low-latency figure.

### Productivity Claims (and controversy)

Tan's claims are extraordinary:
- 600,000+ lines of production code in 60 days
- 140,751 lines added and 362 commits in one week
- 1,237 GitHub contributions in 2026 (vs. 772 in 2013 when building Bookface)
- Runs 10–15 simultaneous Claude Code sessions via Conductor

These figures depend on parallel execution via Conductor (conductor.build), a separate Mac app that manages multiple Claude Code sessions each in their own git worktree. Without Conductor, gstack is just structured prompts.

### The SXSW "Cyber Psychosis" Moment

At SXSW 2026, Tan publicly stated: "I sleep like four hours a night right now. I have cyber psychosis, but I think like a third of the CEOs that I know have it as well." This framing — authentic but alarming — both fueled the backlash and humanized the story.

### Gregorein's Audit: The AI Slop Counter-Narrative

The most pointed critique came from X user @Gregorein, who audited Tan's production website (garryslist.org) after the 37K LOC/day and 72-day shipping streak claims:

**Findings:**
- Homepage loads 6.42 MB across 169 requests
- For what is described as a "newsletter-blog-thingy"
- Tweet: https://x.com/Gregorein/status/2038953944475472316

The audit became Exhibit A for critics arguing that high AI-generated line counts ≠ quality or production efficiency. gstack's own `/plan-design-review` skill includes "AI Slop detection" and rates design dimensions 0–10 — but the tool can only gate quality if you use it.

### Backlash Taxonomy

1. **"It's just prompts"** — Mo Bitar's "AI is making CEOs delusional" video argued gstack is just text files that any Claude Code user already has
2. **The AI slop critique** — Gregorein's homepage audit
3. **Unverifiable productivity claims** — no independent verification of LOC counts
4. **"I would fire that CTO"** — one founder publicly stated a CTO who needed gstack should be fired
5. **Preemptive dismissal** — Tan's README response: "if you want to hate on free open source software — you're welcome to, but I'd rather you just try it first"

### AI Opinions on gstack (from various LLMs)

- ChatGPT: "reasonably sophisticated prompt workflows, but not magical. The real insight here is that AI coding works best when you simulate an engineering org structure."
- Gemini: "sophisticated — is less about making coding easier and more about making it correct."
- Claude: "a mature, opinionated system built by someone who actually uses it heavily."

### Community Reception

- ~20,000 GitHub stars within 48 hours
- 2,200+ forks
- Trended on Product Hunt
- A separate community site at gstacks.org emerged
- A gstack-fork at asecretcompany/gstack-fork appeared with 15 tools (trimmed version)
- Conductor added "Quick Start → Add repository with gstack initialized" in v0.43.0

## Key Links

- GitHub: https://github.com/garrytan/gstack
- README: https://github.com/garrytan/gstack/blob/main/README.md
- Skills docs: https://github.com/garrytan/gstack/blob/main/docs/skills.md
- Office hours skill: https://github.com/garrytan/gstack/blob/main/office-hours/SKILL.md
- TechCrunch coverage: https://techcrunch.com/2026/03/17/why-garry-tans-claude-code-setup-has-gotten-so-much-love-and-hate/
- Gregorein audit tweet: https://x.com/Gregorein/status/2038953944475472316
- Garry Tan announcement: https://x.com/garrytan/status/2032014576557179044
- Community site: https://gstacks.org/
- SitePoint tutorial: https://www.sitepoint.com/gstack-garry-tan-claude-code/
- mager.co analysis: https://www.mager.co/blog/2026-03-28-gstack-garry-tan-claude-plugin/

## Actionable Takeaways

1. **Install gstack globally** — it takes 30 seconds and costs nothing. Even if you don't use all 31 commands, `/careful` and `/freeze` alone are worth it as safety guardrails.
2. **Use `/browse` for any automation task** — Bun+Playwright at ~100ms/command is faster than anything else in the Claude Code ecosystem for browser work.
3. **Adopt the sprint structure** — Think → Plan → Build → Review → Test → Ship → Reflect. Bake this into project CLAUDE.md so Claude doesn't skip phases.
4. **Pair with Conductor** — gstack's productivity claims only materialize at scale with parallel sessions. Conductor handles the git worktree isolation.
5. **Run `/qa` before every ship** — This is the AI slop prevention mechanism. Gregorein's audit suggests Tan wasn't using his own tools consistently.
6. **Use `/cso` on anything customer-facing** — OWASP + STRIDE audit as a slash command is genuinely novel and operationally valuable.
7. **Ignore the LOC claims** — The metric is meaningless. What matters: structured review (`/review`), browser testing (`/qa`), security audits (`/cso`).

## Connections

- Connects to `/workspace/group/bookmarks/2026-04-01/02-free-code-repo/` — free-code fork of Claude Code that unlocks experimental features
- Connects to `08-gstack-vs-nanoclaw-vs-conductor` in this batch — the comparative landscape
- Relates to OpenClaw discussion in `/workspace/group/bookmarks/2026-03-31/14-self-improving-agents/RESEARCH.md` — gstack is Claude Code-native while OpenClaw is model-agnostic
- The AI slop critique connects to CLAUDE.md quality gate topic (02) — structured self-evaluation is the counter to slop
