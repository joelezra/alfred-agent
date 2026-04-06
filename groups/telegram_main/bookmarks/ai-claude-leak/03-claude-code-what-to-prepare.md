# What to Prepare for Based on the Claude Code Leak

**Bookmarked:** Mar 31, 2026
**Author:** @elliotarledge (Elliot Arledge) — 237k views, 1.2k likes, 2.1k bookmarks
**Tweet ID:** 2038934884761444838
**Article:** X Article — "What to Prepare for Based on the Claude Code Leak"
**Category:** AI / Claude Code Leak
**Type:** Deep Analysis / Reference
**Actionable:** YES — prepare for upcoming Claude Code features

---

## How the Leak Happened

Anthropic's `@anthropic-ai/claude-code@2.1.88` npm package included `cli.js.map` (59.8 MB) — a source map file containing the **full original TypeScript source** in its `sourcesContent` field. A build configuration oversight: debug artifacts got shipped to production.

**Discovery:** @Fried_rice (Chaofan Shou)
**How to access:** Download the package, find `cli.js.map`, parse JSON, extract `sourcesContent`.

---

## Unreleased Features Found in the Source

### 1. KAIROS — Autonomous Daemon Mode (154 references)
The most referenced feature flag. Turns Claude Code into an **always-on agent**:
- Background sessions
- "Dream" memory consolidation
- GitHub webhook subscriptions
- Push notifications
- Channel-based communication

### 2. PROACTIVE Mode (37 references)
Claude works **independently between user messages**:
- System sends "tick" prompts to keep agent alive
- Claude decides what to do on each wake-up
- Prompt literally says: *"You are running autonomously"* and *"look for useful work"* and *"act on your best judgment rather than asking for confirmation"*

### 3. COORDINATOR_MODE (32 references)
Transforms Claude into an **orchestrator managing parallel workers**:
- Spawns and manages parallel worker agents
- Handles research, implementation, verification by delegating to specialists
- Detailed instructions on writing prompts for workers
- Handles when to continue vs spawn fresh agents
- Worker failure handling built in

### 4. TRANSCRIPT_CLASSIFIER / Auto Mode (107 references)
AI classifier that **auto-approves tool permissions** — the constant permission prompts could disappear or become optional for trusted operations.

*(Note: A commenter pointed out auto mode already shipped as of March 2026)*

---

## Internal Model Codenames Revealed

| Codename | Notes |
|----------|-------|
| **Capybara** | Claude 4.6 variant. "Capybara v8" — 29-30% false claims rate vs v4's 16.7%. Tendency to over-comment code. "Assertiveness counterweight" mentioned |
| **Fennec** | Migrated to Opus 4.6 |
| **Numbat** | Unreleased. Comment: *"Remove this section when we launch numbat"* |
| **opus-4-7 / sonnet-4-8** | Referenced as examples of version numbers that should never appear in public commits — suggesting these exist internally |

The false claims rate disclosure is significant: Anthropic internally documented **Capybara at 29-30% false claims rate** (they say "done" when they didn't actually complete the task). Employees get a verification loop. Regular users don't.

---

## Undercover Mode

Designed for Anthropic employees contributing to **public/open-source repos**:
- Strips all AI attribution from commits
- Hides model codenames
- Removes any mention of "Claude Code" or AI
- Doesn't even tell the model what model it is

The prompt: *"You are operating UNDERCOVER in a PUBLIC/OPEN-SOURCE repository. Your commit messages, PR titles, and PR bodies MUST NOT contain ANY Anthropic-internal information. Do not blow your cover."*

**No force-OFF switch** — if not in an internal Anthropic repo, undercover mode stays on by default.

---

## Other Features

| Flag | Description |
|------|-------------|
| **VOICE_MODE** (46 refs) | Speech-to-text and text-to-speech voice interaction |
| **FORK_SUBAGENT** | Fork yourself into parallel agents |
| **VERIFICATION_AGENT** | Independent adversarial verification of work |
| **ULTRAPLAN** | Advanced planning capabilities |
| **WEB_BROWSER_TOOL** | Browser automation |
| **TOKEN_BUDGET** | Explicit token budget targeting ("+500k", "spend 2M tokens") |
| **TEAMMEM** | Team memory sync across users |
| **BUDDY** | Tamagotchi pet system (see below) |

### The BUDDY System (Tamagotchi)
- 18 species: duck, goose, blob, cat, dragon, octopus, owl, penguin, turtle, snail, ghost, axolotl, capybara, cactus, robot, rabbit, mushroom, chonk
- Rarity tiers (legendary = 1%)
- Cosmetics: crown, tophat, propeller, halo, wizard, beanie, tinyduck
- Stats: DEBUGGING, PATIENCE, CHAOS, WISDOM, SNARK
- Shiny variants exist
- The "capybara" species name is obfuscated with `String.fromCharCode()` specifically to avoid internal leak-detection scanners — confirming capybara is a sensitive model codename

---

## What This Means

1. **Claude Code is getting significantly more autonomous** — KAIROS/PROACTIVE/COORDINATOR = background daemon that monitors repos and acts
2. **Permission friction is being addressed** — transcript classifier for auto-approving tools
3. **Model versioning is more complex than public API suggests** — internal variants, fast modes, codenames with known issues
4. **Security is serious** — 2,500+ lines of bash command validation, sandboxing, undercover mode
5. **They're building personality into the product** — BUDDY system suggests Claude Code will feel like a companion

---

## Controversy

One commenter noted this was suspiciously close to April 1st. Another said many features were already released. Another called it "brilliant growth marketing." The debate about whether this was a genuine accident or a PR stunt ran in the replies.

---

## Actionable Takeaways

- Watch for KAIROS shipping — when it does, autonomous background agents become mainstream
- The 29-30% false claims rate on Capybara is now public knowledge — build verification steps into any production agentic workflow
- COORDINATOR_MODE is essentially what NanoClaw already does — this validates the multi-agent orchestration architecture
- Undercover mode is active by default on public repos — any AI commits to open source are likely stripped of attribution already
