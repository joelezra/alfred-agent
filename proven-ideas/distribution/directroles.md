# DirectRoles: distribution study
Checked revenue (Jul→Aug→Sep→Oct 2026): $3,903 → $9,364 → $16,268 → $27,764 · Quiz-funnel web app selling access to "direct employer" jobs scraped from company career pages, no agencies (Whop checkout) · Weekly / monthly / lifetime plans (code fallback $7/wk, $17/mo, $47 lifetime; test arms of $1 trial → $19/mo and free 7-day trial); MRR $13.9k / 521 subs

## Main channel(s)
1. **Paid acquisition into a heavily A/B-tested quiz funnel (most likely Meta/TikTok ads), run as one "tenant" of a multi-site funnel engine (HiddenRoles).** Confidence: **low-medium**. This is inferred from the funnel's design, not from ads actually seen.
2. **Small programmatic SEO set ("<Company> remote jobs/careers" pages linking to /start?src=…).** Confidence: **low**. Only 27 URLs, so it cannot explain $28k/month.

## Evidence
- The site is a JS shell with `window.TENANT={"id":"directroles",…,"mode":"jobs","flowVersion":"v2"}`. The code falls back to "HiddenRoles" / hiddenroles.co defaults. hiddenroles.co serves the same app and the same sitemap structure. https://directroles.net/ , https://hiddenroles.co/
- A leftover on the company page shows the logo "DirectRoles .co" (from the template). The TrustMRR icon file is named "bestjobs-hq", which suggests more sibling tenants.
- The funnel code references pricing arms C through P ("CareerHound-style email-first short quest", "US-only $1/1-week trial → $19/mo", "Polypick-style signup-first flow + dedicated landing", "FREE 7-day trial", "annual $47 shown as $4/month"). Arms are forced with ?arm= and assigned by the server. https://directroles.net/app.js
- Classic paid-funnel mechanics in the code: a multi-step quiz ("How long has your search been running?"), interstitials ("Popular roles get 300+ applications within 24 hours"), a fake "Analyzing your profile… Filtering out agencies" progress screen, "You've unlocked 50% off", a strike-through "was" price, exit-intent coupon popup, drip-email coupons (/unlock?coupon=CAREER20), loss-aversion framing personalized from salary, and a "spots left" counter.
- Code comment: "weekly outsells monthly 15:6". The weekly plan is labeled MOST POPULAR.
- Whop checkout embedded on-domain ("Arm G… keeps the buyer on OUR domain instead of redirecting to whop.com"; utm_source=armg). Country-localized pricing with India UPI, and mentions of users in Nigeria and India. Payments run on Whop, even though comments mention Stripe.
- Audience signal in code: "Customer Support Specialist… 35.8% of US visitors" wanted it, versus 4.3% for Software Engineer. That points to a mass-market, entry-level remote-work audience, typical of Facebook/TikTok ad targeting rather than tech Twitter.
- Analytics: Rybbit and Microsoft Clarity only. No Meta/TikTok/Google pixel in the client code (server-side conversion tracking can't be ruled out).
- Campaign attribution: "a company/mixed career page sends visitors to /start?src=<key>". Company pages link to /start?src=amazon and /start?src=remote-jobs. https://directroles.net/amazon-careers
- Sitemap has 27 URLs: home, /jobs, /remote-jobs, /work-from-home-jobs plus 23 "<company>-careers" pages (Amazon, Google, CVS, Concentrix, TTEC, TELUS…). https://directroles.net/sitemap.xml
- Testimonials are hardcoded with randomuser-style avatars ("men/44"). Several say "Saw this on Reddit" and "found HiddenRoles through Reddit", but no Reddit threads were found by search. The "seekers": 7,488 figure in the code equals TrustMRR's "estimated user count".
- No public footprint: 0 X followers on TrustMRR, no social accounts linked, no Wayback snapshots. Web search for "directroles" returns nothing relevant.
- Parent HiddenRoles has a Product Hunt page ("Find remote jobs LinkedIn never shows you", 4 upvotes, about 5 months old) by Danilo (@danilovilhena_). https://www.producthunt.com/products/hidden-roles

## Growth story
- *Inference:* DirectRoles launched on 14 Jul 2026 as a new tenant (new brand angle: "skip the recruiter") of an already-optimized funnel. It made $3.9k in its first ~17 days. Making money that fast with no audience usually means buying traffic into a proven funnel, or cross-routing traffic and email from the parent brand.
- *Inference:* growth of about 1.7–2.4x each month comes from scaling ad spend as the pricing arms win. Weekly plans stack recurring revenue quickly: MRR $13.9k from 521 subs is about $27 per sub per month.
- MRR growth slowed (+9.4% in 30 days) while revenue grew +36.6%. That suggests high churn on weekly plans, with revenue sustained by new buyers (inference).

## Playbook to copy
1. Build one funnel engine (quiz → personalized "results ready" → discounted paywall) and launch it under several brand/angle tenants on separate domains.
2. Sell a scraped public-data feed ("jobs not on LinkedIn") with a pain-led angle ("skip the recruiter") to a broad, anxious audience.
3. A/B test pricing structure, not just price: weekly vs $1 trial vs free trial vs annual-shown-monthly. Keep the server deciding the arm.
4. Embed checkout on your own domain and localize prices (UPI for India). Add exit-intent and drip coupons.
5. Add a few "<Big Company> remote jobs" SEO pages with ?src= attribution as a cheap side channel.

## Unknowns
- Which ad network(s) and how much spend: the Meta Ad Library needs login, there was no Wayback history, and no ads were directly observed.
- Who runs DirectRoles (the TrustMRR founder is blank). Whether HiddenRoles' maker owns it is unverified, and so is whether sibling tenants share traffic.
- Real Reddit presence (Reddit JSON was blocked from here); refund and churn rates.
