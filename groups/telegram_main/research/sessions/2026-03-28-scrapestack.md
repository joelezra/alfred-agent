# Session: ScrapeStack Build
**Date:** 2026-03-28
**Status:** Built and running

## What We Built
A personal web scraping stack to power all future SaaS products.
Lives at: `/workspace/group/scrapestack/`

## Stack
- **Scrapling** (33.5k ⭐) — scraping + anti-bot + proxy rotation
- **Crawl4AI** (51k ⭐) — HTML → clean markdown for LLM processing
- **Dramatiq + Redis** — job queue for scale (production)
- **changedetection.io** (30.8k ⭐) — monitor site changes
- **FastAPI** — REST API layer
- **SQLite** (dev) / **PostgreSQL** (production)

## Running Now
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Dev mode: SQLite + inline tasks (no Docker needed)
- API Key: ss-local-dev-key-change-in-prod

## API Endpoints
- POST /scrape — submit URL, get job_id
- GET /scrape/{job_id} — get result
- POST /crawl — crawl entire site
- GET /jobs — list all jobs
- POST /monitor — add URL to change monitoring

## Anti-Bot Open Source Stack (for production)
| Tool | Stars | What it does |
|---|---|---|
| Patchright | 2.7k | Fixes Playwright CDP leak — passes Cloudflare |
| Camoufox | 6.4k | Firefox fork, C++-level fingerprint spoofing |
| Scrapling | 33.5k | Full framework + proxy rotation + anti-bot |
| NopeCHA | 10.2k | Auto-solves reCAPTCHA, hCaptcha, Turnstile |
| Crawl4AI | 51k | Async Python, clean markdown output |
| Lightpanda | 21.5k | 11x faster than Chrome, 9x less memory |

## How This Powers Products
- YouTube Client Finder → crawl channels → Claude extracts contacts
- Shopify Tracker → monitor product pages → alert on changes
- Newsletter Sponsor Finder → batch scrape marketplaces → store results
- Pattern: scrape → clean markdown → AI processes → store → surface

## Production Deploy (when ready)
1. Set POSTGRES_PASSWORD and API_KEY in .env
2. docker compose up -d
3. API shifts to Postgres + Redis + Scrapling anti-bot
