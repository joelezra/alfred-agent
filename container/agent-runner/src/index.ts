/**
 * NanoClaw Agent Runner
 * Runs inside a container, receives config via stdin, outputs result to stdout
 *
 * Input protocol:
 *   Stdin: Full ContainerInput JSON (read until EOF, like before)
 *   IPC:   Follow-up messages written as JSON files to /workspace/ipc/input/
 *          Files: {type:"message", text:"..."}.json — polled and consumed
 *          Sentinel: /workspace/ipc/input/_close — signals session end
 *
 * Stdout protocol:
 *   Each result is wrapped in OUTPUT_START_MARKER / OUTPUT_END_MARKER pairs.
 *   Multiple results may be emitted (one per agent teams result).
 *   Final marker after loop ends signals completion.
 */

import fs from 'fs';
import path from 'path';
import { query, HookCallback, PreCompactHookInput, PostCompactHookInput, StopHookInput } from '@anthropic-ai/claude-agent-sdk';
import { fileURLToPath } from 'url';

interface ContainerInput {
  prompt: string;
  sessionId?: string;
  groupFolder: string;
  chatJid: string;
  isMain: boolean;
  isScheduledTask?: boolean;
  assistantName?: string;
}

interface ContainerOutput {
  status: 'success' | 'error';
  result: string | null;
  newSessionId?: string;
  error?: string;
}

interface SessionEntry {
  sessionId: string;
  fullPath: string;
  summary: string;
  firstPrompt: string;
}

interface SessionsIndex {
  entries: SessionEntry[];
}

interface SDKUserMessage {
  type: 'user';
  message: { role: 'user'; content: string };
  parent_tool_use_id: null;
  session_id: string;
}

const IPC_INPUT_DIR = '/workspace/ipc/input';
const IPC_INPUT_CLOSE_SENTINEL = path.join(IPC_INPUT_DIR, '_close');
const IPC_POLL_MS = 500;

/**
 * Push-based async iterable for streaming user messages to the SDK.
 * Keeps the iterable alive until end() is called, preventing isSingleUserTurn.
 */
class MessageStream {
  private queue: SDKUserMessage[] = [];
  private waiting: (() => void) | null = null;
  private done = false;

  push(text: string): void {
    this.queue.push({
      type: 'user',
      message: { role: 'user', content: text },
      parent_tool_use_id: null,
      session_id: '',
    });
    this.waiting?.();
  }

