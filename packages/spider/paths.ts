/**
 * Path defaults for the spider package only (no imports from repo root).
 * Keep `SPIDER_DIR_DEFAULT` in sync with `packages/caption-generator/paths.ts` if crawl layout changes.
 */

export const SPIDER_DIR_DEFAULT = 'output/spider' as const;

/** Remotion Studio: synced copy of title.json (monorepo app convention). */
export const PUBLIC_VIDEO_DIR = 'public/video' as const;

export const PUBLIC_TITLE_JSON_FOR_REMOTION = `${PUBLIC_VIDEO_DIR}/title.json` as const;

export function getSpiderOutputDir(): string {
  const v = process.env.SPIDER_OUTPUT_DIR?.trim();
  return v && v.length > 0 ? v : SPIDER_DIR_DEFAULT;
}

export function getSpiderOutputJsonPath(): string {
  return `${getSpiderOutputDir()}/output.json`;
}

export function getSpiderTitleJsonPath(): string {
  return `${getSpiderOutputDir()}/title.json`;
}
