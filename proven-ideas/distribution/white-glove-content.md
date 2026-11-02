# White Glove Content: distribution study
Checked revenue (Jul→Aug→Sep→Oct 2026): $45,918 → $57,379 → $68,310 → $68,479 · Done-for-you faceless YouTube/Shorts channels (scripts, AI voice, edit, thumbnails, auto-posting) on subscription · $54 / $124 / $284 per month (long-form $77–314, multi-channel $86–354), $0 setup, month-to-month

## Main channel(s)
1. **Paid social (Meta/Instagram first, then TikTok) to dedicated `/go/*` ad landing pages**, pitched as a "passive AdSense income" side hustle. Confidence: **medium-high**.
2. **Google Search ads** on high-intent "faceless YouTube service" queries. Confidence: **medium**.
Supporting: a new affiliate "Partner Network" and refer-a-friend program (Sep–Oct 2026), and SEO/AI-search pages (mostly Oct 2026, too new to explain the curve).

## Evidence
- The homepage declares **7 ad pixels**: Meta `2124510371799881`, TikTok, Snap, X, Reddit, Google Ads `AW-18180496174`, and an **OpenAI/ChatGPT ads pixel** (https://www.whiteglovecontent.com/, page source `window.__WGC_*_PIXEL_ID__`).
- The JS bundle has a full ad-attribution stack. It captures gclid/fbclid/ttclid/UTMs, stores a landing-page variant (`wgc_lp_variant_v1`), and has an admin `/admin/attribution` view. Source labels include "Meta (FB/IG)", "TikTok", "Google", "OpenAI / ChatGPT", "AI search & agents", "Affiliate".
- Ad landing pages: `/go`, `/go/longform`, `/go/money`, `/go/price`, `/go/friend`, `/go/watermark`, `/go/non-watermark`, `/go/overlay`. Each variant config lists its intended channels, e.g. `/go` → `["meta","tiktok","google"]` and `/go/longform` → `["google","meta","tiktok"]`. That's a creative/LP split-test setup, not organic.
- Organic social is negligible: TikTok @whiteglovecontent **53 followers, 33 videos, 842 likes**; YouTube @WhiteGloveContent **31 subscribers**. So the IG/TikTok reach has to come from paid placements.
- A Trustpilot reviewer says "came across this company on **instagram**". Only 5 reviews, 3.0★, all unprompted. 2 of the reviews are 1★ ("image slideshows", "waste of money") (https://www.trustpilot.com/review/whiteglovecontent.com).
- Economics fit paid acquisition. TrustMRR shows **15,058 visitors/30d, $4.34 revenue per visitor**, 516 active subs, MRR $62.8k, **65% profit margin**, and lists Meta Ads spend as a tracked (login-only) metric (https://trustmrr.com/startup/white-glove-content).
- **Partner Network** terms published Sep 11 2026. Customer gets 15% off the first invoice. Associates earn 15% of the first payment + 5% recurring for 12 months. "Certified Growth" (15 customers in 30 days) earns 18% + 8%; "Strategic Agency" earns 20% + 10%. Last-click attribution, 90-day window (https://www.whiteglovecontent.com/partner-terms, bundle config).
- Refer-a-friend (v2026-10-07): friend gets 20% off, referrer gets 20% of plan price as bill credit, capped at $100 and 5 friends per year (https://www.whiteglovecontent.com/referral-terms).
- SEO/GEO: 99 sitemap URLs (28 blog, 18 /niches, 14 guides, 10 "vs-" pages such as vs-invideo, vs-opus-clip, vs-freelancers, plus persona pages /for-side-hustlers etc.). **90 of 99 have lastmod Oct 2026**. robots.txt welcomes GPTBot/OAI-SearchBot and the site serves /llms.txt. Domain rating 8. This is AI-search prep, not the historical engine.
- Social proof is a "Results" page of founder-owned channel earnings ("250 niches"), with heavy disclaimers: classic make-money-online ad funnel (https://www.whiteglovecontent.com/results).
- Listed for sale on TrustMRR since Sep 16 2026 at $2.5M (3.2x), with 19 offers.

## Growth story
- Apr $2.1k → May $22.4k → Jun $40.8k: a 10x jump in one month fits **switching on paid ads** for a productized service, not organic compounding (inference).
- Jul→Sep (+49%): probably scaled ad spend plus more LP variants, upsells (long-form/multi-channel plans, animation add-ons) and subscriber stacking. Monthly subs compound when acquisition outpaces churn (inference).
- Oct flat, MRR −4.4%, last-30d revenue −5.9%. Signs of ad saturation or rising churn, consistent with negative Trustpilot reviews about quality. Timing matches the sale listing and a late push into affiliates and SEO for cheaper acquisition (inference).

## Playbook to copy
1. Sell a **productized AI service as an income opportunity** ("you own it, keep 100% of ad revenue"). Aspirational outcomes convert well in paid social at ~$50–300/mo price points.
2. Build **many ad-specific landing pages** (`/go/<angle>`) and track the variant + click ID through checkout, so each creative angle (price, money, long-form) is measured against revenue.
3. Fire every pixel (Meta, TikTok, Google, Reddit, X, Snap, ChatGPT ads) behind a consent gate. Let the attribution dashboard decide where spend goes.
4. Once paid works, add a **tiered affiliate program** (15/5 → 18/8 → 20/10) to recruit YouTube-automation influencers at a CAC capped by commission.
5. Pre-build **"vs competitor" + niche + persona pages and llms.txt** for Google/AI-search capture at near-zero marginal cost.

## Unknowns
- Actual ad spend, creatives and active-ad counts (Meta Ad Library returned 403; Google Ads Transparency not checked; Instagram page blocked with 429).
- Founder identities. No founder X/LinkedIn/interviews found.
- Whether affiliates/YouTube influencers drive meaningful volume yet. The program is only about 2 months old.
- Churn rate. TrustMRR shows it only after login.