  end(): void {
    this.done = true;
    this.waiting?.();
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<SDKUserMessage> {
    while (true) {
      while (this.queue.length > 0) {
        yield this.queue.shift()!;
      }
      if (this.done) return;
      await new Promise<void>(r => { this.waiting = r; });
      this.waiting = null;
    }
  }
}

async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { data += chunk; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

const OUTPUT_START_MARKER = '---NANOCLAW_OUTPUT_START---';
const OUTPUT_END_MARKER = '---NANOCLAW_OUTPUT_END---';

function writeOutput(output: ContainerOutput): void {
  console.log(OUTPUT_START_MARKER);
  console.log(JSON.stringify(output));
  console.log(OUTPUT_END_MARKER);
}

function log(message: string): void {
  console.error(`[agent-runner] ${message}`);
}

function getSessionSummary(sessionId: string, transcriptPath: string): string | null {
  const projectDir = path.dirname(transcriptPath);
  const indexPath = path.join(projectDir, 'sessions-index.json');

  if (!fs.existsSync(indexPath)) {
    log(`Sessions index not found at ${indexPath}`);
    return null;
  }

  try {
    const index: SessionsIndex = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    const entry = index.entries.find(e => e.sessionId === sessionId);
    if (entry?.summary) {
      return entry.summary;
    }
  } catch (err) {
    log(`Failed to read sessions index: ${err instanceof Error ? err.message : String(err)}`);
  }

  return null;
}

/**
 * Archive the full transcript to conversations/ before compaction.
 */
function createPreCompactHook(assistantName?: string): HookCallback {
  return async (input, _toolUseId, _context) => {
    const preCompact = input as PreCompactHookInput;
    const transcriptPath = preCompact.transcript_path;
    const sessionId = preCompact.session_id;

    if (!transcriptPath || !fs.existsSync(transcriptPath)) {
      log('No transcript found for archiving');
      return {};
    }

    try {
      const content = fs.readFileSync(transcriptPath, 'utf-8');
      const messages = parseTranscript(content);

      if (messages.length === 0) {
        log('No messages to archive');
        return {};
      }

      const summary = getSessionSummary(sessionId, transcriptPath);
      const name = summary ? sanitizeFilename(summary) : generateFallbackName();

      const conversationsDir = '/workspace/group/conversations';
      fs.mkdirSync(conversationsDir, { recursive: true });

      const date = new Date().toISOString().split('T')[0];
      const filename = `${date}-${name}.md`;
      const filePath = path.join(conversationsDir, filename);

      const markdown = formatTranscriptMarkdown(messages, summary, assistantName);
      fs.writeFileSync(filePath, markdown);

      log(`Archived conversation to ${filePath}`);
    } catch (err) {
      log(`Failed to archive transcript: ${err instanceof Error ? err.message : String(err)}`);
    }

    return {};
  };
}

const MEMORY_DIR = '/workspace/group/memory';

/**
 * Ensure memory directory exists with template files on first run.
 */
function initMemoryDir(): void {
  fs.mkdirSync(MEMORY_DIR, { recursive: true });

  const templates: Record<string, string> = {
    'preferences.md': `# User Preferences

Track user preferences, communication style, and how they like things done.

## Communication Style
<!-- How does the user like to communicate? Formal/casual? Concise/detailed? -->

## Work Preferences
<!-- How do they like tasks approached? What tools/formats do they prefer? -->

## Topics of Interest
<!-- What do they care about? Recurring themes? -->
`,
    'learnings.md': `# Learnings

Things that worked, things that didn't, and patterns to remember.

## What Works
<!-- Approaches, solutions, and patterns that the user liked -->

## What to Avoid
<!-- Mistakes made, approaches the user corrected, things that didn't work -->
`,
    'people.md': `# People & Contacts

People the user mentions, their relationships, and relevant context.
`,
    'index.md': `# Memory Index

Overview of what's stored in memory.

| File | Purpose |
|------|---------|
| preferences.md | User preferences, communication style, work habits |
| learnings.md | What works, what to avoid, patterns |
| people.md | People the user mentions and context about them |
| topic-index.md | Auto-built keyword index — grep this first to find relevant conversations |
| summaries/ | Individual compact summaries (quick context per conversation) |
| pending-review.md | Auto-extracted signals for you to review and integrate |

## How to Find Past Context

1. \`grep "keyword" memory/topic-index.md\` → find dates and file paths
2. Read the summary file for quick context
3. Read the full transcript in \`conversations/\` only if you need exact details
`,
  };

  for (const [filename, content] of Object.entries(templates)) {
    const filePath = path.join(MEMORY_DIR, filename);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content);
      log(`Created memory template: ${filename}`);
    }
  }
}

/**
 * Extract keywords from text for the topic index.
 * Strips common stop words and returns unique meaningful terms.
 */
