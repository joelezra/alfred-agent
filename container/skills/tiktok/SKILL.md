---
name: tiktok
description: Browse TikTok feeds, search users, read comments, view trending content, and download videos. Use when the user asks about TikTok, viral content, trending topics, or creator analysis.
---

# tiktok — TikTok CLI

## Commands

```bash
# Trending videos
tiktok --plain trending --limit 10

# User profile
tiktok --plain user @username
tiktok --plain user username --videos --limit 10

# Video details
tiktok --plain video "https://www.tiktok.com/@user/video/1234567890"

# Video comments
tiktok --plain comments "https://www.tiktok.com/@user/video/1234567890" --limit 20

# Hashtag videos
tiktok --plain hashtag "fyp" --limit 10

# Search users
tiktok --plain search "query" --limit 10

# Download video
tiktok --plain download "https://www.tiktok.com/@user/video/1234567890"
tiktok --plain download "URL" -o "output.mp4"
tiktok --plain download "URL" --audio
```

## Tips

- Use `--plain` for human-readable output, omit for JSON
- Accepts usernames with or without `@` prefix, or full profile URLs
- Download uses yt-dlp (works without TikTok API)
- Use `--audio` to extract audio only
