# free-code: Claude Code Recompiled — Telemetry Stripped, Guardrails Removed, Experimental Features Unlocked

**Source:** https://twitter.com/paoloanzn/status/2039022418698907949
**GitHub:** https://github.com/paoloanzn/free-code
**Author:** @paoloanzn (4nzn / Paolo Anzn) — verified developer on X, built free-code using Claude Code and Codex
**Date:** 2026-03-31
**Category:** Claude Code / Open Source / Developer Tools
**Type:** Actionable / Reference
**Engagement:** 1,070,949 views, 5,643 bookmarks, 5,762 likes, 430 retweets

---

## TL;DR

Within hours of the Anthropic Claude Code source code leak (npm package 2.1.88, March 31, 2026), developer @paoloanzn rebuilt and recompiled the full Claude Code source with three modifications: all telemetry stripped, all security guardrail prompts removed, and all experimental features enabled. Uploaded to GitHub and also to IPFS for DMCA resilience. The project has 4.8K stars and 1.3K forks. This is a DIFFERENT tweet from ID 2039022430661063060 (which just links to GitHub) — this one contains the full announcement text.

---

## Key Claims

- "Claude Code source code fully recompiled, telemetry stripped, security guardrails prompts stripped, all working experimental features enabled"
- Claims to have rebuilt the full build pipeline — meaning the code can be modified and rebuilt (not just a binary distribution)
- Includes "ultraplan mode" — described as a new async agentic planning mode where Claude starts a multi-agent research session in the browser lasting between 10 and 30 minutes
- Uploaded to IPFS (actually decentralized storage, not blockchain — author corrected this in replies) for DMCA resilience
- Uploaded to GitHub: https://github.com/paoloanzn/free-code
- Note from author: "some experimental features are not FULLY working yet, still working on those"
- Built using "both Claude Code and Codex tbh" (confirmed in replies)
- Language: TypeScript (the original Claude Code language); build pipeline reconstructed

---

## Deep Dive

### What free-code Actually Does (from verified GitHub README)

Three main modifications to upstream Claude Code:

**1. Telemetry Removal:**
- Disables OpenTelemetry
- Disables GrowthBook analytics
- Disables Sentry error reporting
- Disables custom event logging
- Claims all outbound data collection is "dead-code-eliminated or stubbed"

**2. Security Prompt Modification:**
- Strips system-level instructions that "constrain Claude's behavior beyond what the model itself enforces"
- Removes hardcoded refusal patterns
- Removes server-pushed overlays
- Note: This is distinct from model-level safety — these are prompt-level constraints in the CLI harness, not RLHF/Constitutional AI in the model weights

**3. Feature Unlocking:**
- Enables 54 of 88 compile-time feature flags that are disabled in the public npm release
- Supported providers: Anthropic, OpenAI Codex, AWS Bedrock, Google Vertex AI, Anthropic Foundry
- Voice input, deep thinking mode, agent systems, memory extraction
- Interactive REPL and one-shot execution modes

**Ultraplan Mode (highlighted feature):**
- Async agentic planning mode
- Claude starts a multi-agent research session in the browser
- Session duration: 10-30 minutes
- Described as a new modality beyond standard REPL usage
- Status: partially working per author's own note

**GitHub metrics at time of research:**
- Stars: 4.8K
- Forks: 1.3K
- Issues: 1 open
- Commits: 49
- Disclaimer in README: "The original Claude Code source is the property of Anthropic. This fork exists because the source was publicly exposed through their npm distribution."

### Key Clarifications from Replies

**On "free" meaning:**
User @leakerpro90 assumed "free" meant free API access and was disappointed when API credits were still required. @paoloanzn responded with a link to the GNU definition of free software (gnu.org/philosophy/free-sw.html) — "free as in freedom, not free as in beer." The CLI harness is free; you still need your own Anthropic API key.

**On API key risk:**
User @shirtwascash warned: "Adding your Anthropic key to this will 100% get your account banned within a week, only usable to turn into a non-Claude CLI." @paoloanzn responded: "Not true. This signs requests 1:1 with the original client (since it is). If you don't want to risk too much, use the standard build and not the one with the experimental features enabled."

