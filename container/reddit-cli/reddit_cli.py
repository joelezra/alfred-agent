#!/usr/bin/env python3
"""Reddit CLI — read posts, comments, search subreddits, and research via public .json endpoints."""

import argparse
import json
import re
import sys
import urllib.request
import urllib.parse
import urllib.error

BASE = "https://www.reddit.com"
HEADERS = {"User-Agent": "reddit-cli/2.0 (by claude-code)"}


def fetch(path, params=None):
    """Fetch a Reddit .json endpoint."""
    url = f"{BASE}{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        if e.code == 429:
            print("Rate limited. Wait a minute and retry.", file=sys.stderr)
            sys.exit(1)
        raise


def extract_post_id(url_or_id):
    """Extract post ID from a URL or return as-is if already an ID."""
    if url_or_id.startswith("http"):
        m = re.search(r"/comments/([a-z0-9]+)", url_or_id)
        if m:
            return m.group(1)
        raise ValueError(f"Cannot extract post ID from URL: {url_or_id}")
    return url_or_id


def parse_post(d):
    """Parse a post data dict into our standard format."""
    selftext = d.get("selftext", "")
    is_self = d.get("is_self", False)
    return {
        "id": d["id"],
        "title": d["title"],
        "author": d.get("author", "[deleted]"),
        "subreddit": d.get("subreddit", ""),
        "score": d.get("score", 0),
        "upvote_ratio": d.get("upvote_ratio"),
        "num_comments": d.get("num_comments", 0),
        "created_utc": d.get("created_utc", 0),
        "permalink": f"https://reddit.com{d['permalink']}",
        "is_self": is_self,
        "selftext": selftext if is_self else None,
        "link_url": d.get("url") if not is_self else None,
    }


def parse_comment(thing, max_depth=99):
    """Recursively parse a comment thing into our format."""
    d = thing.get("data", {})
    depth = d.get("depth", 0)
    if depth > max_depth:
        return None
    result = {
        "id": d.get("id", ""),
        "author": d.get("author", "[deleted]"),
        "score": d.get("score", 0),
        "body": d.get("body", ""),
        "created_utc": d.get("created_utc", 0),
        "depth": depth,
    }
    replies_data = d.get("replies")
    if isinstance(replies_data, dict):
        children = replies_data.get("data", {}).get("children", [])
        replies = []
        for child in children:
            if child.get("kind") == "t1":
                parsed = parse_comment(child, max_depth)
                if parsed:
                    replies.append(parsed)
        if replies:
            result["replies"] = replies
        result["replies_count"] = len(replies)
    else:
        result["replies_count"] = 0
    return result


def cmd_read(args):
    """Read a post by URL or ID."""
    post_id = extract_post_id(args.url)
    data = fetch(f"/comments/{post_id}.json", {"limit": 0})
    d = data[0]["data"]["children"][0]["data"]
    result = parse_post(d)

    if args.plain:
        print(f"[r/{result['subreddit']}] {result['title']}")
        print(f"by u/{result['author']} | {result['score']} pts | {result['num_comments']} comments")
        print(result['permalink'])
        if result["selftext"]:
            print(f"\n{result['selftext']}")
    else:
        print(json.dumps(result, indent=2))


def cmd_comments(args):
    """Read comments on a post."""
    post_id = extract_post_id(args.url)
    data = fetch(f"/comments/{post_id}.json", {"sort": args.sort, "limit": args.limit})
    children = data[1]["data"]["children"]

    comments = []
    for thing in children[:args.limit]:
        if thing.get("kind") != "t1":
            continue
        d = thing["data"]
        comments.append({
            "id": d.get("id", ""),
            "author": d.get("author", "[deleted]"),
            "score": d.get("score", 0),
            "body": d.get("body", ""),
            "created_utc": d.get("created_utc", 0),
            "depth": d.get("depth", 0),
            "replies_count": len(d.get("replies", {}).get("data", {}).get("children", [])) if isinstance(d.get("replies"), dict) else 0,
        })

    if args.plain:
        for c in comments:
            indent = "  " * c["depth"]
            print(f"{indent}u/{c['author']} ({c['score']} pts):")
            for line in c["body"].split("\n"):
                print(f"{indent}  {line}")
            print()
    else:
        print(json.dumps(comments, indent=2))


