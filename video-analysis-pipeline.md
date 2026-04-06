# Video Analysis Pipeline — Idea

## Concept

Agent can "watch" videos by extracting keyframes and feeding them to Claude vision for multimodal analysis. Returns structured findings with visual references.

## Pipeline

```
Video URL (YouTube, TikTok, X, etc.)
  → yt-dlp downloads video (already in container)
  → ffmpeg detects scene changes (select='gt(scene,0.3)')
  → ffmpeg extracts keyframes at each scene change
  → Agent receives timestamped screenshots
  → Claude vision analyzes each frame in context
  → Structured report: findings, key moments, visual references
```

## What's Needed

- **ffmpeg** — add to Dockerfile (`apt-get install ffmpeg`)
- **yt-dlp** — already installed (came with tiktok-cli)
- **Claude vision** — already available (multimodal)

## Smart Fallback

- Default: keyframes only (no audio transcription)
- Works great for visual content: slides, code, diagrams, product demos
- If agent determines frames alone don't tell the story (talking-head, podcast-style), fall back to audio transcription (Whisper API or local)

## Implementation

Build as a container skill (`container/skills/video-analysis/SKILL.md`) that the agent invokes when given a video URL. The skill would include a helper script that handles the ffmpeg extraction and outputs a structured directory of timestamped frames.

## Status

Idea stage — not yet built.
