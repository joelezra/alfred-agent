# Admin Night App — Product Spec

## Vision

A life admin tracker with a social accountability layer. Not a task list — an activation energy remover. People CAN do their admin; they just can't make themselves START alone.

Build for the permanent need, market with the TikTok trend.

---

## Market Context

- **Pain**: 8.8 hours/week on life admin, 204 tasks/month, 82% can't keep up
- **Trend**: "Admin night" — TikTok wave peaking now (Mar 2026), ~6-9 month marketing window
- **Competition**: Nearly empty. Eggy pivoted to B2B. Get Adulting has 42 ratings. Nobody serious.
- **Target**: Gen Z / young Millennials (22-35), overwhelmed by adulting, TikTok-native
- **Bloomberg backlash piece** (Mar 7 2026) = near peak awareness. Clock is ticking.

## Core Product

### Dashboard
- Categories: Bills, Health, Vehicle, Home, Subscriptions, Documents
- Status: overdue (red), due soon (yellow), done (green)
- Smart reminders that escalate (30 days → 14 → 3 → OVERDUE)

### Admin Night (the differentiator)
- Tap "Start Admin Night" → solo or invite friends via link
- 45-min timer, everyone works through their own tasks
- See friends' progress bars (anonymised — task count only, not content)
- Reactions/emoji during session
- Session summary: tasks cleared, group total, streak

### Input Methods (by version)

| Version | Method | Cost | Effort |
|---------|--------|------|--------|
| MVP | Manual + templates | $0 (on-device) | 2-3 weeks |
| v1.1 | + Photo scan (OCR) + voice notes | $0 (iOS native) | 2 weeks |
| v2 | + Calendar sync | $0 (on-device) | 1-2 weeks |
| v3 | + Email scan + AI suggestions | $0.10-2.00/user/mo | 4-6 weeks |

### Templates
- Pre-built checklists: "Just moved," "Tax season," "Turning 26 insurance," "New job admin"
- Users can create/share custom templates

### Document Vault
- Snap photos of insurance cards, registration, receipts, lease
- Organised by category
- Search by text (OCR)

---

## Pricing

| Tier | Price | Includes |
|------|-------|----------|
| Free | $0 | Core tasks, templates, 1 admin night/month, basic reminders |
| Pro | $3.99/mo or $34.99/yr | Unlimited admin nights, photo scan, voice, calendar sync, document vault, smart reminders |
| Pro + AI | $6.99/mo or $59.99/yr | Everything in Pro + email scan, AI suggestions, proactive nudges |
| Lifetime (Pro) | $59.99 | Pro forever (no AI — can't offer lifetime on ongoing API costs) |

### Revenue Projections

| Scenario | Timeline | Users | Paying (5%) | Monthly Revenue |
|----------|----------|-------|-------------|-----------------|
| Conservative | 6 months | 50K | 2,500 | ~$8K/mo |
| Moderate | 12 months | 200K | 10,000 | ~$35K/mo |
| Strong | 18 months | 500K | 25,000 | ~$85K/mo |

### Growth Loop
Free users get 1 admin night/month → invite friends → friends download → friends hit limit → friends upgrade. Network-effect built into the paywall.

---

## Build Order

### Phase 1: MVP (3-4 weeks) — SHIP FAST
- Manual task tracking with categories
- Template library (5-10 pre-built checklists)
- Smart reminders (escalating)
- Admin Night: invite friends, timer, progress bars, session summary
- Free + Pro tiers
- **Goal**: App Store while TikTok wave is live

### Phase 2: Friction Reduction (2-3 weeks)
- Photo scan (iOS Vision framework — free, on-device)
- Voice capture (iOS Speech framework — free, on-device)
- Document vault with photo storage

### Phase 3: Proactive (2-3 weeks)
- Calendar sync (HealthKit-style permission)
- Recurring task detection
- "You haven't done X in Y months" nudges

### Phase 4: AI Moat (4-6 weeks)
- Email scanning (with permission) → auto-creates tasks
- AI suggestions and proactive nudges
- Pro + AI tier launch
- Lifetime Pro option

### Phase 5: On-Device AI Migration (ongoing)
- Shift API-dependent AI features to on-device (Apple Intelligence, MLX)
- Margins improve as API costs drop to zero
- Eventually fold AI into Pro tier

---

## Marketing Strategy

### Ride the wave (now through Sep/Oct 2026)
- TikTok organic: film admin night sessions, post as-is
- Design core interaction for 10-second screen recording
- "This app is $50 once, not $10/month forever" — anti-subscription angle
- Screenshot user comments, reuse their language in App Store listing

### Post-wave (Oct 2026+)
- Stand on product merit
- Community/word-of-mouth from admin night social loop
- Template library as content marketing (shareable checklists)
- Don't brand around "admin night" — brand around "life admin made simple"

---

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Trend dies before launch | HIGH | Ship in 3-4 weeks, not 3-4 months |
| Notion/Todoist add life admin templates | MEDIUM | Their DNA is work productivity; life admin is different UX |
| Apple Reminders good enough | MEDIUM | No social layer, no smart categories, no proactive reminders |
| Users won't pay | MEDIUM | Lifetime option + generous free tier |
| Privacy concerns (documents, email) | HIGH | Offline-first, on-device processing, no account required for core |

---

## Key Insight

"The TikTok trend is a 6-12 month marketing window, not a product thesis. But it points to a durable, quantified pain. Build for the need, market with the trend."

The social layer (admin night) is what makes people download. The life admin tracker is what makes them stay.

---

## Research Sources

Full market validation reports saved at:
- `app-store-research-2026-03-25.md` — broad market scan
- Deep-dive reports generated from Reddit, TikTok, X/Twitter research agents

Key data:
- CNN, Bloomberg, Marie Claire, Her Campus coverage of admin night trend
- Brightpearl: 8.8 hours/week on life admin, 204 tasks/month
- Deloitte 2025: 40% Gen Z overwhelmed, 47% rate mental health fair/poor
- RevenueCat 2026: subscription app conversion benchmarks
- Eggy ($7M valuation, pivoted to B2B), Get Adulting (42 ratings)
