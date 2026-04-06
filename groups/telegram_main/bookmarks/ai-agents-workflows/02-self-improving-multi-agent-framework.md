# Super Self-Improving Multi-Agent Framework

**Bookmarked:** Mar 31, 2026 (16:31 MYT)
**Author:** @gkisokay (Graeme) — 47k views, 337 likes, 657 bookmarks
**Tweet ID:** 2038896951891210309
**Category:** AI Agents & Workflows
**Type:** Reference / Architecture Pattern
**Actionable:** YES — architecture pattern applicable to autonomous systems

---

## The Architecture

Three-agent system for autonomous self-improvement and bug monitoring:

### Agent 1: Main Agent (Hermes)
- Operates your workflows
- Sits at the top of the agent hierarchy
- Runs workflows using persistent memory and self-improving skills
- The one you interact with directly

### Agent 2: Main's Supervisor (Hermes)
- Monitors the ENTIRE system
- Reads operation logs and failure logs
- Searches for bugs and solutions
- Brings issues to Agent 3 for verification

### Agent 3: External Supervisor (OpenClaw/different model)
- Also monitors the Hermes system from outside
- Searches for issues and solutions independently
- Acts as a check on Agent 2's assessments

---

## The Feedback Loop

Multiple times per day, Agent 2 audits the system:
1. Finds errors, stale jobs, failures
2. Proposes a fix
3. Tags Agent 3

Agent 3:
1. Audits the system
2. Reads Agent 2's summary
3. Verifies the problem and solution
4. Together, they iterate in a dedicated channel until they find a coded solution

**Risk-based escalation:**
- Low-risk fix → auto-fixes immediately
- High-risk fix → escalated to Agent 1 for human approval

---

## The Two Goals

1. **Never worry** that the system is operating correctly (monitoring goal)
2. **Two separate agents focused on improvements** — not just fixing bugs, but making the system meaningfully better over time

In the ideal state: no bugs to fix, so both supervisors are fully focused on proposing improvements. The system gets smarter every day without human intervention.

---

## Why This Architecture Works

The key insight is using a **different model/agent as the external supervisor (Agent 3)**. Using a different perspective (OpenClaw vs Hermes) means you get independent verification rather than two instances of the same model agreeing with each other.

This mirrors how human organizations work: internal audit + external audit. One agent may have blind spots the other doesn't.

---

## Practical Application

This pattern is directly applicable to:
- The ICT trading system — an agent monitoring if the cron jobs ran correctly, if data quality is good, if analyses are being saved properly
- Any production autonomous system where you want monitoring without constant human oversight
- SaaS products where you want background reliability agents

**The meta-insight:** The first goal is peace of mind. The second is compounding improvement. Most people build systems, then manually monitor them. This architecture makes the system monitor and improve itself.

---

## What's Next (from the author)

Graeme mentioned he's "cooking up something" toward building more sentience in agents — hinting at persistent goal-directed behaviour beyond reactive monitoring. No details yet, but worth following @gkisokay.
