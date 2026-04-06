# Three CLAUDE.md Blocks That Make Claude Get Smarter Every Session

**Source:** https://twitter.com/PawelHuryn/status/2039095189843706022
**X Article:** http://x.com/i/article/2039091207045890048
**Author:** @PawelHuryn (Paweł Huryn) — verified product manager/educator, founder of productcompass.pm, host of upcoming Claudathon (May 9, 2026), 250+ builders signed up
**Date:** 2026-03-31
**Category:** Claude Code / AI Tooling / Productivity
**Type:** Actionable (high priority)
**Engagement:** 83,930 views, 1,208 bookmarks, 347 likes, 34 retweets

---

## TL;DR

Paweł Huryn spent a month adding three specific blocks to his CLAUDE.md. By week three, Claude was applying 24 project-specific rules it had written itself — rules never explicitly prompted, extracted from patterns across dozens of sessions. The three blocks target three distinct failure modes: memory without reflection (Knowledge Architecture), repeated debate of settled decisions (Decision Journal), and agents confidently praising their own mediocre work (Quality Gate). Full templates published at productcompass.pm/p/claude-md-snippets.

---

## Key Claims

- Added 3 blocks to CLAUDE.md; after 1 month, Claude was self-generating and applying 24 project-specific rules
- Rules were never explicitly prompted — they emerged from session patterns
- Decision Journal: 80% accuracy on decisions that forced explicit alternatives consideration vs. decisions made with high confidence
- Quality Gate premise backed by Anthropic's own engineering documentation: agents confidently praise work they produced even when quality is mediocre
- Full system is paste-ready in 90 seconds
- Knowledge is organized as a graph of .md files per domain — does not bloat a single CLAUDE.md file (confirmed in replies)

---

## Deep Dive

### The Problem Being Solved: Memory Without Reflection

Standard CLAUDE.md setups are growing correction logs — a list of mistakes Claude made that you've added rules for. They capture:
- Your pricing test showed 40% churn
- A competitor dropped their free tier
- Onboarding users churned less

But Claude never connects these three observations. They sit in separate sessions. Memory without reflection is just storage.

### Block 1: Knowledge Architecture — The Learning Loop

**The failure mode:** Claude captures observations but never revisits them. Insights from last week don't inform this week's work. No mechanism to test whether a pattern holds, promote it when it does, or discard it when it doesn't.

**The principle:** Force active retrieval before every task. Claude reads existing knowledge before making recommendations. After the task, extract what was learned and store in domain-specific folders with a clear hierarchy:
- Raw observations
- Hypotheses (need more data)
- Confirmed rules (applied by default)

**The promotion cycle:**
1. Observation starts as a hypothesis
2. After 3+ confirmations across sessions → promoted to rule (applied automatically)
3. When new data contradicts a rule → demoted back to hypothesis
4. System self-corrects instead of accumulating stale advice

**Implementation structure:**
```
Before starting tasks, review existing rules and hypotheses for relevant domains.
Apply confirmed rules by default. Identify hypotheses testable with current work.

After each task, extract insights into domain folders:
  /knowledge/[domain]/
    knowledge.md (facts and patterns)
    hypotheses.md (requires additional data)
    rules.md (validated — apply automatically)

Maintain /knowledge/INDEX.md routing to each domain.
Promote hypotheses to rules after 3+ confirmations.
Demote rules contradicted by new evidence back to hypothesis status.
```

**What happened in practice:** After one month, Huryn had a folder where Claude had promoted 24 rules on its own. They emerged from dozens of sessions. Claude was measurably better — not because of better prompts, but because the system had been learning the whole time.

### Block 2: Decision Journal — Reviewable Reasoning

**The failure mode:** Someone asks why you picked Postgres over DynamoDB. Nobody remembers. You spend 30 minutes re-debating a settled decision.

**The principle:** Before making any significant decision, Claude searches for prior decisions in that area first. If one exists, it follows the existing reasoning unless new information invalidates it. If no prior decision exists, it logs the full context.

**Log format:**
```
File: /decisions/YYYY-MM-DD-{topic}.md

## Decision: {what was chosen}
## Context: {why this arose}
## Alternatives considered: {other options evaluated}
## Reasoning: {why this option prevailed}
## Trade-offs accepted: {what was sacrificed}
## Supersedes: {link to prior decision if replacing one}
```

