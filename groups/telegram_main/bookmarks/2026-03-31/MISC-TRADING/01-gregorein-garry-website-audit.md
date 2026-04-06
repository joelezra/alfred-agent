# Garry Tan Website Audit: 78,400 Lines of AI Slop in Production

**Source:** https://twitter.com/Gregorein/status/2038953944475472316
**Author:** @Gregorein — verified developer, self-reported 2.5B tokens in Cursor in 2023 alone
**Date:** 2026-03-31
**Category:** AI Code Quality / Tech Criticism
**Type:** Reference / Actionable
**Engagement:** 2.44M views, 2,867 bookmarks, 7,289 likes, 585 retweets (on the opening tweet)

---

## TL;DR

After Garry Tan (President of Y Combinator) publicly bragged about writing 37,000 lines of code per day and maintaining a 72-day shipping streak on garryslist.org, developer @Gregorein did a pure client-side HAR audit. The homepage downloads 6.42 MB across 169 requests — 562x heavier than Hacker News (YC's own product), which runs on 7 requests and 12 KB. A follow-up tweet reveals the Garry vs. a 17-year-old side story: Garry called a teenager (@xiaonweb) a "clout farmer" when they pointed out that bragging about LOC is silly — the same teenager had built a full browser engine in Rust at 17.

---

## Key Claims (All from HAR file, client-side only)

- 6.42 MB downloaded across 169 requests on a single homepage load for a newsletter/blog site
- 28 TEST FILES shipped to every visitor — actual test harnesses (not results), all returning HTTP 200 and actively downloaded. 300 KB of test code.
- 78 Stimulus controllers shipped, including AI image generation, voice extraction, video generation, radar charts, draft review, lab evaluation — and the literal Rails Hello World scaffold (`hello_controller.js`, 157 bytes). None used on the homepage.
- The same bear logo downloaded 8 times: 3 PNG copies, 2 WebP variants, 2 AVIF variants, 1 512x512 favicon. One AVIF is 0 bytes — a failed image conversion deployed to production. Total logo bandwidth: 654 KB.
- Two article images served as raw uncompressed PNGs: 2.07 MB + 1.99 MB = ~4 MB. Browser explicitly sends `Accept: image/avif, image/webp`; server ignores it. With WebP they'd be 200-400 KB combined.
- 520 KB Trix rich text editor loaded on a read-only homepage — a backend CMS spillover.
- 47 images with empty `alt=""` on a site describing itself as civic engagement.
- Full page content rendered TWICE in the DOM (mobile + desktop versions both present).
- Duplicate `<title>` tags in `<head>`.
- An empty CSS file (just a manifest comment, content-hashed and served).
- PostHog analytics proxied through `/s/` — source code comment literally reads: `// Load SDK from our proxy (bypasses ad blockers)`. A 501(c)(4) civic nonprofit tracking users while actively circumventing privacy tools.
- After the audit went viral, the website went down for half a day.

---

## Deep Dive

### Who Is Garry Tan?

Garry Tan is the President and CEO of Y Combinator, the world's most influential startup accelerator (Airbnb, Stripe, Dropbox, Coinbase, etc.). Before YC he was one of the first engineers at Palantir, co-founded Posterous (acquired by Twitter), and built YC's internal social network Bookface. He is vocal on X about AI-accelerated development.

His LOC claims have escalated over time:
- Earlier: 10,000 LOC/day using gstack + Claude Code
- March 2026 tweet: "Absolutely insane week for agentic engineering 37K LOC per day across 5 projects. Still speeding up."
- His gstack tool uses 15-23 specialist Claude Code "slash commands" — CEO, Eng Manager, Designer, QA, Security Officer, etc. Open-sourced under MIT.
- He orchestrates via Conductor: 15 parallel sessions simultaneously.
- A 7-day `/retro` showed 140,751 lines added, 362 commits, 35% test code.

### garryslist.org

GarrysList.org is a 501(c)(4) nonprofit "civic engagement organization" Garry Tan founded in early 2026 for voter education and advocacy (pro-growth tech/housing policy in California). It is the site that was audited. It is built in Rails with Stimulus controllers and uses PostHog for analytics.

### The @xiaonweb Incident

When 17-year-old developer @xiaonweb politely pointed out that bragging about lines of code as a metric is misguided, Garry Tan publicly called them a "clout farmer" on main. The teenager's actual work: a browser engine in Rust, including HTML tokenizer, CSS cascade, box model layout, GPU renderer via wgpu — with a published technical breakdown demonstrating understanding of web internals that Gregorein describes as deeper than most senior engineers. Garry Tan is the president of a multi-billion-dollar startup kingmaker with 113 Claude sessions per week (per Gregorein's framing). He punched down at a teenager. This was the most-boosted follow-up tweet in the thread (2,633 likes, 303 bookmarks, 196K views).

