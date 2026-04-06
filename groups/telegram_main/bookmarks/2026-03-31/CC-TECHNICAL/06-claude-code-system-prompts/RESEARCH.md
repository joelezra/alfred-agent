# Claude Code System Prompts Repository — Collected Templates and Extractions

**Source:** GitHub search for "claude-code system-prompt" and "CLAUDE.md templates"
**Author:** Multiple — primary: Piebald-AI (claude-code-system-prompts), repowise-dev, FlorianBruniaux, davila7
**Bookmarked:** 2026-03-31
**Category:** AI / Claude Code Technical
**Type:** Reference
**Engagement:** Piebald-AI: 8,100 stars, 1,500 forks; FlorianBruniaux: notable; rohitg00 toolkit (includes templates): 31,300 stars

---

## TL;DR

Multiple repositories exist for collecting Claude Code's system prompts and CLAUDE.md templates. The most authoritative is Piebald-AI/claude-code-system-prompts — which extracts Claude Code's actual system prompt strings from the npm package on every release, maintaining a changelog across 139 versions. FlorianBruniaux/claude-code-ultimate-guide contains 225 production templates. repowise-dev/claude-code-prompts offers independently authored prompt patterns. The asgeirtj/system_prompts_leaks repo contains the raw leaked system prompt text.

## Key Claims

- Piebald-AI extracts directly from npm — "guaranteed to be exactly what Claude Code uses" — updated within minutes of each release
- 110+ system prompt strings cataloged; CHANGELOG across 139 versions (from v2.0.14 to v2.1.90, April 1, 2026)
- Includes: 24 builtin tool descriptions, sub-agent prompts (Plan/Explore/Task), system reminders (~40 conditional), utility prompts
- FlorianBruniaux: 225 production templates, 22K+ lines of documentation, CC0 licensed (freely copyable)
- repowise-dev: independently authored patterns covering system prompts, tool prompts, agent delegation, memory management, multi-agent coordination
- The ULTRAPLAN mode system prompt was extracted and is included (see `09-claude-code-ultraplan`)
- "tweakcc" tool allows patching individual system prompt files in local installations

## Deep Dive

### The Authority Repo: Piebald-AI/claude-code-system-prompts

URL: https://github.com/Piebald-AI/claude-code-system-prompts
Stars: 8,100 | Forks: 1,500

**What it contains:**
The repo extracts all system prompt strings from the compiled Claude Code npm package using a script. This is different from leak-based approaches — it's systematic, reproducible, and legal (extracting from a publicly distributed package).

**110+ system prompt strings, organized:**

*Agent Prompts:*
- Sub-agent prompts: `/explore`, `/plan`, `/task`
- Creation assistants
- Slash command agents: `/batch`, `/security-review`, `/schedule`
- Utility agents

*Data Prompts:*
- API reference prompts (Python, TypeScript, Go, Java, etc.)
- SDK usage patterns
- Documentation templates

*System Prompt Components:*
- Tool usage guidelines (one per tool: Bash, Read, Write, Edit, Glob, Grep, WebFetch, etc.)
- Execution policies
- Output efficiency rules
- Core behavioral instructions

*System Reminders (~40 conditional):*
These are injected dynamically based on context — when Claude is in a certain mode, has done certain things, or is approaching certain situations. Examples include the ULTRAPLAN mode reminder (see `09-claude-code-ultraplan`).

**Version tracking:**
The CHANGELOG.md maps what changed in Claude Code's system prompt across every version from v2.0.14 to v2.1.90 (139 versions). This is an unprecedented record of how Anthropic has evolved Claude Code's instructions over time.

**Key insights from the version tracking:**
- Anthropic regularly adjusts the tool usage guidelines — especially for Bash and file operations
- The safety/risk assessment prompts have grown in specificity over time
- Sub-agent coordination prompts were substantially rewritten around v2.1.x
- The CLAUDE.md init flow (`/init CLAUDE.md`) was added in a specific version and has been refined multiple times

**tweakcc:**
A companion tool that allows patching individual system prompt files in your local Claude Code installation. You can replace Anthropic's default tool guidelines with your own, or modify the behavioral rules for specific contexts. This is effectively system prompt engineering without fork maintenance.

### The Ultimate Guide: FlorianBruniaux/claude-code-ultimate-guide

URL: https://github.com/FlorianBruniaux/claude-code-ultimate-guide

**What it contains:**
The most complete documentation guide with production-ready templates:
- 225 production templates total
- 9 custom AI personas
- 26 slash commands
- 31 hooks (bash + PowerShell)
- 14 skills
- Utility scripts
- 22,000+ lines of core documentation

**License:** CC BY-SA 4.0 for educational content; CC0 1.0 for templates (copy-paste freely, no attribution required)

This is the "everything you need" package for someone setting up Claude Code from scratch.

### The Pattern Library: repowise-dev/claude-code-prompts

URL: https://github.com/repowise-dev/claude-code-prompts

**Philosophy:** Independently authored prompt templates "informed by studying Claude Code" — not extracted from the actual codebase, but derived from studying its patterns and writing original implementations.

**Patterns covered:**
- System prompt architecture
- Core behavioral rules
- Safety and risk assessment
- Tool-specific instructions (per tool type)
- Agent delegation patterns
- Verification and testing prompts
- Memory and context management
- Multi-agent coordination
- Auxiliary prompts (error handling, fallback behavior)

