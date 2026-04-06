/**
 * Larry Marketing - Slide Image Generation via Nano Banana Pro
 *
 * Generates 6 TikTok slideshow images using Google Gemini 3 Pro Image.
 * Reads config + prompts from stdin, writes images to output directory.
 *
 * Input (stdin JSON):
 * {
 *   "configPath": "path/to/config.json",
 *   "outputDir": "path/to/output/",
 *   "prompts": ["prompt1", "prompt2", ...],  // 6 prompts
 *   "referenceImages": ["path/to/ref.png"]   // optional, for consistency
 * }
 *
 * Output (stdout JSON):
 * { "success": true, "slides": ["slide_1.png", ...], "cost": 0.80 }
 */

import fs from 'fs';
import path from 'path';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const SLIDE_WIDTH = 1024;
const SLIDE_HEIGHT = 1536;

interface Input {
  configPath: string;
  outputDir: string;
  prompts: string[];
  referenceImages?: string[];
}

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
  }>;
  error?: { message: string; code: number };
}

async function generateImage(
  apiKey: string,
  model: string,
  prompt: string,
  referenceImages?: string[],
): Promise<Buffer> {
  const parts: Array<Record<string, unknown>> = [];

  // Add reference images for character/scene consistency
  if (referenceImages && referenceImages.length > 0) {
    for (const refPath of referenceImages) {
      if (fs.existsSync(refPath)) {
        const imgData = fs.readFileSync(refPath).toString('base64');
        const ext = path.extname(refPath).toLowerCase();
        const mimeType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
        parts.push({ inlineData: { mimeType, data: imgData } });
      }
    }
  }

  parts.push({ text: prompt });

  const body = {
    contents: [{ parts }],
    generationConfig: {
      responseModalities: ['IMAGE', 'TEXT'],
      imageDimensions: { width: SLIDE_WIDTH, height: SLIDE_HEIGHT },
    },
  };

  const url = `${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as GeminiResponse;

  if (data.error) {
    throw new Error(`Gemini API error: ${data.error.message}`);
  }

  // Extract the image from response
  const candidate = data.candidates?.[0];
  if (!candidate) throw new Error('No candidate in Gemini response');

  for (const part of candidate.content.parts) {
    if (part.inlineData?.data) {
      return Buffer.from(part.inlineData.data, 'base64');
    }
  }

  throw new Error('No image data in Gemini response');
}

async function main() {
  // Read input from stdin
  const rawInput = fs.readFileSync(0, 'utf-8');
  const input: Input = JSON.parse(rawInput);

  // Load config
  const config = JSON.parse(fs.readFileSync(input.configPath, 'utf-8'));
  const { apiKey, model } = config.imageGen;

  if (!apiKey) {
    console.log(JSON.stringify({ success: false, message: 'No API key in config.imageGen.apiKey' }));
    process.exit(1);
  }

  // Ensure output directory
  fs.mkdirSync(input.outputDir, { recursive: true });

  const slides: string[] = [];
  let totalCost = 0;
  const costPerImage = 0.134; // Nano Banana Pro standard pricing

  for (let i = 0; i < input.prompts.length; i++) {
    const slideFile = `slide_${i + 1}.png`;
    const slidePath = path.join(input.outputDir, slideFile);

    // Skip if already generated (resume support)
    if (fs.existsSync(slidePath) && fs.statSync(slidePath).size > 0) {
      console.error(`Slide ${i + 1} already exists, skipping`);
      slides.push(slideFile);
      continue;
    }

    console.error(`Generating slide ${i + 1}/${input.prompts.length}...`);

    try {
      const imageBuffer = await generateImage(
        apiKey,
        model || 'gemini-3-pro-image-preview',
        input.prompts[i],
        // Use reference images + any previously generated slides for consistency
        input.referenceImages,
      );

      fs.writeFileSync(slidePath, imageBuffer);
      slides.push(slideFile);
      totalCost += costPerImage;
      console.error(`Slide ${i + 1} saved (${(imageBuffer.length / 1024).toFixed(0)}KB)`);
    } catch (err) {
      console.error(`Failed to generate slide ${i + 1}: ${err}`);
      // Continue with remaining slides
      slides.push(`FAILED: ${slideFile}`);
    }

    // Small delay between requests to avoid rate limiting
    if (i < input.prompts.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  const successful = slides.filter((s) => !s.startsWith('FAILED:'));
  console.log(
    JSON.stringify({
      success: successful.length === input.prompts.length,
      slides,
      successful: successful.length,
      total: input.prompts.length,
      cost: Math.round(totalCost * 100) / 100,
      outputDir: input.outputDir,
    }),
  );
}

main().catch((err) => {
  console.log(JSON.stringify({ success: false, message: String(err) }));
  process.exit(1);
});
