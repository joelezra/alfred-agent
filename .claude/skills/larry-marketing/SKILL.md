---
name: larry-marketing
description: Automate TikTok slideshow marketing with AI-generated images (Nano Banana Pro), text overlays, Postiz posting, analytics tracking, and a daily feedback loop. Use when setting up TikTok marketing, creating slideshows, checking analytics, or optimizing content performance. Triggers on "larry", "tiktok marketing", "slideshow", "generate slides", "daily report", "post analytics".
---

# Larry Marketing for NanoClaw

Automate your TikTok slideshow pipeline: generate (Nano Banana Pro) -> overlay -> post (Postiz) -> track -> iterate.

Adapted from the [Larry marketing skill](https://clawhub.ai/olliewazza/larry) by Oliver Henry. Modified for NanoClaw's container architecture and Google Nano Banana Pro image generation.

> **Compatibility:** NanoClaw v1.2.0+. Requires Telegram channel.

## Prerequisites

### Required

- **Node.js v18+** (already on NanoClaw host)
- **node-canvas** (`npm install canvas`) — text overlays on slides. Needs system libs:
  - macOS: `brew install pkg-config cairo pango libpng jpeg giflib librsvg`
  - Ubuntu: `sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev`
- **Postiz account** — posting + analytics backbone. Sign up at [postiz.com](https://postiz.com)
- **Google AI API key** — for Nano Banana Pro image generation. Get one at [aistudio.google.com](https://aistudio.google.com)

### Optional

- **RevenueCat** — conversion tracking for mobile apps (trials, subscriptions, revenue)
- Cross-posting platforms connected in Postiz (Instagram, YouTube, Threads)

## Architecture

```
Container (agent)                    Host (NanoClaw)
┌─────────────────────┐             ┌──────────────────────────────┐
│ larry_generate_slides│──IPC──────>│ scripts/generate-slides.ts   │
│ larry_add_overlays   │──IPC──────>│ scripts/add-overlays.ts      │
│ larry_post           │──IPC──────>│ scripts/post-to-tiktok.ts    │
│ larry_analytics      │──IPC──────>│ scripts/check-analytics.ts   │
│ larry_report         │──IPC──────>│ scripts/daily-report.ts      │
└─────────────────────┘             └──────────────────────────────┘
          │                                    │
          │ MCP tools via agent.ts             │ Runs on host with
          │ (write to /workspace/ipc/tasks/)   │ API keys + node-canvas
          │                                    │
          └──── IPC results ◄──────────────────┘
```

## First Run — Onboarding

When this skill is first loaded, start a conversation with the user. Don't dump a checklist — talk naturally. Ask one or two things at a time.

### Phase 0: TikTok Account Warmup

Check if the user has an active TikTok account. If new/barely used, they MUST warm it up for 7-14 days first:

> "Do you already have a TikTok account you've been using, or starting fresh?"

If new: scroll naturally 30-60 min/day, like sparingly (1 in 10), follow niche accounts, leave genuine comments, maybe post 1-2 casual videos. The signal: when their For You page is dominated by their niche content, the account is warmed up.

Skip if the account is already active.

### Phase 1: Get to Know Their Product

> "Tell me about your app/product. What's it called, what does it do?"

Follow up naturally:
- Who's the ideal user?
- What problem does it solve?
- What makes it different?
- App Store / website link?
- Do they use RevenueCat or another subscription system?

Store in `tiktok-marketing/app-profile.json`.

### Phase 2: Competitor Research

> "Before we create content, I want to research competitors on TikTok. Can I use the browser?"

Search TikTok for their niche. Find 3-5 competitors. Analyze top hooks, formats, posting frequency, CTAs. Save to `tiktok-marketing/competitor-research.json`.

### Phase 3: Image Style (Nano Banana Pro)

> "For images, we're using Google's Nano Banana Pro — it's great at consistent characters across slides and handles text rendering well. Let's figure out the visual style."

Work through:
- Real photos vs illustrations vs graphics?
- What's the subject? (people, scenes, products, before/after)
- What vibe? (cozy, clinical, luxurious, minimal)
- Consistency needs? (same person, same room, same style across all 6 slides)
- Must-have elements?

Build the base prompt together. Example:

```
iPhone photo of a [specific scene], [specific style], [specific details].
Realistic lighting, natural colors, taken on iPhone 15 Pro.
No text, no watermarks, no logos.
[Consistency: "same person with dark hair", "same room layout", etc.]
```

**Key rules:**
- "iPhone photo" + "realistic lighting" = looks real, not AI
- Lock architecture/layout in EVERY prompt
- Include everyday objects for lived-in feel
- Portrait 1024x1536 (9:16) — fills TikTok screen
- Extremely specific > vague

**Nano Banana Pro advantages over other providers:**
- Up to 14 reference images for character consistency
- Better text rendering if text is needed in images
- Native 4K support (we use 1024x1536 for TikTok)
- ~$0.13/image standard, ~$0.07/image with Batch API

Store prompt in `config.imageGen.basePrompt`.

### Phase 4: Postiz Setup

> "We need Postiz for posting and analytics. It's what lets me track performance and tell you what's working."

Walk through:
1. Sign up at [postiz.com](https://postiz.com)
2. Connect TikTok (Integrations -> Add TikTok)
3. Note the TikTok integration ID
4. Get API key (Settings -> API)
5. Optional: connect Instagram, YouTube, Threads for cross-posting

Explain drafts workflow: posts go to TikTok inbox. User adds trending sound, then publishes. 30 seconds per post, massive impact on reach.

Don't proceed until Postiz is connected and API key works.

### Phase 5: Conversion Tracking (Optional)

If they have RevenueCat:
- V2 secret key from dashboard (starts with `sk_`)
- Project ID
- This lets the feedback loop optimize for revenue, not just views

Without RevenueCat: loop works on views/engagement only.

### Phase 6: Content Strategy

Using competitor research + app profile, build initial strategy:
- 3-5 hook ideas tailored to niche + competitor gaps
- Posting schedule (default: 7:30am, 4:30pm, 9pm)
- Which hook categories to test first
- Cross-posting plan

Save to `tiktok-marketing/strategy.json`.

### Phase 7: Daily Analytics Cron

Set up using NanoClaw's task scheduler:

```
Schedule: daily at 07:00 (user's timezone)
Task: Run larry_report with config, then message the user with summary
```

### Phase 8: Save Config & First Post

Store everything in `tiktok-marketing/config.json`:

```json
{
  "app": {
    "name": "AppName",
    "description": "...",
    "audience": "...",
    "problem": "...",
    "differentiator": "...",
    "websiteUrl": "...",
    "category": "fitness",
    "isMobileApp": true
  },
  "imageGen": {
    "provider": "nano-banana-pro",
    "apiKey": "your-google-ai-key",
    "model": "gemini-3-pro-image-preview",
    "basePrompt": "iPhone photo of...",
    "useBatchAPI": false
  },
  "postiz": {
    "apiKey": "your-postiz-key",
    "integrationIds": {
      "tiktok": "id",
      "instagram": "id-optional"
    }
  },
  "revenuecat": {
    "enabled": false,
    "v2SecretKey": "sk_...",
    "projectId": "proj..."
  },
  "posting": {
    "privacyLevel": "SELF_ONLY",
    "schedule": ["07:30", "16:30", "21:00"],
    "crossPost": ["instagram"],
    "timezone": "Asia/Kuala_Lumpur"
  },
  "competitors": "tiktok-marketing/competitor-research.json",
  "strategy": "tiktok-marketing/strategy.json"
}
```

Then generate the **first test slideshow** — this is a TEST, not a live post:

> "Let's create a test slideshow. I'll generate 6 slides and we'll look at them together. If the images look off, we tweak and try again."

Iterate 2-5 rounds until the images look right. Only start posting once the style is locked.

---

## Core Workflow

### 1. Generate Slideshow Images

Use `larry_generate_slides` tool:
- 6 prompts, each sharing the same base description
- Lock key elements (architecture, face, camera angle) across all slides
- Portrait 1024x1536 always
- Takes 1-3 minutes

### 2. Add Text Overlays

Use `larry_add_overlays` tool:
- Text content rules: REACTIONS not labels
- "Wait... this is actually nice??" not "Modern minimalist"
- 4-6 words per line, use \n for breaks
- 3-4 lines per slide ideal
- No emoji (canvas can't render them)

### 3. Post to TikTok

Use `larry_post` tool:
- Posts as drafts (SELF_ONLY) by default
- User adds trending sound manually, then publishes
- Caption: Hook > Problem > Discovery > Result > CTA, max 5 hashtags
- Cross-posts to configured platforms automatically

### 4. Connect Analytics (2+ hours after publishing)

Use `larry_analytics` tool:
- Wait at least 2 hours after user publishes (TikTok indexing delay)
- Matches posts to TikTok video IDs chronologically
- Release IDs CANNOT be overwritten once set — verify before connecting

---

## The Feedback Loop

### Diagnostic Framework

Two axes: **views** (reach) and **conversions** (revenue).

| Views | Conversions | Action |
|-------|-------------|--------|
| High | High | SCALE — 3 variations, test posting times |
| High | Low | FIX CTA — test different slide 6 CTAs, check landing page |
| Low | High | FIX HOOK — radically different hooks, keep CTA |
| Low | Low | FULL RESET — new format, audience angle, hook categories |

Without RevenueCat, optimize on views only:
- 50K+ → DOUBLE DOWN (3 variations)
- 10K-50K → Keep in rotation
- 1K-10K → Try 1 more variation
- <1K twice → DROP

### Hook Evolution

Track in `tiktok-marketing/hook-performance.json`. The daily report updates this automatically.

### CTA Testing

When views are good but conversions low, cycle through:
- "Download [App] — link in bio"
- "[App] is free to try — link in bio"
- "I used [App] for this — link in bio"
- "Search [App] on the App Store"
- No explicit CTA (just app name visible)

---

## Posting Schedule

Default optimal times (adjust for audience timezone):
- **7:30 AM** — early scrollers
- **4:30 PM** — afternoon break
- **9:00 PM** — evening wind-down

3x/day minimum. Consistency beats sporadic viral hits.

---

## The 6-Slide Formula

1. **Hook slide** — stop the scroll. Person + conflict/curiosity
2. **Problem slide** — amplify the pain point
3. **Discovery slide** — introduce the solution naturally
4. **Result slide 1** — show transformation
5. **Result slide 2** — reinforce with another angle
6. **CTA slide** — call to action

---

## Integration Points

To integrate this skill into NanoClaw, make the following modifications:

---

**1. Host side: `src/ipc.ts`**

Add import after other local imports:
```typescript
import { handleLarryIpc } from '../.claude/skills/larry-marketing/host.js';
```

Modify `processTaskIpc` function's switch statement default case:
```typescript
// Find:
default:
logger.warn({ type: data.type }, 'Unknown IPC task type');

// Replace with:
default:
const handled = await handleLarryIpc(data, sourceGroup, isMain, DATA_DIR);
if (!handled) {
    logger.warn({ type: data.type }, 'Unknown IPC task type');
}
```

---

**2. Container side: `container/agent-runner/src/ipc-mcp.ts`**

Add import after `cron-parser` import:
```typescript
// @ts-ignore - Copied during Docker build from .claude/skills/larry-marketing/
import { createLarryTools } from './skills/larry-marketing/agent.js';
```

Add to the end of tools array (before the closing `]`):
```typescript
    ...createLarryTools({ groupFolder, isMain })
```

---

**3. Build script: `container/build.sh`**

Ensure build context is project root (same as x-integration):
```bash
cd "$SCRIPT_DIR/.."
docker build -t "${IMAGE_NAME}:${TAG}" -f container/Dockerfile .
```

---

**4. Dockerfile: `container/Dockerfile`**

Add COPY line after other skill COPY lines and before `RUN npm run build`:
```dockerfile
# Copy Larry marketing MCP tools
COPY .claude/skills/larry-marketing/agent.ts ./src/skills/larry-marketing/
```

---

**5. Install node-canvas on host:**
```bash
cd /path/to/nanoclaw
brew install pkg-config cairo pango libpng jpeg giflib librsvg  # macOS
npm install canvas
```

---

**6. Add credentials:**

Add to `.env` or OneCLI:
```bash
GOOGLE_AI_API_KEY=your-key-here
POSTIZ_API_KEY=your-key-here
```

Or store in the tiktok-marketing/config.json directly (the scripts read from config, not env vars).

---

**7. Rebuild and restart:**
```bash
./container/build.sh
npm run build
launchctl kickstart -k gui/$(id -u)/com.nanoclaw  # macOS
```

## Credentials

The scripts read API keys from `tiktok-marketing/config.json`, not environment variables. This keeps credentials in one place and allows the agent to manage them during onboarding.

For production, consider moving sensitive keys to OneCLI:
```bash
onecli set GOOGLE_AI_API_KEY your-key
onecli set POSTIZ_API_KEY your-key
```

Then modify scripts to read from environment if config values are empty.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| 1536x1024 (landscape) | Use 1024x1536 (portrait) |
| Labels not reactions | "Wait this is nice??" not "Modern style" |
| Connecting release ID too soon | Wait 2+ hours — TikTok indexing delay |
| Wrong video connected | Can't overwrite — always verify |
| Only tracking views | Track conversions with RevenueCat |
| Same hooks forever | Iterate based on daily report data |
| No cross-posting | Use Postiz to post everywhere |
| Generic image prompts | Be extremely specific, lock consistency elements |
| No trending sound | Silent slideshows get buried — always add music before publishing |

## Security

- `tiktok-marketing/config.json` contains API keys — in `.gitignore`
- Only main group can use larry tools (enforced in agent.ts and host.ts)
- Scripts run as subprocesses with limited environment
