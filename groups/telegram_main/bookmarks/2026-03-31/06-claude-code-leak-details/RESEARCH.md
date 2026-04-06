# Claude Code Leak Details — npm Source Map Incident

## Source
- Tweet: @T3chFalcon — March 31, 2026
- Tweet ID: 2038926178153529479
- Original discovery tweet: @Fried_rice (Chaofan Shou) — posted ~4:23 AM ET March 31, 2026

## What It's About (TL;DR)

On March 31, 2026, security researcher Chaofan Shou (@Fried_rice / @shoucccc) discovered that Anthropic's Claude Code CLI version 2.1.88 on npm had shipped a 59.8 MB JavaScript source map file (`cli.js.map`) that contained the full TypeScript source code of the entire application — 1,900 files, 512,000+ lines. This was not a hack; it was a build pipeline configuration error. The `.map` file pointed to a publicly accessible ZIP archive on Anthropic's own Cloudflare R2 storage bucket. GitHub mirrors by @nichxbt and others appeared within hours, accumulating thousands of stars before Anthropic's DMCA takedowns arrived.

## Key Claims / Insights

- Package: `@anthropic-ai/claude-code` version 2.1.88 — shipped March 30/31, 2026
- The source map file `cli.js.map` was 59.8 MB and contained full `sourcesContent` (original TypeScript embedded directly)
- The URL in the map pointed to a ZIP on Anthropic's R2 storage — publicly fetchable
- Root cause: Bun runtime generates source maps by default; `.npmignore` was missing `*.map`
- This was the *third known occurrence* — previous leaks in v0.2.8 and v0.2.28 (2025) were also source maps
- Codebase: ~1,906 files, 64,464–512,000 lines (estimates vary; the 512K+ figure includes all TypeScript files in `src/`)
- Concurrent security risk: A malicious axios version (1.14.1 / 0.30.4) with a RAT was distributed via npm between 00:21–03:29 UTC on March 31
- Anthropic's ARR: ~$19B annualized revenue run-rate; Claude Code alone: ~$2.5B ARR
- GitHub mirror contact: @nichxbt; clean mirror: @baanditeagle (specific repos DMCA'd quickly)

## Deep Dive Research

### How the Leak Worked Technically

Source maps are JSON files that map minified/bundled JavaScript back to original source code. They contain a field called `sourcesContent` that can embed the literal text of the original files. When Bun compiled Claude Code for distribution:

1. Bun generated `cli.js.map` as a debug artifact
2. The map file was not excluded in `.npmignore`
3. The npm package included the 59.8 MB map file
4. `cli.js.map` contained a `sourceMappingURL` pointing to a ZIP on Anthropic's R2 bucket
5. The R2 URL used the `r2.dev` development subdomain — publicly accessible by default

Anyone who noticed the file size anomaly in the npm package could reconstruct the entire source tree. Chaofan Shou was the first to publish this publicly.

The proper fix: add `*.map` to `.npmignore`, or use a private source map upload service (Sentry's model — upload source maps to gated observability backends, not public CDN).

### What Was Inside the Leaked Codebase

*Core architecture:*
- ~40–50 modular, permission-gated tools (file operations, bash execution, web fetch, LSP integration, IDE bridge)
- Query engine: ~46,000-line module handling all LLM API calls, streaming, caching, and multi-agent orchestration
- Multi-agent coordinator capable of spawning subagent "swarms" for parallel task execution
- IDE bridge system using JWT-authenticated bidirectional WebSocket communication
- Persistent memory system using file-based storage with YAML frontmatter
- React + Ink terminal UI framework for rendering
- Built on Bun runtime (not Node.js)
- Zod v4 for comprehensive schema validation throughout
- ~50 slash commands
- 44 compile-time feature flags for unreleased features

*Notable unreleased features discovered (behind feature flags):*
- KAIROS: always-on autonomous daemon mode, watches repos, acts proactively, maintains daily logs, does "dreaming" (memory consolidation at idle)
- PROACTIVE mode: Claude works independently between user messages, receives "tick" prompts, system says "You are running autonomously" and instructs it to "look for useful work"
- COORDINATOR_MODE: transforms Claude into an orchestrator that spawns and manages parallel worker agents for research/implementation/verification phases
- TRANSCRIPT_CLASSIFIER: auto-approves tool permissions using an AI classifier
- ULTRAPLAN: 30-minute remote planning sessions
- VOICE_MODE: push-to-talk voice interface
- BUDDY: fully implemented Tamagotchi-style companion — 18 species (duck, goose, blob, cat, dragon, octopus, owl, penguin, turtle, snail, ghost, axolotl, capybara, cactus, robot, rabbit, mushroom, chonk), rarity tiers, shiny variants, 5 stats (DEBUGGING, PATIENCE, CHAOS, WISDOM, SNARK), unique per userId hash
- Undercover Mode: strips Anthropic metadata from git commits, removes model codenames (Capybara, Tengu), designed for Anthropic employees contributing to public OSS repos — notably has NO force-OFF

*Leaked model codenames:*
- Capybara: Claude 4.6 variant (29–30% false claims rate noted vs v4's 16.7%)
- Capybara-fast / Capybara-fast[1m] (1M context variant)
- Fennec: Opus 4.6
- Numbat: unreleased
- Internal code references `opus-4-7` and `sonnet-4-8` as examples of version strings that "should never appear in public commits"

*Anti-distillation mechanisms:*
- Fake tools injection: sends decoy tool definitions to poison training data when recording API calls
- Connector-text summarization: returns cryptographically-signed summaries instead of full reasoning chains
- Both can be disabled via `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS` env var — so Anthropic is aware of their fragility

*Code quality findings:*
- `src/cli/print.ts`: single 3,167-line function with 12 levels of nesting and 486 branch points of cyclomatic complexity
- 875 KB single React component for terminal rendering
- Zero tests in the leaked codebase
- 74 npm dependencies
- Nested promises without proper async handling patterns
- However: 2,500+ lines of bash command validation; extensive sandboxing; cryptographic client attestation

### Community Response and GitHub Mirrors

Within hours of Shou's tweet (which got 16 million views on the thread), the code was mirrored to dozens of GitHub repositories. Key mirrors:

- `Ahmad-progr/claude-leaked-files` — mirrored snapshot for educational/security research
- `leaked-claude-code/leaked-claude-code` — another archive
- `777genius/claude-code-source-code`
- Community members began stripping telemetry, flipping hidden feature flags, and drafting clean-room reimplementations in Python and Rust

Anthropic issued DMCA takedowns, but:
- Decentralized git platform Gitlawb received copies (resistant to centralized takedowns)
- Clean-room rewrites (Python, Rust) bypass copyright concerns
- Sigrid Jin created "claw-code" (Python clean-room) before sunrise on March 31

### Security Warning (Active Threat)

IMPORTANT: If `@anthropic-ai/claude-code` was installed via npm between 00:21–03:29 UTC on March 31, 2026, a concurrent npm supply chain attack may have delivered a malicious version of axios (1.14.1 or 0.30.4) containing a Remote Access Trojan. Check lockfiles (`package-lock.json`, `yarn.lock`, `bun.lockb`) for `axios@1.14.1`, `axios@0.30.4`, or the dependency `plain-crypto-js`. If found: treat host as fully compromised, rotate all secrets, clean OS reinstall.

### CVEs Exposed

Historical CVEs at Claude Code's trust boundaries, made more actionable by the source exposure:
- CVE-2025-59828: pre-trust execution vulnerability
- CVE-2025-58764: permission-bypass flaw
- CVE-2026-21852: startup-flow API leak

### Anthropic's Response

Official statement: "No sensitive customer data or credentials were involved or exposed. This was a release packaging issue caused by human error, not a security breach. We're rolling out measures to prevent this from happening again."

Anthropic now recommends the native installer instead of npm: `curl -fsSL https://claude.ai/install.sh | bash` — standalone binary, no `.map` files, supports background auto-updates.

## Key Links Found

- https://news.ycombinator.com/item?id=47584540 — Hacker News discussion thread
- https://dev.to/gabrielanhaia/claude-codes-entire-source-code-was-just-leaked-via-npm-source-maps-heres-whats-inside-cjo — DEV.to analysis
- https://venturebeat.com/technology/claude-codes-source-code-appears-to-have-leaked-heres-what-we-know — VentureBeat coverage
- https://decrypt.co/362917/anthropic-accidentally-leaked-claude-code-source-internet-keeping-forever — Decrypt: "The Internet Is Keeping It Forever"
- https://www.bleepingcomputer.com/news/artificial-intelligence/claude-code-source-code-accidentally-leaked-in-npm-package/ — BleepingComputer
- https://techstartups.com/2026/03/31/anthropics-claude-source-code-leak-goes-viral-again-after-full-source-hits-npm-registry-revealing-hidden-capybara-models-and-ai-pet/ — Tech Startups
- https://securityonline.info/claude-code-source-leak-npm-anthropic-source-map/ — Security Online
- https://cybernews.com/security/anthropic-claude-code-source-leak/ — Cybernews
- https://www.theregister.com/2026/03/31/anthropic_claude_code_source_code/ — The Register
- https://fortune.com/2026/03/31/anthropic-source-code-claude-code-data-leak-second-security-lapse-days-after-accidentally-revealing-mythos/ — Fortune
- https://github.com/Ahmad-progr/claude-leaked-files — archived mirror (may be DMCA'd)
- https://github.com/leaked-claude-code/leaked-claude-code — another archive
- https://github.com/Kuberwastaken/claude-code — Rust breakdown
- https://www.penligent.ai/hackinglabs/claude-code-source-map-leak-what-was-exposed-and-what-it-means — security-focused analysis
- https://winbuzzer.com/2026/03/31/claude-code-source-leaked-npm-source-map-xcxwbn/ — WinBuzzer

## Actionable Takeaways

1. *Never ship `.map` files in npm packages* — add `*.map` to `.npmignore` explicitly; run `npm pack --dry-run` before every publish
2. *Use native installers for CLI tools where possible* — `curl | bash` native installers don't have this class of vulnerability
3. *Check your npm lockfile NOW* if you installed Claude Code on March 31, 2026 between 00:21–03:29 UTC — see security warning above
4. *Understand what KAIROS/PROACTIVE/COORDINATOR modes mean for your workflow* — these features are coming; design your permission and approval workflows now before they ship
5. *The harness architecture in the leak is a blueprint* — study the 6-layer memory, tool permission system, and subagent isolation patterns for your own agent builds
6. *Anti-distillation is fragile* — one env var disables it; if you're building on top of Claude and care about protecting your prompts, the source map shows you what to watch for
7. *Source map hygiene applies to all frontend/CLI products* — this is a universal build pipeline lesson, not just Anthropic's problem

## Category

AI Tools / Dev Tools / Security / Business Intelligence

## Type

Reference / Actionable
