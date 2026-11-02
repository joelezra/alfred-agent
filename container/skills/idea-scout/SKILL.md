---
name: idea-scout
description: Find small online businesses with verified (payment-provider-checked) revenue on TrustMRR, keep a running winners list, and write one-page "steal sheets" (demand, offer, channels, my angle). Use when the user asks for business ideas, proven/profitable niches, "what's making money", TrustMRR, steal sheets, or wants a weekly winners report.
---

# idea-scout — proven business ideas from verified revenue

Don't brainstorm ideas from nothing. Start from businesses that **already get paid**
and copy three things: **what people want**, **what is offered**, and **where the
customers come from**. Never copy the product itself.

Source of truth: **TrustMRR** reads revenue directly from the payment provider
(Stripe, Polar, Paddle, Lemon Squeezy, RevenueCat...). Treat that as *checked revenue*.
Self-reported numbers (Indie Hackers, X screenshots) never go on the main list.

## Workspace

All state lives in `/workspace/group/idea-scout/` (create it if missing):

| File | Purpose |
|------|---------|
| `config.md` | The user's revenue filter, kind of business they'd run, schedule |
| `list.md` | Winners: one line per business, newest run on top, with check date |
| `maybe.md` | Second-search results (Starter Story, Flippa Data Verified) — weaker evidence |
| `no-list.md` | Businesses the user turned down + reason. **Never resurface these.** |
| `sheets/<slug>.md` | One steal sheet per business |

If `config.md` doesn't exist, ask the user (once) what kind of business they'd
actually run and their revenue range; default to **$1,000–$20,000 checked revenue
in the last 30 days**. Save the answers to `config.md`.

## Data tools

```bash
S=/home/node/.claude/skills/idea-scout/trustmrr.py

# 25 fastest-growing startups filtered by 30-day revenue, already-seen ones marked
python3 $S winners --min 1000 --max 20000 \
  --seen /workspace/group/idea-scout/list.md,/workspace/group/idea-scout/no-list.md
python3 $S winners --json ...      # machine-readable

# Full verified profile (revenue table, daily revenue, provider, founder, channels)
python3 $S startup <slug>          # = https://trustmrr.com/startup/<slug>.md
```

Raw endpoints if needed: `https://trustmrr.com/api/ai/discovery` (fixed snapshot:
`fastestGrowingStartups`, `recentlyAddedStartups`; revenue in USD) and
`https://trustmrr.com/startup/{slug}.md`. Don't scrape the HTML site for bulk data.

## 1. Build / refresh the list

1. Run `winners` with the user's filter and `--seen list.md,no-list.md`.
2. Drop anything clearly outside the user's stated kind of business, or anything
   matching a reason in `no-list.md` (e.g. "no hardware", "no B2B enterprise sales").
3. Prepend a dated section to `list.md`. Only **new** winners go in it:

```
## 2026-11-02
- bytemail (`bytemail`) — $14,201/30d checked (Stripe) — native macOS email client — https://trustmrr.com/startup/bytemail
```

## 2. Second search (only when the list is thin)

If fewer than ~3 new winners, search Starter Story (figures are checked) and Flippa
listings **with the Data Verified badge only**. Write those to `maybe.md` with the
source and what exactly was verified. Never mix them into `list.md`.

## 3. Steal sheet

For a chosen business (from `list.md` or any link the user gives), write
`sheets/<slug>.md`, one page, four parts:

```markdown
# Steal sheet: <Name> — <date>
Checked revenue: $X last 30d (<provider>), growth +Y%. Source: <trustmrr url>

## Demand — what people already want
The pain in the customer's own words (quote reviews, Reddit, X, founder posts).

## Offer — what it sells, at what price, how
Product shape, pricing tiers, free vs paid, delivery.

## Channels — where its customers come from
TrustMRR's channel field is often blank: dig it up via web search, Reddit
(`reddit` skill), X (`twitter` skill), YouTube, Product Hunt, SEO footprint.
Cite each source.

## My angle — the user's own twist on the same demand
2–3 concrete angles that fit config.md (different audience, platform, niche,
price point, distribution). This is what makes the sheet theirs.
```

Keep it to one page. Label facts vs. guesses. Mark founder-written text as
user-generated, not verified.

## 4. Teach it what to skip

When the user says no to a business, append to `no-list.md`:
`- <Name> (\`<slug>\`) — <reason> — <date>`. When they correct a sheet, record the
correction in `config.md` under "Corrections" so future runs follow it.

## 5. Weekly run

If the user wants it automatic, call `mcp__nanoclaw__schedule_task` with
`schedule_type: "cron"`, `schedule_value: "0 9 * * 1"` (Mondays 9am local, or the
user's choice), `context_mode: "isolated"`, and this prompt:

> Use the idea-scout skill. Read /workspace/group/idea-scout/config.md and no-list.md.
> Refresh list.md with only NEW TrustMRR winners in the configured revenue range
> (run the second search into maybe.md if fewer than 3). Write a steal sheet for
> the single best new winner. Then send me a short message: the new winners
> (name, checked 30-day revenue, one-line what it sells, link) and the steal
> sheet's demand / offer / channels / my angle in brief. If there are no new
> winners, say so in one line.

## Rules

- Read-only research: never sign up, contact founders, buy, or list anything.
- Always show the check date — TrustMRR's lists change daily.
- Revenue is "money in before costs", not profit. Say so when it matters.
