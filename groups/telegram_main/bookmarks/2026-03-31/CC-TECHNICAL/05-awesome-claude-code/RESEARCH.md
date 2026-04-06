# Awesome Claude Code — Curated Resource Repositories

**Source:** GitHub search for "awesome-claude-code" and "awesome-claude-skills"
**Author:** Multiple — primary: @hesreallyhim (hesreallyhim/awesome-claude-code), @rohitg00, @travisvn, others
**Bookmarked:** 2026-03-31
**Category:** AI / Claude Code Technical
**Type:** Reference
**Engagement:** hesreallyhim/awesome-claude-code: 35,800 stars, 2,800 forks; rohitg00 toolkit: 31,300 stars

---

## TL;DR

The "awesome-claude-code" ecosystem on GitHub has exploded in early 2026. The leading repository (hesreallyhim/awesome-claude-code) has 35,800 stars and catalogs skills, hooks, slash-commands, agent orchestrators, applications, and plugins. A competing "toolkit" repo (rohitg00) claims 135 agents, 35 curated skills, and 400,000+ skills via SkillKit. Multiple adjacent repos focus specifically on skills, prompts, or system prompt collections — each filling a different niche.

## Key Claims

- hesreallyhim/awesome-claude-code: 35,800 stars, 2,800 forks, 950 commits, actively maintained
- rohitg00/awesome-claude-code-toolkit: 31,300 stars, claims 135 agents + 400,000 skills via SkillKit
- quemsah/awesome-claude-plugins: 9,988 repositories indexed (as of March 31, 2026), automated metrics
- Official Claude Code skills repo: 37,500 stars (Anthropic's own public skills repository)
- The main Claude Code repo itself: 55,000 stars
- Category breadth: agent skills, hooks, slash-commands, CLAUDE.md templates, orchestrators, monitoring tools, alternative clients

## Deep Dive

### The Leading Repository: hesreallyhim/awesome-claude-code

URL: https://github.com/hesreallyhim/awesome-claude-code

**Stats:** 35,800 stars, 2,800 forks, 950 commits, 150 open issues (indicating active community)

**What makes it the leading repo:**
- Comprehensive scope covering the entire ecosystem
- Selective curation — focuses on functional tools over template collections
- Multiple presentation formats (Awesome, Classic, Extra, Flat)
- Active maintenance with recent additions
- Strong community engagement (150+ issues)

**Primary Categories:**

1. **Agent Skills** — model-controlled configurations enabling specialized tasks. These are SKILL.md-based folders that Claude discovers and loads on demand.

2. **Workflows & Knowledge Guides** — tightly-coupled resources for specific project types or domains

3. **Tooling** — applications built on top of Claude Code:
   - IDE integrations
   - Usage monitors (ccflare: web-UI dashboard for usage metrics)
   - Orchestrators (Ruflo: self-learning autonomous swarms with vector memory)
   - Config managers

4. **Status Lines** — terminal statusline customizations showing Claude's operational state

5. **Hooks** — lifecycle automation via Claude's agentic process hooks API:
   - Pre-tool-call hooks
   - Post-tool-call hooks
   - On-start hooks
   - On-completion hooks

6. **Slash-Commands** — custom commands organized by function:
   - Git operations
   - Testing workflows
   - Documentation generation
   - CI/deployment

7. **CLAUDE.md Files** — language and domain-specific configuration templates:
   - Python projects
   - TypeScript/React
   - Rust
   - Go
   - Data science
   - DevOps/infrastructure

8. **Alternative Clients** — non-official Claude interfaces and wrappers

9. **Official Documentation** — Anthropic reference materials

**Notable items listed:**
- **TSK** (by dtormoen): Rust CLI for delegating development tasks to AI agents in sandboxed Docker environments; multiple agents in parallel; returns git branches for review
- **agnix** (by agent-sh): comprehensive linter for Claude Code agent files (validates CLAUDE.md, AGENTS.md, SKILL.md, hooks, MCP); plugins for all major IDEs; auto-fixes
- **Simone** (by Helmi): project management workflow system — not just commands but a complete system of documents, guidelines, and processes
- **Ruflo**: multi-agent orchestration with self-learning autonomous swarms, vector-based memory, systematic planning
- **claude-devtools**: detailed observability into Claude Code sessions with log analysis and visualization
- **Context Engineering Kit** (by Vlad Goncharov): advanced context engineering techniques with minimal token footprint, focused on agent result quality

### The Toolkit Competitor: rohitg00/awesome-claude-code-toolkit

URL: https://github.com/rohitg00/awesome-claude-code-toolkit

**Stats:** 31,300 stars

**Claims:** "The most comprehensive toolkit for Claude Code":
- 135 agents
- 35 curated skills
- 400,000+ skills via SkillKit integration
- 42 commands
- 150+ plugins
- 19 hooks
- 15 rules
- 7 templates
- 8 MCP configs

**Distinctive features:**
- 6 deep-dive guides on cost optimization
- 15 ranked strategies for reducing Claude Code spend
- 12 CLAUDE.md templates
- Token estimator and usage analyzer
- Copy-paste configs throughout
- Claims to save 30-60% on Claude Code costs

**Difference from hesreallyhim:** rohitg00 is more of an all-in-one toolkit you install, while hesreallyhim is a curated index you navigate. Different use cases.

### Skills-Focused Repos

**travisvn/awesome-claude-skills**
URL: https://github.com/travisvn/awesome-claude-skills

Focus: Claude Skills specifically — the specialized folders containing instructions, scripts, and resources that Claude dynamically discovers.

Key architectural insight documented: **Progressive disclosure architecture**
- Metadata loading (~100 tokens): Claude scans available skills to identify relevant matches
- Full instructions (<5k tokens): loaded when Claude determines the skill applies
- Bundled resources: loaded only as needed

This is how you keep Claude's context window clean while having a large skill library.

**ComposioHQ/awesome-claude-skills**
URL: https://github.com/ComposioHQ/awesome-claude-skills

A curated list focused on tools for customizing Claude AI workflows — oriented toward Composio's integration platform.

**BehiSecc/awesome-claude-skills**
URL: https://github.com/BehiSecc/awesome-claude-skills

Categorized skills for: document handling, development tools, data analysis, and more.

### The Automated Metrics Repo: quemsah/awesome-claude-plugins

URL: https://github.com/quemsah/awesome-claude-plugins

Unique approach: automated collection of Claude Code plugin adoption metrics across GitHub using n8n workflows. 9,988 repositories indexed as of March 31, 2026.

This is a quantitative alternative to curated lists — it tracks which Claude Code plugins are actually being used across real repos, not just which ones got listed in an awesome-list.

### The Aggregator: webfuse-com/awesome-claude

URL: https://github.com/webfuse-com/awesome-claude

A meta-list covering everything Claude-related: models, tools, integrations, agents, skills. Points to all the major Claude Code awesome lists as sub-resources.

### Commercial Platform: aitmpl.com

URL: https://www.aitmpl.com/

A commercial browsing + install platform for Claude Code components:
- 1,000+ pre-built components
- Categories: AI agents, slash commands, MCP integrations, hooks, settings
- Free, open-source CLI tool for installation
- Browsable web interface

This is the "App Store" model applied to the awesome-claude-code ecosystem.

### The Scope of the Ecosystem (April 2026)

The quemsah metrics repo indexing 9,988 repositories using Claude Code plugins indicates the ecosystem has grown to roughly 10,000 active projects integrating Claude Code tooling. The awesome-claude-code lists are the discovery layer for this ecosystem.

Mapping the ecosystem state:
- Claude Code itself: 55,000 GitHub stars
- Official skills repo: 37,500 stars
- hesreallyhim/awesome-claude-code: 35,800 stars
- rohitg00 toolkit: 31,300 stars
- ~10,000 repos using Claude Code plugins

## Key Links

- Leading list: https://github.com/hesreallyhim/awesome-claude-code
- Full toolkit: https://github.com/rohitg00/awesome-claude-code-toolkit
- Skills-focused: https://github.com/travisvn/awesome-claude-skills
- Composio skills: https://github.com/ComposioHQ/awesome-claude-skills
- BehiSecc skills: https://github.com/BehiSecc/awesome-claude-skills
- Plugin metrics: https://github.com/quemsah/awesome-claude-plugins
- Aggregator: https://github.com/webfuse-com/awesome-claude
- Commercial platform: https://www.aitmpl.com/
- ClaudeLog summary: https://claudelog.com/claude-code-mcps/awesome-claude-code/
- GitHub topic: https://github.com/topics/claude-code

## Actionable Takeaways

1. **Bookmark hesreallyhim/awesome-claude-code** as the primary discovery resource — it's the most authoritative curated index for new tools, skills, and integrations
2. **Check rohitg00's cost optimization guides** — the 15 ranked strategies for reducing Claude Code spend and 12 CLAUDE.md templates are practically valuable for active users
3. **Use the progressive disclosure architecture** (from travisvn) when building new skills — metadata (~100 tokens) → full instructions (<5k tokens) → bundled resources. This is the right skill architecture.
4. **Monitor quemsah/awesome-claude-plugins** for adoption data — which tools are actually being used across the ecosystem vs. which are just well-marketed
5. **Look for CLAUDE.md templates** in hesreallyhim and rohitg00 for your specific tech stack — there are language/framework-specific templates that are directly drop-in usable

## Connections

- The skills listed here (especially agnix linter) are quality tools for the gstack and CLAUDE.md architectures discussed in `01-garry-tan-gstack` and `02-claude-memory-architecture`
- The orchestrators listed (Ruflo, TSK) overlap with the Paperclip landscape from `04-paperclip-zero-human-company`
- The CLAUDE.md templates are extensions of the three-block system from `02-claude-memory-architecture`
- The system prompts collection (Piebald-AI) is covered in more depth in `06-claude-code-system-prompts`
