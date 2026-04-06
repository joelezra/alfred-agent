# Claude Code Hidden Features — iamfakeguru Analysis

## Source
- Tweet: @Motion_Viz — March 31, 2026
- Tweet ID: 2039013516288655423
- Quoted tweet: @iamfakeguru (original thread/analysis)
- GitHub: https://github.com/iamfakeguru/claude-md

## What It's About (TL;DR)

Following the March 31, 2026 source code leak, reverse-engineer @iamfakeguru published a thread and GitHub repo documenting 7 structural limitations they found in Claude Code's source — including an employee-only feature gate that gives Anthropic staff capabilities external users never see, a context compaction system that silently destroys working memory, hard-coded file read limits, and tool result truncation. They also released a CLAUDE.md override config claiming to reproduce "employee-grade configuration Anthropic didn't ship to you."

## Key Claims / Insights

1. *Employee-only verification gate* — `USER_TYPE === 'ant'` check gates post-edit type checking and other verification loops for Anthropic employees. External users don't get these. The 29–30% false claims rate (vs Claude 4's 16.7%) is documented internally in comments referencing "Capybara v8."
2. *Context death spiral* — autoCompact fires at ~167K tokens (confirmed by Substack/reverse-engineering analysis: ~50% context window capacity). Keeps 5 files at 5K each, compresses everything else into a 50K summary. Mid-refactor compaction silently destroys working memory.
3. *Brevity mandate* — system prompts include "try simplest approach first" which overrides user intent when users want thoroughness
4. *Agent swarm hidden* — sub-agents run in isolated AsyncLocalStorage contexts; no MAX_WORKERS limit exposed to users (confirmed by source: parallel Explore subagents with no documented cap)
5. *2,000-line blind spot* — file reads hard-capped at 2,000 lines / 25K tokens, silently truncated (no error, no warning)
6. *Tool result blindness* — results over 50K chars truncated to a 2K preview (some sources say 2,000-byte preview)
7. *grep not AST* — raw text matching used for code search; misses dynamic imports, re-exports, and other non-literal patterns
8. A CLAUDE.md override config is provided at the repo to address all of these

## Deep Dive Research

### Finding 1: Employee-Only Gate (USER_TYPE === 'ant')

The leaked source confirms different behavior for Anthropic employees. The "Undercover Mode" feature (for Anthropic staff contributing to public OSS) is one manifestation — but there are also internal gates around:
- Post-edit type checking and linting verification loops
- Access to unreleased model variants (Capybara, Fennec, Numbat)
- The KAIROS/PROACTIVE/COORDINATOR feature flags are enabled for employees in internal builds

The 29–30% false claims rate documented internally refers to Capybara v8 (Claude 4.6) having a higher tendency to hallucinate compared to Claude 4 (v4: 16.7%). This appears in comments in the source code alongside an "assertiveness counterweight" mechanism and notes about "over-commenting code."

*Independent verification*: The DEV.to reverse engineering article (kolkov) confirmed zero tests in the production codebase and the existence of the feature flag system. The sathwick.xyz reverse engineering piece confirmed the permission modes differ based on user classification.

### Finding 2: Context Death Spiral — autoCompact

The leaked architecture (confirmed via sathwick.xyz and vrungta.substack.com) shows multiple compaction strategies:
- *Auto-compaction*: activates at ~50% context window usage (approximately 100–167K tokens for current Claude models)
- *Microcompaction*: removes time-expired tool results
- *Snip compaction*: truncates history while preserving context
- *Context collapse*: stages lazy commits before hitting API 413 errors

The LMCache analysis estimated 250,000 API calls wasted daily due to uncontrolled autocompaction failures. The iamfakeguru CLAUDE.md override includes explicit instructions to prevent compaction mid-task and to checkpoint working state before context resets.

*What actually survives compaction*: The system preserves 5 most-recently-accessed files at 5K tokens each, then compresses all remaining conversation history into a 50K summary using a separate Sonnet call. The summary is lossy — it preserves decisions but not reasoning chains.

### Finding 3: Brevity Mandate

The system prompt includes instructions prioritizing the "simplest approach." This is a deliberate design choice for safety and predictability, but it creates a mismatch when users want exhaustive analysis or full refactors. The iamfakeguru CLAUDE.md override explicitly includes a "senior developer override" instruction that countermands this.

### Finding 4: Agent Swarm Architecture

The source confirms that sub-agents run in isolated AsyncLocalStorage contexts — meaning each subagent has its own Node.js async context chain, completely invisible to the main agent's execution context. There is no documented MAX_WORKERS limit in the code (or it is not enforced via a simple cap).

The three built-in subagent types:
1. Explore (Haiku, read-only, fast, typically 3 run in parallel)
2. Plan (read-only, receives only summaries from Explore)
3. General-purpose (implements changes, has write access)

The Agent Teams feature (experimental in the leak) extends this to peer-level coordination — separate Claude Code processes communicating via shared task lists and message passing.

### Finding 5: 2,000-Line File Read Hard Cap

Confirmed in multiple analyses. The `read_file` tool truncates at 2,000 lines or 25K tokens without any warning to the user or model. For large files (common in mature codebases), this means Claude never sees the second half. The DEV.to analysis noted this as a structural limitation causing subtle bugs in long-file refactors.

*Workaround*: The iamfakeguru CLAUDE.md override instructs Claude to use offset-based reads for large files and to always check file length before reading.

### Finding 6: Tool Result Blindness — 50K Truncation

The source reveals that tool results over 50K characters are truncated to approximately 2,000–2,048 characters (a preview). This affects bash command outputs (large test runs, build logs), grep results in large codebases, and file contents from large files. The model receives a truncated stub and does not know the full result exists.

