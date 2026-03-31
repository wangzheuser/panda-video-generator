import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { EdgeTTS } from 'node-edge-tts';
import { assertFfmpegAvailable, mergeMp3WithSpeed } from './ffmpeg-merge.js';
import { getMp3DurationSeconds } from './duration.js';
import { generateVtt } from './vtt.js';

const SPEED_FACTOR = 1.1;
const DEFAULT_VOICE = 'zh-CN-YunjianNeural';

/**
 * Single default for TTS parallelism & retry policy (both 3).
 * Override batch with EDGE_TTS_BATCH_SIZE (capped at BATCH_SIZE_ENV_CAP).
 */
const TTS_DEFAULT_THREE = 3;
const DEFAULT_BATCH_SIZE = TTS_DEFAULT_THREE;
const DEFAULT_MAX_RETRIES = TTS_DEFAULT_THREE;
/** Max allowed EDGE_TTS_BATCH_SIZE (raise here if you need >3 concurrent WS). */
const BATCH_SIZE_ENV_CAP = 8;

/** `node-edge-tts` defaults to 10s per paragraph, too short for long lines or slow links. */
const DEFAULT_EDGE_TTS_TIMEOUT_MS = 120_000;
const MIN_EDGE_TTS_TIMEOUT_MS = 15_000;

export type ProcessNarrationOptions = {
  voice?: string;
  speedFactor?: number;
  batchSize?: number;
};

/**
 * Edge read-aloud WebSocket expects SSML names like `zh-CN-YunjianNeural`.
 * Azure-style strings (e.g. `zh-CN-Yunjian:Neural`, `en-US-Aria:DragonHDFlashLatestNeural`)
 * are not valid in `<voice name="...">` and tend to fail or hang until timeout.
 */
export function normalizeVoiceForEdgeReadAloud(voiceRaw: string): string {
  const v = voiceRaw.trim();
  if (!v.includes(':')) return v;

  const plainNeural = /^(.+):Neural$/i.exec(v);
  if (plainNeural) {
    const base = plainNeural[1];
    return base.endsWith('Neural') ? base : `${base}Neural`;
  }

  const variant = /^(.+):(DragonHDFlashLatestNeural|DragonHD\w+|\w+Neural)$/i.exec(v);
  if (variant) {
    const base = variant[1];
    return base.endsWith('Neural') ? base : `${base}Neural`;
  }

  return v.replace(':', '');
}

function voiceToLang(voice: string): string {
  const parts = voice.split('-');
  if (parts.length >= 2) {
    return `${parts[0]}-${parts[1]}`;
  }
  return 'zh-CN';
}

function parseTimeoutMs(): number {
  const raw = process.env.EDGE_TTS_TIMEOUT_MS?.trim();
  const n = raw ? Number.parseInt(raw, 10) : DEFAULT_EDGE_TTS_TIMEOUT_MS;
  if (!Number.isFinite(n) || n < MIN_EDGE_TTS_TIMEOUT_MS) {
    return DEFAULT_EDGE_TTS_TIMEOUT_MS;
  }
  return n;
}

function parseBatchSize(): number {
  const raw = process.env.EDGE_TTS_BATCH_SIZE?.trim();
  const n = raw ? Number.parseInt(raw, 10) : DEFAULT_BATCH_SIZE;
  if (!Number.isFinite(n) || n < 1) return DEFAULT_BATCH_SIZE;
  return Math.min(BATCH_SIZE_ENV_CAP, n);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function ttsWithRetry(
  tts: EdgeTTS,
  text: string,
  outPath: string,
  maxRetries = DEFAULT_MAX_RETRIES,
): Promise<void> {
  let last: unknown;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await tts.ttsPromise(text, outPath);
      return;
    } catch (e) {
      last = e;
      const msg = e instanceof Error ? e.message : String(e);
      const wait = (attempt + 1) * 2000;
      console.warn(`  ⚠️  ${msg} — retry in ${wait}ms (${attempt + 1}/${maxRetries})`);
      await sleep(wait);
    }
  }
  throw last;
}

