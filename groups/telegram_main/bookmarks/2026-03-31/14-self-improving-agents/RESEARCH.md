# Self-Improving Multi-Agent Framework (Hermes + OpenClaw)

## Source
- Tweet ID: 2038896951891210309 — partial content visible
- Author: unknown (partial tweet content)
- References "Super Self-Improving Multi-Agent Framework" for Hermes or OpenClaw agents

## TL;DR
The tweet describes a three-agent supervisory architecture: a main Hermes agent doing operational work, a second Hermes agent monitoring logs and finding bugs, and a third OpenClaw agent as external supervisor. Multiple times per day, Agent 2 audits, proposes fixes, tags Agent 3 to verify, and together they apply auto-fixes (low-risk) or escalate to human approval (high-risk). This pattern is formally implemented as pskoett's "self-improving-agent" OpenClaw skill, and reflects broader capabilities built natively into Hermes Agent by Nous Research.

## Key Claims / Insights
- Agent 1 (Hermes): Main operational agent running workflows with persistent memory
- Agent 2 (Hermes): Internal supervisor — reads operation/failure logs, finds bugs, proposes fixes
- Agent 3 (OpenClaw): External supervisor — verifies Agent 2's proposed fixes, co-develops solutions
- Low-risk fixes: auto-applied without human approval
- High-risk fixes: escalated to human
- Multiple daily audit cycles
- pskoett's skill on ClawHub has 2.2k stars, 243k downloads
- Hermes Agent has 20.8k GitHub stars (Nous Research)
- OpenClaw has 247k GitHub stars (Peter Steinberger, renamed from Clawdbot/Moltbot in Jan 2026)

## Deep Dive Research

### What is OpenClaw?

OpenClaw is a free, open-source, self-hosted AI agent framework built by Austrian developer Peter Steinberger. It started as a weekend project in November 2025 under the name Clawdbot, renamed to Moltbot (trademark issue from Anthropic), then renamed to OpenClaw on January 29, 2026. Gained 247,000 GitHub stars in about 60 days.

**Core features:**
- Multi-channel: WhatsApp, Telegram, Discord, iMessage, Slack, browser control — all from a single Gateway process
- Model-agnostic: Claude, GPT-4o, Gemini, local models via Ollama
- Persistent memory across sessions (unlike Claude Code which resets)
- 52+ built-in community Skills via ClawHub marketplace
- File-based precedence system for skill configuration
- Hub-spoke architecture: central Gateway routes all messages

**SOUL.md:** Behavioral guidelines and personality file, defines how the agent acts across all interactions
**AGENTS.md:** Multi-agent workflows and delegation patterns
**TOOLS.md:** Tool capabilities and integration gotchas
**MEMORY.md:** Long-term memory (main session only)

**Position in market (2026):**
OpenClaw is positioned as a "life OS" — not just coding, but life automation. Connects to your files, calendar, communication channels. Free to self-host; you pay only for the underlying AI API calls.

**Security concerns:** CrowdStrike and Bitdefender have warned about tool poisoning and malicious skills from third-party uploads. Chinese government banned its use in state-owned companies in March 2026.

**Cost vs Claude Code:**
- Claude Code: $20/month per seat ($2,400/yr for 10 seats)
- OpenClaw self-hosted: $120-240/yr flat regardless of team size
- 20-person team saves $3,600-4,800/year with OpenClaw

### What is Hermes Agent?

Hermes Agent is an open-source autonomous AI agent built by Nous Research — the same group behind the Hermes model family and the Atropos RL framework. GitHub: https://github.com/nousresearch/hermes-agent, 20.8k stars.

Positioned as OpenClaw's successor with a focus on self-improvement. Provides automatic migration from OpenClaw (`hermes claw migrate`).

**The core differentiator — closed learning loop:**
Unlike OpenClaw, which approaches every task as new, Hermes has a self-improving mechanism:

1. After completing a complex task, Hermes automatically creates a "Skill Document" — a searchable markdown file following agentskills.io standard
2. Skill documents record exactly how the problem was solved
3. On subsequent similar situations, Hermes retrieves and applies the relevant skill
4. If a newer approach performs consistently better, the skill is updated
5. This creates ongoing refinement rather than one-time learning

**Three-tier memory architecture:**
- Session memory: current conversation context
- Persistent memory: facts and preferences across sessions (FTS5 full-text search + LLM summarization for retrieval without bloating context)
- Skill memory: solution patterns in agentskills.io-compatible markdown files

**User modeling:** Integration with Honcho dialectic modeling — builds a deepening understanding of user preferences, working style, and goals across sessions.

