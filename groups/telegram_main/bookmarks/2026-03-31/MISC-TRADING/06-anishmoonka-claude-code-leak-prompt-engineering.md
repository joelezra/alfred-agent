# The Claude Code Leak as a Free Masterclass in Prompt Engineering

**Source:** https://twitter.com/anishmoonka/status/2039063681590231435
**Author:** @anishmoonka (Anish Moonka) — verified AI writer/educator on X, writes daily deep dives on AI
**Date:** 2026-03-31
**Category:** Prompt Engineering / AI Tools / Analysis
**Type:** Reference / Actionable
**Engagement:** 150,730 views, 1,334 bookmarks, 548 likes, 76 retweets

---

## TL;DR

Anish Moonka reframes the Anthropic Claude Code leak not as a security story but as a free masterclass in how to actually prompt AI properly. The core observation: Anthropic's internal prompts don't say "be helpful" — they specify exact tools, exact risks, and exact output formats, in three distinct layers every time. This is called "constraint-first prompting." The quoted tweet links to an X Article that expands the analysis. One reply accuses the author of fabricating several specific claims (the "virtual pet," the "30% error rate," the "512k line single file" narrative), but the core three-layer argument survives scrutiny.

---

## Key Claims

- The Claude Code leak is primarily a prompt engineering resource, not just a security incident
- Anthropic's internal prompts use a "three layers, every time" structure:
  1. Tool selection — exactly what the AI can and cannot touch
  2. Risk management — what to avoid or flag
  3. Output formatting — exact structure for responses
- This is described as "constraint-first prompting" — start with constraints, not goals
- The approach differs fundamentally from typical user prompts, which function like wishes ("be helpful") rather than contracts
- The leaked code reveals how Anthropic manages context, tool dispatch, and the agent loop

---

## Deep Dive

### The Three-Layer Framework

Based on what's publicly known from the leak (via Decrypt, The Register, and community analysis):

**Layer 1 — Tool Selection (Constraint Scope)**
Anthropic's internal prompts specify exactly which tools Claude can invoke for a given task and which are off-limits. This is not left to Claude's discretion. The tool constraint creates a bounded decision space — Claude cannot hallucinate a tool call it wasn't authorized to make. This is the same principle used in function-calling APIs but implemented at the system prompt level.

**Layer 2 — Risk Management (Constraint Risks)**
Internal prompts enumerate specific failure modes and what to do when encountered. Not general warnings ("be careful") but specific triggers ("if X appears, do Y"). The leaked code revealed that risk constraints are domain-specific — not a blanket policy document but case-specific risk trees.

**Layer 3 — Output Formatting (Constraint Shape)**
Exact structure for responses: specific fields, specific order, specific formats. This constrains the output space just as the tool selection constrains the action space. An agent that knows the exact shape of its output can be evaluated programmatically — the output becomes machine-readable, not just human-readable.

### What This Means for Users

The contrast with typical user prompting:
- Typical: "Write me a blog post about AI safety" (goal-first, unconstrained)
- Anthropic-style: "Write a blog post about AI safety. Use only these sources: [list]. Do not speculate about model capabilities. Format as: [exact schema]. Flag if you encounter claims you cannot verify." (constraint-first)

The constraint-first approach works because:
1. It narrows the search space for Claude's response generation
2. It makes verification possible (did Claude follow the constraints?)
3. It scales: the same framework applies regardless of task complexity
4. It separates concerns: what tools/info Claude has vs. what risks to avoid vs. what shape the output takes

### The "Observe → Codify → Iterate" Loop

The most nuanced reply in the thread (@imjszhang): "The real leak: Anthropic's 3-layer rulebook works because they wrote it for Claude's specific failure modes. Copying the layers without knowing when to break them is cargo-cult engineering. The insight is the loop — observe → codify → iterate — not the codify step alone."

This is correct and important. The three-layer framework is an output of a learning process:
1. Observe where Claude fails or produces suboptimal output
2. Codify the fix as a constraint in the appropriate layer
3. Iterate: test whether the constraint actually fixed the failure mode
4. If yes, promote to standard; if not, refine or discard

