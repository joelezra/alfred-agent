---
name: twitter
description: Read and post on X (Twitter). Tweet, reply, search, read threads, check bookmarks, follow/unfollow. Use when the user asks about X, Twitter, tweeting, or social media posting.
---

# twitter — X (Twitter) CLI

Credentials are pre-configured via env vars (`TWITTER_AUTH_TOKEN`, `TWITTER_CT0`).

## Commands

```bash
# Read a tweet (with replies)
twitter tweet <tweet-id-or-url> -n 10

# Read an X Article (long-form)
twitter article <tweet-id-or-url>

# Search tweets
twitter search "query" -n 20
twitter search "query" --from user --since 2026-01-01 --has images
twitter search "query" --type Latest --lang en --min-likes 100

# View your feed
twitter feed -n 20
twitter feed --type following -n 20

# Bookmarks
twitter bookmarks -n 20

# User profile
twitter user screenname

# User's tweets
twitter user-posts screenname -n 20

# User's likes
twitter likes screenname -n 20

# Followers / following
twitter followers screenname -n 50
twitter following screenname -n 50

# Post a tweet
twitter post "Hello world"

# Post with images (up to 4)
twitter post "Check this out" -i /path/to/image.png

# Reply to a tweet
twitter reply <tweet-id> "Reply text"

# Quote tweet
twitter quote <tweet-id> "My take on this"

# Like / unlike
twitter like <tweet-id>
twitter unlike <tweet-id>

# Retweet / unretweet
twitter retweet <tweet-id>
twitter unretweet <tweet-id>

# Bookmark / unbookmark
twitter bookmark <tweet-id>
twitter unbookmark <tweet-id>

# Follow / unfollow
twitter follow screenname
twitter unfollow screenname

# Delete a tweet
twitter delete <tweet-id> --yes

# Check logged-in account
twitter whoami

# Auth status
twitter status
```

## Safety Rules

- NEVER post, reply, like, retweet, or follow without explicit user approval
- Always confirm tweet content with the user before posting
- When searching or reading, just do it — no confirmation needed

## Tips

- Tweet IDs and full URLs both work
- Use `-n` / `--max` to control result count
- Use `--compact` / `-c` for token-efficient output (great for LLM processing)
- Use `--json` or `--yaml` for structured output
- Auto-outputs YAML when piped (non-TTY) — no flag needed
- Search supports advanced filters: `--from`, `--to`, `--lang`, `--since`, `--until`, `--has`, `--exclude`, `--min-likes`, `--min-retweets`
- Use `--filter` to rank tweets by engagement score
- Use `--full-text` to expand truncated tweets
