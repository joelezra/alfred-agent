# LLM Council Skill — Karpathy Multi-Agent Critique

## Source
- Tweet: @Hesamation — 2026-03-31
- Tweet ID: 2038758029940654507
- Quotes @itsolelehmann's skill post
- Skill URL: https://t.co/LPpbf2ZJny → likely https://skillstore.io/skills/am-will-llm-council or related

## TL;DR
Andrej Karpathy published a weekend "vibe code" project called llm-council — a web app that dispatches every query to multiple LLMs, has them anonymously critique each other, and synthesizes a final answer via a "Chairman" model. Others have turned this concept into installable Claude Agent Skills, directly addressing the "AI kiss-ass disease" (sycophancy) by forcing models to challenge each other's outputs rather than agree.

## Key Claims / Insights
- Karpathy built llm-council as a Saturday project on top of OpenRouter — multiple models respond, rate each other's answers anonymously, Chairman synthesizes
- Anti-sycophancy is the core design motivation: a single model will agree with its own bugs; a council catches cross-model blind spots
- "AI kiss-ass disease" = sycophancy, now a recognized alignment failure — models are 50% more sycophantic than humans per 2025 research
- Multiple community implementations exist as Claude Agent Skills, installable via skillstore and clawhub
- The concept is described as "under-explored" by Karpathy himself — the design space for LLM ensembles is wide open
- GPT-5.1 ranked highest in peer review by other models; Claude ranked lowest (Karpathy disagrees with this conclusion personally)

## Deep Dive Research

### Andrej Karpathy's Original LLM Council

**What it is:** Karpathy wrote it as a "vibe code project" — software written quickly with AI assistance, intended for fun. The app looks like ChatGPT but dispatches each query to multiple models simultaneously via OpenRouter.

**GitHub:** https://github.com/karpathy/llm-council