function parseParagraphs(content: string): string[] {
  const lines: string[] = [];
  for (const line of content.split('\n')) {
    const t = line.trim();
    if (t) lines.push(t);
  }
  return lines;
}

/**
 * Read narration script (non-empty lines = paragraphs), synthesize with Edge-TTS,
 * merge + speed-up, write `audio.mp3` and `audio.vtt` into `outputDir`.
 */
export async function processNarrationFile(
  inputFile: string,
  outputDir: string,
  options: ProcessNarrationOptions = {},
): Promise<void> {
  const voiceRaw = options.voice ?? (process.env.EDGE_TTS_VOICE?.trim() || DEFAULT_VOICE);
  const voice = normalizeVoiceForEdgeReadAloud(voiceRaw);
  const speedFactor = options.speedFactor ?? SPEED_FACTOR;
  const batchSize = options.batchSize ?? parseBatchSize();
  const timeoutMs = parseTimeoutMs();

  assertFfmpegAvailable();

  const content = await readFile(inputFile, 'utf-8');
  const lines = parseParagraphs(content);

  if (lines.length === 0) {
    throw new Error('Narration file is empty (no non-empty lines)');
  }

  await mkdir(outputDir, { recursive: true });

  const tts = new EdgeTTS({
    voice,
    lang: voiceToLang(voice),
    outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
    timeout: timeoutMs,
  });

  console.log('🎙️  Edge-TTS (Node)');
  if (voice !== voiceRaw) {
    console.log(`🔊 Voice (raw): ${voiceRaw}`);
    console.log(`🔊 Voice (Edge SSML): ${voice}`);
  } else {
    console.log(`🔊 Voice: ${voice}`);
  }
  console.log(`⏱  Timeout per paragraph: ${timeoutMs}ms · parallel batch size: ${batchSize}`);
  console.log(`📝 ${lines.length} paragraph(s)\n`);

  type Row = { index: number; path: string; duration: number };
  const rows: Row[] = [];

  for (let batchStart = 0; batchStart < lines.length; batchStart += batchSize) {
    const batchEnd = Math.min(batchStart + batchSize, lines.length);

    const batchTasks = [];
    for (let i = batchStart; i < batchEnd; i++) {
      const text = lines[i]!;
      const index = i + 1;
      const tempPath = join(outputDir, `sentence${index}.mp3`);

      batchTasks.push(
        (async (): Promise<Row> => {
          console.log(`[${index}/${lines.length}] ${text.slice(0, 40)}${text.length > 40 ? '…' : ''}`);
          console.log(`    length: ${text.length} chars`);
          await ttsWithRetry(tts, text, tempPath);
          const duration = await getMp3DurationSeconds(tempPath);
          console.log(`    ✅ ${tempPath} (${duration.toFixed(2)}s)\n`);
          return { index, path: tempPath, duration };
        })(),
      );
    }

    const batchRows = await Promise.all(batchTasks);
    rows.push(...batchRows);
  }

  rows.sort((a, b) => a.index - b.index);
  const tempPaths = rows.map((r) => r.path);
  const durations = rows.map((r) => r.duration);

  const mergedPath = join(outputDir, 'audio.mp3');
  console.log(`🔗 Merging + atempo ${speedFactor} → ${mergedPath}`);
  mergeMp3WithSpeed(tempPaths, mergedPath, speedFactor);

  const adjustedDurations = durations.map((d) => d / speedFactor);

  const vttPath = join(outputDir, 'audio.vtt');
  const vttBody = generateVtt(lines, adjustedDurations);
  await writeFile(vttPath, vttBody, 'utf-8');
  console.log(`📝 VTT: ${vttPath}`);

  console.log('🗑️  Removing sentence*.mp3…');
  for (const p of tempPaths) {
    try {
      await rm(p, { force: true });
    } catch {
      /* ignore */
    }
  }

  const total = adjustedDurations.reduce((a, b) => a + b, 0);
  console.log(`\n✅ Done — audio ${mergedPath}, total ~${total.toFixed(2)}s (after speed)`);
}