**Multi-agent delegation:** Hermes spawns isolated subagents for parallel workstreams — each with independent conversations and terminals. Hermes delegates, parallelizes, and synthesizes results.

**Platform support:** Telegram, Discord, Slack, WhatsApp, Signal, and CLI from a single gateway process. Voice memo transcription and cross-platform conversation continuity.

**Model support:** 200+ models via OpenRouter, Nous Portal, z.ai/GLM, Kimi/Moonshot, MiniMax, OpenAI, or custom endpoints. Switch with `hermes model` — no code changes.

**Data generation:** Can export interaction trajectories for RL training via Atropos framework. Batch-process thousands of tool-calling trajectories with checkpointing.

### The pskoett Self-Improving Agent Skill

**GitHub:** https://github.com/peterskoett/self-improving-agent
**ClawHub:** https://clawhub.ai/pskoett/self-improving-agent
**Stats:** ~2.2k stars, 243k downloads

This is the specific skill referenced in the tweet's "Super Self-Improving Multi-Agent Framework" concept. It is an OpenClaw skill that captures learnings, errors, and corrections across sessions.

**Trigger conditions** (when the skill activates):
1. A command or operation fails unexpectedly
2. A user corrects the agent ("No, that's wrong...", "Actually...")
3. A user requests a capability that doesn't exist
4. An external API or tool fails
5. The agent realizes its knowledge is outdated
6. A better approach is discovered for a recurring task

**Logging structure:**
```
.learnings/
├── LEARNINGS.md   — corrections, knowledge gaps, best practices
├── ERRORS.md      — command failures, exceptions with context
└── FEATURE_REQUESTS.md — user-requested capabilities
```

**Entry format:**
- Unique ID: TYPE-YYYYMMDD-XXX (LRN/ERR/FEAT prefix)
- Status: pending → in_progress → resolved / promoted / won't_fix
- Priority: low, medium, high, critical
- Area: frontend, backend, infra, tests, docs, config
- Pattern-Key: stable dedupe identifier for recurring issues
- Recurrence-Count: frequency tracker

**Auto-promotion rules** (when patterns graduate to permanent agent context):
- Recurrence-Count >= 3
- Seen across at least 2 distinct tasks
- Within a 30-day window

**Promotion targets:**
- CLAUDE.md: project facts and conventions
- AGENTS.md: agent-specific workflows
- .github/copilot-instructions.md: GitHub Copilot context
- SOUL.md / TOOLS.md: OpenClaw workspace-level behavioral guidance

**Known issue:** The skill keeps getting soft-deleted from ClawHub since MIT license requirement was added to the platform. It gets re-uploaded but removed again on every ClawHub update. Active GitHub issue: openclaw/clawhub#630.

### The Three-Agent Supervisory Pattern (from the tweet)

The tweet describes a specific architectural pattern combining these tools. Reconstructed from available information:

**Agent 1 — Main Hermes (Operational):**
- Runs primary workflows and automation
- Has persistent memory via Hermes memory system
- Executes tasks, tools, and multi-step workflows
- Logs operations and any failures to structured log files

**Agent 2 — Hermes Supervisor (Internal Auditor):**
- Runs on a schedule (multiple times per day)
- Reads Agent 1's operation logs and ERRORS.md
- Analyzes patterns, finds recurring bugs or inefficiencies
- Proposes coded fixes
- Tags Agent 3 for verification before applying changes
- Applies low-risk fixes automatically
- Escalates high-risk changes to human approval queue

**Agent 3 — OpenClaw External Supervisor:**
- Acts as external verification layer
- Reviews Agent 2's proposed solutions
- Independently verifies fix correctness
- Co-develops solutions when Agent 2's fix is incomplete
- Provides a second opinion before changes go live

**Risk classification:**
- Low-risk (auto-apply): typos in prompts, adding missing tool definitions, updating API endpoint URLs, adjusting timeout values
- High-risk (human approval): changes to core logic, modifications to memory/skill promotion rules, changes affecting security or data handling, structural workflow changes

This is a self-healing, self-improving agent system where the operational agent generates its own improvement backlog and a second agent closes the loop — with an external agent providing oversight. The pattern is inspired by automated quality assurance and draws parallels to: continuous integration pipelines, chaos engineering, and automated incident response.

### SOLARIS — Hermes Synthesis Sessions

