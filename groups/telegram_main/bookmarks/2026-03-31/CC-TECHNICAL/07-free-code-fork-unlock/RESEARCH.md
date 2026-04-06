# free-code Fork — Detelemetrized Claude Code with 54 Unlocked Features

**Source:** https://x.com/paoloanzn/status/2039022430661063060
**Author:** @paoloanzn (also known as 4nzn) — identity pseudonymous; developer who compiled and published the fork
**Bookmarked:** 2026-03-31
**Category:** AI / Claude Code Technical
**Type:** Reference (with legal caveats)
**Engagement:** 4,800 GitHub stars, 1,300 forks on paoloanzn/free-code; IPFS mirror; related "claw-code" rewrite reached 84,000+ stars before DMCA

---

## TL;DR

Following Anthropic's accidental March 31, 2026 exposure of Claude Code's full source code via a forgotten .map file in the npm package, @paoloanzn published free-code — a recompiled fork with all telemetry removed, security guardrails stripped, and all 54 working experimental features enabled. The most significant unlocked feature is ULTRAPLAN (multi-agent planning sessions lasting 10–30 minutes). Anthropic filed DMCA takedowns removing thousands of repos, accidentally hitting 8,100 legitimate repos. The IPFS mirror raises unresolved legal questions about decentralized hosting. The fork is legally risky to use commercially.

## Key Claims

- 88 total feature flags found; 54 bundle cleanly; 34 remain broken
- ULTRAPLAN: enables `/ultraplan` command — 10–30 minute multi-agent planning sessions, runs on Anthropic's server-side infrastructure
- Telemetry removed: OpenTelemetry/gRPC, GrowthBook analytics, Sentry, custom event logging — all stripped
- Security guardrails stripped: the protective prompts that constrain Claude Code's behavior
- IPFS upload: uploaded to IPFS for permanence (decentralized, likely DMCA-resistant)
- 4,800 GitHub stars, 1,300 forks on the main repo
- Anthropic's DMCA sweep hit 8,100 repos, including 8,100+ legitimate public forks
- The broader "claw-code" clean rewrite reached 84,000+ stars before DMCA enforcement
- Anthropic's 90% AI-generated code claim may undermine their copyright position

## Deep Dive

### The Source Code Leak

On March 30, 2026, Anthropic published Claude Code v2.1.88 to npm. The package accidentally included a 59.8 MB source map file — a debugging artifact that maps minified production code back to original TypeScript source. This file was not excluded from `.npmignore` or the `files` field in `package.json`.

Security researcher Chaofan Shou (@Fried_rice) discovered the source map on March 31, 2026, and published it publicly. The file contained:
- 513,000 lines of unobfuscated TypeScript
- 1,906 original source files
- The complete client-side agent harness
- All feature flag definitions
- System prompt strings (later cataloged by Piebald-AI)

Anthropic's statement: "This was a release packaging issue caused by human error."

### What free-code Is

free-code is a clean, buildable fork of Claude Code that:
1. Takes the leaked source as the base
2. Removes all outbound telemetry
3. Strips security guardrail prompts
4. Enables all 54 working experimental feature flags

It is distinct from "claw-code" (a clean-slate rewrite that avoids the copyright problem by not directly using the leaked source).

### The 54 Unlocked Features: Full Audit

**Highest impact features:**

**ULTRAPLAN** (most significant)
- Enables `/ultraplan` command and prompt triggers
- Spawns parallel subagents for multi-aspect exploration (architecture, file mapping, risk assessment)
- Synthesizes findings into a detailed implementation plan
- Spawns a critique agent to review the plan for gaps and risks
- Options: approve (implement immediately + open PR), or teleport plan locally via `__ULTRAPLAN_TELEPORT_LOCAL__` sentinel
- Sessions run 10–30 minutes on Anthropic's server-side Cloud Container Runtime (CCR)
- Contains secrecy clause: Claude is instructed not to reveal how it works
- See full system prompt in Piebald-AI/claude-code-system-prompts

**BRIDGE_MODE**
- Enables Remote Control / REPL bridge command and entitlement paths
- Allows external process to control a Claude Code instance remotely
- Use cases: IDE integrations, automated testing pipelines, CI/CD control

