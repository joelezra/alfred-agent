# STRK: distribution study
Checked revenue (Jul→Aug→Sep→Oct 2026): $1,849 → $4,110 → $5,279 → $6,259 · iOS/Android app to meet strangers and swap Snapchat usernames · Free + IAP (Premium $4.99/wk, $9.99/mo, Platinum $12.99/wk, 24h Boost $2.99)

## Main channel(s)
1. **App Store search (ASO), specifically keyword capture of a removed competitor ("AddChat").** Confidence: medium.
   The iOS title is "Random Chat & AddChat - STRK". "Addchat - Random Chat" (Addchat Inc., id1464989529) was a well-known random-chat app that has been **removed from the US App Store**. STRK now ranks #2 in iTunes search for "addchat" and #2 for "random chat". In effect it owns the search traffic that the dead brand left behind.
2. **"Find Snapchat friends" category search.** Confidence: medium-low. It ranks #6 for "snapchat friends", next to Qudo, Hoop and Wizz. In Germany the title is localized to "Snapchat Freunde finden - STRK", so the keywords are chosen per market.

There's no social, founder or community presence (X followers: 0, and the TikTok handles checked have 0–3 followers). That points to store search plus possibly paid installs.

## Evidence
- The US title is "Random Chat & AddChat - STRK". Seller is Ahmet Cabak, released 2025-06-01, v1.5 shipped 2026-09-16, 278 US ratings averaging 4.34. Source: https://itunes.apple.com/lookup?id=6744369466&country=us
- strk.app still links the old URL slug `strk-add-friends-chat`, so the "AddChat" title is a later rename. Rename date unknown. Source: https://strk.app/
- The Addchat listing returns NOT FOUND from the iTunes lookup API. AppGoblin says "This app was removed from the US App Store", last store update 2024-06-12. Source: https://appgoblin.info/apps/1464989529
- iTunes search ranks: "addchat" #2 (behind BeFriend), "random chat" #2, "snapchat friends" #6. Source: https://itunes.apple.com/search?term=addchat&entity=software&country=us
- Titles by storefront: GB, CA, AU and TR use the "Random Chat & AddChat" title, with 49, 22, 11 and 9 ratings. DE uses "Snapchat Freunde finden - STRK" (8 ratings). The US is clearly the core market.
- US ratings went from 263 (TrustMRR sync, 2026-10-26) to 278 on 2026-11-02, so about 15 per week. AppGoblin estimates 61K installs on iOS and 1.2K ratings worldwide.
- AppGoblin found Facebook, AppLovin, Unity and Google SDKs in the iOS build. That's consistent with paid user acquisition (UA) or ad attribution but doesn't prove it. Source: https://appgoblin.info/apps/6744369466
- There's an older sibling Android app, "Snapchat Friends with STRK" (com.streakersapp, developer "Aproder", live since 2020). It has 211K+ installs, 7.2K ratings, and is about 65% ad-funded. Source: https://appgoblin.info/apps/com.streakersapp
- Daily revenue for Oct 2026 was a steady $140–$280/day with no viral spikes. That shape fits search-driven installs. Source: TrustMRR profile
- The 393 active subs and $5,989 MRR are mostly weekly plans (TrustMRR).

## Growth story
- iOS made about $15–$60/month from Dec 2025 to May 2026. It then jumped to $1,061 in June and kept climbing every month.
- Inference: the step change in June most likely came from a metadata change, i.e. the "Random Chat & AddChat" title plus the Snapchat-friends keywords. It could also have come from Addchat's removal, which gave STRK a high-intent branded query with no strong owner.
- The steady growth after that fits rising keyword rank (more installs, more ratings, higher rank) plus paywall tuning. Inference: a weekly Platinum tier at $12.99 is aggressive and lifts revenue per user.
- The Sep 16 release (v1.5: face verification, Rooms, Streakboard) may have improved conversion and ratings.
- Paid UA (Meta/AppLovin) can't be ruled out, given the SDKs.

## Playbook to copy
1. Look for dead or removed apps that still get search volume in your category. Put the orphaned brand term in your title or subtitle (check trademark risk first), then watch the rank.
2. Write a separate title for each locale, in the local phrasing of the job to be done ("Snapchat Freunde finden").
3. Ride a giant platform's unmet need ("add Snapchat friends") without integrating with it. Users just swap usernames.
4. Monetize impatience: weekly subscriptions plus a cheap 24-hour boost.
5. Port a proven Android app to iOS (React Native) and re-monetize it there through IAP instead of ads.

## Unknowns
- When the title changed and when Addchat was removed (the Wayback Machine was unreachable). The causal link to June is inference.
- Search volume for "addchat", plus any Apple Search Ads or Meta spend (the Ad Library wasn't accessible).
- Who Ahmet Cabak is, and whether he's connected to "Aproder" (the Android developer).
- Why worldwide ratings average 2.69 (AppGoblin) while US ratings average 4.3.