def cmd_search(args):
    """Search across Reddit or within a subreddit."""
    params = {
        "q": args.query,
        "sort": args.sort,
        "t": args.time,
        "limit": args.limit,
    }
    if args.subreddit:
        params["restrict_sr"] = "on"
        path = f"/r/{args.subreddit}/search.json"
    else:
        path = "/search.json"

    data = fetch(path, params)
    children = data["data"]["children"]

    posts = []
    for thing in children:
        d = thing["data"]
        selftext = d.get("selftext", "")
        posts.append({
            "id": d["id"],
            "title": d["title"],
            "author": d.get("author", "[deleted]"),
            "subreddit": d.get("subreddit", ""),
            "score": d.get("score", 0),
            "num_comments": d.get("num_comments", 0),
            "permalink": f"https://reddit.com{d['permalink']}",
            "created_utc": d.get("created_utc", 0),
            "selftext_preview": (selftext[:200] + "...") if selftext and len(selftext) > 200 else selftext,
        })

    if args.plain:
        for p in posts:
            print(f"[r/{p['subreddit']}] {p['title']}")
            print(f"  u/{p['author']} | {p['score']} pts | {p['num_comments']} comments")
            print(f"  {p['permalink']}")
            if p["selftext_preview"]:
                print(f"  {p['selftext_preview'][:150]}")
            print()
    else:
        print(json.dumps(posts, indent=2))


def cmd_hot(args):
    """Get hot posts from a subreddit."""
    data = fetch(f"/r/{args.subreddit}/hot.json", {"limit": args.limit})
    children = data["data"]["children"]

    posts = []
    for thing in children:
        d = thing["data"]
        posts.append({
            "id": d["id"],
            "title": d["title"],
            "author": d.get("author", "[deleted]"),
            "score": d.get("score", 0),
            "num_comments": d.get("num_comments", 0),
            "permalink": f"https://reddit.com{d['permalink']}",
            "created_utc": d.get("created_utc", 0),
        })

    if args.plain:
        for p in posts:
            print(f"{p['score']:>6} pts | {p['title']}")
            print(f"         u/{p['author']} | {p['num_comments']} comments | {p['permalink']}")
            print()
    else:
        print(json.dumps(posts, indent=2))


def cmd_top(args):
    """Get top posts from a subreddit."""
    data = fetch(f"/r/{args.subreddit}/top.json", {"t": args.time, "limit": args.limit})
    children = data["data"]["children"]

    posts = []
    for thing in children:
        d = thing["data"]
        posts.append({
            "id": d["id"],
            "title": d["title"],
            "author": d.get("author", "[deleted]"),
            "score": d.get("score", 0),
            "num_comments": d.get("num_comments", 0),
            "permalink": f"https://reddit.com{d['permalink']}",
            "created_utc": d.get("created_utc", 0),
        })

    if args.plain:
        for p in posts:
            print(f"{p['score']:>6} pts | {p['title']}")
            print(f"         u/{p['author']} | {p['num_comments']} comments | {p['permalink']}")
            print()
    else:
        print(json.dumps(posts, indent=2))


def cmd_subreddit(args):
    """Get subreddit info."""
    data = fetch(f"/r/{args.name}/about.json")
    d = data["data"]

    result = {
        "name": d.get("display_name", ""),
        "title": d.get("title", ""),
        "description": d.get("public_description", ""),
        "subscribers": d.get("subscribers", 0),
        "active_users": d.get("accounts_active", 0),
        "created_utc": d.get("created_utc", 0),
        "over18": d.get("over18", False),
        "url": f"https://reddit.com{d.get('url', '')}",
    }

    if args.plain:
        print(f"r/{result['name']} — {result['title']}")
        print(f"{result['subscribers']:,} subscribers | {result['active_users']:,} online")
        print(result['description'])
    else:
        print(json.dumps(result, indent=2))


def cmd_user(args):
    """Get user info and recent posts."""
    data = fetch(f"/user/{args.username}/about.json")
    d = data["data"]

    result = {
        "name": d.get("name", ""),
        "comment_karma": d.get("comment_karma", 0),
        "link_karma": d.get("link_karma", 0),
        "created_utc": d.get("created_utc", 0),
    }

    if args.posts:
        posts_data = fetch(f"/user/{args.username}/submitted.json", {"limit": args.limit, "sort": "new"})
        submissions = []
        for thing in posts_data["data"]["children"]:
            pd = thing["data"]
            submissions.append({
                "title": pd["title"],
                "subreddit": pd.get("subreddit", ""),
                "score": pd.get("score", 0),
                "num_comments": pd.get("num_comments", 0),
                "permalink": f"https://reddit.com{pd['permalink']}",
            })
        result["recent_posts"] = submissions

    if args.plain:
        print(f"u/{result['name']}")
        print(f"Link karma: {result['link_karma']:,} | Comment karma: {result['comment_karma']:,}")
        if "recent_posts" in result:
            print("\nRecent posts:")
            for p in result["recent_posts"]:
                print(f"  [{p['subreddit']}] {p['title']} ({p['score']} pts)")
    else:
        print(json.dumps(result, indent=2))


