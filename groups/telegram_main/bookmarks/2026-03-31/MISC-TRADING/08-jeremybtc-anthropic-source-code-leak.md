# Anthropic Accidentally Leaked Their Entire Source Code: What Actually Happened

**Source:** https://twitter.com/Jeremybtc/status/2039077799643005198
**Author:** @Jeremybtc (Jeremy) — verified crypto/tech commentator on X, specializes in viral narrative threads
**Date:** 2026-03-31
**Category:** AI Security / Corporate AI / Claude Code
**Type:** Reference
**Engagement:** 3,686,614 views, 22,067 bookmarks, 54,199 likes, 8,735 retweets

---

## TL;DR

The most viral account of Anthropic's Claude Code source code leak — 3.7M views, 22K bookmarks, 54K likes. Jeremy's thread is vivid and well-paced but several claims are inflated or unverified. Cross-referencing against Decrypt, The Register, Hacker News, and the @PelicanAI fact-check reply (1,386 likes, 244K views) reveals what's real, what's exaggerated, and what's false. The core story is real and remarkable enough without embellishment.

---

## Key Claims (Tweet vs. Verified Reality)

| Jeremy's Claim | Verified Reality | Status |
|---|---|---|
| "Entire source code" leaked | Claude Code CLI source leaked — not model weights, not company-wide codebase | Overstated |
| "512,000 lines" | Correct: 512,000 lines across ~1,900 files | Accurate |
| "debugging file accidentally bundled" | Correct: .js.map sourcemap included due to missing .npmignore | Accurate |
| "researcher named Chaofan Shou spotted it within minutes" | Chaofan Shou (@shoucccc) posted at 4:23 AM ET; he is an intern at Solayer Labs, not a named "researcher" broadly | Substantially accurate |
| "21 million people have seen the thread" | Decrypt reported 16 million views on Chaofan Shou's thread | Inflated (16M not 21M) |
| "entire codebase downloaded, copied and mirrored before Anthropic's team woke up" | Accurate directionally | Accurate |
| "Anthropic pulled the package and started firing DMCA takedowns" | Anthropic initially used the `deprecated` flag rather than unpublishing — drew additional criticism for slow response. DMCA takedowns followed | Partially accurate (response was slower/different than implied) |
| "Korean developer named Sigrid Jin" | Correct. WSJ reporting confirms the 25 billion token figure | Accurate |
| "girlfriend was worried he'd get sued" | Color/narrative — not independently verified | Unverified |
| "rewrote the entire thing in Python from scratch before sunrise" | Correct in substance — Python clean-room rewrite | Accurate |
| "Called it claw-code" | Correct: github.com/instructkr/claw-code | Accurate |
| "A Python rewrite is a new creative work. DMCA can't touch it." | Legally plausible argument — not tested in court but standard clean-room rewrite defense | Accurate framing |
| "repo hit 30,000 stars faster than any repository in GitHub history" | Reported by Decrypt and claw-code README; not confirmed by GitHub itself. Treat as unverified marketing | Unverified |
| "It now has 49,000 stars and 56,000 forks" | At time of research: 55,800+ stars, 58,200+ forks (exceeded stated numbers) | Numbers exceeded in 24h |
| "rewriting it again in Rust" | Rust port branch confirmed and in progress | Accurate |
| "mirrored to decentralized platform, will never be taken down" | Multiple IPFS mirrors confirmed including free-code (Bookmark 7) | Accurate |
| "Anthropic built Undercover Mode specifically to stop Claude from leaking internal secrets. Then they leaked their own source code." | Undercover Mode is real (confirmed by multiple sources) but designed to prevent Claude from disclosing Anthropic's internal project names in open-source contributions — not to prevent source code leaks per se. The irony is real but the framing is imprecise. | Accurate irony, imprecise framing |

---

## Deep Dive

### How The Leak Actually Happened (Technical)

Claude Code is built on Bun (acquired by Anthropic in late 2025). Bun generates source maps by default for debugging. Claude Code version 2.1.88, pushed to the npm registry in the early hours of March 31, 2026, shipped with a 59.8 MB JavaScript source map file (`cli.js.map`). A .npmignore entry for `*.map` was missing, and the `files` field in package.json was not configured to exclude debug artifacts. The source map contained a reference to a zip archive of the original TypeScript source, hosted on Anthropic's Cloudflare R2 storage bucket — accessible to anyone who had the URL from the map file. One decompressed download later: 512,000 lines of unobfuscated TypeScript.

Anthropic confirmed: "a release packaging issue caused by human error, not a security breach." Boris Cherny, Anthropic's head of Claude Code, confirmed it was "a plain developer error."

### The Security Concern Beyond the Narrative

A detail that got less viral attention: multiple security researchers warned that users who installed Claude Code between 00:21 and 03:29 UTC on March 31, 2026 may have also received a trojanized version of the axios HTTP client library containing a cross-platform remote access trojan. This is a separate and more serious concern than the source map leak itself. Users in that window are advised to downgrade immediately and rotate all secrets.

Additionally: attackers began typosquatting npm package names related to the leak to target developers trying to compile the exposed source code.

### What Was Actually Found in the Leaked Code

