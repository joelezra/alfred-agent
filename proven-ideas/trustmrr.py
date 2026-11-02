#!/usr/bin/env python3
"""Fetch TrustMRR's public discovery feed and filter it into proven-ideas winners.

Revenue on TrustMRR is read straight from the payment provider (Stripe, Paddle,
Lemon Squeezy, ...), so these are checked numbers, not self-reported claims.

Usage:
  trustmrr.py winners [--min 1000] [--max 20000] [--seen FILE] [--json]
  trustmrr.py startup <slug>          # print the startup's .md profile
  trustmrr.py growth3m [--min-month 1000] [--pool 150] [--json]
      Fastest growers over the last 3 full months. TrustMRR has no public
      3-month ranking, so this builds a pool (fastest-growing + recently added
      + their "Discover more" recommendations), reads each public .md page's
      monthly revenue timeline, and compares the latest full month with the
      month 3 months earlier. The pool is a sample, not all 15k startups.
"""
import argparse
import json
import re
import sys
import urllib.request

DISCOVERY = "https://trustmrr.com/api/ai/discovery"
STARTUP_MD = "https://trustmrr.com/startup/{slug}.md"
UA = {"User-Agent": "proven-ideas/1.0"}


def get(url: str) -> bytes:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def seen_slugs(path: str | None) -> set[str]:
    """Collect slugs already mentioned in list.md / no-list so they never come back."""
    if not path:
        return set()
    slugs: set[str] = set()
    for p in path.split(","):
        try:
            text = open(p, encoding="utf-8").read()
        except FileNotFoundError:
            continue
        slugs.update(re.findall(r"trustmrr\.com/startup/([a-z0-9-]+)", text))
        slugs.update(re.findall(r"`([a-z0-9-]+)`", text))
    return slugs


def cmd_winners(a) -> None:
    data = json.loads(get(DISCOVERY))
    skip = seen_slugs(a.seen)
    out = []
    for s in data.get("fastestGrowingStartups", []):
        rev = (s.get("revenue") or {}).get("last30Days") or 0
        if s.get("stealthMode") or not (a.min <= rev <= a.max):
            continue
        out.append({
            "name": s.get("name"),
            "slug": s.get("slug"),
            "url": s.get("url"),
            "website": s.get("website"),
            "category": s.get("category"),
            "description": (s.get("description") or "").strip(),
            "revenue_30d": round(rev),
            "mrr": round((s.get("revenue") or {}).get("mrr") or 0),
            "growth_30d_pct": round(s.get("growth30d") or 0),
            "payment_provider": s.get("paymentProvider"),
            "on_sale": s.get("onSale"),
            "new": s.get("slug") not in skip,
        })
    out.sort(key=lambda x: (not x["new"], -x["revenue_30d"]))
    if a.json:
        json.dump(out, sys.stdout, indent=1)
        print()
        return
    for w in out:
        tag = "NEW " if w["new"] else "seen"
        print(f"[{tag}] {w['name']} (`{w['slug']}`) — ${w['revenue_30d']:,}/30d, "
              f"+{w['growth_30d_pct']}% growth, {w['category'] or 'n/a'}, via {w['payment_provider']}")
        print(f"       {w['description'][:160]}")
        print(f"       {w['url']}  |  {w['website']}")
    if not out:
        print("No startups in the revenue range today.")


def month_add(ym: str, n: int) -> str:
    y, m = map(int, ym.split("-"))
    m += n
    y += (m - 1) // 12
    m = (m - 1) % 12 + 1
    return f"{y:04d}-{m:02d}"


