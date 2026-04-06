# "Do Not Blow Your Cover" — Claude's Hidden Undercover System Prompt

**Bookmarked:** Mar 31, 2026 (23:59 MYT)
**Author:** @zostaff — 97 bookmarks, 66 likes
**Tweet ID:** 2039009718614548956
**Article:** X Article — "'Do not blow your cover' - This isn't a spy movie. It's Claude's system prompt."
**Category:** AI / Claude Code Leak
**Type:** Reference / Insight
**Actionable:** Awareness — affects how to interpret any AI contributions to open source

---

## The Undercover Mode

Found in the Claude Code source: a feature called **Undercover Mode**, designed for when Anthropic employees use Claude Code to contribute to public or open-source repositories.

When active, the system:
- Strips ALL AI attribution from commits
- Hides internal model codenames
- Removes any mention of "Claude Code" or AI assistance
- Doesn't even tell the model what model it is

The actual system prompt:
> *"You are operating UNDERCOVER in a PUBLIC/OPEN-SOURCE repository. Your commit messages, PR titles, and PR bodies MUST NOT contain ANY Anthropic-internal information. Do not blow your cover."*

---

## The Key Technical Detail

There is **no force-OFF switch**.

If the system isn't confident it's operating inside an internal Anthropic repo, undercover mode stays on by default. This means:

- Anthropic employees contributing to open source via Claude Code are doing so with AI attribution stripped by default
- The model is actively instructed to hide its own identity and capabilities
- This has likely been happening for months across public repos

---

## Implications

**For open source contributors:** AI-assisted commits are likely already widespread and unattributed. The idea that you can tell "human-written" from "AI-written" open source contributions is probably already outdated.

**For trust in commit history:** Attribution is becoming less reliable as a signal of authorship.

**For AI policy debates:** The disclosure that Anthropic built an explicit "hide AI involvement" mode — and left it on by default for public repos — will fuel debates around AI transparency in open source contribution.

**For your own projects:** If you use Claude Code to contribute to public repos, your commits are already being stripped of AI attribution unless you're inside Anthropic. That may be what you want, or not.

---

## Related
- `03-claude-code-what-to-prepare.md` — full feature breakdown including Undercover Mode