**KAIROS:** Named after the Ancient Greek concept of "the right moment." Referenced 150+ times in the source. A fully built but unshipped autonomous background daemon mode — a persistent agent that monitors and acts without being explicitly invoked. Not yet shipped.

**Undercover Mode:** System prompt instruction: "Do not blow your cover." Designed to prevent Claude from disclosing Anthropic's internal project names when contributing to external/open-source repositories. A specific, narrow constraint — not a general secrecy system.

**Buddy:** A Tamagotchi-style AI pet with 18 species, rarity tiers, and stats including debugging, patience, chaos, and wisdom. Unshipped. Existence confirmed by multiple outlets including Decrypt.

**44 hidden feature flags:** Unreleased capabilities accessible via compile-time flags. free-code (Bookmark 7) enables 54 of 88 total flags.

**Multi-agent coordination logic:** Full architecture for how Claude orchestrates subagents, manages tool calls, handles permissions and OAuth.

**"Buddy" clarification:** @HypeAutopsy in the Anishmoonka thread (Bookmark 6) called this fabricated — but multiple independent outlets including Decrypt reported it from the actual code. @HypeAutopsy's claim appears to be incorrect on this specific point.

### The @PelicanAI Fact-Check (Most Valuable Reply in Thread)

@PelicanAI_ posted a detailed fact-check reply (1,386 likes, 244K views). Key corrections:
- 16M views on Chaofan Shou's thread (not 21M as claimed by Jeremy)
- The "fastest repo in GitHub history" claim is unverified — repeated by claw-code's own README and Decrypt, but no primary GitHub confirmation
- "Entire source code" is overstated: it's the Claude Code CLI/harness, not model weights or the whole company codebase
- The dramatic "before sunrise" framing around Sigrid Jin is directionally true but cinematically embellished
- Undercover Mode exists but serves a narrower purpose than Jeremy's ironic framing implies

Jeremy's reply to the fact-check: "What AI model is this" (treating the fact-check bot as an AI, with 1,335 likes). Notably he did not dispute any of the corrections.

### Broader Context: Second Leak in 13 Months

This was not Anthropic's first such incident. A similar leak occurred in February 2025. The March 2026 incident also occurred five days after a separate CMS misconfiguration exposed roughly 3,000 internal files, including details on the unreleased "Mythos" model. Two accidental disclosures in one week, for a company valued at $350 billion and reportedly considering an IPO in Q4 2026, represents a pattern of release engineering failures that goes beyond a single human error.

As one commenter noted: "Governance fails first in release engineering, not policy docs. If debug artifacts can leak internals, model risk controls are only as strong as CI/CD and audit trail discipline."

---

## Key Links

- Jeremy's tweet: https://twitter.com/Jeremybtc/status/2039077799643005198
- @PelicanAI fact-check reply: https://twitter.com/PelicanAI_/status/2039097858721276067
- Decrypt (primary coverage): https://decrypt.co/362917/anthropic-accidentally-leaked-claude-code-source-internet-keeping-forever
- The Register: https://www.theregister.com/2026/03/31/anthropic_claude_code_source_code/
- The Hacker News: https://thehackernews.com/2026/04/claude-code-tleaked-via-npm-packaging.html
- Layer5 technical writeup: https://layer5.io/blog/engineering/the-claude-code-source-leak-512000-lines-a-missing-npmignore-and-the-fastest-growing-repo-in-github-history/
- claudefa.st full mechanics: https://claudefa.st/blog/guide/mechanics/claude-code-source-leak
- claw-code (Sigrid Jin): https://github.com/instructkr/claw-code
- free-code (paoloanzn): https://github.com/paoloanzn/free-code
- Yahoo Finance IPO implications: https://finance.yahoo.com/sectors/technology/articles/claude-code-512-000-line-062237118.html

---

## Actionable Takeaways

1. If you installed Claude Code on March 31, 2026 between 00:21-03:29 UTC: downgrade immediately, rotate all secrets stored in or accessible from that environment. The axios trojan concern is serious and distinct from the source map story.
2. The KAIROS feature (background daemon agent) is what to watch for in future Claude Code releases — it's already built.
3. The 44 (or 88 total) feature flags tell you what Anthropic is working on. Read the claudefa.st mechanics post for the full flag list.
4. For release engineering: the missing .npmignore lesson is simple. Add a mandatory CI check that verifies no .map or debug files are included in the published package before pushing to npm.
5. The @PelicanAI reply is the model for how to handle viral tech misinformation — measured, specific corrections with receipts. 244K views on a reply correcting a 3.7M-view post.
6. The "clean-room rewrite" legal defense for claw-code is worth understanding if you're building on leaked source — it's the difference between copyright infringement and independent creation.

---

## Connections

- This tweet is the narrative anchor for Bookmarks 6 (Anishmoonka) and 7 (free-code) — both respond directly to this event
- The KAIROS autonomous daemon is the infrastructure Block's AI coordination model (Bookmark 2) would need to run at scale
- Undercover Mode is a concrete example of constraint-first prompting (Bookmark 6) — a specific, bounded behavioral constraint with a clear trigger
- The release engineering failure is the same failure mode as the Garry Tan website audit (Bookmark 1): AI-accelerated development without process governance produces unexpected artifacts in production
- The IPO timing pressure ($350B valuation, Q4 2026 target) makes this operationally significant beyond the tech story
