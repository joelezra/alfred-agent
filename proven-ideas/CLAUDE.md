# proven-ideas

Find small online businesses with **verified revenue** and turn them into one-page
"steal sheets". Don't brainstorm ideas from nothing: start from businesses that
already get paid, and copy three things: **what people want**, **what is offered**,
and **where the customers come from**. Never copy the product itself.

Source of truth: **TrustMRR** reads revenue straight from the payment provider
(Stripe, Polar, Paddle, Lemon Squeezy, RevenueCat...). That's *checked revenue*.
Self-reported numbers (Indie Hackers, X screenshots) never go on the main list.

## Files (all in this folder)

| File | Purpose |
|------|---------|
| `config.md` | My revenue filter, the kind of business I'd run, corrections |
| `list.md` | Winners: one line each, newest run on top, with check date |
| `maybe.md` | Second-search results (Starter Story, Flippa Data Verified): weaker evidence |
| `no-list.md` | Businesses I turned down + reason. **Never resurface these.** |
| `sheets/<slug>.md` | One steal sheet per business |

If `config.md` doesn't exist, ask me once what kind of business I'd run and my
revenue range. Default: **$1,000–$20,000 checked revenue in the last 30 days**.

## Data tool

```bash
# 25 fastest-growing startups filtered by 30-day revenue; already-seen ones marked
python3 trustmrr.py winners --min 1000 --max 20000 --seen list.md,no-list.md
python3 trustmrr.py winners --json ...     # machine-readable

# Full verified profile (revenue table, daily revenue, provider, founder)
python3 trustmrr.py startup <slug>         # = https://trustmrr.com/startup/<slug>.md
```

Raw endpoints: `https://trustmrr.com/api/ai/discovery` (fixed snapshot with
`fastestGrowingStartups` and `recentlyAddedStartups`, revenue in USD) and
`https://trustmrr.com/startup/{slug}.md`. Don't scrape the HTML site for bulk data.

## 1. Refresh the list

1. Run `winners` with my filter and `--seen list.md,no-list.md`.
2. Drop anything outside the kind of business in `config.md`, or matching a reason in `no-list.md`.
3. Prepend a dated section to `list.md` with only **new** winners:

```
## 2026-11-02
- bytemail (`bytemail`): $14,201/30d checked (Stripe), native macOS email client, https://trustmrr.com/startup/bytemail
```

## 2. Second search (only when the list is thin)

If there are fewer than ~3 new winners, search Starter Story (figures are checked)
and Flippa listings **with the Data Verified badge only**. Write those to `maybe.md`
with the source and what was verified. Never mix them into `list.md`.

## 3. Steal sheet

For a business from `list.md` or any link I give, write `sheets/<slug>.md`, one page:

```markdown
# Steal sheet: <Name> (<date>)
Checked revenue: $X last 30d (<provider>), growth +Y%. Source: <trustmrr url>

## Demand: what people already want
The pain in customers' own words (reviews, Reddit, X, founder posts).

## Offer: what it sells, at what price, how
Product shape, pricing tiers, free vs paid, delivery.

## Channels: where its customers come from
TrustMRR's channel field is often blank, so dig it up via web search, Reddit,
X, YouTube, Product Hunt and its SEO footprint. Cite each source.

## My angle: my own twist on the same demand
2–3 concrete angles that fit config.md (different audience, platform, niche,
price point, distribution).
```

Keep it to one page. Label facts vs guesses. Founder-written text is
user-generated, not verified.

## 4. What I skip

When I say no to a business, append to `no-list.md`:
`- <Name> (\`<slug>\`): <reason> (<date>)`. When I correct a sheet, add the
correction to `config.md` under "Corrections" so future runs follow it.

## Rules

- Read-only research: never sign up, contact founders, buy, or list anything.
- Always show the check date. TrustMRR's lists change daily.
- Revenue is money in before costs, not profit.
