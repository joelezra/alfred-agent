/**
 * Larry Marketing - MCP Tool Definitions (Agent/Container Side)
 *
 * These tools run inside the container and communicate with the host via IPC.
 * The host-side implementation is in host.ts.
 */

// @ts-ignore - SDK available in container environment only
import { tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

const IPC_DIR = '/workspace/ipc';
const TASKS_DIR = path.join(IPC_DIR, 'tasks');
const RESULTS_DIR = path.join(IPC_DIR, 'larry_results');

function writeIpcFile(dir: string, data: object): string {
  fs.mkdirSync(dir, { recursive: true });
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`;
  const filepath = path.join(dir, filename);
  const tempPath = `${filepath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
  fs.renameSync(tempPath, filepath);
  return filename;
}

async function waitForResult(
  requestId: string,
  maxWait = 600000,
): Promise<{ success: boolean; message: string; data?: unknown }> {
  const resultFile = path.join(RESULTS_DIR, `${requestId}.json`);
  const pollInterval = 2000;
  let elapsed = 0;

  while (elapsed < maxWait) {
    if (fs.existsSync(resultFile)) {
      try {
        const result = JSON.parse(fs.readFileSync(resultFile, 'utf-8'));
        fs.unlinkSync(resultFile);
        return result;
      } catch (err) {
        return { success: false, message: `Failed to read result: ${err}` };
      }
    }
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
    elapsed += pollInterval;
  }

  return { success: false, message: 'Request timed out (10 min)' };
}

export interface SkillToolsContext {
  groupFolder: string;
  isMain: boolean;
}

export function createLarryTools(ctx: SkillToolsContext) {
  const { isMain } = ctx;

  return [
    tool(
      'larry_generate_slides',
      `Generate TikTok slideshow images using Nano Banana Pro (Google Gemini 3 Pro Image).
Generates portrait images (1024x1536) optimized for TikTok's 9:16 format.
Image generation takes 1-3 minutes for 6 slides. Main group only.`,
      {
        config_path: z.string().describe('Path to tiktok-marketing/config.json'),
        output_dir: z.string().describe('Directory to save generated slides (e.g. tiktok-marketing/posts/2026-04-05-0730/)'),
        prompts: z.array(z.string()).describe('Array of 6 image generation prompts. Each must include the base style + slide-specific variation.'),
        reference_images: z.array(z.string()).optional().describe('Optional paths to reference images for character/scene consistency'),
      },
      async (args) => {
        if (!isMain) {
          return { content: [{ type: 'text', text: 'Only the main group can generate slides.' }], isError: true };
        }

        const requestId = `larry-gen-${Date.now()}`;
        writeIpcFile(TASKS_DIR, {
          type: 'larry_generate_slides',
          requestId,
          configPath: args.config_path,
          outputDir: args.output_dir,
          prompts: args.prompts,
          referenceImages: args.reference_images || [],
          timestamp: new Date().toISOString(),
        });

        const result = await waitForResult(requestId, 600000); // 10 min timeout
        return {
          content: [{ type: 'text', text: result.success ? JSON.stringify(result.data) : result.message }],
          isError: !result.success,
        };
      },
    ),

    tool(
      'larry_add_overlays',
      `Add text overlays to slide images using node-canvas.
Uses Larry's proven sizing formula (dynamic font, 28% vertical positioning, outline+fill).
Text should use \\n for line breaks, 4-6 words per line, REACTIONS not labels. Main group only.`,
      {
        input_dir: z.string().describe('Directory containing slide_N.png files'),
        texts: z.array(z.string()).describe('Array of text strings for each slide. Use \\n for line breaks.'),
        output_dir: z.string().optional().describe('Optional output directory (defaults to input_dir)'),
      },
      async (args) => {
        if (!isMain) {
          return { content: [{ type: 'text', text: 'Only the main group can add overlays.' }], isError: true };
        }

        const requestId = `larry-overlay-${Date.now()}`;
        writeIpcFile(TASKS_DIR, {
          type: 'larry_add_overlays',
          requestId,
          inputDir: args.input_dir,
          texts: args.texts,
          outputDir: args.output_dir,
          timestamp: new Date().toISOString(),
        });

        const result = await waitForResult(requestId, 120000);
        return {
          content: [{ type: 'text', text: result.success ? JSON.stringify(result.data) : result.message }],
          isError: !result.success,
        };
      },
    ),

    tool(
      'larry_post',
      `Post slideshow to TikTok via Postiz API. Posts as drafts (SELF_ONLY) by default.
User must add a trending sound in TikTok inbox before publishing.
Optionally cross-posts to Instagram, YouTube, Threads. Main group only.`,
      {
        config_path: z.string().describe('Path to tiktok-marketing/config.json'),
        slide_dir: z.string().describe('Directory with overlay slide images'),
        caption: z.string().describe('Post caption. Structure: Hook > Problem > Discovery > Result > CTA. Max 5 hashtags.'),
        title: z.string().describe('Slideshow title'),
        cross_post: z.boolean().default(false).describe('Cross-post to configured platforms'),
      },
      async (args) => {
        if (!isMain) {
          return { content: [{ type: 'text', text: 'Only the main group can post.' }], isError: true };
        }

        const requestId = `larry-post-${Date.now()}`;
        writeIpcFile(TASKS_DIR, {
          type: 'larry_post',
          requestId,
          configPath: args.config_path,
          slideDir: args.slide_dir,
          caption: args.caption,
          title: args.title,
          crossPost: args.cross_post,
          timestamp: new Date().toISOString(),
        });

        const result = await waitForResult(requestId, 120000);
        return {
          content: [{ type: 'text', text: result.success ? JSON.stringify(result.data) : result.message }],
          isError: !result.success,
        };
      },
    ),

    tool(
      'larry_analytics',
      `Check post analytics and connect release IDs. Pulls data from Postiz.
Waits 2+ hours after publishing before connecting (TikTok indexing delay).
Use daily for the feedback loop. Main group only.`,
      {
        config_path: z.string().describe('Path to tiktok-marketing/config.json'),
        days: z.number().default(3).describe('Number of days to look back'),
        connect: z.boolean().default(true).describe('Attempt to connect unlinked posts to TikTok video IDs'),
      },
      async (args) => {
        if (!isMain) {
          return { content: [{ type: 'text', text: 'Only the main group can check analytics.' }], isError: true };
        }

        const requestId = `larry-analytics-${Date.now()}`;
        writeIpcFile(TASKS_DIR, {
          type: 'larry_analytics',
          requestId,
          configPath: args.config_path,
          days: args.days,
          connect: args.connect,
          timestamp: new Date().toISOString(),
        });

        const result = await waitForResult(requestId, 120000);
        return {
          content: [{ type: 'text', text: result.success ? JSON.stringify(result.data) : result.message }],
          isError: !result.success,
        };
      },
    ),

    tool(
      'larry_report',
      `Generate daily marketing report with the diagnostic framework.
Pulls Postiz analytics + optional RevenueCat conversions.
Diagnoses each post (scale / fix CTA / fix hook / full reset).
Saves report to tiktok-marketing/reports/. Main group only.`,
      {
        config_path: z.string().describe('Path to tiktok-marketing/config.json'),
        days: z.number().default(3).describe('Number of days to analyze'),
        hook_performance_path: z.string().default('tiktok-marketing/hook-performance.json').describe('Path to hook performance tracking file'),
      },
      async (args) => {
        if (!isMain) {
          return { content: [{ type: 'text', text: 'Only the main group can generate reports.' }], isError: true };
        }

        const requestId = `larry-report-${Date.now()}`;
        writeIpcFile(TASKS_DIR, {
          type: 'larry_report',
          requestId,
          configPath: args.config_path,
          days: args.days,
          hookPerformancePath: args.hook_performance_path,
          timestamp: new Date().toISOString(),
        });

        const result = await waitForResult(requestId, 180000);
        return {
          content: [{ type: 'text', text: result.success ? JSON.stringify(result.data) : result.message }],
          isError: !result.success,
        };
      },
    ),
  ];
}
