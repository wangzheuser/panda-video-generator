#!/usr/bin/env node

/**
 * Env-only CLI: spider crawl `output.json` → DeepSeek caption → script + estimated WebVTT.
 *
 * Optional:
 *   CAPTION_INPUT_JSON       — default `<SPIDER_OUTPUT_DIR>/output.json`
 *   CAPTION_OUTPUT_DIR       — default output/spider
 *   CAPTION_SCRIPT_FILENAME  — default input.txt
 *   CAPTION_VTT_FILENAME     — default captions.vtt
 *   CAPTION_SEC_PER_CHAR     — default 0.12 (timing heuristic for Chinese)
 */

import { resolve } from 'path';
import { constants as fsConstants } from 'fs';
import { access } from 'fs/promises';
import { OUTPUT_DIRS, getSpiderOutputJsonPath } from './paths';
import { runCaptionAndVttFromSpiderJson } from './pipeline-from-json';

async function main(): Promise<void> {
  const jsonRaw =
    process.env.CAPTION_INPUT_JSON?.trim() || getSpiderOutputJsonPath();
  const outDirRaw = process.env.CAPTION_OUTPUT_DIR?.trim() || OUTPUT_DIRS.SPIDER;

  const jsonPath = resolve(process.cwd(), jsonRaw);
  try {
    await access(jsonPath, fsConstants.R_OK);
  } catch {
    console.error(`CAPTION_INPUT_JSON not found: ${jsonPath}`);
    process.exit(1);
  }

  const outDir = resolve(process.cwd(), outDirRaw);
  const scriptName = process.env.CAPTION_SCRIPT_FILENAME?.trim();
  const vttName = process.env.CAPTION_VTT_FILENAME?.trim();
  const sec = process.env.CAPTION_SEC_PER_CHAR?.trim();
  const secPerChar = sec !== undefined && sec !== '' ? Number(sec) : undefined;
  if (secPerChar !== undefined && (Number.isNaN(secPerChar) || secPerChar <= 0)) {
    console.error('CAPTION_SEC_PER_CHAR must be a positive number');
    process.exit(1);
  }

  await runCaptionAndVttFromSpiderJson(jsonPath, outDir, {
    scriptFilename: scriptName || undefined,
    vttFilename: vttName || undefined,
    secPerChar,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
