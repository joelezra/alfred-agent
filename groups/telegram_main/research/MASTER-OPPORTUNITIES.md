# Master Opportunity Scorecard
**Date:** 2026-03-28
**Constraint:** Organic distribution only. Solo build or tiny team. Laptop entrepreneurs in US/EU/AU markets.
**Research covers:** 6 software categories + organic distribution playbook

---

## Scoring Key

Each opportunity scored 1-5 on five dimensions:

| Dimension | What it measures |
|---|---|
| **Market Pain** | How loud and validated the complaints are (Reddit, G2, Trustpilot, pricing scandals) |
| **Gap Clarity** | How obvious the winning product spec is — can you describe it in one sentence? |
| **Distribution Ease** | How reachable the audience is organically (subreddit sizes, TikTok hooks, switching events) |
| **Build Complexity** | How hard is the MVP to build solo? (1 = easy, 5 = very complex) — LOWER is better |
| **Revenue Ceiling** | Can this realistically reach $10K-$100K MRR? |

**Total = sum of first 4 dimensions + Revenue Ceiling. Max 25.**

---

## Ranked Scorecard

| Rank | Category | Market Pain | Gap Clarity | Distribution | Build (lower=better) | Revenue Ceiling | **TOTAL** |
|---|---|---|---|---|---|---|---|
| 🥇 1 | **Email Marketing** | 5 | 5 | 5 | 3 | 5 | **23** |
| 🥈 2 | **Analytics** | 4 | 5 | 4 | 2 | 4 | **19** |
| 🥉 3 | **SEO Tools** | 4 | 4 | 4 | 3 | 4 | **19** |
| 4 | **Social Media Tools** | 4 | 4 | 4 | 3 | 4 | **19** |
| 5 | **Design Tools** | 5 | 3 | 4 | 4 | 5 | **21** |
| 6 | **Project Management** | 3 | 4 | 4 | 2 | 3 | **16** |

*(Design tools scored higher on pain and ceiling but lower on gap clarity and build complexity — explained below)*

---

## #1 — Email Marketing ($15-29/mo Klaviyo replacement for Shopify)

**The trigger event:** Klaviyo switched billing from "emails sent" → "active profiles" in Feb 2025. Users went from $39/mo → $200+/mo overnight with zero list growth. Third price hike in four years. "Active profiles" includes unsubscribed contacts, bots, unconfirmed signups — you pay for ALL of them. 90-day suppression jail means you can't escape tier jumps. Trustpilot quote: *"Klaviyo's pricing policy is unethical and exploitative."*

**The user:** Shopify store, $200K-$800K/yr revenue, 3,000 email subscribers. Weekly pain: "Why is my Klaviyo bill $180 when I only emailed 2,000 people?"

**What 80% of users need (5 flows = 30-50% of email revenue):**
1. Welcome series (2-3 emails)
2. Abandoned cart recovery ($3.45/recipient avg)
3. Post-purchase + review request
4. Browse abandonment
5. Win-back campaign

**What they pay for but never use:** Predictive AI, CDP, multi-variate A/B, WhatsApp marketing, Facebook lookalike sync, 100+ automation templates

**The winning spec:** Native Shopify integration + 5 pre-built flows + weekly newsletter builder + buyer/non-buyer segmentation + charge by emails SENT (not passive profiles)
- Tier 1: $15/mo — 2,500 contacts / 25,000 sends
- Tier 2: $29/mo — 10,000 contacts / 100,000 sends
- Free Klaviyo migration tool = zero-friction switch

**Distribution:**
- Reddit: r/shopify (327K), r/ecommerce (800K) — "Klaviyo billing horror" posts go viral here constantly
- TikTok: "I replaced $180/mo Klaviyo with this $15/mo tool" — exact format, revenue reveal (Shopify dashboard screenshot) performs best
- Facebook groups: Shopify Entrepreneurs (100K), Ecom Empires (104K)
- Product Hunt: launch during next Klaviyo price hike news cycle

**Revenue ceiling:** Every Shopify store needs this. 500K+ active Shopify stores in US alone. Even 0.1% = 500 customers × $20 avg = $10K MRR from day one community.

**Existing closest alternative:** Omnisend ($16/mo, $68 ROI per $1 spent) — but weak brand awareness and poor TikTok presence. MailerLite raising rates Sep 2025 = additional displacement.

---

## #2 — Analytics ($9-19/mo GA4 replacement for indie hackers)

