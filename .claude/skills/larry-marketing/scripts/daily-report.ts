/**
 * Larry Marketing - Daily Analytics Report
 *
 * The feedback loop engine. Pulls Postiz analytics + optional RevenueCat data,
 * applies the diagnostic framework, generates actionable recommendations.
 *
 * Input (stdin JSON):
 * {
 *   "configPath": "path/to/config.json",
 *   "days": 3,
 *   "hookPerformancePath": "path/to/hook-performance.json"
 * }
 *
 * Output (stdout JSON):
 * {
 *   "success": true,
 *   "report": "markdown report text",
 *   "summary": "short summary for messaging",
 *   "recommendations": [...]
 * }
 */

import fs from 'fs';

const POSTIZ_API_BASE = 'https://api.postiz.com';
const REVENUECAT_API_BASE = 'https://api.revenuecat.com/v2';

interface Post {
  postId: string;
  caption: string;
  publishedAt: string;
  hookText: string;
  ctaText: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  conversions: number;
}

interface Recommendation {
  type: 'scale' | 'fix_cta' | 'fix_hook' | 'full_reset' | 'app_issue';
  message: string;
  priority: 'high' | 'medium' | 'low';
}

interface Input {
  configPath: string;
  days: number;
  hookPerformancePath: string;
}

function diagnose(views: number, conversions: number, hasRevenueCat: boolean): Recommendation {
  const highViews = views >= 10000;
  const highConversions = conversions >= 2;

  if (!hasRevenueCat) {
    // View-only optimization
    if (views >= 50000) return { type: 'scale', message: 'Viral hit. Make 3 variations immediately.', priority: 'high' };
    if (views >= 10000) return { type: 'scale', message: 'Good performance. Keep in rotation, test at different times.', priority: 'medium' };
    if (views >= 1000) return { type: 'fix_hook', message: 'Modest reach. Try 1 more variation with a stronger hook.', priority: 'medium' };
    return { type: 'full_reset', message: 'Low reach. Try a completely different hook category.', priority: 'high' };
  }

  if (highViews && highConversions) {
    return { type: 'scale', message: 'Hook + CTA both working. Scale: 3 variations, test posting times.', priority: 'high' };
  }
  if (highViews && !highConversions) {
    return { type: 'fix_cta', message: 'Hook is gold but CTA needs work. Test different slide 6 CTAs. Check app landing page.', priority: 'high' };
  }
  if (!highViews && highConversions) {
    return { type: 'fix_hook', message: 'Content converts but nobody sees it. Test radically different hooks. Keep the CTA.', priority: 'high' };
  }
  return { type: 'full_reset', message: 'Neither hook nor CTA working. Try different format/audience angle entirely.', priority: 'high' };
}

