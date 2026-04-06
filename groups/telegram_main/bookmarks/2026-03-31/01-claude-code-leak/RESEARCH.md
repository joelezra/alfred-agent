# Claude Code Open Source / The Harness Is the Product

## Source
- Tweet: @Av1dlive — March 31, 2026
- Tweet ID: 2038987890139799721
- Quoted tweet: Sebastian Raschka (@rasbt) — https://t.co/HH23b6VZ6O (substack note c-236083977)

## What It's About (TL;DR)

On March 31, 2026, Anthropic accidentally leaked Claude Code's entire TypeScript source via a `.map` file in the npm package. Sebastian Raschka analyzed it and concluded that Claude Code's performance advantage over a plain model web interface does not come from the model itself — it comes from the surrounding software *harness*: the way repo context is loaded, prompt cache is managed, subagents are spun up, and memory is persisted. @Av1dlive quoted this and crystallized it as: "the model is interchangeable. the harness is the product."

## Key Claims / Insights

- Live repo context is loaded and structured before you type a single character
- Aggressive prompt cache reuse: 92% prefix reuse rate across all LLM calls in a typical task execution — explored in depth via LMCache blog analysis
- File-read deduplication: file contents accessed multiple times can be cached independently of prefix boundaries (flagged as an optimization opportunity in the source)
- Structured session memory: 6-layer memory system loaded at session start — organizational policies, project rules, user preferences, local context, auto-learned patterns, and session history
- Subagent parallelism that does NOT affect main loop: subagents run isolated TAOR (Think-Act-Observe-Repeat) loops in separate context windows; the main agent only receives summaries, never raw tool outputs from subagents
- The architecture is designed to *shrink* as models improve — hard-coded scaffolding gets deleted with each model upgrade
- Conclusion from Raschka: if you dropped DeepSeek, MiniMax, or Kimi into this harness with some optimization, they'd also show strong performance over their base web UI counterparts

## Deep Dive Research

### What Is a Harness?

The term "harness" in AI tooling refers to the infrastructure layer surrounding an AI model: the tools, context loading, memory system, permission system, feedback loops, caching, and orchestration. The metaphor is deliberate — the horse (model) is powerful but directionless; the harness channels its capability.

As the industry summarized it in early 2026: "If 2025 was the year AI agents proved they could write code, 2026 is the year we learned that the agent isn't the hard part — the harness is."

### Prompt Cache Reuse — Technical Details

Claude Code's prompt caching works via *prefix matching* against Anthropic's KV cache infrastructure. The system prompt (which includes full git repo context and tool specifications) is ~20,000+ tokens. Rather than reprocessing this on every API call:

- The entire prefix (system prompt + tool definitions + CLAUDE.md) is cached
- Cache hit rate is 92–97% in execution phases
- Cache writes cost 25% more than base tokens; cache hits cost only 10% — net 81% cost reduction on a 2M token task
- Subagents use a `defer_loading` strategy for tools: lightweight stubs are sent first (keeping prefix stable), and full schemas only load when the model selects them
- Cache keys are cumulative: prefix caching is ordered as tools → system → messages; any change in the prefix invalidates everything downstream

### Subagent Parallelism That Doesn't Affect Main Loop

This is the most architecturally important point. Claude Code spins up 3 classes of subagents:

1. *Explore subagents* (run in parallel, read-only, fast/cheap model like Haiku): independently search the codebase for different things simultaneously
2. *Plan subagent* (read-only, receives only exploration summaries): acts as software architect
3. *General-purpose subagents*: isolated execution workers

Each subagent runs its own TAOR loop in a completely isolated context window. The main agent's context is *never polluted* by raw subagent tool outputs. The main loop only sees summaries. This is why subagent parallelism (even running 5-10 at once) does not slow down or degrade the main agent's reasoning.

Communication between agents uses file-based IPC with concurrent-session locking (not sockets), and task notifications use XML-formatted messages.

### Session Memory Architecture

Six memory layers are loaded at the start of every session:
1. Organizational policies (CLAUDE.md at repo root)
2. Project rules (`.claude/rules/*.md`)
3. User preferences (~/.claude/settings.json)
4. Local context (recent file edits, git state)
5. Auto-learned patterns (derived from previous sessions)
6. Session history (last session's summary)

This prevents the agent from "starting from zero" every time. The memory system uses persistent markdown files with YAML frontmatter, with a Sonnet-powered relevance selector deciding what to load.

### The GitHub Repos

Several open-source implementations spawned from the leak:

- `shareAI-lab/learn-claude-code` — teaches harness engineering from scratch, 12 progressive sessions building s01 (agent loop) to s12 (team isolation)
- `instructkr/claw-code` — "Better Harness Tools" Rust port, reached 50K stars in 2 hours
- Multiple Python clean-room rewrites appeared before sunrise on March 31

### Harness Engineering as a Discipline

The NxCode guide formalizes harness engineering around 3 pillars:
1. *Context Engineering* — static (CLAUDE.md, specs) + dynamic (observability, git state) — "anything the agent can't access in-context doesn't exist"
2. *Architectural Constraints* — deterministic linters, LLM-based auditors, structural tests
3. *Entropy Management* — scheduled garbage-collection agents that verify documentation accuracy

LangChain improved their coding agent from 52.8% to 66.5% accuracy "by only changing the harness, not the underlying model."

## Key Links Found

- https://sebastianraschka.com/blog/2026/claude-code-secret-sauce.html (blog post — 404 at time of research, likely DMCA'd)
- https://substack.com/@rasbt/note/c-236083977 — Raschka's Substack note
- https://blog.lmcache.ai/en/2025/12/23/context-engineering-reuse-pattern-under-the-hood-of-claude-code/ — LMCache deep dive on 92% prefix reuse rate
- https://vrungta.substack.com/p/claude-code-architecture-reverse — full architectural reverse-engineering analysis
- https://github.com/shareAI-lab/learn-claude-code — open-source harness engineering curriculum
- https://github.com/instructkr/claw-code — Rust harness reimplementation
- https://www.nxcode.io/resources/news/harness-engineering-complete-guide-ai-agent-codex-2026 — harness engineering complete guide
- https://platform.claude.com/docs/en/build-with-claude/prompt-caching — official Anthropic prompt caching docs
- https://www.claudecodecamp.com/p/how-prompt-caching-actually-works-in-claude-code — "The Hidden System That Makes Claude Code 80% Cheaper"

## Actionable Takeaways

1. *Build a proper CLAUDE.md* — this is Layer 1 of the 6-layer memory system. Invest in it. It's cached at the top of every session's prefix.
2. *Structure your project for the harness, not just for humans* — clear directory trees, per-filetype rules in `.claude/rules/*.md`, explicit architectural docs
3. *The model choice matters less than you think* — swapping Sonnet for another frontier model in a well-built harness may yield comparable results
4. *Use subagents deliberately* — for parallel research tasks, isolated subagents prevent context pollution in your main loop
5. *Understand prompt cache economics* — place static content (tools, system prompt, docs) at the beginning; never change the prefix unnecessarily
6. *Learn from `learn-claude-code`* — the 12-session curriculum is a practical guide to building your own harness from first principles

## Category

AI Tools / Dev Tools / Software Architecture

## Type

Reference / Actionable