*Workaround*: Pipe large outputs to files and read them in chunks, or use the `--output` flag for bash commands to write to disk.

### Finding 7: grep Not AST

The `grep` tool in Claude Code uses raw regex/text matching rather than AST-aware code search. This means:
- Dynamic imports (`require(someVar)`) are not found by name
- Re-exports (`export { foo } from './bar'`) may not be traced
- Decorator-based usage may be missed
- TypeScript type aliases and generics can fool pattern matching

The leaked codebase does include LSP integration (language server protocol), but it is not used as the primary search mechanism — grep is.

*Workaround*: The iamfakeguru CLAUDE.md instructs Claude to use `ts-morph` or LSP queries for dependency tracing rather than grep.

### The CLAUDE.md Override Config

The `iamfakeguru/claude-md` GitHub repo provides a production CLAUDE.md file addressing all 7 limitations. Key elements (from the README):

- Forces verification loops: after every file edit, run type check + tests before reporting success
- Phased execution: explicit plan → checkpoint → implement → verify phases
- Senior developer override: countermands brevity mandate with explicit "be thorough" instruction
- Sub-agent swarming directives: explicit instructions for when to delegate to parallel subagents
- Autonomous bug fixing: loop until tests pass, not until one fix is attempted
- Session continuity: write checkpoint files before context might compact
- Per-filetype rules in `.claude/rules/*.md` with YAML frontmatter
- Hooks in `~/.claude/settings.json` for post-tool-use automation (formatting, blocking dangerous commands)

Installation: `curl -o CLAUDE.md https://raw.githubusercontent.com/iamfakeguru/claude-md/main/CLAUDE.md`

Works natively with Claude Code, and also with Cursor (via `.cursorrules`).

### Community Reaction and Independent Verification

The DEV.to article (kolkov) documented independent reverse engineering of 12 versions of Claude Code (August 2025 – March 2026) before the leak, confirming:
- 16.3% failure rate across 3,539 API requests (every 6th request fails)
- The attestation bug (cch=00000) corrupting prompts when users discuss certain topics
- Silent model downgrade from Opus to Sonnet after 3 consecutive 529 errors
- The watchdog bug: "protects the SSE event loop but not the initial connection phase"

The sathwick.xyz reverse engineering post confirmed the 6-layer memory system, TAOR loop architecture, and the compaction strategies.

The Hacker News thread (item 44214926) had commenters confirming privilege escalation through tool chaining and token waste in Claude Code vs. competitors.

### Assessment: Which Overrides Are Actually Useful

*High value*:
- Verification loops (finding 1 workaround) — Claude often reports "done" without checking if types/tests pass
- Phased execution and checkpointing (finding 2 workaround) — critical for long refactors
- Offset-based file reads for large files (finding 5 workaround) — prevents silent truncation bugs

*Medium value*:
- Senior developer override (finding 3) — helps with thoroughness but may increase token spend
- Tool result piping to files (finding 6) — necessary for large outputs but adds friction

*Lower value / situational*:
- Sub-agent swarming directives — Claude Code already does this reasonably well; explicit instructions add noise
- grep vs AST instructions — useful for TypeScript-heavy codebases; overkill for simple projects

## Key Links Found

- https://github.com/iamfakeguru/claude-md — the CLAUDE.md override config repo
- https://dev.to/kolkov/we-reverse-engineered-12-versions-of-claude-code-then-it-leaked-its-own-source-code-pij — pre-leak reverse engineering analysis (12 versions)
- https://sathwick.xyz/blog/claude-code.html — deep technical reverse engineering of architecture
- https://vrungta.substack.com/p/claude-code-architecture-reverse — 6 architectural shift analysis
- https://blog.lmcache.ai/en/2025/12/23/context-engineering-reuse-pattern-under-the-hood-of-claude-code/ — LMCache analysis (250K wasted API calls from compaction failures)
- https://news.ycombinator.com/item?id=44214926 — HN reverse engineering discussion
- https://alex000kim.com/posts/2026-03-31-claude-code-source-leak/ — fake tools, frustration regexes, undercover mode analysis
- https://www.blog.brightcoding.dev/2025/07/17/inside-claude-code-a-deep-dive-reverse-engineering-report/ — pre-leak deep dive report
- https://gist.github.com/cole-christensen/cb9119e2f6b0f29b56872798e8ebb840 — reverse engineering CLAUDE.md / AGENTS.md gist

## Actionable Takeaways

1. *Download and customize the iamfakeguru CLAUDE.md* — it addresses real structural limitations with practical overrides. Review each directive against your project's needs.
2. *Add verification loops to your workflow* — always ask Claude to run tests/types after edits, never trust a "done" without a passing test suite
3. *Checkpoint before long sessions* — for refactors over 50K tokens, write a checkpoint file with current state so compaction doesn't destroy progress
4. *Never assume full file reads* — for files over 500 lines, explicitly tell Claude to read in chunks with offset parameters
5. *Pipe large bash outputs to files* — any command that produces more than 50K chars of output should write to disk; Claude can't see the full output otherwise
6. *Use LSP queries for TypeScript dependency tracing* — raw grep misses dynamic imports and re-exports
7. *Understand the employee/external gap* — post-edit verification is an employee-only feature; compensate via CLAUDE.md hook configuration
8. *Watch the false claims rate* — Capybara v8 (Claude 4.6) has a 29–30% documented false claims rate; always verify AI-reported outcomes with actual test runs

## Category

AI Tools / Dev Tools / Reverse Engineering

## Type

Actionable / Reference