function extractKeywords(text: string, maxKeywords = 8): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
    'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over',
    'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
    'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
    'same', 'so', 'than', 'too', 'very', 'just', 'because', 'but', 'and',
    'or', 'if', 'while', 'about', 'up', 'its', 'it', 'this', 'that',
    'these', 'those', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he',
    'him', 'his', 'she', 'her', 'they', 'them', 'their', 'what', 'which',
    'who', 'whom', 'also', 'like', 'get', 'got', 'make', 'made', 'know',
    'think', 'want', 'need', 'use', 'used', 'using', 'well', 'back',
    'even', 'give', 'way', 'much', 'still', 'going', 'said', 'thing',
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  // Count frequency and return top keywords
  const freq = new Map<string, number>();
  for (const w of words) {
    freq.set(w, (freq.get(w) || 0) + 1);
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * Append an entry to the topic index file.
 */
function updateTopicIndex(date: string, keywords: string[], summaryPath: string, transcriptPath: string): void {
  const indexPath = path.join(MEMORY_DIR, 'topic-index.md');
  const entry = `${date} | ${keywords.join(', ')} | ${summaryPath} | ${transcriptPath}\n`;

  if (fs.existsSync(indexPath)) {
    fs.appendFileSync(indexPath, entry);
  } else {
    fs.writeFileSync(indexPath, `# Topic Index\n\nGrep this file to find relevant conversations.\n\n| Date | Keywords | Summary | Transcript |\n|------|----------|---------|------------|\n${entry}`);
  }
}

/**
 * Post-compaction hook: save compact summary as individual file and update topic index.
 * Three-tier lookup: topic-index.md (tiny) → summaries/ (small) → conversations/ (full)
 */
function createPostCompactHook(): HookCallback {
  return async (input, _toolUseId, _context) => {
    const postCompact = input as PostCompactHookInput;
    const summary = postCompact.compact_summary;
    if (!summary) return {};

    try {
      const summariesDir = path.join(MEMORY_DIR, 'summaries');
      fs.mkdirSync(summariesDir, { recursive: true });

      const date = new Date().toISOString().split('T')[0];
      const keywords = extractKeywords(summary);

      // Find matching transcript file (saved by PreCompact hook) and reuse its name
      const conversationsDir = '/workspace/group/conversations';
      let transcriptRef = '';
      let baseName = '';
      if (fs.existsSync(conversationsDir)) {
        const transcripts = fs.readdirSync(conversationsDir).filter(f => f.startsWith(date)).sort();
        if (transcripts.length > 0) {
          const transcriptFile = transcripts[transcripts.length - 1];
          transcriptRef = `conversations/${transcriptFile}`;
          baseName = transcriptFile; // Reuse exact transcript filename for summary
        }
      }

      // Fall back to keyword-based name if no transcript found
      if (!baseName) {
        const name = keywords.slice(0, 3).join('-') || 'conversation';
        baseName = `${date}-${name}.md`;
      }

      let finalPath = path.join(summariesDir, baseName);
      // Avoid overwriting if same name exists (multiple compactions in one day)
      if (fs.existsSync(finalPath)) {
        const time = new Date().toISOString().split('T')[1].slice(0, 5).replace(':', '');
        finalPath = path.join(summariesDir, `${time}-${baseName}`);
      }

      fs.writeFileSync(finalPath, `# Summary: ${keywords.slice(0, 4).join(', ')}\n\n${date}\n\n${summary}\n`);

      updateTopicIndex(date, keywords, `memory/summaries/${path.basename(finalPath)}`, transcriptRef);
      log(`Saved summary to ${path.basename(finalPath)}, indexed ${keywords.length} keywords`);
    } catch (err) {
      log(`Failed to save compact summary: ${err instanceof Error ? err.message : String(err)}`);
    }

    return {};
  };
}

/**
 * Stop hook: extract learning signals from the conversation transcript.
 * Looks for corrections, preferences, and explicit memory requests.
 * Writes raw signals to pending-review.md for the agent to integrate
 * into structured memory files on next session.
 */
function createStopHook(): HookCallback {
  return async (input, _toolUseId, _context) => {
    const stopInput = input as StopHookInput;
    const transcriptPath = stopInput.transcript_path;

    if (!transcriptPath || !fs.existsSync(transcriptPath)) return {};

    try {
      const content = fs.readFileSync(transcriptPath, 'utf-8');
      const messages = parseTranscript(content);

      if (messages.length < 2) return {};

      const signals: string[] = [];

      // Pattern 1: User corrections ("no", "not that", "actually", "I meant", "don't", "stop")
      const correctionPatterns = /\b(no[,.]?\s|not that|actually[,.]?\s|i meant|don't|stop\s|wrong|incorrect|i prefer|i'd rather|instead of)/i;

      // Pattern 2: Explicit memory requests ("remember", "note that", "keep in mind", "for future")
      const memoryPatterns = /\b(remember\s+(that|this|my|i)|note that|keep in mind|for (future|next time)|don't forget|always\s+\w+\s+when|never\s+\w+\s+when)/i;

      // Pattern 3: Positive feedback ("perfect", "exactly", "yes that's", "great", "love it")
      const positivePatterns = /\b(perfect|exactly|yes[,!]?\s+that'?s?|great[,!]|love it|that's what i|keep doing|good job)/i;

      for (const msg of messages) {
        if (msg.role !== 'user') continue;
        const text = msg.content.trim();
        if (text.length < 5 || text.length > 500) continue;

        if (correctionPatterns.test(text)) {
          signals.push(`[correction] ${text}`);
        }
        if (memoryPatterns.test(text)) {
          signals.push(`[memory-request] ${text}`);
        }
        if (positivePatterns.test(text)) {
          signals.push(`[positive] ${text}`);
        }
      }

      // Index conversation keywords regardless of signals
      const allText = messages.map(m => m.content).join(' ');
      const keywords = extractKeywords(allText);
      if (keywords.length > 0) {
        fs.mkdirSync(MEMORY_DIR, { recursive: true });
        const date = new Date().toISOString().split('T')[0];
        const conversationsDir = '/workspace/group/conversations';
        let transcriptRef = '';
        if (fs.existsSync(conversationsDir)) {
          const transcripts = fs.readdirSync(conversationsDir).filter(f => f.startsWith(date)).sort();
          if (transcripts.length > 0) {
            transcriptRef = `conversations/${transcripts[transcripts.length - 1]}`;
          }
        }
        updateTopicIndex(date, keywords, '', transcriptRef);
        log(`Indexed ${keywords.length} keywords from conversation`);
      }

      if (signals.length === 0) return {};

      fs.mkdirSync(MEMORY_DIR, { recursive: true });
      const pendingPath = path.join(MEMORY_DIR, 'pending-review.md');
      const date = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const block = `\n### ${date}\n\n${signals.map(s => `- ${s}`).join('\n')}\n`;

      if (fs.existsSync(pendingPath)) {
        fs.appendFileSync(pendingPath, block);
      } else {
        fs.writeFileSync(pendingPath, `# Pending Review\n\nAuto-extracted signals from conversations. Review these and integrate relevant ones into preferences.md, learnings.md, or people.md — then delete the entries you've processed.\n${block}`);
      }
      log(`Extracted ${signals.length} learning signals to pending-review.md`);
    } catch (err) {
      log(`Failed to extract learning signals: ${err instanceof Error ? err.message : String(err)}`);
    }

    return {};
  };
}

function sanitizeFilename(summary: string): string {
  return summary
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

function generateFallbackName(): string {
  const time = new Date();
  return `conversation-${time.getHours().toString().padStart(2, '0')}${time.getMinutes().toString().padStart(2, '0')}`;
}

interface ParsedMessage {
  role: 'user' | 'assistant';
  content: string;
}

function parseTranscript(content: string): ParsedMessage[] {
  const messages: ParsedMessage[] = [];

  for (const line of content.split('\n')) {
    if (!line.trim()) continue;
    try {
      const entry = JSON.parse(line);
      if (entry.type === 'user' && entry.message?.content) {
        const text = typeof entry.message.content === 'string'
          ? entry.message.content
          : entry.message.content.map((c: { text?: string }) => c.text || '').join('');
        if (text) messages.push({ role: 'user', content: text });
      } else if (entry.type === 'assistant' && entry.message?.content) {
        const textParts = entry.message.content
          .filter((c: { type: string }) => c.type === 'text')
          .map((c: { text: string }) => c.text);
        const text = textParts.join('');
        if (text) messages.push({ role: 'assistant', content: text });
      }
    } catch {
    }
  }

  return messages;
}

function formatTranscriptMarkdown(messages: ParsedMessage[], title?: string | null, assistantName?: string): string {
  const now = new Date();
  const formatDateTime = (d: Date) => d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const lines: string[] = [];
  lines.push(`# ${title || 'Conversation'}`);
  lines.push('');
  lines.push(`Archived: ${formatDateTime(now)}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const msg of messages) {
    const sender = msg.role === 'user' ? 'User' : (assistantName || 'Assistant');
    const content = msg.content.length > 2000
      ? msg.content.slice(0, 2000) + '...'
      : msg.content;
    lines.push(`**${sender}**: ${content}`);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Check for _close sentinel.
 */
function shouldClose(): boolean {
  if (fs.existsSync(IPC_INPUT_CLOSE_SENTINEL)) {
    try { fs.unlinkSync(IPC_INPUT_CLOSE_SENTINEL); } catch { /* ignore */ }
    return true;
  }
  return false;
}

/**
 * Drain all pending IPC input messages.
 * Returns messages found, or empty array.
 */
function drainIpcInput(): string[] {
  try {
    fs.mkdirSync(IPC_INPUT_DIR, { recursive: true });
    const files = fs.readdirSync(IPC_INPUT_DIR)
      .filter(f => f.endsWith('.json'))
      .sort();

    const messages: string[] = [];
    for (const file of files) {
      const filePath = path.join(IPC_INPUT_DIR, file);
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        fs.unlinkSync(filePath);
        if (data.type === 'message' && data.text) {
          messages.push(data.text);
        }
      } catch (err) {
        log(`Failed to process input file ${file}: ${err instanceof Error ? err.message : String(err)}`);
        try { fs.unlinkSync(filePath); } catch { /* ignore */ }
      }
    }
    return messages;
  } catch (err) {
    log(`IPC drain error: ${err instanceof Error ? err.message : String(err)}`);
    return [];
  }
}

/**
 * Wait for a new IPC message or _close sentinel.
 * Returns the messages as a single string, or null if _close.
 */
function waitForIpcMessage(): Promise<string | null> {
  return new Promise((resolve) => {
    const poll = () => {
      if (shouldClose()) {
        resolve(null);
        return;
      }
      const messages = drainIpcInput();
      if (messages.length > 0) {
        resolve(messages.join('\n'));
        return;
      }
      setTimeout(poll, IPC_POLL_MS);
    };
    poll();
  });
}

/**
 * Run a single query and stream results via writeOutput.
 * Uses MessageStream (AsyncIterable) to keep isSingleUserTurn=false,
 * allowing agent teams subagents to run to completion.
 * Also pipes IPC messages into the stream during the query.
 */
async function runQuery(
  prompt: string,
  sessionId: string | undefined,
  mcpServerPath: string,
  containerInput: ContainerInput,
  sdkEnv: Record<string, string | undefined>,
  resumeAt?: string,
): Promise<{ newSessionId?: string; lastAssistantUuid?: string; closedDuringQuery: boolean }> {
  const stream = new MessageStream();
  stream.push(prompt);

  // Poll IPC for follow-up messages and _close sentinel during the query
  let ipcPolling = true;
  let closedDuringQuery = false;
  const pollIpcDuringQuery = () => {
    if (!ipcPolling) return;
    if (shouldClose()) {
      log('Close sentinel detected during query, ending stream');
      closedDuringQuery = true;
      stream.end();
      ipcPolling = false;
      return;
    }
    const messages = drainIpcInput();
    for (const text of messages) {
      log(`Piping IPC message into active query (${text.length} chars)`);
      stream.push(text);
    }
    setTimeout(pollIpcDuringQuery, IPC_POLL_MS);
  };
  setTimeout(pollIpcDuringQuery, IPC_POLL_MS);

  let newSessionId: string | undefined;
  let lastAssistantUuid: string | undefined;
  let messageCount = 0;
  let resultCount = 0;

  // Load global CLAUDE.md as additional system context (shared across all groups)
  const globalClaudeMdPath = '/workspace/global/CLAUDE.md';
  let globalClaudeMd: string | undefined;
  if (!containerInput.isMain && fs.existsSync(globalClaudeMdPath)) {
    globalClaudeMd = fs.readFileSync(globalClaudeMdPath, 'utf-8');
  }

  // Discover additional directories mounted at /workspace/extra/*
  // These are passed to the SDK so their CLAUDE.md files are loaded automatically
  const extraDirs: string[] = [];
  const extraBase = '/workspace/extra';
  if (fs.existsSync(extraBase)) {
    for (const entry of fs.readdirSync(extraBase)) {
      const fullPath = path.join(extraBase, entry);
      if (fs.statSync(fullPath).isDirectory()) {
        extraDirs.push(fullPath);
      }
    }
  }
  if (extraDirs.length > 0) {
    log(`Additional directories: ${extraDirs.join(', ')}`);
  }

  // Model selection: NANOCLAW_MODEL env var or default to opus
  const model = process.env.NANOCLAW_MODEL || 'claude-opus-4-6';

  for await (const message of query({
    prompt: stream,
    options: {
      model,
      cwd: '/workspace/group',
      additionalDirectories: extraDirs.length > 0 ? extraDirs : undefined,
      resume: sessionId,
      resumeSessionAt: resumeAt,
      systemPrompt: globalClaudeMd
        ? { type: 'preset' as const, preset: 'claude_code' as const, append: globalClaudeMd }
        : undefined,
      allowedTools: [
        'Bash',
        'Read', 'Write', 'Edit', 'Glob', 'Grep',
        'WebSearch', 'WebFetch',
        'Task', 'TaskOutput', 'TaskStop',
        'TeamCreate', 'TeamDelete', 'SendMessage',
        'TodoWrite', 'ToolSearch', 'Skill',
        'NotebookEdit',
        'mcp__nanoclaw__*'
      ],
      env: sdkEnv,
      permissionMode: 'bypassPermissions',
      allowDangerouslySkipPermissions: true,
      settingSources: ['project', 'user'],
      mcpServers: {
        nanoclaw: {
          command: 'node',
          args: [mcpServerPath],
          env: {
            NANOCLAW_CHAT_JID: containerInput.chatJid,
            NANOCLAW_GROUP_FOLDER: containerInput.groupFolder,
            NANOCLAW_IS_MAIN: containerInput.isMain ? '1' : '0',
          },
        },
      },
      hooks: {
        PreCompact: [{ hooks: [createPreCompactHook(containerInput.assistantName)] }],
        PostCompact: [{ hooks: [createPostCompactHook()] }],
        Stop: [{ hooks: [createStopHook()] }],
      },
    }
  })) {
    messageCount++;
    const msgType = message.type === 'system' ? `system/${(message as { subtype?: string }).subtype}` : message.type;
    log(`[msg #${messageCount}] type=${msgType}`);

    if (message.type === 'assistant' && 'uuid' in message) {
      lastAssistantUuid = (message as { uuid: string }).uuid;
    }

    if (message.type === 'system' && message.subtype === 'init') {
      newSessionId = message.session_id;
      log(`Session initialized: ${newSessionId}`);
    }

    if (message.type === 'system' && (message as { subtype?: string }).subtype === 'task_notification') {
      const tn = message as { task_id: string; status: string; summary: string };
      log(`Task notification: task=${tn.task_id} status=${tn.status} summary=${tn.summary}`);
    }

    if (message.type === 'result') {
      resultCount++;
      const textResult = 'result' in message ? (message as { result?: string }).result : null;
      log(`Result #${resultCount}: subtype=${message.subtype}${textResult ? ` text=${textResult.slice(0, 200)}` : ''}`);
      writeOutput({
        status: 'success',
        result: textResult || null,
        newSessionId
      });
    }
  }

  ipcPolling = false;
  log(`Query done. Messages: ${messageCount}, results: ${resultCount}, lastAssistantUuid: ${lastAssistantUuid || 'none'}, closedDuringQuery: ${closedDuringQuery}`);
  return { newSessionId, lastAssistantUuid, closedDuringQuery };
}

async function main(): Promise<void> {
  let containerInput: ContainerInput;

  try {
    const stdinData = await readStdin();
    containerInput = JSON.parse(stdinData);
    try { fs.unlinkSync('/tmp/input.json'); } catch { /* may not exist */ }
    log(`Received input for group: ${containerInput.groupFolder}`);
  } catch (err) {
    writeOutput({
      status: 'error',
      result: null,
      error: `Failed to parse input: ${err instanceof Error ? err.message : String(err)}`
    });
    process.exit(1);
  }

  // Credentials are injected by the host's credential proxy via ANTHROPIC_BASE_URL.
  // No real secrets exist in the container environment.
  const sdkEnv: Record<string, string | undefined> = { ...process.env };

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const mcpServerPath = path.join(__dirname, 'ipc-mcp-stdio.js');

  // Initialize memory directory with templates on first run
  initMemoryDir();

  let sessionId = containerInput.sessionId;
  fs.mkdirSync(IPC_INPUT_DIR, { recursive: true });

  // Clean up stale _close sentinel from previous container runs
  try { fs.unlinkSync(IPC_INPUT_CLOSE_SENTINEL); } catch { /* ignore */ }

  // Build initial prompt (drain any pending IPC messages too)
  let prompt = containerInput.prompt;
  if (containerInput.isScheduledTask) {
    prompt = `[SCHEDULED TASK - The following message was sent automatically and is not coming directly from the user or group.]\n\n${prompt}`;
  }

  // Inject pending-review reminder if learnings exist from previous sessions
  const pendingReviewPath = path.join(MEMORY_DIR, 'pending-review.md');
  if (!containerInput.isScheduledTask && fs.existsSync(pendingReviewPath)) {
    const pendingContent = fs.readFileSync(pendingReviewPath, 'utf-8').trim();
    if (pendingContent.length > 50) {
      prompt += '\n\n[SYSTEM: You have pending learnings from previous conversations in memory/pending-review.md. When you have a moment between tasks, review them and integrate relevant ones into your memory files (preferences.md, learnings.md, people.md), then delete the processed entries from pending-review.md. Do this silently — don\'t mention it to the user.]';
      log('Injected pending-review reminder into prompt');
    }
  }
  const pending = drainIpcInput();
  if (pending.length > 0) {
    log(`Draining ${pending.length} pending IPC messages into initial prompt`);
    prompt += '\n' + pending.join('\n');
  }

  // Query loop: run query → wait for IPC message → run new query → repeat
  let resumeAt: string | undefined;
  try {
    while (true) {
      log(`Starting query (session: ${sessionId || 'new'}, resumeAt: ${resumeAt || 'latest'})...`);

      const queryResult = await runQuery(prompt, sessionId, mcpServerPath, containerInput, sdkEnv, resumeAt);
      if (queryResult.newSessionId) {
        sessionId = queryResult.newSessionId;
      }
      if (queryResult.lastAssistantUuid) {
        resumeAt = queryResult.lastAssistantUuid;
      }

      // If _close was consumed during the query, exit immediately.
      // Don't emit a session-update marker (it would reset the host's
      // idle timer and cause a 30-min delay before the next _close).
      if (queryResult.closedDuringQuery) {
        log('Close sentinel consumed during query, exiting');
        break;
      }

      // Emit session update so host can track it
      writeOutput({ status: 'success', result: null, newSessionId: sessionId });

      log('Query ended, waiting for next IPC message...');

      // Wait for the next message or _close sentinel
      const nextMessage = await waitForIpcMessage();
      if (nextMessage === null) {
        log('Close sentinel received, exiting');
        break;
      }

      log(`Got new message (${nextMessage.length} chars), starting new query`);
      prompt = nextMessage;
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    log(`Agent error: ${errorMessage}`);
    writeOutput({
      status: 'error',
      result: null,
      newSessionId: sessionId,
      error: errorMessage
    });
    process.exit(1);
  }
}

main();
