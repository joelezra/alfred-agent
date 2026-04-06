# Claude Code Leak — Repos to Fork Right Now
*Researched: 2026-04-01*

---

## Fork These Now (Priority Order)

1. **github.com/paoloanzn/free-code** — ~3,000 stars | The definitive de-telemetrized build. 54 working experimental features unlocked, guardrails stripped. Actively maintained. LIVE on GitHub as of 2026-04-01. Also mirrored on Gitlawb (permanent). Fork this if you want a working, installable binary with unlocked features.

2. **github.com/instructkr/claw-code** — ~106,000 stars | The clean-room Python+Rust rewrite. Not a source mirror so legally cleaner. Fastest repo in GitHub history to 50K stars (2 hours). LIVE on GitHub. Fork this for the architecture study and to contribute to the ongoing rewrite.

3. **github.com/Kuberwastaken/claurst** — ~5,800 stars | Dedicated Rust rewrite ("claurst"), separate from the above. Clean-room, educational breakdown of BUDDY, KAIROS, and other hidden systems. LIVE on GitHub. Fork this for the Rust port specifically.

4. **github.com/chauncygu/collection-claude-code-source-code** — ~489 stars | Curated collection: includes a decompiled v2.1.88 archive (163K lines of TypeScript) plus a Python rewrite reference. Still LIVE as of 2026-04-01. Fork before it gets swept by DMCA.

5. **github.com/leaked-claude-code/leaked-claude-code** — ~396 stars | Direct source mirror, framed as "security research." LIVE as of 2026-04-01 but could go down at any time. 12 commits. Fork immediately if you want the raw source archive.

---

## The Original Leak

**What happened:** On March 31, 2026 at ~04:23 UTC, Chaofan Shou (@Fried_rice) discovered that Anthropic's npm package `@anthropic-ai/claude-code@2.1.88` shipped a 59.8 MB `.map` source map file. That file contained a reference to the full, unobfuscated TypeScript source — a zip archive sitting on Anthropic's Cloudflare R2 storage bucket. Anyone who found the reference could download and decompress the entire codebase: 512,000 lines across 1,906 TypeScript files.

Anthropic engineer Boris Cherny confirmed: "Our deploy process has a few manual steps, and we didn't do one of the steps correctly." An official spokesperson added that no customer data or credentials were exposed.

**The @nichxbt connection:** The GitHub account `nirholas` (contact: nichxbt) was the primary early uploader. The repo `github.com/nirholas/claude-code` was the first large mirror. It has since been **DMCA'd — returns HTTP 451** (confirmed). The original uploader repurposed the repo to host a Python feature port after concluding he could face legal liability for hosting Anthropic's IP directly.

**@baanditeagle:** Despite being named in the user's research prompt, no evidence of this specific GitHub account or mirror was found in any indexed source, DMCA notice, or news coverage. The GitHub DMCA file at `github.com/github/dmca/blob/master/2026/03/2026-03-31-anthropic.md` lists 100+ specifically-named repos but does not mention baanditeagle. This account either: (a) never existed under that name, (b) was already taken down before indexing, or (c) the name is slightly different. Cannot be verified — do not rely on it.