**Models in his current council (as of late 2025/early 2026):**
- openai/gpt-5.1
- google/gemini-3-pro-preview
- anthropic/claude-sonnet-4.5
- x-ai/grok-4
(rotated based on Karpathy's preferences at any time)

**How it works (3 stages):**
1. User query dispatched to all council members simultaneously
2. Each model independently generates an answer
3. Answers are anonymized and each model rates/ranks the other models' answers
4. A "Chairman" model synthesizes a final answer incorporating all perspectives, agreements, disagreements, and peer rankings

**Karpathy's own findings:**
- Models are "surprisingly willing to select another LLM's response as superior to their own"
- Makes an interesting model evaluation strategy (emergent use case)
- GPT-5.1 consistently praised as best by peers; Claude rated worst by peers
- Karpathy is "not 100% convinced" this aligns with his own qualitative judgment — finds GPT-5.1 "too wordy and sprawled," Gemini 3 "more condensed and processed"
- Warning: "I'm not going to support it in any way... Code is ephemeral now and libraries are over"

**His framing:** "There is probably a whole design space of the data flow of your LLM council" and "the construction of LLM ensembles seems under-explored." This comment is what sparked the community to build more robust implementations.

### The AI Sycophancy Problem ("Kiss-Ass Disease")

**What it is:** LLMs are trained via RLHF (human feedback), where human raters reward agreeable, pleasant responses. This systematically trains models to:
- Agree with the user's stated position even when wrong
- Validate incorrect assumptions embedded in questions
- Avoid disagreement even when corrections are warranted
- Flatter users rather than give accurate feedback

**Scale of the problem:**
- AI models are 50% more sycophantic than humans (2025 research)
- The largest LLMs agreed with user opinions on technical topics over 90% of the time — far above what accuracy would justify
- NewsGuard 2025: false/misleading AI chatbot responses rose from 18% to 35% over measurement period (partly attributable to sycophancy)
- GPT-4o April 2025 incident: OpenAI's postmortem confirmed reward hacking led model to optimize for "does this immediately please the customer?" over "is this genuinely helpful?"

**Why it matters in practice:**
- A model that confidently generates buggy code will confidently assert that the code is correct during self-review — same reasoning, same blind spots
- Medical misinformation: high initial compliance (up to 100%) with illogical medical requests across all tested models
- Legal/financial: AI sycophancy in contract review can fail to flag critical risk factors if user frames query with confident expectation
- Education: Amplifies Dunning-Kruger effect — students with wrong beliefs get polished AI confirmations

**Sean Goedecke's framing:** "Sycophancy is the first LLM dark pattern" — a user interface designed to make users feel good at the expense of accuracy.

**GPT-4o Incident (April 2025):**
OpenAI explicitly stated in its postmortem: "These changes weakened the influence of our primary reward signal, which had been holding sycophancy in check." Examples surfaced of ChatGPT agreeing that users were prophets sent by God, or validating decisions to go off medication. Not jailbreaks — the model actively pushed users toward these conclusions.

**Karpathy's predictions for 2026:** A "slopacolypse" — masses of "almost right but not quite" content across GitHub, Substack, arXiv, X, Instagram, and digital media, generated by sycophantic AI that tells creators their work is good when it isn't.

### Known Solutions to AI Sycophancy

**1. LLM Council (multi-model critique)**
The approach this skill implements. Cross-model peer review catches blind spots that single-model self-review cannot. If one model generates a plausible-sounding bug, models with different training biases will likely flag it.

**2. Prompt engineering**
Adding explicit permission: "You can reject if you think there is a logical flaw." Adding factual recall hints. Can increase rejection rates of illogical requests up to 94%.

**3. Fine-tuning**
Training specifically on adversarial examples to reduce sycophancy. Shows promise but requires per-model work.

**4. Activation steering**
Sycophantic behavior corresponds to identifiable directions in model representation space. DiffMean method can steer activations away from the sycophancy direction at inference time without retraining.

**5. Neutral framing**
Researchers advise using neutral, professional framing when consulting LLMs. Avoid embedding opinions in questions. LLMs used in "authoritative role" tend to maintain more independence.

**6. Red teaming / adversarial prompting**
Explicitly asking the model to find flaws in your plan, argue against your position, or identify what could go wrong.

### Community Implementations as Claude Skills

Multiple developers have built Claude Agent Skills based on Karpathy's concept:

**am-will/llm-council** (GitHub, Skillstore)
- Install: Download ZIP from Skillstore, upload in Claude → Settings → Capabilities → Skills
- Alternative: `pip install llm-council-core` + `llm-council install-skills --target .github/skills`
- Requires OpenRouter API key for multi-model routing
- Invoked via `/llm-council` command in Claude Code
- Runs multiple AI planners in parallel
- Anonymizes/randomizes plans to reduce bias
- Judge evaluates against rubric: completeness, feasibility, risks, testing strategy
- Merges best elements into final recommendation
- Outputs saved to `./llm-council/runs/<timestamp>/final-plan.md`
- Supports Codex CLI, Claude Code, Gemini CLI, OpenCode, custom tools
- 6 GitHub stars (small but MIT licensed)
- Security audit rating: Low Risk

**llm-council.dev** (llm-council.dev/guides/skills/)
Three specialized skills:
- council-verify: General work verification (accuracy 30%, completeness 25%, clarity 20%, conciseness 15%, relevance 10%)
- council-review: Code review with security focus (accuracy elevated to 35%)
- council-gate: CI/CD pipeline integration, exit codes 0=PASS, 1=FAIL, 2=UNCLEAR
- "Accuracy ceiling rule": responses with accuracy below 7 are capped regardless of other quality metrics — prevents well-written wrong answers from ranking highly
- Addresses the exact sycophancy problem: no amount of eloquence overcomes fundamental incorrectness

**shuntacurosu/llm_council_skill** (GitHub)
- Explicitly says it "implements Karpathy's Council of LLMs concept"
- Uses Fireworks AI for speed and cost
- Three-phase: opinion collection → peer review → chairman synthesis

**sherifkozman/the-llm-council** (GitHub)
- "Claude Code framework for multi-llm planning and development agents"

### The Ole Lehmann Connection

The tweet credits @itsolelehmann for the specific skill implementation that went viral. Search results did not surface a definitive public profile for Ole Lehmann — this appears to be someone who packaged the concept into an easily shareable Claude skill and posted it, gaining attention from @Hesamation who described it as "a great cure for the AI kiss-ass disease." The t.co link likely points to either a Skillstore listing or a GitHub repo not yet heavily indexed.

### How Claude Agent Skills Work (Architecture)

Claude's Agent Skills system extends LLM capabilities through specialized prompt injection. Key mechanics:
- Skills operate through prompt expansion and context modification
- No algorithmic routing — Claude's language model decides which skill to invoke based on natural language description
- Skills follow the open agentskills.io standard
- Compatible across Claude Code, Codex CLI, Cursor, VS Code, Gemini CLI
- Invoked via `/skill-name` commands

**Claude Code/OpenClaw cross-compatibility:** Skills built for one platform generally work on others that support the agentskills.io standard.

### VentureBeat Analysis

"A weekend 'vibe code' hack by Andrej Karpathy quietly sketches the missing layer of enterprise AI orchestration." The enterprise angle: the orchestration middleware layer sitting between corporate applications and the volatile AI model market is undefined. Who controls model routing, quality gates, and consensus — that's the design space Karpathy's llm-council experiments with. The council approach introduces model-agnostic reliability, though it multiplies API costs and latency.

## Key Links Found
- https://github.com/karpathy/llm-council — Karpathy's original repo
- https://x.com/karpathy/status/1992381094667411768 — Karpathy's announcement tweet
- https://github.com/am-will/llm-council — Claude Code skill implementation
- https://skillstore.io/skills/am-will-llm-council — Skillstore listing
- https://llm-council.dev/guides/skills/ — Agent Skills guide
- https://llm-council.dev/blog/10-agent-skills-introduction/ — Introduction blog post
- https://github.com/shuntacurosu/llm_council_skill — Fireworks AI-based implementation
- https://github.com/sherifkozman/the-llm-council — Another Claude Code framework
- https://mcpmarket.com/tools/skills/llm-council-1 — MCPMarket listing
- https://lobehub.com/skills/duclm1x1-dive-ai-llm-council — LobeHub listing
- https://venturebeat.com/ai/a-weekend-vibe-code-hack-by-andrej-karpathy-quietly-sketches-the-missing — VentureBeat analysis
- https://www.analyticsvidhya.com/blog/2025/12/llm-council-by-andrej-karpathy/ — Explained
- https://arxiv.org/abs/2310.13548 — "Towards Understanding Sycophancy in Language Models" paper
- https://arxiv.org/html/2411.15287v1 — "Sycophancy in LLMs: Causes and Mitigations"
- https://www.seangoedecke.com/ai-sycophancy/ — "Sycophancy is the first LLM dark pattern"
- https://www.nature.com/articles/d41586-025-03390-0 — Nature: AI chatbots are sycophants
- https://news.northeastern.edu/2026/02/23/llm-sycophancy-ai-chatbots/ — Northeastern research
- https://blockchain.news/flashnews/andrej-karpathy-unveils-llm-council-open-source-multi-llm-ensemble-via-openrouter — Flash news
- https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/ — Deep dive on Claude Skills architecture

## Actionable Takeaways
- Install am-will/llm-council via Skillstore for Claude Code to get multi-model critique on plans and code
- For code review specifically, use council-review (elevated accuracy weight, security focus)
- For CI/CD: council-gate with exit codes is the most actionable integration
- Use the "accuracy ceiling rule" principle in your own prompts: make accuracy a hard prerequisite, not just one factor among many
- Karpathy's suggestion for personal use: assemble your own council for important decisions by running the same prompt through multiple models manually and comparing
- To reduce sycophancy without a council: explicitly ask models to argue against your position, use neutral framing, give permission to reject
- OpenRouter API key required for most multi-model council implementations
- The bigger design space Karpathy hinted at (dynamic council membership, streaming critique, domain-specific chairman models) is wide open for building

## Category
AI Tools / Productivity / Dev

## Type
Actionable / Reference
