# Claude Memory Architecture — Self-Improving CLAUDE.md with 3-Block System

**Source:** https://www.productcompass.pm/p/claude-md-snippets
**Author:** @huryn — Paweł Huryn, CPO/PM with 15+ years in tech; The Product Compass newsletter (#1 AI & PM newsletter on Substack, hundreds of thousands of subscribers)
**Bookmarked:** 2026-03-31
**Category:** AI / Claude Code Technical
**Type:** Actionable
**Engagement:** High — featured in The Product Compass, widely shared in Claude Code community

---

## TL;DR

Paweł Huryn documented a three-block CLAUDE.md architecture that solves Claude's session-statefulness problem by building a persistent knowledge system: a Knowledge Ledger (domain-organized facts/hypotheses/rules), a Decision Journal (traceable reasoning logs), and a Quality Gate (objective evaluation criteria). By week three of using this system, Claude was applying 24 project-specific rules it had written itself — rules that emerged organically from patterns across dozens of sessions.

## Key Claims

- Every Claude Code session starts stateless — CLAUDE.md is the only bridge across sessions
- Three-block architecture turns Claude from a stateless tool into a compounding agent
- Knowledge Ledger: domain folders with `knowledge.md`, `hypotheses.md`, `rules.md`
- Hypotheses promoted to rules after 3+ confirmations; rules demoted if contradicted
- Decision Journal: `/decisions/YYYY-MM-DD-{topic}.md` format with full reasoning chains
- Quality Gate: eval-set of binary yes/no questions preventing confident self-praise of mediocre work
- By week three: Claude applying 24 self-generated project-specific rules
- Distinct from `Learnings.md` approach — complementary, not interchangeable

## Deep Dive

### The Core Problem This Solves

Claude Code resets its context every session. There is no native mechanism to remember your conventions, your technology preferences (bun vs npm, Alembic vs raw SQL), your architectural decisions, or your project-specific rules. The only file that reliably onboards every session is CLAUDE.md.

The naive solution is a long CLAUDE.md that lists everything. But long CLAUDE.md files have diminishing returns — Anthropic's own best practices warn that instructions get buried as the file grows. The three-block system solves this by making CLAUDE.md a routing layer that points to domain-specific knowledge stores, rather than a monolithic instruction document.

### Block 1: The Knowledge Ledger

Structure:
```
/knowledge/[domain]/
  knowledge.md    — confirmed facts and observed patterns
  hypotheses.md   — unconfirmed observations needing more data
  rules.md        — confirmed patterns, applied by default
/knowledge/INDEX.md  — routing map to each domain folder
```

Domain examples: `/knowledge/pricing/`, `/knowledge/onboarding/`, `/knowledge/competitors/`, `/knowledge/architecture/`

**The promotion/demotion cycle:**
- Observation → `hypotheses.md`
- Confirmed 3+ times → promoted to `rules.md`
- Rule contradicted by new evidence → demoted back to `hypotheses.md`

**Active retrieval, not passive storage:** The value is in Claude checking the knowledge base before making a recommendation, not in the files existing. CLAUDE.md should instruct Claude to read the relevant domain folder before starting any task in that domain.

**The 24 self-generated rules:** By week three, Claude was identifying patterns across sessions and encoding them as rules without explicit prompting. For example, it might observe: "User always wants error handling before the happy path. Observed in 4 consecutive implementations. Promoting to rule." This is the compounding effect.

### Block 2: The Decision Journal

Format: `/decisions/YYYY-MM-DD-{topic}.md`

Each decision file includes:
- Decision statement (what was decided)
- Context (why this decision was being made)
- Alternatives considered (what else was on the table)
- Reasoning (why this option was chosen)
- Trade-offs accepted (what you're giving up)
- Links to superseded decisions (if this overrides an earlier choice)

**Why this matters:** Without a decision journal, Claude re-debates settled questions every session. Teams waste time re-explaining why they chose PostgreSQL over MongoDB, or why the API uses snake_case instead of camelCase. More insidiously, Claude may make choices that contradict earlier decisions because it has no memory of them.

The decision journal is a form of institutional memory. In human organizations, this is tribal knowledge. In Claude-assisted development, it's a file.

**Session management pattern:** For work spanning multiple sessions, maintain a `.claude/state.md` file with:
- Goal (what are we building?)
- Status (ready / in-progress / blocked / done)
- Done (what's complete)
- Next (singular, concrete next action)
- Open questions (unresolved blockers)

Update it before ending every session. This is the short-term bridge; the decision journal is the long-term archive.

### Block 3: The Quality Gate

**The core problem it solves:** Agents confidently praise work they've produced, even when mediocre. Claude has no external reference for "good" — it evaluates relative to what it just produced, not against an objective standard.

**The eval-set approach:** A quality gate is a collection of binary yes/no questions that define what a good output looks like. Not subjective ("is this good?") but specific and checkable ("Does the API return appropriate HTTP status codes for all error conditions? Does every database write have a corresponding rollback path?").

**A `self-review-checklist` skill** can operationalize this: Claude runs the checklist before considering work complete. Convention drift, missing tests, and architectural inconsistencies surface before shipping rather than in production.

**Relationship to gstack:** gstack's `/review` and `/qa` skills are an implementation of the quality gate concept. The three-block CLAUDE.md architecture is the persistent knowledge layer that makes quality gate results compound over time.

### Skills 1.0 vs Skills 2.0 Context

- Skills 1.0 (October 2025): static SKILL.md file with instructions. You write it, Claude follows it.
- Skills 2.0 (January 2026): feedback loop. The skill itself can be improved through Auto Research, which measures output quality, modifies the skill instructions, and keeps better versions.

The three-block system predates Skills 2.0 but is complementary — the Knowledge Ledger is a manual version of what Skills 2.0 automates for skill-specific knowledge.

### Learnings.md vs CLAUDE.md: The Distinction

- `CLAUDE.md`: static, intentional knowledge — things you've decided Claude should always know
- `Learnings.md`: dynamic, discovered knowledge — observations Claude accumulated by running the skill
- State files (`.claude/state.md`): transient, session-bridging knowledge — what's in progress right now

They're a stack, not alternatives. A fully instrumented project has all three.

### Related Self-Improvement Systems

- Christopher Allen's GitHub Gist: "Self-Improving Claude Code: A bootstrap seed prompt that evolves into a sophisticated configuration system" (https://gist.github.com/ChristopherA/fd2985551e765a86f4fbb24080263a2f)
- MindStudio's Self-Learning Skill with Learnings.md: https://www.mindstudio.ai/blog/self-learning-claude-code-skill-learnings-md
- David Oliver's Medium piece: "Recursive Self-Improvement: Building a Self-Improving Agent with Claude Code" (March 2026)

### Official Anthropic Best Practices Alignment

The Claude Code official docs (code.claude.com/docs/en/best-practices) confirm:
- CLAUDE.md is loaded every session — keep it broad
- For domain-specific or occasional knowledge, use skills (loaded on demand)
- Treat CLAUDE.md like code: review when things go wrong, prune regularly, test changes by observing behavior

The three-block system is an extension of this philosophy taken to its logical conclusion.

## Key Links

- Source article: https://www.productcompass.pm/p/claude-md-snippets
- Author Substack: https://substack.com/@huryn
- Christopher Allen's bootstrap seed: https://gist.github.com/ChristopherA/fd2985551e765a86f4fbb24080263a2f
- MindStudio Learnings.md: https://www.mindstudio.ai/blog/self-learning-claude-code-skill-learnings-md
- Auto Research self-improving skills: https://www.mindstudio.ai/blog/claude-code-autoresearch-self-improving-skills
- David Oliver Medium (recursive self-improvement): https://medium.com/@davidroliver/recursive-self-improvement-building-a-self-improving-agent-with-claude-code-d2d2ae941282
- Shubh Jain on auto research: https://medium.com/@shubhjain191/how-to-make-your-claude-code-skills-self-improving-using-auto-research-803ff97d5483
- Official best practices: https://code.claude.com/docs/en/best-practices
- Groff.dev implementation guide: https://www.groff.dev/blog/implementing-claude-md-agent-skills

## Actionable Takeaways

1. **Implement the knowledge ledger structure today** — create `/knowledge/[domain]/` folders for your top 3 domains (architecture, conventions, product decisions). Start with what you'd have to re-explain to Claude every session.
2. **Add a Decision Journal entry for every architectural decision** — format: `/decisions/YYYY-MM-DD-topic.md`. Start with decisions already made. The next time you onboard Claude on a session, point to the journal.
3. **Build a quality gate eval-set** — write 10–15 binary yes/no questions specific to your project's quality standards. Store in `.claude/quality-gate.md`. Instruct Claude to run through it before any `/ship` equivalent.
4. **Add active retrieval instructions to CLAUDE.md** — don't just store knowledge, instruct Claude to read the INDEX.md before starting domain-specific work.
5. **Track the hypothesis-to-rule pipeline** — when Claude surfaces a pattern, consciously decide: is this ready to promote from `hypotheses.md` to `rules.md`? The 3-confirmation heuristic is a good default.
6. **Maintain `.claude/state.md` for all multi-session work** — update before ending every session. This is non-negotiable.
7. **Prune CLAUDE.md quarterly** — remove rules that no longer apply, consolidate overlapping rules, ensure the highest-value 5 rules are at the top.

## Connections

- Directly supports the employee-grade CLAUDE.md work referenced in `/workspace/group/bookmarks/SUMMARY.md` (the @iamfakeguru FORCED VERIFICATION and CONTEXT DECAY rules)
- The quality gate concept is implemented by gstack's `/review` and `/qa` skills (see `01-garry-tan-gstack`)
- Hermes Agent's three-tier memory (session / persistent / skill) described in `/workspace/group/bookmarks/2026-03-31/14-self-improving-agents/RESEARCH.md` is a more automated version of this same architecture
- The decision journal is a manual version of what Hermes Agent does automatically with "Skill Documents"
- NanoClaw in this environment uses SOUL.md as the behavioral core — this three-block system is the equivalent for Claude Code
