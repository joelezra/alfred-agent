# agent-browser — Research Notes

**Source:** Vercel Labs (`vercel-labs/agent-browser`), Apache-2.0
**Not** Anthropic native — third-party tool designed to be called by AI agents via Bash.

## Architecture

- Native **Rust binary** (not Playwright/Puppeteer)
- Speaks **CDP (Chrome DevTools Protocol)** directly to Chromium
- Daemon model: background process keeps browser state alive between CLI calls
- Pre-compiled platform binaries bundled in npm package
- In NanoClaw container: uses system Chromium (`/usr/bin/chromium`)

## Key Design: Accessibility Tree + Refs (not pixels)

Instead of screenshots + pixel coordinates (like Anthropic's computer use), uses token-efficient refs:

```bash
agent-browser open https://example.com
agent-browser snapshot -i    # → @e1 [button] "Submit", @e2 [input] "Email"...
agent-browser fill @e2 "hello@example.com"
agent-browser click @e1
```

~200-400 tokens per snapshot vs 3000-5000 for full DOM.

## Command Surface

| Group | Commands |
|-------|---------|
| Navigation | `open`, `back`, `forward`, `reload`, `close`, `connect` |
| Snapshot | `snapshot [-i] [-c] [-d N] [-s selector]` |
| Interaction | `click`, `fill`, `type`, `press`, `hover`, `check`, `select`, `scroll`, `drag`, `upload` |
| Semantic locators | `find role/text/label/placeholder/alt/testid/first/last/nth` |
| Get info | `get text/html/value/attr/title/url/count/box/styles` |
| State check | `is visible/enabled/checked` |
| Screenshots | `screenshot [--full] [--annotate]`, `pdf`, `record start/stop` |
| Wait | `wait <sel\|ms\|--text\|--url\|--load\|--fn>` |
| Settings | `set viewport/device/geo/offline/headers/credentials/media` |
| Cookies/storage | `cookies`, `storage local/session` |
| Network | `network route/unroute/requests/har` |
| Tabs/frames | `tab new/close/switch`, `window new`, `frame` |
| Auth | `state save/load`, `--profile`, `--session-name`, `auth vault` |
| Batch | `batch` (pipe JSON array of commands) |
| Debug | `trace`, `profiler`, `console`, `errors`, `highlight`, `inspect`, `diff` |
| JS | `eval`, `eval -b <base64>`, `eval --stdin` |

## Use Cases for NanoClaw

- Browse websites that WebFetch can't handle (SPAs, dynamic pages)
- Fill forms, interact with web apps
- Scrape data from complex sites
- Take screenshots for visual reports
- Auth state persistence for repeated access to logged-in sites