def cmd_thread(args):
    """Read a full thread (post + top comments with replies)."""
    post_id = extract_post_id(args.url)
    data = fetch(f"/comments/{post_id}.json", {"sort": "confidence", "limit": args.limit, "depth": args.depth + 1})

    post_data = data[0]["data"]["children"][0]["data"]
    comment_things = data[1]["data"]["children"]

    comments = []
    for thing in comment_things[:args.limit]:
        if thing.get("kind") != "t1":
            continue
        parsed = parse_comment(thing, args.depth)
        if parsed:
            comments.append(parsed)

    result = {
        "title": post_data["title"],
        "author": post_data.get("author", "[deleted]"),
        "subreddit": post_data.get("subreddit", ""),
        "score": post_data.get("score", 0),
        "selftext": post_data.get("selftext") if post_data.get("is_self") else None,
        "num_comments": post_data.get("num_comments", 0),
        "comments": comments,
    }

    if args.plain:
        print(f"[r/{result['subreddit']}] {result['title']}")
        print(f"by u/{result['author']} | {result['score']} pts | {result['num_comments']} comments")
        if result["selftext"]:
            print(f"\n{result['selftext']}\n")
        print("---")

        def print_comment(c, indent=0):
            prefix = "  " * indent
            print(f"{prefix}u/{c['author']} ({c['score']} pts):")
            for line in c["body"].split("\n"):
                print(f"{prefix}  {line}")
            print()
            for r in c.get("replies", []):
                print_comment(r, indent + 1)

        for c in comments:
            print_comment(c)
    else:
        print(json.dumps(result, indent=2))


def main():
    parser = argparse.ArgumentParser(
        prog="reddit",
        description="Reddit CLI — read, search, and research via public .json endpoints (no API key needed)"
    )
    parser.add_argument("--plain", action="store_true", help="Plain text output (default: JSON)")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # read
    p_read = subparsers.add_parser("read", help="Read a post by URL or ID")
    p_read.add_argument("url", help="Post URL or ID")

    # comments
    p_comments = subparsers.add_parser("comments", help="Read comments on a post")
    p_comments.add_argument("url", help="Post URL or ID")
    p_comments.add_argument("--sort", default="confidence", choices=["confidence", "top", "new", "controversial", "old", "q&a"])
    p_comments.add_argument("--limit", type=int, default=20)

    # search
    p_search = subparsers.add_parser("search", help="Search Reddit")
    p_search.add_argument("query", help="Search query")
    p_search.add_argument("--subreddit", "-r", help="Limit to subreddit")
    p_search.add_argument("--sort", default="relevance", choices=["relevance", "hot", "top", "new", "comments"])
    p_search.add_argument("--time", default="all", choices=["all", "hour", "day", "week", "month", "year"])
    p_search.add_argument("--limit", type=int, default=10)

    # hot
    p_hot = subparsers.add_parser("hot", help="Hot posts from a subreddit")
    p_hot.add_argument("subreddit", help="Subreddit name (without r/)")
    p_hot.add_argument("--limit", type=int, default=10)

    # top
    p_top = subparsers.add_parser("top", help="Top posts from a subreddit")
    p_top.add_argument("subreddit", help="Subreddit name (without r/)")
    p_top.add_argument("--time", default="week", choices=["hour", "day", "week", "month", "year", "all"])
    p_top.add_argument("--limit", type=int, default=10)

    # subreddit
    p_sub = subparsers.add_parser("subreddit", help="Get subreddit info")
    p_sub.add_argument("name", help="Subreddit name (without r/)")

    # user
    p_user = subparsers.add_parser("user", help="Get user info")
    p_user.add_argument("username", help="Username (without u/)")
    p_user.add_argument("--posts", action="store_true", help="Include recent posts")
    p_user.add_argument("--limit", type=int, default=10)

    # thread
    p_thread = subparsers.add_parser("thread", help="Read full thread (post + nested comments)")
    p_thread.add_argument("url", help="Post URL or ID")
    p_thread.add_argument("--limit", type=int, default=15, help="Max top-level comments")
    p_thread.add_argument("--depth", type=int, default=3, help="Max reply depth")

    args = parser.parse_args()

    commands = {
        "read": cmd_read,
        "comments": cmd_comments,
        "search": cmd_search,
        "hot": cmd_hot,
        "top": cmd_top,
        "subreddit": cmd_subreddit,
        "user": cmd_user,
        "thread": cmd_thread,
    }

    try:
        commands[args.command](args)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