def parse_md(md: str) -> dict:
    months = {}
    sec = md.split("### Monthly revenue timeline", 1)
    if len(sec) == 2:
        for ym, val in re.findall(r"^\| (\d{4}-\d{2}) \| \$([\d,.]+) \|", sec[1].split("\n## ", 1)[0], re.M):
            months[ym] = float(val.replace(",", ""))
    desc = re.search(r"^- Description: (.*)$", md, re.M)
    name = re.search(r"^- Name: (.*)$", md, re.M)
    prov = re.search(r"^- Verified payment provider API source: (.*)$", md, re.M)
    related = re.findall(r'"slug": "([a-z0-9-]+)"', md.split("## Discover More Startups", 1)[-1])
    return {"months": months, "description": desc.group(1).strip() if desc else "",
            "name": name.group(1).strip() if name else "",
            "provider": prov.group(1).strip() if prov else "", "related": related}


def cmd_growth3m(a) -> None:
    import datetime
    import time
    data = json.loads(get(DISCOVERY))
    seeds = data.get("fastestGrowingStartups", []) + data.get("recentlyAddedStartups", [])
    queue = [s["slug"] for s in seeds if not s.get("stealthMode")]
    seen: set[str] = set()
    pages = {}
    while queue and len(pages) < a.pool:
        slug = queue.pop(0)
        if slug in seen:
            continue
        seen.add(slug)
        try:
            info = parse_md(get(STARTUP_MD.format(slug=slug)).decode("utf-8", "replace"))
        except Exception:
            continue
        pages[slug] = info
        queue.extend(r for r in info["related"] if r not in seen)
        time.sleep(0.3)
    today = datetime.date.today()
    last = month_add(f"{today.year:04d}-{today.month:02d}", -1)  # last full month
    base = month_add(last, -3)
    rows = []
    for slug, info in pages.items():
        if info["name"].lower().startswith(("stealth company", "anonymous")):
            continue
        m = info["months"]
        end = m.get(last, 0.0)
        start = m.get(base, 0.0)
        if end < a.min_month:
            continue
        rows.append({
            "name": info["name"], "slug": slug, "url": f"https://trustmrr.com/startup/{slug}",
            "description": info["description"], "provider": info["provider"],
            "base_month": base, "base_revenue": round(start),
            "last_month": last, "last_revenue": round(end),
            "gain": round(end - start),
            "growth_pct": None if start <= 0 else round((end - start) / start * 100),
            "trail": [round(m.get(month_add(base, i), 0)) for i in range(4)],
        })
    rows.sort(key=lambda r: -r["gain"])
    if a.json:
        json.dump(rows, sys.stdout, indent=1)
        print()
        return
    print(f"Pool: {len(pages)} startups read. Comparing {base} -> {last}.")
    for r in rows[:a.top]:
        g = "new" if r["growth_pct"] is None else f"+{r['growth_pct']}%" if r["growth_pct"] >= 0 else f"{r['growth_pct']}%"
        trail = " -> ".join(f"${v:,}" for v in r["trail"])
        print(f"{r['name']} (`{r['slug']}`): {trail}  [{g}, +${r['gain']:,}/mo]")
        print(f"   {r['description'][:150]}")


def cmd_startup(a) -> None:
    sys.stdout.write(get(STARTUP_MD.format(slug=a.slug)).decode("utf-8", "replace"))


def main() -> None:
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)
    w = sub.add_parser("winners")
    w.add_argument("--min", type=float, default=1000)
    w.add_argument("--max", type=float, default=20000)
    w.add_argument("--seen", help="comma-separated files whose slugs count as already seen")
    w.add_argument("--json", action="store_true")
    w.set_defaults(fn=cmd_winners)
    s = sub.add_parser("startup")
    s.add_argument("slug")
    s.set_defaults(fn=cmd_startup)
    g = sub.add_parser("growth3m")
    g.add_argument("--min-month", type=float, default=1000, help="min revenue in the latest full month")
    g.add_argument("--pool", type=int, default=150, help="max startup pages to read")
    g.add_argument("--top", type=int, default=20)
    g.add_argument("--json", action="store_true")
    g.set_defaults(fn=cmd_growth3m)
    a = p.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