**On OpenRouter/other models:**
User asked if other providers (OpenRouter, non-Anthropic models) could be used. @paoloanzn: "I've rebuilt the full build pipeline — meaning you can easily modify the code as you want and just rebuild." So it's configurable if you're willing to modify the source.

**On IPFS/blockchain:**
User @paradigm_broken corrected "blockchain" → @paoloanzn: "decentralized. SORRY I WAS IN RUSH OK?!" Uploaded to IPFS (InterPlanetary File System) — a content-addressed decentralized storage system, not a blockchain.

**On security (axios vulnerability):**
User asked about known axios vulnerability. @paoloanzn: "nope. the version of the lib is safe."

### Important Caveats and Risks

1. **Legal exposure:** Using leaked proprietary source code is legally murky even if the source was accidentally made public. Anthropic retains copyright. This is different from claw-code (which is a clean-room Python rewrite from scratch).

2. **API key risk is real:** Despite @paoloanzn's confidence, using a modified client that enables undocumented experimental features with your Anthropic API key is a ToS risk. Anthropic can detect unusual API usage patterns. Risk level: LOW for standard build, MEDIUM-HIGH for experimental feature build.

3. **Feature completeness:** Author explicitly stated "some experimental features are not FULLY working yet." Ultraplan mode in particular is described as in-progress.

4. **DMCA status:** Anthropic has issued DMCA takedowns against mirrors of the original leaked source. The GitHub repo may face takedown. IPFS backup exists but is harder to navigate.

5. **Relationship to claw-code (Sigrid Jin):** free-code is a recompile of the original TypeScript source. claw-code (instructkr/claw-code) is a clean-room Python rewrite — legally cleaner but architecturally different.

### Comparison: free-code vs. claw-code

| | free-code | claw-code |
|---|---|---|
| Language | TypeScript (original) | Python rewrite |
| Legal status | Murky (uses leaked source) | Cleaner (clean-room) |
| Stars | 4.8K | 55K+ |
| Maintainer | @paoloanzn | Sigrid Jin (@instructkr) |
| Build pipeline | Fully rebuilt, modifiable | Separate architecture |
| Experimental features | 54/88 unlocked | Equivalent Python |
| Telemetry | Stripped | N/A |

---

## Key Links

- Tweet (this ID): https://twitter.com/paoloanzn/status/2039022418698907949
- Tweet with GitHub link: https://twitter.com/paoloanzn/status/2039022430661063060
- GitHub: https://github.com/paoloanzn/free-code
- GNU Free Software definition: https://www.gnu.org/philosophy/free-sw.html
- Related: claw-code (clean-room Python rewrite): https://github.com/instructkr/claw-code

---

## Actionable Takeaways

1. If you want experimental Claude Code features without legal exposure, claw-code (Python) is the safer option. free-code is closer to the original but legally riskier.
2. The standard build (no experimental features) is the safest use case — telemetry-stripped Claude Code with your own API key. Lowest risk profile.
3. Do NOT use the experimental feature build with a production Anthropic API key. Use a separate API key created for testing if you want to experiment.
4. The 54 unlocked feature flags are worth reading even if you don't use free-code — they reveal what Anthropic is building next (combined with the broader leak analysis from Bookmarks 6 and 8).
5. Build pipeline reconstruction is the genuinely useful part: fork, modify to add OpenRouter or other model support, rebuild. The author confirmed this works.
6. Ultraplan mode (10-30 minute multi-agent browser session) is the feature to watch — if it works as described, it's closer to a full autonomous agent than the current REPL model.

---

## Connections

- This is Tweet ID 2039022418698907949 — different from 2039022430661063060 (the companion tweet that just links to GitHub). The announcement tweet is this one.
- Directly spawned by the leak described in Bookmark 8 (Jeremybtc) and analyzed in Bookmark 6 (Anishmoonka)
- The guardrails that free-code strips are the exact constraints that Anishmoonka's three-layer framework advocates keeping (Bookmark 6) — interesting tension
- The 54 unlocked feature flags correspond to the experimental features mentioned in the awesome-claude-code ecosystem (Bookmark 5)
- Telemetry stripping is relevant to any privacy-conscious developer running Claude Code on sensitive codebases
