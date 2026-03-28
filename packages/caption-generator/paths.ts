/**
 * Path defaults for this package only (no imports from repo root).
 * Defaults align with `packages/spider/paths.ts` — keep `SPIDER_DIR_DEFAULT` in sync if you change crawl layout.
 */

export const SPIDER_DIR_DEFAULT = 'output/spider' as const;

/** Caption / narration output directory default when env unset. */
export const OUTPUT_DIRS = {
  SPIDER: SPIDER_DIR_DEFAULT,
} as const;

export function getSpiderOutputDir(): string {
  const v = process.env.SPIDER_OUTPUT_DIR?.trim();
  return v && v.length > 0 ? v : SPIDER_DIR_DEFAULT;
}

export function getSpiderOutputJsonPath(): string {
  return `${getSpiderOutputDir()}/output.json`;
}

export function getSpiderNarrationPath(): string {
  return `${getSpiderOutputDir()}/input.txt`;
}

/**
 * Default file `generateVideoScript` writes when `outputDir` is omitted.
 * Override with `TTS_INPUT_FILE`.
 */
export function getTtsInputFile(): string {
  const v = process.env.TTS_INPUT_FILE?.trim();
  if (v && v.length > 0) return v;
  return getSpiderNarrationPath();
}