Beyond the pskoett skill, Hermes has a built-in pattern called SOLARIS — structured synthesis sessions that run twice daily. The agent:
1. Loads accumulated observations
2. Reviews recent work
3. Reflects on patterns, gaps, connections, and improvements
4. Updates its own synthesis file
5. SOLARIS's prompt itself gets refined over time — the reflection process improves the reflection process

SOLARIS insights flow into subsequent task decisions without manual intervention, creating a feedback loop between reflection and action.

### Broader Landscape: Who Else is Building Self-Improving Agents

**1. Nous Research / Hermes Agent** — closed learning loop with auto-generated skills (most complete current implementation)

**2. Atropos (Nous Research)** — RL training framework that Hermes integrates with; generates training trajectories from agent interactions

**3. OpenAI o3/o4 "Critique" systems** — not fully disclosed but known to use internal self-critique during reasoning

**4. Anthropic Constitutional AI** — model learns from its own critique process during training, though not runtime self-improvement

**5. SOLARIS pattern** — Hermes twice-daily synthesis described above

**6. AutoGPT / AgentGPT** — early experiments in self-directed agents (2023); superseded by more structured approaches

**7. Stanford's Voyager (2023)** — Minecraft agent that wrote and retained skills in code; early proof-of-concept for skill accumulation pattern

**8. Multi-agent debate papers** — academic research showing that having LLMs argue against each other improves accuracy on reasoning tasks (links to the LLM Council concept)

### Installation Guide

**pskoett skill via ClawHub:**
```bash
clawhub install self-improving-agent
```

**Manual installation:**
```bash
git clone https://github.com/peterskoett/self-improving-agent.git ~/.openclaw/skills/self-improving-agent
```

**Hermes Agent installation:**
```bash
# If migrating from OpenClaw:
hermes setup  # detects ~/.openclaw and offers migration
hermes claw migrate

# Fresh install:
pip install hermes-agent
hermes setup
```

## Key Links Found
- https://github.com/nousresearch/hermes-agent — Hermes Agent (20.8k stars)
- https://github.com/peterskoett/self-improving-agent — pskoett skill repo
- https://clawhub.ai/pskoett/self-improving-agent — ClawHub listing
- https://github.com/openclaw/skills/blob/main/skills/pskoett/self-improving-agent/SKILL.md — Skill definition
- https://github.com/openclaw/openclaw/blob/main/AGENTS.md — OpenClaw agents docs
- https://getclaw.sh/blog/openclaw-vs-hermes-agent-feature-comparison-founders-2026 — Feature comparison
- https://www.mindstudio.ai/blog/what-is-hermes-agent-openclaw-alternative — What is Hermes
- https://flowtivity.ai/blog/hermes-agent-vs-openclaw/ — Head-to-head comparison
- https://www.trysliq.com/blog/hermes-agent-nous-research-review — Sliq review
- https://medium.com/@GaoDalie_AI/hermes-agent-ollama-fastest-way-to-install-locally-f2b13d958e32 — Local install guide
- https://anthonymaio.substack.com/p/getting-started-with-hermes-agent — Getting started
- https://towardsdatascience.com/using-openclaw-as-a-force-multiplier-what-one-person-can-ship-with-autonomous-agents/ — OpenClaw force multiplier
- https://agentskills.so/skills/pskoett-self-improving-agent-self-improvement — agentskills.so listing
- https://llmbase.ai/openclaw/self-improving-agent/ — LLMBase listing
- https://playbooks.com/skills/openclaw/skills/self-improving-agent — Playbooks listing
- https://skywork.ai/slide/en/mastering-openclaw-trading-bot-2037089898507014144 — OpenClaw force multiplier guide

## Actionable Takeaways
- If running OpenClaw: install pskoett/self-improving-agent immediately — it's 2.2k stars, 243k downloads for a reason
- The three-agent pattern from the tweet can be manually assembled: OpenClaw for main + supervisor agent + external verifier using sessions_spawn and sessions_send tools
- Use AGENTS.md to define the supervisor relationship and delegation pattern
- For Hermes: the self-improving loop is built-in — just use it and it builds skills automatically
- Key question for setup: define your risk classification criteria before deployment — what changes can auto-apply vs need human review
- The SOLARIS synthesis session pattern is worth stealing even for manual workflows: schedule a daily "agent reflection" prompt that reads recent logs and proposes improvements
- Hermes is the better choice if you have repetitive structured tasks that should improve over time; OpenClaw if you need maximum channel coverage and managed deployment
- Watch for: Nous Research's Atropos integration with Hermes — the RL training-from-interaction-trajectories angle is potentially very powerful for specialized task agents

## Category
AI Tools / Dev / Agent Architecture

## Type
Actionable / Reference
