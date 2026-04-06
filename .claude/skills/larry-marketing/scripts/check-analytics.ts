/**
 * Larry Marketing - Analytics Check + Release ID Connection
 *
 * Pulls analytics from Postiz and connects posts to TikTok video IDs.
 * Must wait 2+ hours after publishing before connecting (TikTok indexing delay).
 *
 * Input (stdin JSON):
 * {
 *   "configPath": "path/to/config.json",
 *   "days": 3,
 *   "connect": true     // attempt to connect unlinked posts
 * }
 *
 * Output (stdout JSON):
 * { "success": true, "posts": [...], "connected": 2, "unconnected": 1 }
 */

import fs from 'fs';

const POSTIZ_API_BASE = 'https://api.postiz.com';
const MIN_HOURS_BEFORE_CONNECT = 2;

interface Input {
  configPath: string;
  days: number;
  connect: boolean;
}

interface PostAnalytics {
  postId: string;
  caption: string;
  publishedAt: string;
  connected: boolean;
  releaseId?: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
}

async function fetchPosts(apiKey: string, days: number): Promise<PostAnalytics[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const res = await fetch(`${POSTIZ_API_BASE}/posts?since=${since}&limit=100`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) throw new Error(`Fetch posts failed: ${res.status}`);
  const data = (await res.json()) as Array<Record<string, unknown>>;

  return data.map((p) => ({
    postId: p.id as string,
    caption: ((p.content as string) || '').slice(0, 80),
    publishedAt: p.publishedAt as string,
    connected: !!(p.releaseId),
    releaseId: p.releaseId as string | undefined,
  }));
}

async function fetchPostAnalytics(apiKey: string, postId: string): Promise<Partial<PostAnalytics>> {
  const res = await fetch(`${POSTIZ_API_BASE}/analytics/post/${postId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) return {};
  const data = (await res.json()) as Record<string, number>;

  return {
    views: data.views || 0,
    likes: data.likes || 0,
    comments: data.comments || 0,
    shares: data.shares || 0,
  };
}

async function getMissingReleaseIds(apiKey: string, postId: string): Promise<Array<{ id: string; thumbnail?: string }>> {
  const res = await fetch(`${POSTIZ_API_BASE}/posts/${postId}/missing`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) return [];
  return (await res.json()) as Array<{ id: string; thumbnail?: string }>;
}

async function connectReleaseId(apiKey: string, postId: string, releaseId: string): Promise<boolean> {
  const res = await fetch(`${POSTIZ_API_BASE}/posts/${postId}/release-id`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ releaseId }),
  });

  return res.ok;
}

async function main() {
  const rawInput = fs.readFileSync(0, 'utf-8');
  const input: Input = JSON.parse(rawInput);

  const config = JSON.parse(fs.readFileSync(input.configPath, 'utf-8'));
  const { apiKey } = config.postiz;

  if (!apiKey) {
    console.log(JSON.stringify({ success: false, message: 'No Postiz API key' }));
    process.exit(1);
  }

  // Fetch recent posts
  const posts = await fetchPosts(apiKey, input.days || 3);
  console.error(`Found ${posts.length} posts in last ${input.days} days`);

  // Fetch analytics for connected posts
  for (const post of posts) {
    if (post.connected) {
      const analytics = await fetchPostAnalytics(apiKey, post.postId);
      Object.assign(post, analytics);
    }
  }

  let connected = 0;
  let unconnected = 0;

  if (input.connect) {
    // Get all already-connected release IDs to avoid duplicates
    const connectedIds = new Set(
      posts.filter((p) => p.releaseId).map((p) => p.releaseId),
    );

    // Find posts that need connecting (published 2+ hours ago, not connected)
    const needsConnection = posts.filter((p) => {
      if (p.connected) return false;
      const publishedAt = new Date(p.publishedAt);
      const hoursSince = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60);
      return hoursSince >= MIN_HOURS_BEFORE_CONNECT;
    });

    if (needsConnection.length > 0) {
      // Get available TikTok video IDs from the first unconnected post
      const available = await getMissingReleaseIds(apiKey, needsConnection[0].postId);
      const unusedIds = available
        .filter((v) => !connectedIds.has(v.id))
        .sort((a, b) => {
          // TikTok IDs are sequential integers — higher = newer
          return BigInt(a.id) < BigInt(b.id) ? -1 : 1;
        });

      // Match chronologically: oldest post → lowest ID
      const sorted = [...needsConnection].sort(
        (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
      );

      for (let i = 0; i < Math.min(sorted.length, unusedIds.length); i++) {
        console.error(`Connecting post ${sorted[i].postId} → ${unusedIds[i].id}`);
        const ok = await connectReleaseId(apiKey, sorted[i].postId, unusedIds[i].id);
        if (ok) {
          sorted[i].connected = true;
          sorted[i].releaseId = unusedIds[i].id;
          connected++;

          // Fetch analytics now that it's connected
          const analytics = await fetchPostAnalytics(apiKey, sorted[i].postId);
          Object.assign(sorted[i], analytics);
        }
      }

      unconnected = sorted.length - connected;
    }

    // Count remaining unconnected (too recent)
    const tooRecent = posts.filter((p) => {
      if (p.connected) return false;
      const publishedAt = new Date(p.publishedAt);
      const hoursSince = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60);
      return hoursSince < MIN_HOURS_BEFORE_CONNECT;
    });

    if (tooRecent.length > 0) {
      console.error(`${tooRecent.length} post(s) too recent to connect (< ${MIN_HOURS_BEFORE_CONNECT}h)`);
    }
  }

  console.log(
    JSON.stringify({
      success: true,
      posts,
      total: posts.length,
      connected,
      unconnected,
      withAnalytics: posts.filter((p) => p.views !== undefined).length,
    }),
  );
}

main().catch((err) => {
  console.log(JSON.stringify({ success: false, message: String(err) }));
  process.exit(1);
});