**The core problem:** GA4 is technically free but practically broken:
- 48-hour data delay — you can't see what happened yesterday until tomorrow
- 58% of tech users block Google Analytics (Plausible's own research)
- 75%+ of SEOs rated themselves "not happy" with GA4
- Finding traffic sources required a 1,400-word tutorial
- UA historical data deleted Jan 1, 2024 — years of data gone overnight
- GDPR violations ruled in 7 EU countries

**The user:** Indie hacker, 1-2 products, $0-$5K MRR. Checks analytics every morning, 5 min max. Wants: visitor count, top sources, signups — one screen, real-time. Pays $9-19/mo sweet spot.

**What they check daily (4 things, nothing else):**
1. Visitor count
2. Top traffic sources
3. Top pages
4. Signups/conversions

**The perfect spec (doesn't fully exist yet):**
- Cookieless web analytics (no GDPR, no ad-blocker blind spots)
- Stripe MRR integration (see revenue alongside traffic)
- Simple funnel (visitor → trial → paid)
- 5-minute setup (drop a script tag, done)
- Real-time data (not 48-hour delay)
- Daily email digest

**Why this gap exists:** Plausible does analytics but no revenue integration. PostHog has pieces but moving upmarket ($1.4B valuation). Nobody combined all three simply.

**Distribution:**
- Hacker News: Plausible's HN launch = 48K visitors in one week. Show HN posts about privacy-first tools get massive traction.
- Twitter Build-in-Public: document the build, show the dashboard growing
- Reddit: r/indiehackers, r/SaaS
- SEO: "GA4 alternative" — proven high-volume search

**Revenue ceiling:** 12K+ subscribers paying for Plausible at $3.1M ARR with 8 employees. Simple Analytics at $813K ARR with 2 employees. The bootstrapped proof is there.

**Build complexity score (2/5 = easy):** Cookieless tracking script is a known architecture. SQLite + a single-page dashboard MVP can ship in days.

---

## #3 — SEO Tools ($19-29/mo Ahrefs alternative for bloggers)

**The trigger event:** Ahrefs introduced credit system in Oct 2024. Bills became unpredictable. Victoria Kurichenko (SEO blogger with 100K+ following): "I stopped using Ahrefs Lite when they introduced the credit system — can't predict monthly cost." Data inflation: Ahrefs showed 65,000 visits for her site; GA showed 7,000 — 9x discrepancy. Daily rank tracking requires "Project Boost Max" at $99-199/mo ON TOP of base plan.

**The user ("Jake"):** Niche site builder, 25-42, earns $500-$5,000/mo blogging. Uses 20% of Ahrefs features. Sweet spot: $19-29/mo. Core want: "I just need to check if a keyword is worth writing about before I spend 4 hours on an article."

**What they use every single day:**
1. Keyword difficulty checker (every post)
2. Rank tracker (50-200 keywords)
3. Competitor top pages (occasional)
4. Basic backlink check (occasional)

**What they never touch:** Site audit, API, content gap at scale, PPC data, social integrations, white-label reporting

**The gap:** No modern, well-designed, focused keyword research tool at $19-29/mo targeting bloggers specifically.
- KeySearch has the price ($17-24/mo, 10K+ users) but a dated interface
- Mangools has the polish ($27-36/mo) but no community presence
- Ahrefs' hidden $29/mo Starter plan is their defensive move — very limited

**Distribution:**
- r/juststart (167K members — HIGHEST SIGNAL for niche site builders)
- TikTok: "I cancelled my $99/mo Ahrefs and replaced it with a $17/mo tool" — proven hook
- YouTube SEO: "Ahrefs alternative for bloggers" is a proven high-traffic search query
- AppSumo lifetime deal: blogger community specifically hunts lifetime deals

---

## #4 — Social Media Tools ($19-29/mo for solopreneurs)

**The pain:**
- Hootsuite: eliminated free plan + raised prices 40%+. Trustpilot 1.8/5 from 511 reviews. No true TikTok direct publishing.
- Sprout Social: $199/user/mo for basic scheduling. Teams share credentials to avoid per-seat cost.
- Later: forced users from $18/mo → $25/account (250% overnight increase).

**The user ("Sarah"):** Freelance social media manager or solopreneur. 2-4 platforms (Instagram, TikTok, LinkedIn, X). Batch-schedules a week of posts Monday morning. Checks analytics once or twice a week. Feature utilization: 15-25% of available features.

**The specific unmet gap:** Smart brand-voice-trained AI captions + true TikTok direct publishing + per-account timing data — all under $25/mo. No tool has nailed all three simultaneously at this price point.

**The proof:** Metricool hit $17M ARR with ZERO paid ads — pure freemium + content marketing (3-4M blog visits/month). 114% YoY growth. This market rewards well-positioned entrants.

**Distribution:**
- Reddit: r/entrepreneur (5.1M), r/smallbusiness (2.2M), r/socialmedia (2.1M)
- TikTok: "My $99/mo Hootsuite vs my $19/mo tool" — before/after format
- YouTube SEO: "Best social media tool 2026" — goldmine keyword
- Freemium moat: Metricool proved it

---

## #5 — Design Tools ($19-29/mo for solo creators)

**The pain:** Adobe Creative Cloud's FTC lawsuit (hidden 50% ETF) drove massive brand damage in 2024-2025. Price hike to $69.99/mo billed monthly. Australian users saw +68% price increase. CapCut US ban (Jan 2025) created a 323M MAU vacuum. Canva Teams 300%+ price hike.

**The gap:** No single tool covers the full weekly workflow of a solo creator at $15-29/mo:
- Thumbnail design + photo manipulation
- Short-form video editing with auto-captions (CapCut vacuum)
- Brand kit flowing across video + graphics + email
- Multi-format resize in one click

**Why ranked lower despite high pain:** The gap is real but the product scope is broader (harder to build a good video editor than a rank tracker). Also more competitors (DaVinci Resolve free, Affinity free, CapCut returning via workarounds) create a messier landscape.

**The opportunity angle:** Position specifically for the CapCut replacement in the creator economy. Short-form video editor + thumbnail maker + brand kit. Skip the full Adobe-replacement ambition.

---

## #6 — Project Management ($9-15/mo for freelancers)

**The pain:** ClickUp surprise billings ($150/mo → $1,200/mo overnight), Notion setup complexity, HoneyBook raising to $36-59/mo.

**What solo freelancers need (5 jobs):**
1. Track tasks across 3-6 clients
2. Log time per task
3. Bill from logged time
4. Share progress with client (portal)
5. Get paid

**Why ranked last:** Market is crowded (Bonsai, Plutio, HoneyBook, Basecamp), pain is moderate (not a mass exodus event), and existing tools like Notion + Toggl combo are "good enough" for most freelancers. Revenue ceiling lower — freelancers are price-sensitive and churn-prone.

---

## The Prioritized Action Plan

### Phase 1: Fastest to Revenue (Pick One)

**Best first bet: Analytics tool**
- Smallest build (script tag + dashboard + Stripe integration)
- Fastest to ship a credible MVP (1-2 weeks)
- Hacker News launch strategy is proven (Plausible: 48K visitors in one week)
- $9-19/mo pricing = near-zero friction to try
- Clear positioning: "GA4 replacement for indie hackers — real-time, cookieless, Stripe integrated"

**Alternative first bet: SEO tool**
- Market is proven (KeySearch 10K users at $17/mo)
- Well-understood data sources (Google Search Console API, common crawl)
- Clear distribution in r/juststart community
- Can launch with keyword research only (rank tracker in v2)

### Phase 2: Highest Revenue Ceiling (After Proving Distribution)

**Email marketing for Shopify**
- Highest dollar value per customer ($15-29/mo, sticks long-term)
- Klaviyo billing scandal created the switching event — but building the Shopify integration is technically heavier
- Perfect second product after proving distribution with analytics or SEO tool

### Phase 3: Scale Play

**Social media tools**
- Metricool's $17M ARR proves this market rewards good execution
- Build only after having a distribution engine running (Reddit + TikTok + content marketing)
- The freemium model requires volume — need organic channels established first

---

## Cross-Cutting Organic Distribution Priority

Regardless of product chosen, this is the playbook (from the distribution research):

1. **Reddit comment strategy first** — 5 thoughtful comments/day in problem threads (not your own posts). 70/30: answer thoroughly, mention product naturally. Gets 10-20 signups/day within 2-4 weeks without a viral event.
2. **One viral Reddit post** — r/InternetIsBeautiful or niche-specific sub (r/juststart, r/shopify, r/indiehackers). Title: "I made a thing that does X" — NOT "Our platform leverages AI to..."
3. **TikTok faceless demos** — 3x/week, screen recordings, 27-35 seconds, show the RESULT first. Lead with the after state.
4. **Build in public on X** — specific numbers ("$413 MRR" gets 30-50 comments; "making progress" gets nothing). Failure stories outperform success stories.
5. **Product Hunt** — one-time credibility spike only. Reality: Indie Hackers converts at 23.1% vs PH's 3.1%.
6. **SEO** — long-term compounding. Start with "[X] alternative" keywords.

**Fastest path to first paying user:** Reddit comment strategy (5/day in problem threads) + free tier with zero friction = 10-20 signups/day within weeks, no viral event required.

---

## Research Files Index

| File | Contents |
|---|---|
| `market-research/email-marketing-tools.md` | Klaviyo billing scandal, Shopify email gap, winning spec |
| `market-research/analytics-tools.md` | GA4 exodus, Plausible proof, indie hacker persona |
| `market-research/seo-tools.md` | Ahrefs credit system, KeySearch proof, blogger persona |
| `market-research/social-media-tools.md` | Hootsuite/Sprout pricing, Metricool $17M ARR proof |
| `market-research/design-tools.md` | Adobe FTC lawsuit, CapCut vacuum, creator persona |
| `market-research/project-management-tools.md` | Freelancer PM gap, HoneyBook displacement |
| `distribution/organic-tiktok-reels-playbook.md` | Full organic playbook with real numbers (Jenni AI, Formula Bot, Tactiq) |
| `market-research/feedback-roadmap-tools.md` | Canny $400/mo, killed free plan Dec 2025, Featurebase/Frill gaining |
| `market-research/screen-recording-tools.md` | Loom/Atlassian 100x price shock, Cap 10K GitHub stars, Tella YC-backed |
| `market-research/testimonial-social-proof-tools.md` | Senja $1M ARR 2-person team, $9-19/mo tier wide open |
| `market-research/helpdesk-livechat-tools.md` | Intercom $0.99/AI resolution, Crisp 300K businesses bootstrapped |
| `market-research/course-digital-product-platforms.md` | Gumroad 10% flat, Stan Store 949% YoY growth at $29/mo 0% fees |

---

## Round 2 Scorecard — Simpler Builds, Less Entrenched

*Criteria: solo-buildable MVP, not enterprise, strong organic distribution, validated demand*

| Rank | Category | Market Pain | Gap Clarity | Distribution | Build (lower=better) | Revenue Ceiling | **TOTAL** |
|---|---|---|---|---|---|---|---|
| 🥇 1 | **Testimonial & Social Proof** | 4 | 5 | 5 | 1 | 4 | **19** |
| 🥈 2 | **Feedback & Roadmap Tools** | 5 | 5 | 4 | 2 | 4 | **20** |
| 🥉 3 | **Screen Recording / Async Video** | 5 | 4 | 5 | 3 | 4 | **21** |
| 4 | **Course & Digital Products** | 5 | 4 | 5 | 3 | 5 | **22** |
| 5 | **Live Chat / Helpdesk** | 4 | 4 | 4 | 3 | 4 | **19** |

### Standout findings

**Testimonial tools — easiest possible build:** Senja hit $1M ARR with 2 people. The widget itself drives acquisition ("Powered by X" on every embed). $9-19/mo tier is nearly uncontested. Form + embed widget + import connectors = that's the entire MVP.

**Feedback/roadmap — active migration wave RIGHT NOW:** Canny killed their free plan December 2025. Thousands of indie founders are actively searching for alternatives this month. Featurebase already used by Lovable, Raycast, n8n. Winning unlock: flat pricing, no "tracked user" growth tax.

**Screen recording — clear villain, ready narrative:** Atlassian paid $975M for Loom, killed the free tier, some orgs went from $0 to $24,000/yr. "Atlassian ruined Loom" is pre-written viral content. Cap (open source, 10K GitHub stars) and Tella (YC-backed, $2.1M seed) already validating the gap.

**Course/digital products — math does the selling:** "At $5,000/mo in sales, Gumroad takes $500. We take $29." Stan Store proved this at 949% YoY growth, 300K customers, $29/mo flat. Kajabi just had its first price hike in a decade — displacement timing is ideal.

**Live chat — Intercom's AI billing is the new Klaviyo:** Per-AI-resolution pricing means growth punishes you. One Reddit case: $4,000 → $9,000/mo in a month. Crisp proved 300K businesses at this price point, but they keep raising prices.
