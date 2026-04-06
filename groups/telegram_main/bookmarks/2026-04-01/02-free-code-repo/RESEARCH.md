# free-code — The Detelemetrized, Feature-Unlocked Fork of Claude Code

**Source:** https://github.com/paoloanzn/free-code
**Author:** @paoloanzn (4nzn) — verified, GitHub handle paoloanzn; builds developer tooling, active in the Claude Code ecosystem
**Bookmarked:** 2026-04-01
**Category:** AI / Claude Code Ecosystem
**Type:** Reference
**Engagement:** 75K views, 788 bookmarks; 3K+ GitHub stars, 1.1K+ forks

---

## TL;DR

free-code is a fork of Anthropic's Claude Code CLI that became possible when Claude Code's source was inadvertently exposed via source maps in the npm distribution on March 31, 2026. The fork removes all telemetry (OpenTelemetry, GrowthBook, Sentry), strips security prompt guardrails, and unlocks 54 of 88 experimental feature flags that ship disabled in the official release. It is permanently mirrored on IPFS to survive DMCA takedowns. Legal status is questionable — this is Anthropic's proprietary code.

## Key Claims

- Source became available March 31, 2026 through a source map exposure in the npm distribution
- All telemetry removed: OpenTelemetry/gRPC, GrowthBook analytics, Sentry error reporting, custom event logging
- 54 of 88 feature flags unlocked (all that compile cleanly); full audit in FEATURES.md
- Security-prompt guardrails stripped (the model's inherent safety training remains intact)
- ULTRAPLAN/ULTRATHINK modes enabled — "async agentic planning mode where Claude starts a multi-agent research session lasting between 10 and 30 minutes"
- VOICE_MODE, BRIDGE_MODE (IDE remote control), built-in explore/plan agents enabled
- Supports 5 model providers: Anthropic direct, OpenAI Codex, AWS Bedrock, Google Cloud Vertex AI, Anthropic Foundry
- IPFS archived: CID bafybeiegvef3dt24n2znnnmzcud2vxat7y7rl5ikz7y7yoglxappim54bm
- Fork of instructkr/claw-code (not direct Anthropic fork)
- 5 open pull requests including context compression, API restriction removal, PRNG fix, security hardening

## Deep Dive

### How the Source Leak Happened

Anthropic's Claude Code ships as an npm package (compiled JavaScript). On March 31, 2026, the npm distribution inadvertently included source maps — a debugging artifact that contains the original TypeScript source code. Source maps are a common development oversight; they allow browser/Node debugging tools to map minified code back to human-readable source. When present in a published npm package, they effectively expose the full original source to anyone who knows where to look.

This is the same leak referenced extensively in the March 30-31 bookmark batch (see `ai-claude-leak/` directory). The 1,900 files / 512K lines of code that @T3chFalcon reported are the same source that enabled this fork.

### Technical Stack Confirmed

- Runtime: Bun (>=1.3.11)
- Language: TypeScript
- Terminal UI: React + Ink
- CLI parsing: Commander.js
- Schema validation: Zod v4
- Code search: ripgrep
- Protocols: MCP (Model Context Protocol), LSP (Language Server Protocol)

This confirms Claude Code uses React for its terminal rendering — the same architectural choice as Ink-based terminal apps. MCP integration means it can use any MCP server as a tool.

### What's Actually Unlocked

The 88 feature flags in the codebase reveal the full roadmap of what Anthropic was building. Of those, 54 compile cleanly and are enabled in this fork. Key unlocked features:

**ULTRAPLAN / ULTRATHINK**: Multi-agent async planning mode. Claude initiates a research session in the browser lasting 10-30 minutes before responding. This is effectively a slow, deep-thinking mode — useful for architecture decisions, not quick queries.

**VOICE_MODE**: Push-to-talk input. Allows voice commands to the CLI agent.

**BRIDGE_MODE**: IDE remote control for VS Code and JetBrains. The agent can control the IDE directly, not just edit files.

**Built-in plan/explore agents**: Dedicated agents for task planning and codebase exploration.

**Memory extraction**: Post-query automatic memory handling — the agent can persist context without explicit user instruction.

### Who Is paoloanzn?

- Twitter: @paoloanzn (verified account, handle 4nzn)
- Active in Claude Code / developer tooling space
- Tweet announcing the project: https://x.com/paoloanzn/status/2039022418698907949 — "say hello to free-code claude code source code fully recompiled, telemetry stripped, security guardrails prompts stripped, all working experimental features enabled including ultraplan mode"
- Anticipated DMCA and preemptively uploaded to IPFS/Filecoin
- The timing (same week as the leak becoming public knowledge) suggests close involvement in the original discovery or rapid response to it

### Active Development (Pull Requests)

5 open PRs indicating this is not abandoned:
- #16: PRNG algorithm fix + native Bun cracker (CoreSheep)
- #8: API restrictions removal — enables third-party provider compatibility (GouBuliya)
- #7: Context compression — contextCollapse and snipCompact utilities for handling large contexts (GouBuliya, 10 comments)
- #5: Build script fix — narrows EEXIST error handling (glovergao)
- #3: Security improvement — vendor modifiers-napi locally (morluto)

PR #7 (context compression) is particularly interesting — this directly addresses one of the FILE READ BUDGET and CONTEXT DECAY issues documented in the March bookmark batch employee-grade CLAUDE.md.

### Legal & Ethical Considerations

This fork is legally complicated:
- The source was exposed through Anthropic's own distribution mistake (source maps in npm)
- Anthropic almost certainly owns the copyright
- Redistributing compiled versions = likely copyright infringement
- Anthropic can (and probably will) issue DMCA takedowns
- paoloanzn anticipated this and IPFS-mirrored it — the code will not disappear
- Using it requires providing your own Anthropic API key — Anthropic still monetizes the model usage
- The fork strips telemetry Anthropic uses for product analytics, not just surveillance data
- Guardrail stripping is the most ethically gray part — though the author notes model safety training remains

For personal use with your own API key: risk is low. For building products on top: legal exposure is real.

### Experimental Features That Are "Not Fully Working Yet"

The tweet explicitly notes: "NOTE: some experimental features are not FULLY working yet, still working on those." Based on the PR activity, likely culprits:
- Context compression utilities (PR #7 is actively being worked on)
- PRNG algorithm (PR #16 is a fix)
- API restrictions for third-party providers (PR #8)

ULTRAPLAN mode is confirmed working but may be slow/unreliable.

## Key Links

- Repo: https://github.com/paoloanzn/free-code
- Source tree: https://github.com/paoloanzn/free-code/tree/main/src
- Pull requests: https://github.com/paoloanzn/free-code/pulls
- Mirror repo (mygu fork): https://github.com/mygu/claude-code-source
- Author's tweet: https://x.com/paoloanzn/status/2039022418698907949
- IPFS CID: bafybeiegvef3dt24n2znnnmzcud2vxat7y7rl5ikz7y7yoglxappim54bm
- Install script: https://raw.githubusercontent.com/paoloanzn/free-code/main/install.sh

## Actionable Takeaways

1. Install via the one-liner curl script if you want the feature-unlocked build — but use your own Anthropic API key (you're still paying Anthropic per token)
2. ULTRAPLAN mode (10-30 minute deep planning sessions) is the most interesting unlocked feature for complex architecture work — use it for system design decisions, not day-to-day tasks
3. BRIDGE_MODE could be valuable if VS Code integration works — allows the agent to control the IDE rather than just edit files
4. Context compression PR (#7) is worth watching — this addresses the silent context decay problem directly
5. Do NOT build a commercial product on this codebase without legal clearance — Anthropic will notice
6. The FEATURES.md file (full audit of all 88 flags) is the real treasure here — reveals Anthropic's full product roadmap even without running the code
7. If Anthropic DMCA's the GitHub repo, the IPFS mirror survives — pin the CID if you want permanent access

## Connections

- Directly extends the March bookmark batch research: `ai-claude-leak/01-claude-code-leak-announcement.md` — this is the working code derived from that leak
- The ULTRAPLAN/ULTRATHINK mode connects to `ai-claude-leak/03-claude-code-what-to-prepare.md` — KAIROS daemon and COORDINATOR_MODE are likely in the 88 flags
- The context compression PR (#7) directly addresses the FILE READ BUDGET and CONTEXT DECAY issues documented in `ai-claude-leak/04-claude-code-employee-grade-overrides.md`
- The multi-provider support (OpenAI, Bedrock, Vertex) connects to the "harness is the product" insight from `ai-claude-leak/02-claude-code-harness-is-product.md` — the harness is now officially model-agnostic
- paoloanzn's fork connects to the NanoClaw architecture question: if Claude Code's MCP integration is exposed here, it may reveal patterns useful for OpenClaw/NanoClaw design
