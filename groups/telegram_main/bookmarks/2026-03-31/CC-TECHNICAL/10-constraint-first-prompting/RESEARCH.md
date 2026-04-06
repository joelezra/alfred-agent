# Constraint-First Prompting — Rules Before Task Technique

**Source:** Multiple sources — Claude Code community documentation, Anthropic best practices, DEV.to posts
**Author:** Not formally attributed to a single author; emerged from Claude Code community practice in 2025–2026
**Bookmarked:** 2026-03-31
**Category:** AI / Claude Code Technical
**Type:** Actionable
**Engagement:** Referenced across multiple Claude Code guides; not a single viral post but a distributed best practice

---

## TL;DR

Constraint-first prompting is the technique of stating rules, boundaries, and constraints before or alongside the task description, so the model filters possible approaches through guardrails before generating any code or plans. It is not formally coined or academically attributed — it is a community-documented best practice that emerged from Claude Code usage patterns in 2025–2026. The evidence for its effectiveness comes from practitioners, not controlled studies, but the underlying logic is sound and consistent with how Claude processes instructions.

## Key Claims

- State constraints before the task: list rules, limits, environment constraints, then give the specific feature to implement
- Claude rewards users who give context, constraints, and formatting instructions before open-ended tasks
- "Contract format" system prompt: Role → Success criteria → Constraints → Uncertainty rule → Output format
- Effective constraints include: technology version, memory limits, directory scope, file exclusions, output format
- CLAUDE.md is the persistent constraint layer — applies constraints across all sessions without repeating them
- No single "coiner" identified — the technique emerged organically in the Claude Code community circa 2025
- Related academic work: DSPy Assertions (Singhvi et al., 2023) — constraint-based LLM pipeline technique

## Deep Dive

### What the Technique Is

Constraint-first prompting inverts the natural order of how most people write prompts. Typical prompt: "Build me a user authentication system using our existing database schema." Constraint-first: "Constraints: Python 3.11 only, no new dependencies, all changes within /src/auth/, rollback must be possible without data migration, tests required. Task: Build user authentication using our existing database schema."

The argument for why order matters: Claude processes the prompt as context for its response. Constraints encountered after the task description may be treated as refinements to an already-formed approach. Constraints encountered before the task description are embedded in the model's "approach filter" from the start — possible solutions are generated already constrained, rather than generated freely and then trimmed.

### The Evidence Base

No controlled studies exist for this specific technique as of April 2026. The evidence is:

1. **Anthropic's own best practices documentation** — the Claude Code docs (code.claude.com/docs/en/best-practices) state: "Be specific, not vague. Claude can infer intent, but it can't read your mind — so reference specific files, mention constraints, and point to example patterns."

2. **Practitioner reports** — widely reported in Claude Code community that specifying "do not modify any files outside the /src directory" as an explicit constraint produces more reliable containment than asking for it after the task.

3. **The "contract format" pattern** — documented by multiple practitioners as more effective than unstructured prompts. Structure: Role (1 line) → Success criteria (bullets) → Constraints (bullets) → Uncertainty handling rule → Output format specification.

