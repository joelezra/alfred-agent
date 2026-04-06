# Engineering for Agents That Never Sleep — Nader Dabit

**Source:** https://x.com/dabit3/status/2038608435105726862 (tweet); http://x.com/i/article/2038359826556649472 (X Article — not found via API); full article at https://nader.substack.com/p/engineering-for-agents-that-never
**Author:** @dabit3 — Nader Dabit, Growth at Cognition (makers of Devin AI + Windsurf), former AWS developer relations lead, former Aave/Lens Protocol, former Eigen Labs, DeveloperDAO co-founder; 187.6K followers, 14+ years building software
**Bookmarked:** 2026-04-01
**Category:** AI Agents & Infrastructure
**Type:** Reference
**Engagement:** 36K views, 359 bookmarks

---

## TL;DR

Nader Dabit argues that AI agents are already operating autonomously at Cognition — 30% of Devin sessions are triggered without any human — and this ratio will invert to 90% automated within a year. The engineering implication is that "the prompt is the bottleneck" — humans acting as relays between machine-readable signals and agents is a waste. The article outlines the four prerequisites that separate agents that can handle 3am incidents from agents that just open PRs: comprehensive tests, quality documentation, reproducible environments, and rich system context. This is less about using AI and more about what engineering infrastructure enables autonomous operation at scale.

## Key Claims

- At Cognition, 70% of Devin sessions currently start manually (webapp, Slack, Linear); 30% automated (API, scheduled sessions)
- Within months: will flip to 30% manual / 70% automated
- Within a year: 10% manual / 90% automated
- "Most of the signals that trigger engineering work are already machine-readable"
- Humans acting as relays between systems that could talk directly is the core inefficiency to eliminate
- "The prompt is the bottleneck" — not agent capability
- The scaffolding (tests, docs, reproducible environments, system context) is "the difference between an agent that opens a PR and an agent that closes an incident at 3am"
- On mature teams: "most of the work will already be underway before anyone opens [the prompt interface]"

## Deep Dive

### The Core Argument: Agents Triggered by Machines, Not Humans

The article's central insight is structural, not technical. Every alert that fires, test that fails, spec that gets approved — these are already machine-readable events. Currently, the workflow is:

> Machine-readable event → Human reads it → Human context-switches → Human opens agent session → Human types a prompt restating what the event already said → Agent acts

The human in that chain is not adding value — they are a relay. Remove the relay, and you get:

> Machine-readable event → Agent acts directly

Dabit says at Cognition this is already happening for 30% of sessions and accelerating rapidly.

### The Four Prerequisites for Autonomous Operation

Dabit's article identifies four things engineering teams must build before agents can operate reliably without humans:

**1. Comprehensive Unit Tests**
Agents verify their own output. Without tests, the agent has no way to know if its change broke something. With tests, the agent can run the suite, see failures, and self-correct. This is the feedback loop that makes autonomous PR merging safe.

*Implication:* If your test coverage is low, every AI-generated change requires human review. Test coverage directly determines how much of the 70%→30%→10% manual ratio you can actually achieve.

**2. Quality Documentation**
Agents need context without asking for clarification. When documentation is good, the agent can answer "what does this function do?", "what are the conventions here?", "what are the tradeoffs?" independently. When documentation is poor, every non-trivial task requires a human to brief the agent.

*Implication:* Documentation is not for humans anymore. It's the interface through which agents understand the system.

**3. Reproducible Environments**
The agent needs to execute code without custom setup. If "running the tests" requires a developer to configure local environment variables, install dependencies manually, or connect to dev infrastructure — the agent can't do it autonomously. Reproducible environments (containerized, scripted, CI-integrated) are the prerequisite for unattended execution.

*Implication:* Devcontainers, Docker, and codified setup scripts are not developer convenience features — they're the infrastructure that enables autonomous agents.

**4. Rich System Context**
Agents need to understand architecture and conventions at the system level. This goes beyond individual file documentation: what are the architectural boundaries? Which services own which data? What are the established patterns for error handling, authentication, API versioning?

This connects directly to the employee-grade CLAUDE.md insight from the March bookmark batch — a well-structured CLAUDE.md is exactly this "rich system context" formalized.

### The Cognition Data Point

Cognition is uniquely credible as a source for this argument — they run cloud agents in production longer than any other company and have the Devin platform to measure actual usage patterns. Their internal data:

- 659 Devin PRs merged in a single week (up from 154 in their best week of 2025 — 4x increase)
- Non-engineers tag @Devin in Slack to fix docs, report bugs, request features — without Git or local environment
- DANA (Data Analyst Agent) answers analytics queries without pulling engineers away from primary work
- Daily design system audits run automatically, flagging hardcoded colors and non-standard components
- Bug triage runs via !triage-bug playbook before human engineers engage