**Why this matters:** Since the original Claude Code source is Anthropic's proprietary code, repowise-dev's independently authored versions are legally clear for commercial use, modification, and redistribution. You can build a competing product on these patterns without copyright concerns.

### The CLI Tool: davila7/claude-code-templates

URL: https://github.com/davila7/claude-code-templates

An interactive web interface and CLI tool for browsing and installing 100+ agents, commands, settings, hooks, and MCPs. Notable included collections:

- K-Dense-AI/claude-scientific-skills: 139 scientific skills for biology, chemistry, medicine, and computational research
- Standard templates for common project types

### The Leaks Repo: asgeirtj/system_prompts_leaks

URL: https://github.com/asgeirtj/system_prompts_leaks

Contains the raw text of extracted/leaked system prompts from major AI tools:
- Claude Code (full system prompt)
- ChatGPT
- Gemini
- Grok
- Perplexity

The Claude Code system prompt is the actual text that runs at the top of every Claude Code session. Understanding it is essential for anyone doing serious prompt engineering with Claude Code.

### What the System Prompts Reveal

Based on the Piebald-AI extractions (and corroborated by the March 2026 source leak), Claude Code's system prompt architecture includes:

1. **Core identity and behavioral principles** — honesty, safety, task focus
2. **Tool-by-tool guidelines** — each tool (Bash, Read, Write, Edit, etc.) has its own instruction block
3. **Execution policies** — when to proceed vs. ask, how to handle uncertainty
4. **Output efficiency rules** — avoid unnecessary verbosity, prefer concise technical responses
5. **Agent delegation guidelines** — when to spawn subagents, how to coordinate
6. **Risk assessment framework** — how to evaluate destructive operations
7. **Context management** — how to handle long contexts, what to compact
8. **CLAUDE.md loading** — instructions for how to read and apply CLAUDE.md
9. **Conditional system reminders** — 40 dynamic injections based on session state

**The ULTRAPLAN system prompt** (extracted by Piebald-AI) is one of the most revealing — it shows Anthropic's actual intent for the feature, the "ULTRAPLAN_TELEPORT_LOCAL" sentinel, and the secrecy clause (Claude is instructed not to reveal how the feature works). See `09-claude-code-ultraplan`.

### The luongnv89/claude-howto Guide

URL: https://github.com/luongnv89/claude-howto

Current version: v2.2.0 (March 2026), compatible with Claude Code 2.1+

A visual, beginner-to-power-user guide with copy-paste templates:
- Slash command configs
- CLAUDE.md templates
- Hook scripts
- MCP configs
- Subagent definitions
- Full plugin bundles
- Mermaid diagrams showing how each feature works internally

### Commercial Aggregator: aitmpl.com

A platform with 1,000+ pre-built Claude Code components. Uses a free, open-source CLI for installation.

## Key Links

- Piebald-AI (authoritative extraction): https://github.com/Piebald-AI/claude-code-system-prompts
- ULTRAPLAN system prompt: https://github.com/Piebald-AI/claude-code-system-prompts/blob/main/system-prompts/system-reminder-ultraplan-mode.md
- FlorianBruniaux (225 templates): https://github.com/FlorianBruniaux/claude-code-ultimate-guide
- repowise-dev (original patterns): https://github.com/repowise-dev/claude-code-prompts
- davila7 (CLI tool): https://github.com/davila7/claude-code-templates
- system_prompts_leaks (raw text): https://github.com/asgeirtj/system_prompts_leaks/blob/main/Anthropic/claude-code.md
- luongnv89 guide: https://github.com/luongnv89/claude-howto
- Commercial templates: https://www.aitmpl.com/
- awesome-claude-code (includes this in listings): https://github.com/hesreallyhim/awesome-claude-code
- Prompt engineering guide: https://github.com/ThamJiaHe/claude-prompt-engineering-guide

## Actionable Takeaways

1. **Bookmark Piebald-AI/claude-code-system-prompts** and subscribe to its updates — every Claude Code release changes the system prompt, and this repo documents those changes within minutes
2. **Use tweakcc** to customize specific system prompt components in your local installation — this is a more surgical approach than forking the entire codebase
3. **Copy the FlorianBruniaux templates** (CC0 licensed) for immediate project setup — 26 slash commands, 31 hooks, 14 skills ready to use
4. **Study the tool-by-tool guidelines** in Piebald-AI — understanding what instructions Claude Code gives itself for each tool reveals why Claude behaves the way it does and how to write better tool-use instructions in CLAUDE.md
5. **For commercial use of Claude Code patterns**, use repowise-dev's independently authored versions rather than extracted originals — legally cleaner

## Connections

- The ULTRAPLAN system prompt extracted here is the foundation for `09-claude-code-ultraplan`
- The FlorianBruniaux hooks collection connects to the hooks category in `05-awesome-claude-code`
- The system prompt architecture revealed here directly informs the three-block CLAUDE.md system in `02-claude-memory-architecture`
- The free-code fork (`07-free-code-fork-unlock`) builds on the source code that these system prompts were extracted from
- The CLAUDE.md init flow documented here explains how the knowledge ledger in `02-claude-memory-architecture` gets bootstrapped
