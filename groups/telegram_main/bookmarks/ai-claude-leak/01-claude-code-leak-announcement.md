# Claude Code Source Leak — The Announcement

**Bookmarked:** Mar 31, 2026
**Author:** @T3chFalcon (IT Guy) — 1.5M views, 10k likes, 8.2k bookmarks
**Tweet ID:** 2038926178153529479
**Category:** AI / Claude Code Leak
**Type:** Reference
**Actionable:** No — awareness only

---

## What Happened

Anthropic accidentally published a `.map` file alongside the `@anthropic-ai/claude-code` npm package. The file `cli.js.map` embedded the **full original TypeScript source code** in its `sourcesContent` field — a build configuration oversight, not a hack. The package version was `2.1.88`.

- **1,900 files**
- **512,000+ lines of code**
- Full tool system, 50+ slash commands, multi-agent coordinator, React/Ink terminal UI, IDE bridge, permission engine, and several unreleased features

**Original discovery:** @Fried_rice (Chaofan Shou)

**Mirrors that went live immediately:**
- GitHub repo by @nichxbt
- Clean mirror by @baanditeagle

---

## Why It Mattered

This wasn't a security hack — it was the entire product roadmap publicly accessible via npm. The dev community tore through it within hours, discovering unreleased features, internal model codenames, and employee-only configurations.

It spread across the entire dev community within a day. By the time this was bookmarked, multiple analysis threads, GitHub mirrors, and exploit guides had already gone live.

---

## Key Insight

The speed of distribution of this leak demonstrated how transparent the AI tooling ecosystem has become — and how fast information moves in 2026. Anthropic's internal roadmap, model codenames, and employee-grade tooling were publicly readable for hours before being addressed.

---

## Related Bookmarks
- `02-claude-code-harness-is-product.md` — insight on what the leak reveals
- `03-claude-code-what-to-prepare.md` — Elliot Arledge's deep analysis
- `04-claude-code-employee-grade-overrides.md` — @iamfakeguru's CLAUDE.md guide
