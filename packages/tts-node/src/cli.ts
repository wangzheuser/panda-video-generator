#!/usr/bin/env node
/**
 * CLI: [input_file] [output_dir]
 * Defaults: TTS_INPUT_FILE / TTS_OUTPUT_DIR, else $SPIDER_OUTPUT_DIR/input.txt → output/tts (align with types/paths).
 * Env: EDGE_TTS_VOICE (optional)
 */
import { resolve } from 'node:path';
import { processNarrationFile } from './process.js';

function defaultTtsOutputDir(): string {
  const v = process.env.TTS_OUTPUT_DIR?.trim();
  return v && v.length > 0 ? v : 'output/tts';
}

function defaultSpiderDir(): string {
  const v = process.env.SPIDER_OUTPUT_DIR?.trim();
  return v && v.length > 0 ? v : 'output/spider';
}

function defaultTtsInputFile(): string {
  const v = process.env.TTS_INPUT_FILE?.trim();
  if (v && v.length > 0) return v;
  return `${defaultSpiderDir()}/input.txt`;
}

async function main(): Promise<void> {
  const inputArg = process.argv[2];
  const outArg = process.argv[3];

  const inputFile = resolve(process.cwd(), inputArg ?? defaultTtsInputFile());
  const outputDir = resolve(process.cwd(), outArg ?? defaultTtsOutputDir());

  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('Usage: tsx packages/tts-node/src/cli.ts [input_file] [output_dir]');
    console.log(`Defaults: ${defaultTtsInputFile()} → ${defaultTtsOutputDir()}`);
    console.log('Env: SPIDER_OUTPUT_DIR, TTS_INPUT_FILE, TTS_OUTPUT_DIR, TTS_PUBLIC_DIR, EDGE_TTS_VOICE');
    return;
  }

  if (!inputArg) {
    console.log(`TTS input (default): ${inputFile}`);
    console.log(`TTS output dir (default): ${outputDir}`);
  }

  await processNarrationFile(inputFile, outputDir);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
