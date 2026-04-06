# Top 60 Claude Skills, Workflows & GitHub Repos for AI — Complete List
**Source:** https://x.com/PrajwalTomar_/status/2038654002611769529 (quote-tweet of @eng_khairallah1's X Article)
**X Article ID:** 2037612358349320193 (by Khairallah AL-Awady)
**Author of article:** @eng_khairallah1 (Khairallah AL-Awady) — AI tooling researcher and creator. Spent 100+ hours personally testing tools. Posted March 28, 2026. Article: 2,639 likes, 401 RTs, 10,273 bookmarks — massive engagement.
**Author of quote-tweet:** @PrajwalTomar_ (Prajwal Tomar) — Builder of 10+ client MVPs via @ignytlabs. 51k+ followers on X. Active Claude Code educator. Builds with Google Stitch + Claude Code + Cursor.
**Date:** 2026-03-30
**Category:** AI Tools / Claude / Developer Resources
**Type:** Reference (master list)
**Engagement:** 17,601 views, 178 bookmarks (Prajwal's tweet) | 10,273 bookmarks (original article — massive)

## TL;DR
Khairallah AL-Awady spent 100+ hours testing AI tools and produced a definitive 60-item list of Claude skills, workflows, and GitHub repos that actually work in 2026. Organized into 9 categories with honest notes on each. This is the most comprehensive practical reference in this entire bookmark batch.

## Key Claims
- 80,000+ community Claude skills exist — the list filters to 60 that actually work
- Clear taxonomy: Skills = teach Claude HOW to do things; MCP = give Claude ACCESS to external tools
- 10,273 bookmarks on the original article = extremely high signal that this is useful
- One commenter (@Asimov_ai_) warns: ClawHub had 1,100+ malicious packages at last count — always check SKILL.md for reverse shells before installing
- Another (@claudiaonchain) notes: only ~10 of 60 survive a context reset (memory persistence is the real filter)

## Deep Dive
**The Full 60-Item List by Category:**

**Part 1: AI Coding Agents & IDEs**
01. Claude Code — Anthropic's CLI coding agent; gold standard for AI-assisted dev
02. Cursor — AI-first VS Code fork; best for devs wanting AI in existing workflow
03. Codex CLI — OpenAI's terminal agent; strong for multi-step implementation
04. Windsurf — AI IDE by Codeium; Cascade agent for multi-file editing
05. Superpowers — 20+ battle-tested Claude Code skills; 96k GitHub stars; install first
06. Spec Kit (GitHub) — spec-driven development; 50k stars
07. Aider — AI pair programming in terminal; works with any LLM; 30k stars

**Part 2: Agent Frameworks**
08. OpenClaw — viral open-source AI agent; persistent, multi-channel (WhatsApp/Telegram/Discord); writes own skills; 210k stars
09. LangGraph — multi-agent orchestration as code; 26k stars
10. CrewAI — multi-agent with roles/goals/backstories; team-like workflows
11. AutoGPT — OG agent platform; matured significantly
12. Dify — open-source LLM app builder; good for non-developers
13. OWL — tops GAIA benchmark for agent coordination
14. CopilotKit — embed AI copilots in React apps
15. pydantic-ai — type-safe agent framework for Python

**Part 3: MCP Servers & Tool Integration**
16. Tavily — search engine built for AI agents; clean LLM-ready data; 4 tools; remote MCP in 1 minute
17. Context7 — injects up-to-date library docs into context; no more hallucinated APIs; use "context7" in prompts
18. Task Master AI — AI project manager; feed a PRD → structured tasks with dependencies
19. MCP Playwright — browser automation for LLMs; natural language browser control
20. fastmcp — build MCP servers in minimal Python; fastest custom tool integration
21. markdownify-mcp — convert PDFs/images/audio to Markdown for AI pipelines
22. MCPHub — manage multiple MCP servers via HTTP dashboard

**Part 4: Claude Skills (Top Picks)**
23. PDF Processing (Official) — read, extract tables, fill forms, merge/split; highest utility for knowledge workers
24. Frontend Design (Official) — real design systems, bold typography, production UI; 277k installs
25. Skill Creator (Official) — meta-skill; describe workflow → complete SKILL.md in 5 minutes
26. Marketing Skills by Corey Haines — 20+ skills covering CRO, copywriting, SEO, email sequences
27. Claude SEO — full-site audits, schema validation, keyword analysis; 12 sub-skills
28. Obsidian Skills (by Obsidian CEO) — auto-tagging, auto-linking, vault-native operations
29. Context Optimization — reduce token costs and improve KV-cache efficiency; 13.9k stars
30. Deep Research Skill — 8-phase research with auto-continuation

**Part 5: Local AI & Model Running**
31. Ollama — run open-source LLMs locally with one command; supports Llama/Mistral/Gemma
32. Open WebUI — self-hosted ChatGPT-like interface; pairs with Ollama
33. LlamaFile — entire LLM as single executable file; zero dependencies
34. Unsloth — fine-tune models 2x faster with 70% less memory
35. vLLM — high-throughput inference engine; 2-4x faster serving; production standard

**Part 6: Workflow & Automation**
36. n8n — open-source workflow automation; 400+ integrations; AI nodes; self-hostable
37. Langflow — visual drag-and-drop agent pipelines; 140k stars
38. Huginn — self-hosted web agents for monitoring/alerts/data; privacy-first
39. DSPy — program (not prompt) foundation models; Stanford research
40. Temporal — durable workflow engine for long-running processes; survives crashes/retries

**Part 7: Search, Data & RAG**
41. GPT Researcher — autonomous research agent producing compiled reports
42. Firecrawl — turn any website into LLM-ready data; built for AI pipelines
43. Vanna AI — natural language to SQL
44. Instructor — structured JSON outputs from any LLM using Pydantic; 15+ providers; what production engineers use
45. Chroma — open-source vector database; simplest semantic search + memory
46. dlt — LLM-native data pipelines from 5,000+ sources
47. ExtractThinker — ORM for document intelligence

**Part 8: API & Infrastructure**
48. FastAPI — Python web framework for AI applications; Pydantic validation built in
49. Portkey Gateway — route to 250+ LLMs through one API; switch models without code changes
50. OmniRoute — API proxy for 44+ AI providers; load balancing + fallbacks
51. lmnr — trace and evaluate agent behavior; production observability
52. Codebase Memory MCP — convert codebase to persistent knowledge graph; Claude remembers across sessions

**Part 9: Collections & Learning**
53. Awesome Claude Skills — best curated skill list; 22k stars; start here for new skills
54. Anthropic Skills Repo — official reference implementations; gold standard
55. Awesome Agents — 100+ open-source agent tools
56. PromptingGuide — comprehensive prompt engineering reference
57. Anthropic Prompt Engineering Tutorial — 9 chapters, Jupyter notebooks; best structured learning
58. SkillsMP — marketplace with 80k+ community skills; largest catalog
59. MAGI//ARCHIVE — daily feed of fresh AI repos
60. Anthropic Official Docs — read cover to cover before building anything serious

**Recommended Starter Stacks:**
- Developer: Claude Code + Superpowers + Context7 + Tavily
- Creator/knowledge worker: OpenClaw + Obsidian Skills + PDF Processing + Frontend Design
- Product builder: FastAPI + Instructor + Chroma + LangGraph
- Learner: Anthropic Tutorial + PromptingGuide + Anthropic Docs

**Security Warning (from @Asimov_ai_ in replies):**
ClawHub had 1,100+ malicious packages. Before installing any skill: check for reverse shells in scripts, data exfiltration patterns, encoded payloads. Read SKILL.md before install. This is critical.

**Context Persistence Warning (from @claudiaonchain):**
Only ~10 of the 60 actually survive a context reset. The ones that stick: memory persistence, structured handoffs, hooks that reload state after compaction. Evaluate skills for this specifically if you need persistent workflows.

## Key Links
- Full article: http://x.com/i/article/2037612358349320193
- Khairallah's profile: https://x.com/eng_khairallah1
- Prajwal Tomar's profile: https://x.com/PrajwalTomar_
- OpenClaw GitHub: https://github.com/openclaw/openclaw
- Paperclip GitHub: https://github.com/paperclipai/paperclip
- Superpowers: https://github.com/obra/superpowers
- SkillsMP: https://skillsmp.com
- Awesome Claude Skills: https://github.com/travisvn/awesome-claude-skills
- Anthropic Skills Repo: https://github.com/anthropics/skills
- Task Master AI: https://github.com/eyaltoledano/claude-task-master
- Context7: https://github.com/upstash/context7
- Marketing Skills (Corey Haines): https://github.com/coreyhaines31/marketingskills

## Actionable Takeaways
- Install immediately: Superpowers (#5) + Context7 (#17) + Task Master AI (#18) — highest utility for Claude Code users
- For content/marketing: Corey Haines Marketing Skills (#26) + Claude SEO (#27)
- For research: Deep Research Skill (#30) + Tavily (#16) + GPT Researcher (#41)
- ALWAYS read SKILL.md before installing any community skill — malicious packages are real
- Test skills for context persistence before relying on them for long-running workflows
- n8n (#36) is the most powerful workflow automation for non-coders — 400+ integrations, AI nodes, self-hostable
- Instructor (#44) is what production AI engineers actually use for structured outputs — learn it

## Connections
- This is the reference document for tools used across ALL other bookmarks in this batch
- OpenClaw (#8 in the list) is the agent used in tweets #6 (Paperclip), #7 (trading bots)
- Claude Code is the tool referenced in tweet #4 (vibe coding website business)
- The Corey Haines marketing skills (#26) connect directly to tweets #1-3 on GTM/content strategy
- Paperclip (from tweet #6) works with OpenClaw — both now have full context from this list
