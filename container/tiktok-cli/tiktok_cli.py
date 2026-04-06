#!/usr/bin/env python3
"""TikTok CLI — browse feeds, search, read comments, and download videos."""

import argparse
import asyncio
import json
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime


def fmt_count(n):
    """Format large numbers: 1234567 -> 1.2M"""
    if n is None:
        return "?"
    if n >= 1_000_000:
        return f"{n / 1_000_000:.1f}M"
    if n >= 1_000:
        return f"{n / 1_000:.1f}K"
    return str(n)


def fmt_time(ts):
    """Format unix timestamp to relative or absolute."""
    if not ts:
        return "?"
    try:
        dt = datetime.fromtimestamp(int(ts))
        return dt.strftime("%Y-%m-%d")
    except (ValueError, OSError):
        return "?"


def extract_video_id(url_or_id):
    """Extract video ID from a TikTok URL or return as-is."""
    if url_or_id.startswith("http"):
        m = re.search(r"/video/(\d+)", url_or_id)
        if m:
            return m.group(1)
        # Short URL like vm.tiktok.com/xxx — can't resolve without HTTP
        raise ValueError(f"Cannot extract video ID from: {url_or_id}\nUse a full URL like https://www.tiktok.com/@user/video/1234567890")
    return url_or_id


def extract_username(handle):
    """Normalize username: remove @ prefix and URL parts."""
    if handle.startswith("http"):
        m = re.search(r"tiktok\.com/@([^/?]+)", handle)
        if m:
            return m.group(1)
        raise ValueError(f"Cannot extract username from: {handle}")
    return handle.lstrip("@")


# ── TikTokApi-based commands (async, requires pip install TikTokApi) ──


async def get_api():
    """Initialize TikTokApi with optional ms_token."""
    try:
        from TikTokApi import TikTokApi
    except ImportError:
        print("TikTokApi not installed. Run: pip install TikTokApi && python -m playwright install", file=sys.stderr)
        sys.exit(1)

    api = TikTokApi()
    ms_token = os.environ.get("ms_token") or os.environ.get("MS_TOKEN")
    tokens = [ms_token] if ms_token else None
    await api.create_sessions(
        ms_tokens=tokens,
        num_sessions=1,
        sleep_after=3,
        headless=True,
        browser="chromium",
    )
    return api


async def cmd_trending(args):
    """Show trending videos."""
    async with await get_api() as api:
        videos = []
        async for video in api.trending.videos(count=args.limit):
            d = video.as_dict
            videos.append({
                "id": d.get("id"),
                "desc": d.get("desc", ""),
                "author": d.get("author", {}).get("uniqueId", "?"),
                "nickname": d.get("author", {}).get("nickname", ""),
                "plays": d.get("stats", {}).get("playCount", 0),
                "likes": d.get("stats", {}).get("diggCount", 0),
                "comments": d.get("stats", {}).get("commentCount", 0),
                "shares": d.get("stats", {}).get("shareCount", 0),
                "created": d.get("createTime", 0),
                "music": d.get("music", {}).get("title", ""),
                "url": f"https://www.tiktok.com/@{d.get('author', {}).get('uniqueId', '')}/video/{d.get('id')}",
            })

        if args.plain:
            for v in videos:
                print(f"{fmt_count(v['plays']):>6} plays | @{v['author']}: {v['desc'][:80]}")
                print(f"         {fmt_count(v['likes'])} likes | {fmt_count(v['comments'])} comments | {fmt_time(v['created'])}")
                print(f"         {v['url']}")
                print()
        else:
            print(json.dumps(videos, indent=2))


async def cmd_user(args):
    """Get user profile and optionally their videos."""
    username = extract_username(args.handle)
    async with await get_api() as api:
        user = api.user(username)
        info = await user.info()

        user_data = info.get("user", info.get("userInfo", {}).get("user", {}))
        stats = info.get("stats", info.get("userInfo", {}).get("stats", {}))

        result = {
            "username": user_data.get("uniqueId", username),
            "nickname": user_data.get("nickname", ""),
            "bio": user_data.get("signature", ""),
            "verified": user_data.get("verified", False),
            "followers": stats.get("followerCount", 0),
            "following": stats.get("followingCount", 0),
            "likes": stats.get("heartCount", 0),
            "videos": stats.get("videoCount", 0),
        }

        if args.videos:
            result["recent_videos"] = []
            async for video in user.videos(count=args.limit):
                d = video.as_dict
                result["recent_videos"].append({
                    "id": d.get("id"),
                    "desc": d.get("desc", "")[:100],
                    "plays": d.get("stats", {}).get("playCount", 0),
                    "likes": d.get("stats", {}).get("diggCount", 0),
                    "created": d.get("createTime", 0),
                    "url": f"https://www.tiktok.com/@{username}/video/{d.get('id')}",
                })

        if args.plain:
            check = " [verified]" if result["verified"] else ""
            print(f"@{result['username']} — {result['nickname']}{check}")
            print(f"{fmt_count(result['followers'])} followers | {fmt_count(result['following'])} following | {fmt_count(result['likes'])} likes | {result['videos']} videos")
            if result["bio"]:
                print(result["bio"])
            if "recent_videos" in result:
                print("\nRecent videos:")
                for v in result["recent_videos"]:
                    print(f"  {fmt_count(v['plays']):>6} plays | {v['desc'][:60]}")
                    print(f"           {v['url']}")
        else:
            print(json.dumps(result, indent=2))


