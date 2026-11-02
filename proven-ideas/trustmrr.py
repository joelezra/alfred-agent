#!/usr/bin/env python3
"""Fetch TrustMRR's public discovery feed and filter it into proven-ideas winners.

Revenue on TrustMRR is read straight from the payment provider (Stripe, Paddle,
Lemon Squeezy, ...), so these are checked numbers, not self-reported claims.

Usage:
  trustmrr.py winners [--min 1000] [--max 20000] [--seen FILE] [--json]
  trustmrr.py startup <slug>          # print the startup's .md profile
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
    a = p.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
