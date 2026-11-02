# proven-ideas

Business ideas from businesses that already make money. It pulls TrustMRR's 25
fastest-growing startups (revenue read straight from Stripe and similar),
keeps the ones in your revenue range, and writes one-page steal sheets:
demand, offer, channels, your angle.

Standalone: not part of Alfred. Needs only Python 3 (no packages).

## Use it

Open this folder in Claude Code (`cd proven-ideas && claude`), then:

- "Refresh the list": new winners go into `list.md`
- "Write a steal sheet for <name or TrustMRR link>": writes `sheets/<slug>.md`
- "No to <name>, <reason>": it's never suggested again

Or just the data: `python3 trustmrr.py winners --min 1000 --max 20000`

## Every Monday

In the Claude desktop app, open this folder in the Code tab and ask it to
schedule a weekly task "refresh the list and write a steal sheet for the best
new winner". Or use cron with the Claude CLI:

```
0 9 * * 1  cd /path/to/proven-ideas && claude -p "Refresh the list and write a steal sheet for the best new winner" --permission-mode acceptEdits
```