async def cmd_video(args):
    """Get video details."""
    url = args.url if args.url.startswith("http") else f"https://www.tiktok.com/video/{args.url}"
    async with await get_api() as api:
        video = api.video(url=url)
        info = await video.info()

        d = info if isinstance(info, dict) else {}
        author = d.get("author", {})
        stats = d.get("stats", {})
        music = d.get("music", {})

        result = {
            "id": d.get("id", ""),
            "desc": d.get("desc", ""),
            "author": author.get("uniqueId", "?"),
            "nickname": author.get("nickname", ""),
            "plays": stats.get("playCount", 0),
            "likes": stats.get("diggCount", 0),
            "comments": stats.get("commentCount", 0),
            "shares": stats.get("shareCount", 0),
            "saves": stats.get("collectCount", 0),
            "created": d.get("createTime", 0),
            "duration": d.get("video", {}).get("duration", 0),
            "music": music.get("title", ""),
            "music_author": music.get("authorName", ""),
            "hashtags": [t.get("title", "") for t in d.get("challenges", [])],
            "url": url,
        }

        if args.plain:
            print(f"@{result['author']}: {result['desc']}")
            print(f"{fmt_count(result['plays'])} plays | {fmt_count(result['likes'])} likes | {fmt_count(result['comments'])} comments | {fmt_count(result['shares'])} shares")
            print(f"Duration: {result['duration']}s | Music: {result['music']} — {result['music_author']}")
            if result["hashtags"]:
                print(f"Tags: {' '.join('#' + t for t in result['hashtags'])}")
            print(f"Posted: {fmt_time(result['created'])}")
            print(result["url"])
        else:
            print(json.dumps(result, indent=2))


async def cmd_comments(args):
    """Read comments on a video."""
    video_id = extract_video_id(args.url)
    async with await get_api() as api:
        video = api.video(id=video_id) if not args.url.startswith("http") else api.video(url=args.url)
        comments = []
        async for comment in video.comments(count=args.limit):
            d = comment.as_dict
            comments.append({
                "id": d.get("cid", ""),
                "author": d.get("user", {}).get("unique_id", d.get("user", {}).get("uniqueId", "?")),
                "text": d.get("text", ""),
                "likes": d.get("digg_count", 0),
                "replies": d.get("reply_comment_total", 0),
                "created": d.get("create_time", 0),
            })

        if args.plain:
            for c in comments:
                print(f"@{c['author']} ({fmt_count(c['likes'])} likes):")
                print(f"  {c['text']}")
                if c["replies"]:
                    print(f"  [{c['replies']} replies]")
                print()
        else:
            print(json.dumps(comments, indent=2))


async def cmd_hashtag(args):
    """Get videos for a hashtag."""
    tag_name = args.tag.lstrip("#")
    async with await get_api() as api:
        tag = api.hashtag(name=tag_name)
        info = await tag.info()

        challenge = info.get("challengeInfo", {})
        stats = challenge.get("stats", {})

        videos = []
        async for video in tag.videos(count=args.limit):
            d = video.as_dict
            videos.append({
                "id": d.get("id"),
                "desc": d.get("desc", "")[:100],
                "author": d.get("author", {}).get("uniqueId", "?"),
                "plays": d.get("stats", {}).get("playCount", 0),
                "likes": d.get("stats", {}).get("diggCount", 0),
                "url": f"https://www.tiktok.com/@{d.get('author', {}).get('uniqueId', '')}/video/{d.get('id')}",
            })

        if args.plain:
            print(f"#{tag_name} — {fmt_count(stats.get('videoCount', 0))} videos | {fmt_count(stats.get('viewCount', 0))} views")
            print()
            for v in videos:
                print(f"{fmt_count(v['plays']):>6} plays | @{v['author']}: {v['desc'][:60]}")
                print(f"         {v['url']}")
                print()
        else:
            result = {
                "tag": tag_name,
                "video_count": stats.get("videoCount", 0),
                "view_count": stats.get("viewCount", 0),
                "videos": videos,
            }
            print(json.dumps(result, indent=2))


