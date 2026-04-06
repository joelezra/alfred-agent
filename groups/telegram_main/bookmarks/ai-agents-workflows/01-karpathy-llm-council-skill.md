# How to Finally Trust Claude's Advice — Karpathy's LLM Council Method

**Bookmarked:** Mar 31, 2026 (00:55 MYT)
**Author:** @Hesamation (ℏεsam) quoting @itsolelehmann (Ole Lehmann)
**Tweet ID:** 2038758029940654507 (article: 2038655871807315968)
**Article:** "How to finally trust Claude's advice (using Karpathy's LLM Council method)"
**Category:** AI Agents & Workflows
**Type:** Reference / Actionable Tool
**Actionable:** YES — can implement this skill right now
**Status:** Skill already exists in this environment at `/home/node/.claude/skills/`

---

## The Core Problem

Claude is incredibly agreeable. Ask it "should I launch this product?" — it gives you 5 reasons why you should. Ask "is this product a bad idea?" — it gives you 5 reasons why it is. Same product, different framing, completely opposite answers.

This isn't Claude being bad. It's Claude being obedient to your framing. That's fine for writing emails. It's dangerous for making decisions.

---

## The Origin: Andrej Karpathy's LLM Council

Karpathy (co-founder of OpenAI, former head of AI at Tesla) built the LLM Council concept:
1. Poll multiple models on the same question
2. Have them peer-review each other's responses anonymously
3. A chairman model reads everything and synthesizes the final answer

His version uses GPT, Claude, Gemini against each other. Ole Lehmann rebuilt it entirely inside Claude using sub-agents with different thinking styles.

---

## The 5 Advisors

| Advisor | Role | What It Catches |
|---------|------|-----------------|
| **The Contrarian** | Looks for what will fail. Assumes your idea has a fatal flaw and digs | "This sounds great but have you thought about..." gaps |
| **The First Principles Thinker** | Ignores your question and asks what you're actually trying to solve | "You're optimising the wrong variable entirely" |
| **The Expansionist** | Hunts for upside you're missing, adjacent opportunities | "You're thinking too small" blind spots |
| **The Outsider** | Zero context about you, your field, your history. Reacts to what's in front of them | The curse of knowledge — obvious to you, invisible to customers |
| **The Executor** | Only cares about one thing: what do you do Monday morning? | Brilliant plans with no path to actually doing them (most plans) |

---

## Why the Peer Review Layer is the Key Differentiator

After all 5 advisors respond, the skill anonymises everything. Shuffles which advisor maps to which letter. Then 5 reviewers read all responses and answer 3 questions:

1. Which response is strongest and why?
2. Which has the biggest blind spot?
3. **What did all five miss?**

That last question is the most valuable. When you read 5 perspectives side by side, the **gap between them reveals what nobody thought to mention**.

---

## Real Example: Product Format Decision

Ole was building a Claude Code product. Obvious move: self-paced course. Passive income, scales, he'd done it before.

He counciled it instead. Results:

- **First Principles Thinker:** The real variable is *speed*. AI tools change every few weeks. A self-paced course filmed in March is outdated by May. A workshop lets you teach the current version live.
- **Contrarian:** Self-paced courses average 3-5% completion. 95% of buyers never finish → bad reviews, refunds, "scales" but leaves disappointed customers.
- **Executor:** Polished self-paced course = 8-12 weeks to produce. Workshop = 2-3 weeks. Ship faster, iterate.
- **Expansionist:** Workshop + recording = both formats in one purchase. One production effort, twice perceived value.
- **Outsider:** The course description assumed people already knew why they needed Claude Code. A live workshop demonstrates it instead of explaining it.

Peer review then caught: the Contrarian's completion argument and the First Principles speed argument reinforce each other in a way neither saw alone. A live workshop solves both simultaneously.

**Final verdict:** Live workshop with recording included. 180 people signed up. 4.8/5 stars.

---

## How to Set It Up

1. Grab the skill from Ole's article
2. Drop into Claude Code / Cowork (Customize > Skills > Add skill)
3. Type "council this" followed by your question with full context
4. The skill: scans workspace for context → frames the question → spawns 5 advisors in parallel → runs anonymous peer review → produces chairman synthesis with one concrete next step
5. Output: visual HTML report (60-second scan) + full markdown transcript

---

## When to Council

Use it when:
- Content and positioning decisions ("should I niche down?")
- Hiring and operations choices
- Pricing decisions
- Any fork where you keep going back and forth and the cost of being wrong is high

Skip it when you already know the answer and just want validation. The council will tell you things you don't want to hear. That's the point.

---

## Relevance to Your Work

This directly applies to any major product or business decision — which SaaS to build next, how to price it, what distribution to pursue. Instead of asking Claude once and getting an agreeable answer, council it for decisions where the stakes are high.

The skill also exists in this NanoClaw environment already — @Hesamation noticed this same pattern was built here.