**Scale of takedowns:** Anthropic filed DMCA notices targeting the `nirholas/claude-code` fork network. GitHub processed the takedown against the entire network of 8,100+ repositories simultaneously. Some clean repos (e.g., `mbailey/claude-code-fork`, a fork of Anthropic's own official repo) were incorrectly swept up in the mass takedown.

**What's still live:** Direct source mirrors that are still standing are in a race against DMCA. Clean-room rewrites (claw-code, claurst) are not affected by the DMCA campaign since they do not contain Anthropic's proprietary TypeScript. The Gitlawb decentralized mirror has a public "Will never be taken down" message and is accessible at the address below.

---

## Python Rewrites

### instructkr/claw-code
- **URL:** https://github.com/instructkr/claw-code
- **Stars:** ~106,000 (reached 50K in 2 hours — fastest in GitHub history)
- **Forks:** ~95,600
- **Language:** Rust 92.8%, Python 7.2% (reoriented toward Rust after initial Python foundation)
- **Author:** Sigrid Jin (@instructkr), Korean developer; built end-to-end using oh-my-codex (OmX) AI orchestration
- **Completeness:** Partial but growing. Python foundation covers CLI entry, query engine, session management, tool execution, permission context, session persistence. Includes a "Parity Audit" file that honestly tracks what has not yet been ported from the TypeScript original. Self-described as "not yet a complete one-to-one replacement."
- **Working features:** Multi-agent orchestration, 19 built-in tools, provider-agnostic LLM client (supports Claude, OpenAI, local models), session persistence, autonomous file/command/test workflows.
- **Activity:** Highly active. Last commit March 31, 2026. README states "a much more capable version is on the way." Rust port on `dev/rust` branch.
- **Legal status:** Clean-room rewrite — does not contain Anthropic's TypeScript. LIVE, not DMCA-vulnerable.

### chiragjoshi12/claude-code
- **URL:** https://github.com/chiragjoshi12/claude-code
- **Description:** Independent Python feature port, "entirely rewriting from scratch using oh-my-codex. Educational Purpose only."
- **Stars/forks:** Not independently verified; appeared in search results alongside claw-code
- **Completeness:** Unknown; likely early-stage given how recently it appeared
- **Status:** LIVE as of 2026-04-01 (clean-room, not a source mirror)

---

## Rust Rewrites

### Kuberwastaken/claurst
- **URL:** https://github.com/Kuberwastaken/claurst
- **Also at:** https://github.com/Kuberwastaken/claude-code (same author, earlier version)
- **Stars:** ~5,800
- **Forks:** ~6,400
- **Language:** Rust
- **Completeness:** Early/incomplete clean-room implementation. Reproduces behavior, not source expression. Structured as multiple crates under `src-rust/`. Includes `buddy/` crate reimplementing the gacha companion system found in the leak.
- **Standout value:** Best written breakdown of BUDDY, KAIROS, autoDream, and other hidden systems found in the leaked source. Doubles as technical documentation.
- **Legal basis:** Clean-room engineering (Phoenix Technologies v. IBM precedent). Does not contain Anthropic's TypeScript. LIVE.
- **Activity:** Moderate. 6 open issues, 2 open PRs as of 2026-04-01. Originated March 31, 2026.

### claw-code Rust branch
- **URL:** https://github.com/instructkr/claw-code (branch: dev/rust)
- The claw-code project is itself pivoting to Rust as its "definitive version." The Rust port is in-progress and not yet stable. The main claw-code repo is the best place to track this.

---

## free-code (paoloanzn)

- **URL:** https://github.com/paoloanzn/free-code
- **Gitlawb mirror:** gitlawb.com/node/repos/z6MkgKkb/paoloanzn-free-code (permanent, clone via `git clone gitlawb://did:key:z6MkgKkb.../paoloanzn-free-code`)
- **Stars:** ~3,000
- **Forks:** ~1,100
- **Open PRs:** 5
- **Total commits:** 47
- **Last commit:** March 31, 2026
- **Author:** @paoloanzn (also known as 4nzn on X)
- **Install:** `curl -fsSL https://raw.githubusercontent.com/paoloanzn/free-code/main/install.sh | bash`

### What it does:
This is a rebuilt/recompiled version of Claude Code's TypeScript source, NOT a clean-room rewrite. It applies three changes to the leaked source:

1. **Telemetry stripped:** OpenTelemetry/gRPC, GrowthBook analytics, Sentry, and custom event logging are all dead-code-eliminated or stubbed. No crash reports, no usage analytics, no session fingerprinting.
2. **Security/guardrail prompts removed:** Injected safety prompts stripped from the system prompt layer.
3. **Experimental features unlocked:** Compile-time feature flags enabled via `bun run build:dev:full`.

### Features unlocked (54 working):
- Interaction/UI: Deep thinking mode, voice input, token budgeting, history navigation, message actions, search, performance metrics
- Agents/memory: Built-in agent presets, verification systems, local automation triggers, memory extraction, context optimization, team collaboration files
- Tools/infrastructure: IDE bridge functionality (BRIDGE_MODE), permission classification, cache detection
- ULTRAPLAN: Async agentic planning — offloads complex planning to a remote Cloud Container Runtime session running Opus 4.6, gives it up to 30 minutes, polls every 3 seconds, approve from browser
- VOICE_MODE: `/voice` command, push-to-talk
- COORDINATOR_MODE: Transforms Claude Code into a coordinator that spawns and manages multiple worker agents in parallel (`CLAUDE_CODE_COORDINATOR_MODE=1`)
- KAIROS / PROACTIVE: Always-on background daemon mode

### Features broken (34 non-compiling):
34 flags from the original 88 do not compile cleanly. Per FEATURES.md: "many are close to compiling and just need a small wrapper or missing asset." Contributions invited.

### Maintenance status:
Modest but active — 47 commits, 5 open PRs. The repo is the upstream that `mygu/claude-code-source` forked from. Not intensively maintained but functional as of 2026-04-01.

### Legal status:
This IS built on Anthropic's proprietary TypeScript (unlike the clean-room rewrites). It is on GitHub as of 2026-04-01 but is DMCA-vulnerable. The Gitlawb mirror is the permanent copy. An IPFS backup also exists (see below).

---

## Other Notable Forks

### leaked-claude-code/leaked-claude-code
- **URL:** https://github.com/leaked-claude-code/leaked-claude-code
- **Stars:** ~396 | **Forks:** ~597 | **Commits:** 12
- Direct source mirror, framed as "Security Research." LIVE as of 2026-04-01. Basic, no feature unlocking, no rewriting — just the raw source with a disclaimer. High DMCA risk. Fork immediately if you want this.

### chauncygu/collection-claude-code-source-code
- **URL:** https://github.com/chauncygu/collection-claude-code-source-code
- **Stars:** ~489 | **Forks:** ~768
- Curated collection: contains the decompiled v2.1.88 TypeScript archive (~163K lines, 1,884 files) plus the claw-code Python rewrite as a subproject. Good for having both in one place. LIVE as of 2026-04-01. Contains a README-CN.md (Chinese), indicating broad international attention.

### mygu/claude-code-source
- **URL:** https://github.com/mygu/claude-code-source
- Fork of paoloanzn/free-code. Stars: 0, Forks: 0. Includes an IPFS backup CID in the README: `bafybeiegvef3dt24n2znnnmzcud2vxat7y7rl5ikz7y7yoglxappim54bm`. Useful primarily as a confirmation of the IPFS archive CID.

### Kuberwastaken/claude-code
- **URL:** https://github.com/Kuberwastaken/claude-code
- Same author as claurst. Earlier version — contains the `src-rust/` Rust crates alongside technical analysis. LIVE. Superseded by the dedicated claurst repo but still useful for the commit history.

### Ringmast4r/AAYUSH412-Claude-Code-Source-Code-Analysis
- **URL:** https://github.com/ringmast4r/AAYUSH412-Claude-Code-Source-Code-Analysis
- Reverse-engineered internals analysis. Not a source mirror, not a rewrite — technical documentation of what was found. LIVE. Low DMCA risk.

---

## IPFS Archives

### free-code IPFS backup (via mygu/claude-code-source)
- **CID:** `bafybeiegvef3dt24n2znnnmzcud2vxat7y7rl5ikz7y7yoglxappim54bm`
- **Access:** `ipfs get bafybeiegvef3dt24n2znnnmzcud2vxat7y7rl5ikz7y7yoglxappim54bm` or via any IPFS gateway, e.g. `https://ipfs.io/ipfs/bafybeiegvef3dt24n2znnnmzcud2vxat7y7rl5ikz7y7yoglxappim54bm`
- **Contents:** Stripped, recompiled version of Claude Code with all telemetry removed and experimental features unlocked (the free-code build)
- **Source:** @paoloanzn (4nzn) uploaded this to IPFS explicitly anticipating DMCA takedowns. Referenced in mygu/claude-code-source README.

### Gitlawb mirror of free-code
- **URL:** https://gitlawb.com/node/repos/z6MkgKkb/paoloanzn-free-code
- **Clone:** `git clone gitlawb://did:key:z6MkgKkb.../paoloanzn-free-code`
- Gitlawb is a decentralized git platform using DIDs (Decentralized Identifiers) with IPFS-backed storage. The operator's explicit stance is "Will never be taken down." DMCA does not have jurisdiction over this infrastructure. This is the most reliable permanent link for the free-code build.

### Note on the raw source archive
No verified IPFS CID for the raw Anthropic TypeScript source archive (as opposed to the free-code build) was found in indexed sources. The original R2 bucket URL that Chaofan Shou's tweet linked to has been taken down by Anthropic. It is likely that a raw source IPFS upload exists given the scale of archiving activity, but no confirmed hash was surfaced in this research.

---

## Bottom Line

The five repos to fork today, in order: (1) **paoloanzn/free-code** — fork this immediately, it's the only tested working binary with 54 features unlocked; the Gitlawb mirror is your DMCA-proof backup and the IPFS CID `bafybeiegvef3dt24n2znnnmzcud2vxat7y7rl5ikz7y7yoglxappim54bm` is your permanent copy. (2) **instructkr/claw-code** — fork this for the architecture and to stay current with the most active community rewrite (106K stars, not DMCA-vulnerable). (3) **Kuberwastaken/claurst** — fork for the Rust port and the best technical breakdown of BUDDY/KAIROS. (4) **leaked-claude-code/leaked-claude-code** and **chauncygu/collection-claude-code-source-code** — fork both now as raw TypeScript archives before they go down; these are on borrowed time. The @nichxbt original (nirholas/claude-code) is already gone (HTTP 451). The @baanditeagle account was not findable in any indexed source and cannot be verified as real. The clean-room rewrites (claw-code, claurst) are your safe long-term bets; the source mirrors are time-sensitive.
