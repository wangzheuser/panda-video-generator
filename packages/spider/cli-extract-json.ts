#!/usr/bin/env node

/**
 * Spider: writes { title, content } JSON using environment variables only.
 *
 * Required:
 *   SPIDER_MODE=md|zhihu
 *   SPIDER_SOURCE=(.md path for md mode | zhihu question URL for zhihu mode)
 *   SPIDER_OUTPUT_DIR=(directory for the JSON file, created if missing)
 *
 * Optional:
 *   SPIDER_OUTPUT_FILENAME=output.json  (default)
 */

import { resolve } from 'path';
import { promises as fs } from 'fs';
import {
  extractZhihuUrlToSpiderJson,
  isZhihuQuestionUrl,
  parseMarkdownToSpiderJson,
  type SpiderJsonOutput,
} from './extract-json';

function normalizeMode(raw: string | undefined): 'md' | 'zhihu' | null {
  if (!raw) return null;
  const m = raw.trim().toLowerCase();
  if (m === 'md' || m === 'markdown') return 'md';
  if (m === 'zhihu') return 'zhihu';
  return null;
}

async function main(): Promise<void> {
  const mode = normalizeMode(process.env.SPIDER_MODE);
  const source = process.env.SPIDER_SOURCE?.trim();
  const outDirRaw = process.env.SPIDER_OUTPUT_DIR?.trim();
  const outName = (process.env.SPIDER_OUTPUT_FILENAME?.trim() || 'output.json').replace(/^[/\\]+/, '');

  if (!mode || !source || !outDirRaw) {
    console.error(
      'Required env: SPIDER_MODE=md|zhihu, SPIDER_SOURCE, SPIDER_OUTPUT_DIR\n' +
        'Optional: SPIDER_OUTPUT_FILENAME (default: output.json)',
    );
    process.exit(1);
  }

  const outDir = resolve(process.cwd(), outDirRaw);
  await fs.mkdir(outDir, { recursive: true });
  const outPath = resolve(outDir, outName);

  let result: SpiderJsonOutput;

  if (mode === 'md') {
    const mdPath = resolve(process.cwd(), source);
    result = parseMarkdownToSpiderJson(mdPath);
  } else {
    if (!source.startsWith('http://') && !source.startsWith('https://')) {
      throw new Error('SPIDER_SOURCE must be a full https URL for SPIDER_MODE=zhihu');
    }
    if (!isZhihuQuestionUrl(source)) {
      throw new Error('SPIDER_SOURCE must be a Zhihu question URL (…zhihu.com…/question/…)');
    }
    result = await extractZhihuUrlToSpiderJson(source);
  }

  await fs.writeFile(outPath, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`Wrote ${outPath}`);
  console.log(`Title: ${result.title.slice(0, 80)}${result.title.length > 80 ? '…' : ''}`);
  console.log(`Content length: ${result.content.length} chars`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