**AGENT_MEMORY_SNAPSHOT**
- Stores custom-agent memory snapshot state in the app
- Persistent memory across agent invocations beyond standard session context

**AGENT_TRIGGERS**
- Local cron/trigger tools with bundled trigger-related skills
- Enables time-based and event-based agent activation without external orchestration
- AGENT_TRIGGERS_REMOTE: enables remote trigger path (external trigger sources)

**EXTRACT_MEMORIES**
- Post-query memory extraction hooks
- After each query, Claude extracts and stores relevant information automatically
- Foundation for session-crossing memory without explicit user management

**TEAMMEM**
- Team-memory files: shared memory accessible to all agents on a team
- Watcher hooks for team-memory updates
- Related UI messages for team memory events

**ULTRATHINK**
- Extra thinking-depth mode toggle
- Beyond standard extended thinking

**VOICE_MODE**
- Voice toggling and dictation keybindings
- Voice notices and voice UI
- Requires OAuth + local recording backend

**CHICAGO_MCP**
- Computer-use integration
- Runtime-caveated (requires external `@ant/computer-use-*` packages)

**CCR variants (Cloud Container Runtime):**
- CCR_AUTO_CONNECT: automatic cloud connection
- CCR_MIRROR: cloud state mirroring
- CCR_REMOTE_SETUP: remote environment setup

**TOKEN_BUDGET**
- Tracking and warning interface for token usage
- Visible budget against context window limits

**HISTORY_PICKER**
- Interactive prompt history navigation
- Browse and reuse previous prompts

**CACHED_MICROCOMPACT**
- Query/API flow caching
- Performance optimization for repeated similar requests

**TREE_SITTER_BASH**
- Parser backend with shadow rollout path
- Better bash syntax understanding for more precise edits

### The 34 Broken Flags

34 feature flags compile but cannot function because they require external dependencies not included:
- OAuth gating (for voice mode, remote features)
- GrowthBook entitlements (A/B testing / feature rollout infrastructure)
- Optional native modules (SoX for audio, image-processor-napi)
- Externalized packages (`@ant/computer-use-*`)
- Server-side infrastructure (CCR, the cloud container runtime that powers ULTRAPLAN)

The FEATURES.md in the repo contains reconstruction notes for each broken flag — what would be needed to make them functional.

### Build Variants

`bun run build`: Standard binary (external distribution)
`bun run build:dev:full`: Development build with all experimental features enabled (minus CHICAGO_MCP, which requires `@ant/computer-use-*`)

### Telemetry Removal Details

Upstream Claude Code phones home through:
- OpenTelemetry/gRPC endpoints
- GrowthBook analytics (A/B testing)
- Sentry error reporting
- Custom event logging

free-code:
- Dead-code-eliminates or stubs all outbound telemetry endpoints
- GrowthBook feature flag evaluation still works locally (needed for runtime feature gates)
- GrowthBook does NOT report back to Anthropic

### IPFS and Permanence

@paoloanzn uploaded free-code to IPFS before the GitHub DMCA activity. IPFS is content-addressed and decentralized — there is no single host to send a DMCA notice to.

Whether DMCA can reach IPFS content is an unresolved legal question:
- DMCA takedowns work against centralized platforms (GitHub complies)
- IPFS has no single point of failure or central authority
- Practically, the content is likely permanently accessible via IPFS hash
- gitlawb.com (z6MkgKkb/paoloanzn-free-code) mirrors the repo via decentralized hosting

### Anthropic's DMCA Response

Anthropic filed DMCA notices on March 31, 2026. GitHub's automated process:
- Removed the original leaked repo (nirholas/claude-code) and its fork network
- Accidentally also took down 8,100+ legitimate repos — including forks of Anthropic's own public Claude Code repo
- Developer Danila Poyarkov received a takedown for forking the public repo
- Developer Daniel San received a takedown for a fork containing only skills, examples, and docs

Anthropic engineer Boris Cherny acknowledged the overreach: "This was not intentional, we've been working with GitHub to fix it. Should be better now."

