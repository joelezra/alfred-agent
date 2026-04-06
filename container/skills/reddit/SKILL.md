---
name: reddit
description: Read, search, and research on Reddit. Browse subreddits, read posts and comments, search discussions. Use when the user asks about Reddit, community discussions, or wants to research a topic on Reddit.
---

# reddit — Reddit CLI

No API key needed — uses public .json endpoints.

## Commands

```bash
# Read a post
reddit --plain read <url-or-id>

# Read comments
reddit --plain comments <url-or-id> --sort confidence --limit 20

# Read full thread with nested replies
reddit --plain thread <url-or-id> --limit 15 --depth 3

# Search all of Reddit
reddit --plain search "query" --sort relevance --time all --limit 10

# Search within a subreddit
reddit --plain search "query" -r subredditname --sort top --time week

# Hot posts
reddit --plain hot subredditname --limit 10

# Top posts
reddit --plain top subredditname --time week --limit 10

# Subreddit info
reddit --plain subreddit subredditname

# User info + recent posts
reddit --plain user username --posts --limit 10
```

## Tips

- Use `--plain` for human-readable output, omit for JSON
- Sort options: `confidence`, `top`, `new`, `controversial`, `old`
- Time filters: `hour`, `day`, `week`, `month`, `year`, `all`
- Rate limit: ~100 requests per 10 minutes
- Works with full URLs or just post IDs
