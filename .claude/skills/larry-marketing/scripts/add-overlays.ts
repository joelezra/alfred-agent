/**
 * Larry Marketing - Text Overlay via node-canvas
 *
 * Adds text overlays to slide images. Uses the exact sizing/positioning
 * from the original Larry skill (proven across 1M+ TikTok views).
 *
 * Input (stdin JSON):
 * {
 *   "inputDir": "path/to/slides/",
 *   "texts": ["Line 1\nLine 2", "Slide 2\ntext", ...],
 *   "outputDir": "path/to/output/"  // optional, defaults to inputDir
 * }
 *
 * Output (stdout JSON):
 * { "success": true, "slides": ["slide_1_overlay.png", ...] }
 */

import fs from 'fs';
import path from 'path';

// node-canvas is a native module — must be installed on host
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createCanvas, loadImage } = require('canvas');

interface Input {
  inputDir: string;
  texts: string[];
  outputDir?: string;
}

async function addOverlay(imagePath: string, text: string, outputPath: string): Promise<void> {
  const img = await loadImage(imagePath);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  // Dynamic font sizing based on text length (Larry's proven formula)
  const wordCount = text.split(/\s+/).length;
  let fontSizePercent: number;
  if (wordCount <= 5) fontSizePercent = 0.075; // Short: 75px on 1024w
  else if (wordCount <= 12) fontSizePercent = 0.065; // Medium: 66px
  else fontSizePercent = 0.05; // Long: 51px

  const fontSize = Math.round(img.width * fontSizePercent);
  const outlineWidth = Math.round(fontSize * 0.15);
  const maxWidth = img.width * 0.75;
  const lineHeight = fontSize * 1.3;

  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Word wrap (respects manual \n breaks)
  const lines: string[] = [];
  const manualLines = text.split('\n');
  for (const ml of manualLines) {
    const words = ml.trim().split(/\s+/);
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width <= maxWidth) {
        current = test;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }

  // Position: centered at ~28% from top (TikTok safe zone)
  const totalHeight = lines.length * lineHeight;
  const startY = img.height * 0.28 - totalHeight / 2;
  const x = img.width / 2;

  // Draw each line: black outline + white fill
  for (let i = 0; i < lines.length; i++) {
    const y = startY + i * lineHeight;

    // Black outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = outlineWidth;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeText(lines[i], x, y);

    // White fill
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(lines[i], x, y);
  }

  fs.writeFileSync(outputPath, canvas.toBuffer('image/png'));
}

async function main() {
  const rawInput = fs.readFileSync(0, 'utf-8');
  const input: Input = JSON.parse(rawInput);
  const outputDir = input.outputDir || input.inputDir;

  fs.mkdirSync(outputDir, { recursive: true });

  // Find slide images in input directory
  const slideFiles = fs
    .readdirSync(input.inputDir)
    .filter((f: string) => f.match(/^slide_\d+\.png$/))
    .sort();

  if (slideFiles.length === 0) {
    console.log(JSON.stringify({ success: false, message: 'No slide images found in input directory' }));
    process.exit(1);
  }

  if (input.texts.length !== slideFiles.length) {
    console.error(
      `Warning: ${input.texts.length} texts for ${slideFiles.length} slides. Processing min of both.`,
    );
  }

  const results: string[] = [];
  const count = Math.min(input.texts.length, slideFiles.length);

  for (let i = 0; i < count; i++) {
    const inputPath = path.join(input.inputDir, slideFiles[i]);
    const outputFile = slideFiles[i].replace('.png', '_overlay.png');
    const outputPath = path.join(outputDir, outputFile);

    console.error(`Adding overlay to slide ${i + 1}/${count}...`);

    try {
      await addOverlay(inputPath, input.texts[i], outputPath);
      results.push(outputFile);
      console.error(`Done: ${outputFile}`);
    } catch (err) {
      console.error(`Failed on slide ${i + 1}: ${err}`);
      results.push(`FAILED: ${outputFile}`);
    }
  }

  const successful = results.filter((r) => !r.startsWith('FAILED:'));
  console.log(
    JSON.stringify({
      success: successful.length === count,
      slides: results,
      successful: successful.length,
      total: count,
    }),
  );
}

main().catch((err) => {
  console.log(JSON.stringify({ success: false, message: String(err) }));
  process.exit(1);
});