async function fetchPostizPosts(apiKey: string, days: number): Promise<Post[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const res = await fetch(`${POSTIZ_API_BASE}/posts?since=${since}&limit=100`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) throw new Error(`Postiz posts fetch failed: ${res.status}`);
  const data = (await res.json()) as Array<Record<string, unknown>>;

  const posts: Post[] = [];

  for (const p of data) {
    if (!p.releaseId) continue; // Skip unconnected

    // Fetch per-post analytics
    const analyticsRes = await fetch(`${POSTIZ_API_BASE}/analytics/post/${p.id}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    let views = 0, likes = 0, comments = 0, shares = 0;
    if (analyticsRes.ok) {
      const a = (await analyticsRes.json()) as Record<string, number>;
      views = a.views || 0;
      likes = a.likes || 0;
      comments = a.comments || 0;
      shares = a.shares || 0;
    }

    posts.push({
      postId: p.id as string,
      caption: ((p.content as string) || '').slice(0, 100),
      publishedAt: p.publishedAt as string,
      hookText: '', // Will be filled from hook-performance.json
      ctaText: '',
      views,
      likes,
      comments,
      shares,
      conversions: 0, // Will be filled from RevenueCat
    });
  }

  return posts;
}

async function fetchRevenueCatConversions(
  secretKey: string,
  projectId: string,
  days: number,
): Promise<Map<string, number>> {
  // Fetch recent transactions for conversion attribution
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const res = await fetch(`${REVENUECAT_API_BASE}/projects/${projectId}/transactions?since=${since}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    console.error(`RevenueCat fetch failed: ${res.status}`);
    return new Map();
  }

  const data = (await res.json()) as { items: Array<{ purchased_at: string }> };

  // Group conversions by hour for attribution
  const byHour = new Map<string, number>();
  for (const tx of data.items || []) {
    const hour = tx.purchased_at.slice(0, 13); // YYYY-MM-DDTHH
    byHour.set(hour, (byHour.get(hour) || 0) + 1);
  }

  return byHour;
}

function attributeConversions(posts: Post[], conversionsByHour: Map<string, number>): void {
  // Attribute conversions to posts within a 24-72h window
  for (const post of posts) {
    const publishTime = new Date(post.publishedAt).getTime();
    let attributed = 0;

    for (const [hourStr, count] of conversionsByHour) {
      const convTime = new Date(hourStr + ':00:00Z').getTime();
      const hoursSince = (convTime - publishTime) / (1000 * 60 * 60);
      if (hoursSince >= 0 && hoursSince <= 72) {
        attributed += count;
      }
    }

    post.conversions = attributed;
  }
}

function generateReport(
  posts: Post[],
  recommendations: Recommendation[],
  hasRevenueCat: boolean,
  hookPerformance: Record<string, unknown> | null,
): string {
  const date = new Date().toISOString().split('T')[0];
  let report = `# Daily Marketing Report - ${date}\n\n`;

  if (posts.length === 0) {
    report += 'No connected posts with analytics in the last 3 days.\n';
    return report;
  }

  // Summary stats
  const totalViews = posts.reduce((s, p) => s + p.views, 0);
  const totalConversions = posts.reduce((s, p) => s + p.conversions, 0);
  const avgViews = Math.round(totalViews / posts.length);

  report += `## Summary\n`;
  report += `- Posts analyzed: ${posts.length}\n`;
  report += `- Total views: ${totalViews.toLocaleString()}\n`;
  report += `- Average views: ${avgViews.toLocaleString()}\n`;
  if (hasRevenueCat) {
    report += `- Total conversions: ${totalConversions}\n`;
    report += `- Conversion rate: ${totalViews > 0 ? ((totalConversions / totalViews) * 100).toFixed(3) : 0}%\n`;
  }

  // Per-post breakdown
  report += `\n## Post Performance\n\n`;
  const sorted = [...posts].sort((a, b) => b.views - a.views);

  for (const post of sorted) {
    report += `### ${post.caption}...\n`;
    report += `- Published: ${post.publishedAt}\n`;
    report += `- Views: ${post.views.toLocaleString()} | Likes: ${post.likes} | Comments: ${post.comments} | Shares: ${post.shares}\n`;
    if (hasRevenueCat) {
      report += `- Conversions: ${post.conversions}\n`;
    }
    report += '\n';
  }

  // Recommendations
  report += `## Recommendations\n\n`;
  for (const rec of recommendations) {
    const icon = rec.type === 'scale' ? 'SCALE' : rec.type === 'fix_cta' ? 'FIX CTA' : rec.type === 'fix_hook' ? 'FIX HOOK' : rec.type === 'app_issue' ? 'APP ISSUE' : 'RESET';
    report += `- [${icon}] ${rec.message}\n`;
  }

  return report;
}

async function main() {
  const rawInput = fs.readFileSync(0, 'utf-8');
  const input: Input = JSON.parse(rawInput);

  const config = JSON.parse(fs.readFileSync(input.configPath, 'utf-8'));
  const { apiKey: postizKey } = config.postiz;
  const hasRevenueCat = config.revenuecat?.enabled && config.revenuecat?.v2SecretKey;

  if (!postizKey) {
    console.log(JSON.stringify({ success: false, message: 'No Postiz API key' }));
    process.exit(1);
  }

  // Fetch posts and analytics
  console.error('Fetching Postiz analytics...');
  const posts = await fetchPostizPosts(postizKey, input.days || 3);

  // Fetch RevenueCat conversions if configured
  if (hasRevenueCat) {
    console.error('Fetching RevenueCat conversions...');
    const conversions = await fetchRevenueCatConversions(
      config.revenuecat.v2SecretKey,
      config.revenuecat.projectId,
      input.days || 3,
    );
    attributeConversions(posts, conversions);
  }

  // Load hook performance data if available
  let hookPerformance = null;
  if (input.hookPerformancePath && fs.existsSync(input.hookPerformancePath)) {
    hookPerformance = JSON.parse(fs.readFileSync(input.hookPerformancePath, 'utf-8'));
  }

  // Diagnose each post
  const recommendations: Recommendation[] = [];
  for (const post of posts) {
    recommendations.push(diagnose(post.views, post.conversions, !!hasRevenueCat));
  }

  // Generate report
  const report = generateReport(posts, recommendations, !!hasRevenueCat, hookPerformance);

  // Save report
  const reportsDir = config.app?.name
    ? `tiktok-marketing/reports`
    : 'tiktok-marketing/reports';
  fs.mkdirSync(reportsDir, { recursive: true });
  const reportFile = `${new Date().toISOString().split('T')[0]}.md`;
  fs.writeFileSync(`${reportsDir}/${reportFile}`, report);

  // Generate short summary for messaging
  const topPost = posts.sort((a, b) => b.views - a.views)[0];
  let summary = `Daily report (${posts.length} posts, ${posts.reduce((s, p) => s + p.views, 0).toLocaleString()} total views)`;
  if (topPost) {
    summary += `\nTop: ${topPost.views.toLocaleString()} views`;
  }
  const scaleCount = recommendations.filter((r) => r.type === 'scale').length;
  const resetCount = recommendations.filter((r) => r.type === 'full_reset').length;
  if (scaleCount > 0) summary += `\n${scaleCount} post(s) to scale`;
  if (resetCount > 0) summary += `\n${resetCount} post(s) need new approach`;

  console.log(
    JSON.stringify({
      success: true,
      report,
      summary,
      recommendations,
      postCount: posts.length,
      totalViews: posts.reduce((s, p) => s + p.views, 0),
      totalConversions: posts.reduce((s, p) => s + p.conversions, 0),
    }),
  );
}

main().catch((err) => {
  console.log(JSON.stringify({ success: false, message: String(err) }));
  process.exit(1);
});
