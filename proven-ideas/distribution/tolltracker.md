# TollTracker: distribution study
Checked revenue (Jul→Aug→Sep→Oct 2026): $3,132 → $4,608 → $6,673 → $8,697 · iOS/Android app that tracks your live average speed on Bulgaria's toll-camera "section control" stretches, now speed/red-light/zone alerts across Europe · Freemium. BG store: €1.99/mo, €13.49/yr, €34.99 lifetime (TrustMRR: $3.99/mo, $19.99/yr, lifetime $29.99–99.99)

## Main channel(s)
1. **Regulation-driven App Store / Google Play search in Bulgaria.** Demand appears whenever the state adds camera enforcement, and people search the store for it. Confidence: **medium-high**.
2. **Geographic expansion + localized content/SEO** (Europe-wide 3.0, country launches Jul–Sep 2026, 9,640-URL multilingual site). Confidence: **medium** for the Aug–Oct lift; the programmatic SEO is too new (Oct 2026) to have driven it.
No evidence of paid ads, influencers or press features about the app itself.

## Evidence
- Launched days after Bulgaria started average-speed enforcement on **Sep 7 2025**. App released 2025-09-10 (iOS) / 2025-09-05 (Android). Its first blog posts (Sep 14–15 2025) are section maps (https://www.novinite.com/articles/234246/…, iTunes lookup API).
- The market is plainly Bulgarian. iOS ratings: **BG 170 (4.9★)**, DE 26, RO 15, PL 4, HU 3, US 2. Google Play: **10K+ downloads, ~240 reviews, 4.7★**. AppGoblin estimates ~27K Android installs, **+4.5K/month** "trending", 100% IAP, no ads SDK (https://appgoblin.info/apps/com.bgtolltracker.tracker).
- Seller is Tracker Tech OOD (Bulgaria); developer account is Viktor Kolev. His LinkedIn posts promote TollTracker 3.0 and the Europe expansion (https://bg.linkedin.com/in/viktor-kolev-35102b85, blocked to fetch).
- The news keeps pushing demand. Coverage: 33,288 violations in the first month (BTA, Nov 2025); fines issued from late Nov 2025; 65 certified sections with a target of 100 by end-2026; >40,000 fines and violations down 3x by Mar 2026 (https://www.bta.bg/en/news/1000400-…, https://m.novinite.com/view_news.php?id=237666). Each story is free awareness for "how do I not get fined".
- The app's blog keeps posting enforcement news: "new sections Sofia–Varna 29.10.2025", "new sections on road I-5" etc. On **Aug 31 2026** it covered Bulgaria's new AXIS radar cameras on toll gantries (~330 planned points) (https://tolltracker.eu/blog/new-speed-cameras-bulgaria-axis-q1686-dle).
- Expansion timeline from sitemap/blog dates: **3.0 "Europe road alerts" announced Mar 18 2026** (Italy ZTL, German Umweltzone first). **Country launches: Poland Jul 30, France/Portugal/Spain Aug 2, Austria/Italy sections Aug 17, Hungary Sep 5, Slovenia Sep 13 2026** (https://tolltracker.eu/blog/…). The app was renamed from "TollTracker BG" to "TollTracker: Speed Cameras", 17 languages, CarPlay/Android Auto.
- Programmatic SEO: tolltracker.eu/sitemap.xml has **9,640 URLs**. Of those, 8,113 are `/zones/<country>/<city-ztl|umweltzone>` pages, 418 speed-camera and 228 average-speed country pages, all × 19 languages. **8,113 have lastmod Oct 2026**, so they're very new.
- Site claims "5,000+ daily drivers, 10+ countries". TrustMRR shows **1,907 active subscriptions**, MRR $7,053.
- Competition: Vinetki.bg/TollPass added a **free** average-speed feature, which may have pushed TollTracker beyond the BG-only use case (https://vinetki.bg/en/blog/vignettetaxes/average-speed).
- Facebook page exists (facebook.com/profile.php?id=61580241210587). No follower data reachable.

## Growth story
- Dec 2025–Feb 2026 ($0.9k→$6k): early adopters as fines started arriving (late Nov 2025) (inference).
- Apr 2026 peak $9.2k, then a crash to $2.5k in May: *inference*. A 3.0 launch / lifetime-deal push or Easter travel spike, followed by the novelty wearing off and possibly the free competitor.
- Jul→Oct (+178%): *inference*, from three overlapping drivers. (a) Summer road-trip season, with foreign drivers transiting Bulgaria (13,775 foreign-plate violations in month 1 of 2025). (b) Europe launches in PL/FR/ES/PT/AT/IT/HU/SI from late Jul, which widen the store-search keyword surface (DE/RO ratings are growing). (c) Fresh Bulgarian enforcement news (new radar cameras, Aug 2026; push toward 100 sections).
- Oct 26–30 spike ($455→$1,076→$533→$608→$851/day vs ~$190 baseline) lines up with the v3.5.x release (alternative routes/favorites, Oct 29). Likely a promo or paywall change, or a store feature (unverified).

## Playbook to copy
1. **Ship within 72 hours of a regulation going live** that creates a new fine or obligation, and own the store keyword before incumbents react.
2. Turn every government announcement into a blog post or push notification ("new sections from X date"). News coverage then does the marketing for you.
3. Price for **lifetime + cheap annual**: low-ticket utility, impulse buy right after someone gets a fine.
4. When local demand plateaus or a free competitor appears, **generalize the core feature to adjacent countries/rules** (ZTL, Umweltzone, section control) and localize the store listing into many languages.
5. Generate **programmatic "rule × city × language" pages** from the same dataset that powers the app.

## Unknowns
- iOS vs Android revenue split. Store keyword rankings and chart positions (not retrievable).
- Whether Meta ads run from the Facebook page (Ad Library 403).
- Cause of the April spike and the late-October surge. Any Bulgarian press mention of the app itself (none found).
- Revenue by country after the Europe expansion.