**Analog:** Architecture Decision Records (ADRs) — same principle, but enforced by Claude instead of team discipline.

**Surprising finding from Huryn:** The decisions he was most confident about had the worst accuracy. The ones where he forced explicit consideration of alternatives were right 80% of the time. The journal creates a traceable chain showing reasoning evolution over time.

### Block 3: Quality Gate — Evaluation Criteria That Compound

**The failure mode:** Claude finishes a task and tells you it's done. You ask if the work is good. Claude says yes — confidently, every time. Anthropic's own engineering team documented this: agents confidently praise work they produced, even when quality is mediocre.

**The principle:** Give Claude concrete, testable evaluation criteria specific to your project. Not vague aspirations ("be thorough") but specific checks:
- "churn impact modeled for both monthly and annual cohorts"
- "edge cases documented for each user flow"

**How criteria evolve:**
- When a check catches a real issue → gets noted
- When a check keeps catching the same class of problem → promoted to automatic gate
- When a check has never triggered across many evaluations → flagged for pruning
- Quality bar tightens around actual failure patterns instead of staying frozen

**Analog:** Definition of Done in Scrum — but it gets sharper every week instead of gathering dust in a wiki.

### How the Three Blocks Reinforce Each Other

- Quality Gate catches a pattern → Knowledge Architecture promotes it to a rule
- A decision ages badly → Decision Journal gets a replacement entry with full context on why reasoning changed
- Knowledge rules shape future decisions
- Criteria feed back into knowledge

### Maintenance Schedule

Instructions tell Claude to periodically suggest a system review:
- Prune stale rules
- Check if hypotheses have enough evidence to promote
- Review whether trade-offs played out as expected
- Flag criteria that stopped being useful

Claude suggests the review. You decide when to run it.

### Reply Thread Insights

- @priorodds: "How do you keep this from overloading CLAUDE.md?" — Huryn: "Knowledge is organized into a graph of .md files per domain" (not one file)
- @timschuster: "Trying to reduce markdown files poisoning my context window... might log decisions and rules in Supabase" — this is an interesting alternative (external DB instead of file graph)
- @thechaicoder: doing weekly rule review checks (unused or disproven rules get pruned automatically) — a sensible extension
- @Tahseen_Rahman: "A good CLAUDE.md turns repeated mistakes into infrastructure instead of a ritual you redo every morning" — best summary of the value proposition

---

## Key Links

- Tweet: https://twitter.com/PawelHuryn/status/2039095189843706022
- X Article: http://x.com/i/article/2039091207045890048
- Full implementation (paste-ready blocks): https://www.productcompass.pm/p/claude-md-snippets
- Claudathon (May 9): https://go.productcompass.pm/claudathon

---

## Actionable Takeaways

1. Paste all three blocks into your CLAUDE.md today. 90 seconds of setup. Start the promotion cycle immediately.
2. Do not just add the blocks — create the `/knowledge/` and `/decisions/` directories so Claude has somewhere to write. The file graph is the system.
3. Quality Gate: write your first 5 concrete checks right now (specific, not vague). They don't need to be perfect — they'll evolve.
4. The Supabase alternative (@timschuster's suggestion) is worth exploring if context window size is a concern — a structured external DB could serve as the knowledge graph with better querying.
5. Weekly automated pruning (Claude suggests, you approve) is the maintenance pattern — schedule it.
6. The 24 self-generated rules result is the north star metric: how many rules has Claude written for your project, vs. how many did you write? The ratio should trend toward Claude over time.

---

## Connections

- Directly implements the learning infrastructure needed to address the Garry Tan slop problem (Bookmark 1): the Quality Gate is exactly what was missing
- The Decision Journal is the exact mechanism Block's AI coordination layer would need to implement for organizational decisions (Bookmark 2)
- The knowledge graph approach complements awesome-claude-code's CLAUDE.md resources (Bookmark 5)
- The maintenance schedule concept connects to the Anthropic leak (Bookmark 8): the leaked code revealed similar internal patterns for managing Claude's own rule systems