4. **DEV.to post: "I Made Claude Code Think Before It Codes"** (https://dev.to/_vjk/i-made-claude-code-think-before-it-codes-heres-the-prompt-bf) — describes a pre-coding planning mandate with constraints stated before code generation, reporting significantly fewer revision cycles.

5. **DSPy Assertions (2023)** — the closest academic work: "Computational Constraints for Self-Refining Language Model Pipelines" (Singhvi et al., CoRR abs/2312.13382). This is constraint-based LLM pipeline design, not exactly constraint-first prompting, but the underlying principle is the same.

### The CLAUDE.md Layer

The most powerful application of constraint-first prompting is persistent: encoding constraints in CLAUDE.md so they apply to every session without being repeated.

Effective CLAUDE.md constraints:
- Technology stack and versions (prevents Claude from suggesting the wrong runtime)
- Directory scope rules ("never modify files outside /src")
- Naming conventions (prevents convention drift)
- Anti-patterns to avoid (explicitly list what not to do)
- Required patterns (what must be done: tests, error handling, rollback paths)
- Command preferences (use bun, not npm; use Alembic, not raw SQL)

This is the persistent version of constraint-first prompting — the constraints are always first because they're loaded before any conversation starts.

### The "Contract Format" System Prompt

The most structured implementation of constraint-first prompting:

```
**Role:** [1 line describing the agent's purpose]

**Success Criteria:**
- [Binary outcome 1]
- [Binary outcome 2]
- [Binary outcome 3]

**Constraints:**
- [Hard limit 1]
- [Hard limit 2]
- [Hard limit 3]

**If Uncertain:** [Specific instruction — "ask before proceeding" vs "choose the conservative option"]

**Output Format:** [Exact specification of what the response should look like]
```

This format is documented in the Claude Code community as producing more consistent, more constrained, and more verifiable outputs than unstructured system prompts.

### The 4-Block Prompt Structure

A related structural approach for individual task prompts (not system prompts):

```
## INSTRUCTIONS
[What Claude should do]

## CONTEXT
[Relevant background information]

## TASK
[The specific request]

## OUTPUT FORMAT
[Exactly how the response should be structured]
```

This is not strictly "constraints first" but achieves a similar effect by creating clear separation between the operational rules (INSTRUCTIONS) and the specific ask (TASK).

### Integration with CLAUDE.md

Constraint-first prompting at three levels:

**Level 1 (session-global):** CLAUDE.md constraints — persistent, loaded before every session, apply to all tasks
**Level 2 (session-task):** Constraint-first individual task prompt — constraints stated before the task description
**Level 3 (output verification):** Self-verification checklist — Claude reviews its own output against the stated constraints

The verification checklist at Level 3:
"Before submitting: Did you follow the output format? Are any claims uncertain (mark with [UNCERTAIN])? Are all steps actionable? Did you stay within the stated constraints?"

This uses Claude's ability to review its own work — Claude will often catch constraint violations when explicitly asked to check.

### The Architectural Constraints Pattern

A more sophisticated version: coupling planning skills with spec-driven prompts to enforce architectural constraints before code generation.

Pattern:
1. Before any code is written, Claude reads CLAUDE.md
2. Claude finds the linked specification/issue
3. Claude builds a structured implementation plan
4. Plan is reviewed against architectural constraints
5. Only then does code generation begin

This is "guardrails before the guardrails" — architectural constraints enforced at the planning level, not just the execution level. gstack's sprint structure (Think → Plan → Build) implements this: the planning phase is explicitly where constraints are checked before the build phase begins.

### Anti-Patterns

Common constraint failures:
1. **Cramming unrelated constraints into one giant CLAUDE.md** — important constraints get buried; Anthropic recommends max 3–5 key rules
2. **Constraints too vague** — "be careful" is less effective than "do not modify any files outside /src"
3. **Constraints that contradict each other** — Claude resolves conflicts using its best judgment, which may not match yours
4. **Post-hoc constraints** — asking for constraints to be applied after the task is underway is consistently less effective than pre-task constraint setting
5. **Missing uncertainty handling rule** — without an explicit "if uncertain, ask" or "if uncertain, choose conservative option" instruction, Claude defaults to guessing

### Relationship to Other Frameworks

**gstack** operationalizes constraint-first prompting through its role structure: each role (CEO, Eng Manager, Designer) has an implicit constraint set. `/plan-eng-review` doesn't just plan — it locks architecture and data flow, which means architecture is constrained before implementation begins.

**ULTRAPLAN** (see `09-claude-code-ultraplan`) has constraint-first built into its critique phase: the critique agent specifically looks for constraint violations and missing requirements in the plan before approval.

**The Knowledge Ledger** (see `02-claude-memory-architecture`) is a persistent constraint system: rules.md contains confirmed constraints that Claude applies by default before every task in that domain.

### Is "Constraint-First" Formally Coined?

Research finding: The specific term "constraint-first prompting" does not appear as a formally coined, named, and attributed technique in academic papers or major AI blogs as of April 2026.

The concept exists and is practiced, but under various names:
- "Constrained prompting" (the broader established concept)
- "Defensive prompting" / "prompt scaffolding"
- "DSPy Assertions" (the academic formalization)
- "Contract format prompts" (community terminology)

It is likely a case of a community-developed technique that has multiple names and no single originator. The bookmark may have been a post that gave it the specific "constraint-first" label as a marketing term for an existing practice.

## Key Links

- Official Claude Code best practices: https://code.claude.com/docs/en/best-practices
- Anthropic prompting best practices: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
- DEV.to "Make Claude Think Before It Codes": https://dev.to/_vjk/i-made-claude-code-think-before-it-codes-heres-the-prompt-bf
- SmartScope Claude Code prompting guide: https://smartscope.blog/en/generative-ai/claude/claude-code-prompting-official-guidelines-2025/
- Prompt engineering guide 2026 (Lakera): https://www.lakera.ai/blog/prompt-engineering-guide
- DSPy Assertions paper: CoRR abs/2312.13382 (Singhvi et al., 2023)
- DreamHost tested 25 Claude techniques: https://www.dreamhost.com/blog/claude-prompt-engineering/
- PromptBuilder.cc checklist: https://promptbuilder.cc/blog/claude-prompt-engineering-best-practices-2026
- DataStudios.org: https://www.datastudios.org/post/claude-ai-prompting-techniques-how-to-write-accurate-long-context-responses

## Actionable Takeaways

1. **Restructure your task prompts to put constraints first** — before the task description, list: technology constraints, scope limits, anti-patterns to avoid, required patterns to include. Observe whether revision cycles decrease.
2. **Adopt the "contract format" for system prompts and CLAUDE.md**: Role → Success Criteria → Constraints → Uncertainty Rule → Output Format. This is the highest-signal-density prompt structure for Claude.
3. **Add an explicit uncertainty handling rule to every system prompt** — "If uncertain, ask before proceeding" or "If uncertain, choose the most conservative available option." Without this, Claude guesses.
4. **Add a verification checklist at the end of complex task prompts** — "Before submitting: did you follow the output format? Did you stay within stated constraints?" Claude will catch its own violations when explicitly asked.
5. **Treat CLAUDE.md as your global constraint layer** — it's constraint-first by default (loaded before every conversation). Use it for the 3–5 constraints that must apply to every task.
6. **Use gstack's sprint structure** — the Think → Plan → Build structure enforces constraint-checking at the planning phase, before execution begins. This is architectural-level constraint-first prompting.

## Connections

- The CLAUDE.md as persistent constraint layer connects directly to `02-claude-memory-architecture`'s three-block system (the rules.md files in the Knowledge Ledger are constraint declarations)
- gstack's sprint structure (`01-garry-tan-gstack`) is an implementation of constraint-first at the workflow level
- ULTRAPLAN's critique phase (`09-claude-code-ultraplan`) is constraint-checking built into the planning process
- The "contract format" pattern is used in system prompts documented in `06-claude-code-system-prompts`
- This technique is what separates sophisticated CLAUDE.md setups from naive ones — the quality of constraint specification determines output quality