### The Copyright Question

Anthropic's copyright position may be weaker than it appears:
- Anthropic publicly stated Claude Code is approximately 90% AI-generated (reported by VentureBeat)
- The DC Circuit's March 2025 ruling in Thaler v. Perlmutter: works generated solely by AI cannot receive copyright protection
- If courts determine Claude Code lacks sufficient human authorship, Anthropic's copyright claims over those portions collapse
- This is an active legal question, not settled law

### Installation of free-code

```bash
curl -fsSL https://raw.githubusercontent.com/paoloanzn/free-code/main/install.sh | bash
```

The install script: checks system, installs Bun if needed, clones the repo, builds with all experimental features, symlinks `free-code` to PATH.

Run `free-code` and use `/login` to authenticate with any model provider.

### Forks and Variants

- mygu/claude-code-source: another fork of the same leaked source
- DonutShinobu/claude-code-fork: preserves original code structure with attribution to Anthropic
- claw-code (clean rewrite): 84,000+ stars, not a direct fork of leaked source — clean-room reimplementation

## Key Links

- Primary repo: https://github.com/paoloanzn/free-code
- FEATURES.md: https://github.com/paoloanzn/free-code/blob/main/FEATURES.md
- Announcement tweet: https://x.com/paoloanzn/status/2039022418698907949
- gitlawb mirror: https://gitlawb.com/node/repos/z6MkgKkb/paoloanzn-free-code
- CyberNews coverage: https://cybernews.com/tech/claude-code-leak-spawns-fastest-github-repo/
- DMCA record: https://github.com/github/dmca/blob/master/2026/03/2026-03-31-anthropic.md
- TechCrunch DMCA overreach: https://techcrunch.com/2026/04/01/anthropic-took-down-thousands-of-github-repos-trying-to-yank-its-leaked-source-code-a-move-the-company-says-was-an-accident/
- Decrypt: https://decrypt.co/362917/anthropic-accidentally-leaked-claude-code-source-internet-keeping-forever
- Piunika DMCA enforcement: https://piunikaweb.com/2026/04/01/anthropic-dmca-claude-code-leak-github/
- Zscaler security analysis: https://www.zscaler.com/blogs/security-research/anthropic-claude-code-leak
- Engineers Codex deep dive: https://read.engineerscodex.com/p/diving-into-claude-codes-source-code

## Actionable Takeaways

1. **Do NOT use free-code in production or commercially** — it is built on leaked proprietary source code. The legal risk is real, and Anthropic has demonstrated willingness to file DMCA notices.
2. **Read the FEATURES.md** (not the repo code) — the audit of all 88 feature flags is valuable intelligence about Claude Code's roadmap. Understanding what's coming helps you prepare.
3. **ULTRAPLAN is the feature to watch** — 10–30 minute multi-agent planning sessions on Anthropic's server-side infrastructure will be transformative when it ships publicly. Prepare workflows that can leverage long planning sessions.
4. **BRIDGE_MODE + AGENT_TRIGGERS together** are the foundation of autonomous agent pipelines — watch for Anthropic to ship these as the building blocks of their production multi-agent story.
5. **If you need the features now**, use the Piebald-AI tweakcc approach (modifying system prompts in your local installation) rather than running a fork of leaked code.
6. **Monitor claw-code** (the clean rewrite) instead of free-code — legally cleaner, likely to be more actively maintained.

## Connections

- ULTRAPLAN feature connects directly to `09-claude-code-ultraplan` which has the full system prompt detail
- The source leak is referenced throughout `/workspace/group/bookmarks/2026-03-31/` — especially `06-claude-code-leak-details`
- The AGENT_TRIGGERS feature is what Paperclip (`04-paperclip-zero-human-company`) provides externally as heartbeat scheduling — when it ships natively in Claude Code, Paperclip's trigger model becomes redundant
- TEAMMEM is the native version of what the Knowledge Ledger system in `02-claude-memory-architecture` does manually
- EXTRACT_MEMORIES is what Hermes Agent does automatically (from `/workspace/group/bookmarks/2026-03-31/14-self-improving-agents/RESEARCH.md`)
