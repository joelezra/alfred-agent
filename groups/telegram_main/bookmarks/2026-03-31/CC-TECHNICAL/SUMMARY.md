# CC-Technical Bookmarks — Research Summary
## Batch: 2026-03-31 | Filed: 2026-04-03

10 topics researched. All RESEARCH.md files complete.

---

## Topics

| # | Directory | One-Line Description |
|---|---|---|
| 1 | `01-garry-tan-gstack` | YC CEO Garry Tan's MIT-licensed Claude Code skill pack (28+ commands: CEO/Designer/QA roles) that claims 20K LOC/day via parallel Conductor sessions — and the Gregorein backlash showing his site loads 6.42MB across 169 requests |
| 2 | `02-claude-memory-architecture` | Paweł Huryn's (Product Compass) three-block CLAUDE.md system — Knowledge Ledger + Decision Journal + Quality Gate — that had Claude autonomously generating and applying 24 project-specific rules by week three |
| 3 | `03-jack-dorsey-hierarchy-to-intelligence` | Jack Dorsey + Roelof Botha's March 31 essay arguing that corporate hierarchy is just information routing that AI replaces — proposing only 3 roles (ICs, DRIs, Player-Coaches) and justifying Block's 4,000-person layoff |
| 4 | `04-paperclip-zero-human-company` | @dotta's MIT-licensed Paperclip platform (44,400 GitHub stars) that gives AI agents an org chart, budgets, goals, governance, and heartbeat scheduling — "OpenClaw is the employee, Paperclip is the company" |
| 5 | `05-awesome-claude-code` | The leading curated Claude Code resource repositories: hesreallyhim (35.8K stars, hooks/skills/commands/orchestrators), rohitg00 toolkit (31.3K stars, 135 agents + 400K skills), and the broader ecosystem of ~10,000 Claude Code plugin repos |
| 6 | `06-claude-code-system-prompts` | Repositories collecting Claude Code's actual system prompts — Piebald-AI extracts directly from npm on every release (110+ prompts, 139-version changelog), plus FlorianBruniaux's 225 production templates (CC0 licensed) |
| 7 | `07-free-code-fork-unlock` | @paoloanzn's fork of the accidentally leaked Claude Code source (March 31, 2026) with all telemetry removed and all 54 working experimental features enabled — legally risky, IPFS-archived, Anthropic's DMCA sweep accidentally hit 8,100 innocent repos |
| 8 | `08-gstack-vs-nanoclaw-vs-conductor` | Comparative landscape of Claude Code setup tools: gstack (workflow structure layer), Conductor (parallel session orchestration, macOS, free), NanoClaw/OpenClaw (communication/memory layer) — they stack, not compete |
| 9 | `09-claude-code-ultraplan` | ULTRAPLAN — Anthropic's unreleased internal-only feature running 10–30 minute server-side multi-agent planning sessions (parallel exploration agents + critique agent) on CCR with Opus, with a built-in secrecy clause instructing Claude to mislead users about how it works |
| 10 | `10-constraint-first-prompting` | The community-documented technique of stating rules/constraints before the task description — not formally coined, but widely practiced and backed by Anthropic's own best practices; the "contract format" (Role → Success Criteria → Constraints → Uncertainty Rule → Output Format) is its highest-impact implementation |

---

## Cross-Cutting Themes

**1. The Memory/Persistence Problem**
Every topic in this batch touches the fundamental problem of Claude's statelessness. Topics 2, 5, 6, 9, and 10 are all solving memory in different ways: persistent knowledge files, extractable system prompts, multi-agent session handoffs, and constraint persistence via CLAUDE.md.

**2. Organizational Structure for AI**
Topics 3, 4, and 8 all propose organizational structures for AI agents: Dorsey's three-role model at the corporate level, Paperclip's org chart + governance at the team level, and the layer-based stack (workflow/orchestration/communication) at the tooling level.

**3. The Quality Problem**
The Gregorein audit (topic 1), the quality gate concept (topic 2), and constraint-first prompting (topic 10) all address the same failure mode: high AI output volume ≠ high quality. The tools are getting better at quantity; structured processes are the only counter to AI slop.

**4. The Leak as Inflection Point**
Topics 7 and 9 are downstream of the March 31 source leak. The leak revealed a roadmap (ULTRAPLAN, KAIROS, BRIDGE_MODE, AGENT_TRIGGERS) that changes what to prepare for. The leak also created the free-code ecosystem — legally risky but informationally valuable.

**5. Everything Stacks**
No single tool in this batch replaces the others. The winning setup is: CLAUDE.md architecture (topic 2) + constraint-first prompting (topic 10) + gstack workflow (topic 1) + Conductor parallelism (topic 8) + Paperclip company layer (topic 4). Each operates at a different abstraction level.

---

## What to Act On First

1. **Install gstack** (`01`) — 30 seconds, zero cost, immediately useful
2. **Implement the three-block CLAUDE.md system** (`02`) — highest long-term ROI; creates compounding value
3. **Read Piebald-AI's FEATURES.md + ULTRAPLAN prompt** (`06`, `09`) — free intelligence about Anthropic's roadmap
4. **Evaluate Paperclip for multi-agent workloads** (`04`) — cost control alone is worth the setup

---

## Files in This Directory

```
CC-TECHNICAL/
├── SUMMARY.md                          ← this file
├── 01-garry-tan-gstack/
│   └── RESEARCH.md
├── 02-claude-memory-architecture/
│   └── RESEARCH.md
├── 03-jack-dorsey-hierarchy-to-intelligence/
│   └── RESEARCH.md
├── 04-paperclip-zero-human-company/
│   └── RESEARCH.md
├── 05-awesome-claude-code/
│   └── RESEARCH.md
├── 06-claude-code-system-prompts/
│   └── RESEARCH.md
├── 07-free-code-fork-unlock/
│   └── RESEARCH.md
├── 08-gstack-vs-nanoclaw-vs-conductor/
│   └── RESEARCH.md
├── 09-claude-code-ultraplan/
│   └── RESEARCH.md
└── 10-constraint-first-prompting/
    └── RESEARCH.md
```