async def cmd_search(args):
    """Search for users."""
    async with await get_api() as api:
        users = []
        async for user in api.search.users(args.query, count=args.limit):
            d = user.as_dict if hasattr(user, "as_dict") else user
            users.append({
                "username": d.get("uniqueId", d.get("unique_id", "?")),
                "nickname": d.get("nickname", ""),
                "bio": d.get("signature", "")[:100],
                "followers": d.get("followerCount", d.get("fans", 0)),
                "verified": d.get("verified", False),
            })

        if args.plain:
            for u in users:
                check = " [verified]" if u["verified"] else ""
                print(f"@{u['username']} — {u['nickname']}{check}")
                print(f"  {fmt_count(u['followers'])} followers")
                if u["bio"]:
                    print(f"  {u['bio']}")
                print()
        else:
            print(json.dumps(users, indent=2))


# ── Download (uses yt-dlp, no TikTokApi needed) ──


def cmd_download(args):
    """Download a video using yt-dlp."""
    # Check venv first, then system PATH
    venv_ytdlp = os.path.join(os.path.dirname(__file__), ".venv", "bin", "yt-dlp")
    ytdlp = venv_ytdlp if os.path.isfile(venv_ytdlp) else shutil.which("yt-dlp")
    if not ytdlp:
        print("yt-dlp not found. Install: pip install yt-dlp", file=sys.stderr)
        sys.exit(1)

    cmd = [ytdlp, "--no-warnings"]
    if args.audio:
        cmd += ["-x", "--audio-format", "mp3"]
    if args.output:
        cmd += ["-o", args.output]
    cmd.append(args.url)

    if args.plain:
        print(f"Downloading: {args.url}")

    result = subprocess.run(cmd, capture_output=not args.plain)
    if result.returncode != 0:
        if not args.plain:
            print(json.dumps({"error": result.stderr.decode().strip(), "url": args.url}))
        sys.exit(result.returncode)
    elif not args.plain:
        print(json.dumps({"status": "ok", "url": args.url}))


# ── Main ──


def run_async(coro):
    """Run an async command."""
    try:
        asyncio.run(coro)
    except KeyboardInterrupt:
        pass


def main():
    parser = argparse.ArgumentParser(
        prog="tiktok",
        description="TikTok CLI — browse, search, and download via TikTokApi + yt-dlp",
    )
    parser.add_argument("--plain", action="store_true", help="Human-readable output (default: JSON)")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # trending
    p = subparsers.add_parser("trending", help="Trending videos")
    p.add_argument("--limit", type=int, default=10)

    # user
    p = subparsers.add_parser("user", help="User profile")
    p.add_argument("handle", help="Username, @handle, or profile URL")
    p.add_argument("--videos", action="store_true", help="Include recent videos")
    p.add_argument("--limit", type=int, default=10)

    # video
    p = subparsers.add_parser("video", help="Video details")
    p.add_argument("url", help="Video URL or ID")

    # comments
    p = subparsers.add_parser("comments", help="Video comments")
    p.add_argument("url", help="Video URL or ID")
    p.add_argument("--limit", type=int, default=20)

    # hashtag
    p = subparsers.add_parser("hashtag", help="Videos for a hashtag")
    p.add_argument("tag", help="Hashtag (with or without #)")
    p.add_argument("--limit", type=int, default=10)

    # search
    p = subparsers.add_parser("search", help="Search users")
    p.add_argument("query", help="Search query")
    p.add_argument("--limit", type=int, default=10)

    # download
    p = subparsers.add_parser("download", help="Download video (via yt-dlp)")
    p.add_argument("url", help="Video URL")
    p.add_argument("-o", "--output", help="Output filename template")
    p.add_argument("--audio", action="store_true", help="Extract audio only (mp3)")

    args = parser.parse_args()

    async_commands = {
        "trending": cmd_trending,
        "user": cmd_user,
        "video": cmd_video,
        "comments": cmd_comments,
        "hashtag": cmd_hashtag,
        "search": cmd_search,
    }

    if args.command == "download":
        try:
            cmd_download(args)
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)
    elif args.command in async_commands:
        try:
            run_async(async_commands[args.command](args))
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)


if __name__ == "__main__":
    main()
