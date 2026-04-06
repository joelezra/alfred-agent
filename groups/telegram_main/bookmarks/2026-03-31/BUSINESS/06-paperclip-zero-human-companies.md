# Paperclip: Zero-Human Company Setup via OpenClaw Agents
**Source:** https://x.com/AndrewWarner/status/2039077387485446392
**Author:** @AndrewWarner (Andrew Warner) — Founder of Mixergy.com, the startup interview platform. Built his first company to $38M/year revenue before pivoting to media. 20+ year entrepreneur and interviewer. One of the most credible voices in startup/founder education.
**Date:** 2026-03-31
**Category:** AI Agents / Automation / Tooling
**Type:** Reference / Actionable
**Engagement:** 40,124 views, 725 bookmarks, 392 likes, 23 replies

## TL;DR
Andrew Warner highlights Paperclip, an open-source tool that enables 1-click setup of "zero-human companies" — teams of AI agents orchestrated like a real org chart. Created by pseudonymous developer @dotta. Warner interviewed dotta and posted a YouTube explainer. Paperclip crossed 30,000 GitHub stars within 3 weeks of launch (March 4, 2026).

## Key Claims
- Paperclip enables 1-click setup of "zero-human companies" — teams of AI agents with org charts
- All open source
- Creator @dotta showed Warner the setup in a video walkthrough
- Previously: manage your team of agents → Now: fully autonomous companies with no human involvement
- Warner himself prefers "humans too" — personally skeptical of pure zero-human framing
- YouTube walkthrough at: https://youtu.be/qbCQ-AS5q2c

## Deep Dive
**What Paperclip Actually Is (fully verified):**
Paperclip is a Node.js server + React UI that orchestrates teams of AI agents to run a business with zero human intervention. Created by @dotta, launched March 4, 2026.

Key features:
- Org Charts & Hierarchy: AI CEO delegates to CTO who delegates to engineers — real org structure
- Goal Alignment: Every task traces to the company mission; agents can't drift into busywork
- Cost Control: Monthly spending caps per agent/department; auto-throttles approaching limits
- Heartbeat Scheduling: Agents wake on schedule, check work queue, act autonomously
- Multi-Company Support: Single Paperclip deployment handles multiple isolated companies
- Agent Compatibility: Supports OpenClaw, Claude, Codex, Cursor, Bash, HTTP agents
- Governance & Rollback: Approval gates, config versioning, rollback capability
- Upcoming: "Clipmart" — marketplace for pre-built company templates (content agencies, trading desks, dev shops)

**OpenClaw vs. Paperclip:**
"OpenClaw is an employee, Paperclip is the company." OpenClaw (by Peter Steinberger) is a single autonomous AI assistant managing email, web scraping, tasks — it's 210,000+ GitHub stars and the most accessible entry point to personal AI agents. Paperclip is the multi-agent coordination layer.

**The Nat Eliason Proof:**
Andrew Warner recently interviewed Nat Eliason (Mixergy, 6 days before this tweet). Nat built an AI agent named Felix using OpenClaw — Felix earned $177,417+ autonomously, with a $1M revenue target. Felix's stack: Claude Opus (brain), OpenClaw (body), Discord (communication), Agent Mail (email), Brave (search), Paperclip (project management). Crucially, Eliason gave Felix the Paperclip docs and Felix set up its own management system.

**ClawHost** (mentioned in replies): A service for hosting OpenClaw agents 24/7 on dedicated servers with one click — adjacent commercial play on this ecosystem.

**Andrew Warner's nuanced view:** He personally wants humans involved and noted he doesn't fully love the "zero human" framing. His ideal use cases: social content creation (dream) and research (reality). This is an important grounding note — the technology exists but the fully-autonomous company remains a vision more than a widespread reality.

**GitHub:** https://github.com/paperclipai/paperclip

## Key Links
- YouTube walkthrough (Andrew + dotta): https://youtu.be/qbCQ-AS5q2c
- Paperclip GitHub: https://github.com/paperclipai/paperclip
- Paperclip website: https://paperclip.ing/
- Mixergy interview with Nat Eliason: https://mixergy.com/interviews/how-nat-eliasons-openclaw-earned-177417/
- Zeabur deploy guide: https://zeabur.com/blogs/deploy-paperclip-ai-agent-orchestration
- Flowtivity analysis: https://flowtivity.ai/blog/zero-human-company-paperclip-ai-agent-orchestration/
- OpenClaw vs Paperclip comparison: https://flowtivity.ai/blog/openclaw-vs-paperclip-ai-agent-framework-comparison/
- eWeek coverage: https://www.eweek.com/news/meet-paperclip-openclaw-ai-company-tool/

## Actionable Takeaways
- Watch the YouTube walkthrough immediately: https://youtu.be/qbCQ-AS5q2c
- Set up Paperclip locally via the GitHub repo to understand the architecture
- The realistic near-term use case: 2-5 OpenClaw agents coordinated for research, content production, or data collection — not full company automation
- Cost control is Paperclip's killer feature — prevents runaway API costs from autonomous agents
- The Nat Eliason / Felix story is the best proof-of-concept: $177k+ earned by an agent running semi-autonomously
- Start with one agent doing one job well before scaling to a full "company"
- Clipmart (when released) will be the fastest path to a pre-built agent company template

## Connections
- Tweet #7 (slash1sol Claude Mythos / Polymarket) mentions OpenClaw explicitly as the agent framework
- Tweet #10 (Khairallah's 60 tools list) lists both OpenClaw (#8) and Paperclip — this is the practical guide to the ecosystem
- The zero-human company concept directly challenges the workforce assumptions in tweets #1-3 (human-driven GTM)
- Andrew Warner's credibility makes this the most trustworthy source on the AI agent ecosystem in this batch