These are not demos. This is a team of hundreds operating at these ratios.

### The Cloud Agent vs. Local Agent Distinction

Dabit published a companion article "The Cloud Agent Thesis" that provides important framing:

- **Local agents** (Cursor, Windsurf): synchronous, developer-facing, real-time review. Developer watches and approves.
- **Cloud agents** (Devin, future Claude Code with KAIROS): asynchronous, organizational-facing, parallel workstreams.

The key properties of cloud agents that make the "never sleep" pattern possible:
- Universal access: non-engineers can trigger via Slack without developer setup
- Cross-codebase: single agent spans multiple repositories
- Async operation: handles routine work (refactors, security patches, dependency updates) without real-time steering
- Organizational leverage: expertise encoded in Playbooks, executed by anyone
- Infrastructure model: capacity, not productivity tool

Cloud agents excel at: targeted refactors, bug fixes, test coverage, migrations, documentation.
Cloud agents are weak at: large ambiguous projects, visual design judgment, mobile UI testing.

### Who Is Nader Dabit?

One of the more credible voices in developer relations / AI tooling:

**Career trajectory:**
- Taught himself to code running a WordPress eCommerce business in Mississippi
- Moved to LA, became one of the top React Native trainers in the country
- Trained internal teams at Amazon, Microsoft, and the U.S. military
- 3+ years at AWS leading developer relations for Front End Web & Mobile
- Edge & Node (creators of The Graph Protocol)
- Aave and Lens Protocol (DeFi and decentralized social)
- Eigen Labs (EigenLayer) — developer relations lead
- Currently: Growth at Cognition (Devin AI + Windsurf)
- 187.6K followers on X
- Substack: nader.substack.com

**Why trust him on this:** He's not theorizing. He works at the company running more production cloud agent sessions than anyone else and has access to the actual usage data.

### Note on X Article Unavailability

The Twitter article ID 2038359826556649472 returned "not found" via the CLI tool. However, the full article is available on his Substack at https://nader.substack.com/p/engineering-for-agents-that-never — the article clearly exists and is well-documented. The X article may have been a cross-post that was later deleted or the ID may not match the article's canonical location.

## Key Links

- Full article (Substack): https://nader.substack.com/p/engineering-for-agents-that-never
- Cloud Agent Thesis: https://nader.substack.com/p/the-cloud-agent-thesis
- How Cognition Uses Devin to Build Devin: https://nader.substack.com/p/how-cognition-uses-devin-to-build
- Personal site: https://nader.codes/
- LinkedIn: https://www.linkedin.com/in/naderdabit/
- Twitter: https://x.com/dabit3
- Cognition / Devin: https://cognition.ai

## Actionable Takeaways

1. Audit your current test coverage — this is literally the ceiling for autonomous agent operation. Below 70% coverage, every AI change needs human review. Above 90%, agents can self-verify.
2. Treat your CLAUDE.md / system documentation as the primary interface for agents, not humans. It should answer: what does this service do? what are the architectural boundaries? what are the conventions? what should never be changed?
3. Set up reproducible environments (devcontainers, Docker Compose, scripted setup) before relying on agents for anything beyond trivial edits
4. Start logging machine-readable events that currently require human interpretation: test failures, alerts, spec approvals, PR review requests. Each of these is a potential agent trigger.
5. The 30%/70% ratio for NanoClaw sessions is achievable near-term if: (a) the task types are well-specified, (b) the output is verifiable, and (c) the trigger signals are machine-readable
6. Review Cognition's Playbooks model — encoding expert knowledge once, then executing via agents, is the leverage pattern for any team building with agents

## Connections

- Directly extends `ai-agents-workflows/02-self-improving-multi-agent-framework.md` (March batch) — the 3-agent architecture (main + supervisors) is the internal scaffolding that makes "agents that never sleep" reliable
- The KAIROS daemon described in `ai-claude-leak/03-claude-code-what-to-prepare.md` (March batch) is exactly this pattern: Claude Code becoming an always-on agent triggered by machine events rather than human prompts
- The 4 prerequisites (tests, docs, reproducible envs, system context) map directly to the employee-grade CLAUDE.md overrides from `ai-claude-leak/04-claude-code-employee-grade-overrides.md` — FORCED VERIFICATION rule = comprehensive tests; CONTEXT DECAY rule = rich system context
- The cloud agent vs. local agent distinction is the practical implementation of "the harness is the product" insight from `ai-claude-leak/02-claude-code-harness-is-product.md`
- Connects to the Polymarket bot research (March batch) — the $1K→$14K bot operated via the same "machine-readable events → autonomous execution" pattern with Kelly Criterion as the verification mechanism
- The 659 PRs/week Devin metric is the benchmark for what "agents that never sleep" looks like at production scale. NanoClaw's agent team architecture is a step toward this.
