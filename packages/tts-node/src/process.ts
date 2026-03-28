import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { EdgeTTS } from 'node-edge-tts';
import { assertFfmpegAvailable, mergeMp3WithSpeed } from './ffmpeg-merge.js';
import { getMp3DurationSeconds } from './duration.js';
import { generateVtt } from './vtt.js';

const BATCH_SIZE = 3;
const SPEED_FACTOR = 1.1;
const DEFAULT_VOICE = 'zh-CN-YunjianNeural';

export type ProcessNarrationOptions = {
  voice?: string;
  speedFactor?: number;
  batchSize?: number;
};

function voiceToLang(voice: string): string {
  const parts = voice.split('-');
  if (parts.length >= 2) {
    return `${parts[0]}-${parts[1]}`;
  }
  return 'zh-CN';
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function ttsWithRetry(tts: EdgeTTS, text: string, outPath: string, maxRetries = 3): Promise<void> {
  let last: unknown;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await tts.ttsPromise(text, outPath);
      return;
    } catch (e) {
      last = e;
      const wait = (attempt + 1) * 2000;
      console.warn(`  ⚠️  Retrying in ${wait}ms… (${attempt + 1}/${maxRetries})`);
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
  const voice = options.voice ?? (process.env.EDGE_TTS_VOICE?.trim() || DEFAULT_VOICE);
  const speedFactor = options.speedFactor ?? SPEED_FACTOR;
  const batchSize = options.batchSize ?? BATCH_SIZE;

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
  });

  console.log('🎙️  Edge-TTS (Node)');
  console.log(`🔊 Voice: ${voice}`);
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
