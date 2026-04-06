/**
 * Larry Marketing IPC Handler
 *
 * Handles all larry_* IPC messages from container agents.
 * Runs scripts as subprocesses on the host machine.
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: { target: 'pino-pretty', options: { colorize: true } },
});

interface SkillResult {
  success: boolean;
  message: string;
  data?: unknown;
}

// Script timeout mapping (milliseconds)
const SCRIPT_TIMEOUTS: Record<string, number> = {
  'generate-slides': 600000, // 10 min — image gen is slow
  'add-overlays': 120000, // 2 min
  'post-to-tiktok': 120000, // 2 min
  'check-analytics': 120000, // 2 min
  'daily-report': 180000, // 3 min
};

async function runScript(script: string, args: object): Promise<SkillResult> {
  const scriptPath = path.join(
    process.cwd(),
    '.claude',
    'skills',
    'larry-marketing',
    'scripts',
    `${script}.ts`,
  );

  const timeout = SCRIPT_TIMEOUTS[script] || 120000;

  return new Promise((resolve) => {
    const proc = spawn('npx', ['tsx', scriptPath], {
      cwd: process.cwd(),
      env: { ...process.env, NANOCLAW_ROOT: process.cwd() },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
      // Log stderr in real-time for progress visibility
      const line = data.toString().trim();
      if (line) logger.info({ script }, line);
    });

    proc.stdin.write(JSON.stringify(args));
    proc.stdin.end();

    const timer = setTimeout(() => {
      proc.kill('SIGTERM');
      resolve({ success: false, message: `Script timed out (${timeout / 1000}s)` });
    }, timeout);

    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        resolve({
          success: false,
          message: `Script exited with code: ${code}. ${stderr.slice(-200)}`,
        });
        return;
      }
      try {
        const lines = stdout.trim().split('\n');
        const result = JSON.parse(lines[lines.length - 1]);
        resolve({ success: result.success, message: result.message || '', data: result });
      } catch {
        resolve({
          success: false,
          message: `Failed to parse output: ${stdout.slice(0, 200)}`,
        });
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      resolve({ success: false, message: `Failed to spawn: ${err.message}` });
    });
  });
}

function writeResult(
  dataDir: string,
  sourceGroup: string,
  requestId: string,
  result: SkillResult,
): void {
  const resultsDir = path.join(dataDir, 'ipc', sourceGroup, 'larry_results');
  fs.mkdirSync(resultsDir, { recursive: true });
  fs.writeFileSync(
    path.join(resultsDir, `${requestId}.json`),
    JSON.stringify(result),
  );
}

/**
 * Handle Larry marketing IPC messages
 *
 * @returns true if message was handled, false if not a larry message
 */
export async function handleLarryIpc(
  data: Record<string, unknown>,
  sourceGroup: string,
  isMain: boolean,
  dataDir: string,
): Promise<boolean> {
  const type = data.type as string;
  if (!type?.startsWith('larry_')) return false;

  if (!isMain) {
    const requestId = data.requestId as string;
    if (requestId) {
      writeResult(dataDir, sourceGroup, requestId, {
        success: false,
        message: 'Larry marketing tools are main-group only.',
      });
    }
    return true;
  }

  const requestId = data.requestId as string;
  logger.info({ type, requestId }, 'Processing Larry IPC task');

  let result: SkillResult;

  switch (type) {
    case 'larry_generate_slides':
      result = await runScript('generate-slides', {
        configPath: data.configPath,
        outputDir: data.outputDir,
        prompts: data.prompts,
        referenceImages: data.referenceImages,
      });
      break;

    case 'larry_add_overlays':
      result = await runScript('add-overlays', {
        inputDir: data.inputDir,
        texts: data.texts,
        outputDir: data.outputDir,
      });
      break;

    case 'larry_post':
      result = await runScript('post-to-tiktok', {
        configPath: data.configPath,
        slideDir: data.slideDir,
        caption: data.caption,
        title: data.title,
        crossPost: data.crossPost,
      });
      break;

    case 'larry_analytics':
      result = await runScript('check-analytics', {
        configPath: data.configPath,
        days: data.days,
        connect: data.connect,
      });
      break;

    case 'larry_report':
      result = await runScript('daily-report', {
        configPath: data.configPath,
        days: data.days,
        hookPerformancePath: data.hookPerformancePath,
      });
      break;

    default:
      logger.warn({ type }, 'Unknown Larry IPC type');
      return false;
  }

  if (requestId) {
    writeResult(dataDir, sourceGroup, requestId, result);
  }

  logger.info({ type, requestId, success: result.success }, 'Larry IPC task completed');
  return true;
}