The loop is what PawelHuryn's CLAUDE.md system (Bookmark 4) is implementing — the same iterative codification process, automated.

### Verification: What Was Actually in the Leak vs. What Was Embellished

The @HypeAutopsy reply in the thread is worth examining as a fact-check of the broader leak narrative (directed at embellishments by other commenters, not necessarily at Moonka specifically):

Claims flagged as fabricated by @HypeAutopsy:
- "single file of 512k lines" — it was a .js.map sourcemap for 1,900 TypeScript files, not a single 512k-line file
- "virtual pet with 18 shiny species" (Buddy feature) — described as "100% fabricated" in their analysis (though Decrypt and other outlets did report the Buddy feature from the leak, so this claim from @HypeAutopsy is itself disputed)
- "30% error rate" — described as not in the repo; called a fabricated authoritative-sounding statistic
- "constraint-first prompting" as a term — called a "grift to sell his newsletter" by @HypeAutopsy

Assessment: The core three-layer observation is well-supported by multiple independent analyses of the leaked code. The specific statistics (30% error rate, 18 species) are plausibly embellished. The leak did expose real internal system prompts, real feature flags (44 of them), and real architectural patterns. The Buddy feature is reported by Decrypt but unconfirmed from primary Anthropic source.

### What the Leak Actually Shows About Prompt Engineering

From verified sources (Decrypt, The Register, claudefa.st/blog/guide/mechanics/claude-code-source-leak):

- KAIROS: A fully built but unshipped background daemon mode — architectural documentation reveals how Anthropic structures agent loops
- Undercover Mode: System prompt included "Do not blow your cover" — shows how Anthropic constrains Claude's disclosure behavior in specific contexts (a concrete example of constraint-first at Layer 2)
- 44 hidden feature flags: Shows the feature flag governance architecture — some capabilities exist in the code but are constraint-disabled, not model-disabled
- Multi-agent coordination logic: Reveals how Claude orchestrates subagents — directly relevant to anyone building multi-agent systems

---

## Key Links

- Tweet: https://twitter.com/anishmoonka/status/2039063681590231435
- Quoted X Article: http://x.com/i/article/2039048475560530399
- Decrypt leak coverage: https://decrypt.co/362917/anthropic-accidentally-leaked-claude-code-source-internet-keeping-forever
- The Register coverage: https://www.theregister.com/2026/03/31/anthropic_claude_code_source_code/
- claudefa.st full leak mechanics: https://claudefa.st/blog/guide/mechanics/claude-code-source-leak

---

## Actionable Takeaways

1. Apply the three-layer structure to every system prompt you write: (1) what tools/resources are in scope, (2) what risks/failure modes to watch for, (3) what exact format the output must take. Do this before writing the actual task.
2. The "observe → codify → iterate" loop is the meta-practice. Don't just read the leak — treat every Claude session as a data point and use it to tighten your constraint layers.
3. The Undercover Mode example is immediately applicable: when Claude is contributing to external repositories or communicating externally, add explicit constraints about what internal context it should not disclose.
4. Feature flags in your prompts: you can implement the equivalent of Anthropic's compile-time feature flags using conditional blocks in CLAUDE.md ("if in [environment X], enable [capability Y]")
5. Review the claudefa.st full leak mechanics post for the most technically grounded analysis of what was actually in the source

---

## Connections

- Directly connects to the Jeremybtc leak story (Bookmark 8) — Moonka's angle is the learning extraction from the same event
- The three-layer framework is what PawelHuryn's Quality Gate implements at the session level (Bookmark 4)
- Constraint-first prompting is the prompt-engineering analog of what the Block essay calls "capability composition" — you start with what the system can do (constraints), then let intelligence compose the solution (Bookmark 2)
- The free-code project (Bookmark 7) strips some of these exact constraints — understanding what they do first (from Moonka's analysis) helps you evaluate what you're removing
