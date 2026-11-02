# flint: distribution study
Checked revenue (Jul→Aug→Sep→Oct 2026): $15 → $151 → $2,969 → $3,981 · AI Christian faith companion you text over iMessage (no app) · $4.99 first week then $9.99/week, or $49.99/year (Stripe)

## Main channel(s)
1. **Paid social (Meta and/or TikTok ads) sending people to a phone-capture onboarding funnel.** Confidence: medium. The site has almost no organic footprint (4-page sitemap, no blog, domain rating 0, zero web or Reddit mentions found). Yet the onboarding JS fires both a Meta pixel and a TikTok pixel, maps conversion events for each (Meta "Purchase", TikTok "CompletePayment"), passes the phone number to the pixels for matching, and stores first-touch and last-touch fbclid, ttclid and UTM values in its own attribution store. That is ad-buyer infrastructure.
2. **TikTok persona (UGC-style) accounts.** Confidence: low. @walkwithflint posts as "Amber" ("Jesus is the way ✝️ Follow me on flint"): 255 followers, 54 videos, about 4K likes. Too small on its own to explain about $3K/month.

## Evidence
- The onboarding bundle includes `fbq('init')`, `ttq.load()`, `trackPixel("CompleteRegistration")` once the phone is submitted, `trackPixel("InitiateCheckout")`, and an event map {Purchase→CompletePayment}. Source: https://walkwithflint.com/onboard (JS chunks)
- An attribution module saves `flint_attribution_first` / `flint_attribution_last` with utm_*, ttclid and fbclid, and reads `?utm_campaign=`, `?campaign=` or `?c=`.
- Paywall config: weekly "$4.99 first week, then $9.99/week", yearly "$49.99 … $4.17/month", 0 trial days. PostHog feature flags `pricing-weekly` and `pricing-yearly` mean prices are being A/B tested.
- Daily revenue matches those prices ($9.99, $19.98, $34.95, $49.93…). Source: TrustMRR
- robots.txt blocks /start, /onboarding, /welcome, /subscribe and /avatar, i.e. the ad-landing funnel. /start redirects to /onboard. Source: https://walkwithflint.com/robots.txt
- The sitemap has only /, /about, /terms and /privacy, and /blog returns 404. Web searches for "walkwithflint" return nothing related.
- The homepage claims "2,000+ growing their faith with flint", with unedited-text testimonials ("i've prayed more in 3 weeks…") and a "sunday's easy. it's tuesday that's hard" hook. The copy reads like direct-response ad copy.
- TikTok @walkwithflint (account created around 2026-05-14): persona "Amber", 255 followers, 54 videos, 3,994 likes. Source: https://www.tiktok.com/@walkwithflint
- TrustMRR: 138 active subs, MRR $1,627, 10 acquisition offers, asking $60K, listed 2026-10-13. The founder says "going full time on another project".
- Average daily revenue fell from $144 (Oct 4–13) to $108 (Oct 14–23) to $79 (Oct 24–Nov 1).

## Growth story
- Founded 2026-05-02. Revenue was near zero in Jul and Aug, then $2,969 in Sep. Inference: a jump that steep, with no organic footprint, fits paid campaigns being switched on or scaled in late Aug or Sep, once the funnel and pixels were working.
- Oct came in higher, but daily revenue dropped steadily after the Oct 13 sale listing. Inference: ad spend was cut or paused when the founder moved on, and weekly plans churn quickly. MRR ($1.6K) is well below October's cash ($4K), so much of the revenue is first-week and annual upfront payments.
- The persona TikTok may have supported this or tested creatives. No viral post was found.

## Playbook to copy
1. A "no app" product that lives in iMessage or SMS: ask for the phone number first, which removes install friction and gives you a high-match pixel signal.
2. Wire Meta and TikTok pixels with server-grade attribution (first and last touch, click IDs) before spending, and fire CompleteRegistration when the phone is captured.
3. A cheap first week ($4.99), then a weekly plan, plus an annual anchor, with prices A/B tested through feature flags.
4. Target an identity niche (faith) with emotional "Tuesday problem" copy and screenshot-style testimonials as ad creative.
5. Run persona or faceless TikTok accounts that link to the funnel, both as organic reach and as a creative test bed.

## Unknowns
- Actual ad spend, creatives and which platform dominates. The Meta Ad Library returned 403 and the TikTok Creative Center wasn't checked. ROAS and margin are unknown.
- Whether church, influencer or affiliate partnerships contributed (none found).
- Who the founder is, and whether other persona accounts exist.
- Whether the "2,000+" users figure counts free users.
