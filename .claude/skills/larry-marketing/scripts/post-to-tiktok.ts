/**
 * Larry Marketing - Post to TikTok via Postiz API
 *
 * Posts slideshow images to TikTok as drafts (SELF_ONLY) via Postiz.
 * Also supports cross-posting to Instagram, YouTube, Threads.
 *
 * Input (stdin JSON):
 * {
 *   "configPath": "path/to/config.json",
 *   "slideDir": "path/to/slides/",      // directory with overlay images
 *   "caption": "The caption text...",
 *   "title": "Slideshow title",
 *   "crossPost": true                    // optional, use config platforms
 * }
 *
 * Output (stdout JSON):
 * { "success": true, "postId": "abc123", "platforms": ["tiktok", "instagram"] }
 */

import fs from 'fs';
import path from 'path';

const POSTIZ_API_BASE = 'https://api.postiz.com';

interface Input {
  configPath: string;
  slideDir: string;
  caption: string;
  title: string;
  crossPost?: boolean;
}

interface PostizUploadResponse {
  id: string;
  url: string;
}

interface PostizPostResponse {
  id: string;
  status: string;
}

async function uploadMedia(apiKey: string, imagePath: string): Promise<PostizUploadResponse> {
  const imageData = fs.readFileSync(imagePath);
  const filename = path.basename(imagePath);

  const formData = new FormData();
  formData.append('file', new Blob([imageData], { type: 'image/png' }), filename);

  const res = await fetch(`${POSTIZ_API_BASE}/media/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Upload failed ${res.status}: ${await res.text()}`);
  }

  return (await res.json()) as PostizUploadResponse;
}

async function createPost(
  apiKey: string,
  mediaIds: string[],
  caption: string,
  title: string,
  integrationIds: string[],
  privacyLevel: string,
): Promise<PostizPostResponse> {
  const body = {
    type: 'slideshow',
    title,
    content: caption,
    media: mediaIds,
    integration: integrationIds,
    settings: {
      tiktok: {
        privacy_level: privacyLevel,
      },
    },
  };

  const res = await fetch(`${POSTIZ_API_BASE}/posts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Post creation failed ${res.status}: ${await res.text()}`);
  }

  return (await res.json()) as PostizPostResponse;
}

async function main() {
  const rawInput = fs.readFileSync(0, 'utf-8');
  const input: Input = JSON.parse(rawInput);

  const config = JSON.parse(fs.readFileSync(input.configPath, 'utf-8'));
  const { apiKey: postizKey, integrationIds } = config.postiz;
  const { privacyLevel } = config.posting;

  if (!postizKey) {
    console.log(JSON.stringify({ success: false, message: 'No Postiz API key in config' }));
    process.exit(1);
  }

  if (!integrationIds?.tiktok) {
    console.log(JSON.stringify({ success: false, message: 'No TikTok integration ID in config' }));
    process.exit(1);
  }

  // Find overlay images (or raw slides if no overlays)
  const files = fs.readdirSync(input.slideDir).sort();
  const overlayFiles = files.filter((f: string) => f.includes('_overlay.png'));
  const slideFiles = overlayFiles.length > 0
    ? overlayFiles
    : files.filter((f: string) => f.match(/^slide_\d+\.png$/));

  if (slideFiles.length === 0) {
    console.log(JSON.stringify({ success: false, message: 'No slide images found' }));
    process.exit(1);
  }

  console.error(`Uploading ${slideFiles.length} slides to Postiz...`);

  // Upload each slide
  const mediaIds: string[] = [];
  for (let i = 0; i < slideFiles.length; i++) {
    const slidePath = path.join(input.slideDir, slideFiles[i]);
    console.error(`Uploading slide ${i + 1}/${slideFiles.length}: ${slideFiles[i]}`);

    try {
      const uploaded = await uploadMedia(postizKey, slidePath);
      mediaIds.push(uploaded.id);
    } catch (err) {
      console.log(JSON.stringify({ success: false, message: `Upload failed on slide ${i + 1}: ${err}` }));
      process.exit(1);
    }
  }

  // Build platform list
  const platforms: string[] = [integrationIds.tiktok];
  if (input.crossPost) {
    if (integrationIds.instagram) platforms.push(integrationIds.instagram);
    if (integrationIds.youtube) platforms.push(integrationIds.youtube);
    if (integrationIds.threads) platforms.push(integrationIds.threads);
  }

  console.error(`Creating post on ${platforms.length} platform(s)...`);

  try {
    const post = await createPost(
      postizKey,
      mediaIds,
      input.caption,
      input.title,
      platforms,
      privacyLevel || 'SELF_ONLY',
    );

    const platformNames = ['tiktok'];
    if (input.crossPost) {
      if (integrationIds.instagram) platformNames.push('instagram');
      if (integrationIds.youtube) platformNames.push('youtube');
      if (integrationIds.threads) platformNames.push('threads');
    }

    console.log(
      JSON.stringify({
        success: true,
        postId: post.id,
        platforms: platformNames,
        privacy: privacyLevel || 'SELF_ONLY',
        message:
          privacyLevel === 'SELF_ONLY'
            ? 'Posted as draft. Open TikTok inbox, add a trending sound, then publish.'
            : 'Posted publicly.',
      }),
    );
  } catch (err) {
    console.log(JSON.stringify({ success: false, message: `Post creation failed: ${err}` }));
    process.exit(1);
  }
}

main().catch((err) => {
  console.log(JSON.stringify({ success: false, message: String(err) }));
  process.exit(1);
});