### The Core Argument

Gregorein states explicitly: "AI amplifies whatever process you feed it — including no process at all." The automated agents did exactly what they were told; nobody told them to stop. He compares it to a Duolingo streak for `git push`. Crucially, Gregorein notes this was a client-side audit only — he didn't read a single line of source code. The HAR file doesn't lie.

A defender (@mattmireles) argued: "He runs YC. He's very busy. AI is letting him ship things he simply could not without it. Does it work? Yes." Gregorein's reply: "You realise his website went down half a day ago?"

### Verification Status

- All claims are based on HAR file analysis — objectively verifiable by anyone who visits the site and opens Network tab. Cannot be disputed.
- The 37,000 LOC/day claim is directly from Garry Tan's own X post (tweet ID 2038555792052506941): "Absolutely insane week for agentic engineering 37K LOC per day across 5 projects. Still speeding up."
- The 72-day shipping streak claim is from Garry Tan's own posts.
- The test file download and 0-byte AVIF are confirmed by screenshot evidence in thread.
- garryslist.org site being down is unverified (claimed by Gregorein in reply, unconfirmed independently).

---

## Key Links

- Tweet thread: https://twitter.com/Gregorein/status/2038953944475472316
- GarrysList.org: http://garryslist.org
- Garry Tan's gstack: https://github.com/garrytan/gstack
- Garry Tan's 37K LOC tweet: https://x.com/garrytan/status/2038555792052506941
- Garry Tan's 17K LOC tweet: https://x.com/garrytan/status/2033306615966060734
- TechCrunch on gstack controversy: https://techcrunch.com/2026/03/17/why-garry-tans-claude-code-setup-has-gotten-so-much-love-and-hate/
- Hacker News on gstack: https://news.ycombinator.com/item?id=47418576

---

## Actionable Takeaways

1. LOC-per-day is a vanity metric — always. AI makes this worse, not better, because the cost per line approaches zero while the maintenance burden does not.
2. Shipping streaks without code review are a Duolingo streak for git push. The metric is the act, not the outcome.
3. Do a HAR audit of your own projects before claiming productivity wins. Check: test file leakage, unused asset bundles, image format negotiation, duplicate DOM renders.
4. AI slop detection needs to be explicitly designed in — gstack itself includes an AI slop detector role (the "Designer"). The irony is that it's in the toolkit but clearly not running effectively.
5. PostHog proxy to bypass ad blockers in a nonprofit context is an ethical red flag worth examining in any codebase.
6. The promotion pipeline matters: code review, asset pipeline hygiene, image optimization. These cannot be AI-generated away.

---

## Connections

- Connects to the Claude Code leak (Bookmark 8): both are about what happens when AI code generation is not governed by review process
- Connects to free-code (Bookmark 7): Garry used 113 Claude sessions/week per Gregorein; free-code unlocks experimental features
- The xiaonweb story is a useful counterpoint to the Anthropic/Block AI narrative — a 17-year-old doing deep systems work, manually, while being called a clout farmer by the establishment
- Context for PawelHuryn's CLAUDE.md quality gate (Bookmark 4): quality gates exist precisely because agents confidently claim their work is done even when it isn't
