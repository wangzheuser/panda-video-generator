# @panda-video-generator/caption-generator

**Video narration script** generation via the **DeepSeek** API: takes **structured text you already have** (title, body in `content`, optional Q&A `answers`), returns prose suited for subtitles/TTS. Default write path: **`getTtsInputFile()`** → **`<SPIDER_OUTPUT_DIR>/input.txt`** (next to **`output.json`**), unless **`TTS_INPUT_FILE`** or explicit **`outputDir`** is set.

**Out of scope for this package:** HTTP fetching, Puppeteer, Zhihu or article crawling. Produce a `VideoScriptSourcePayload` (or compatible JSON) with your own spider or pipeline, then call this package.

## Requirements

- Install from the **monorepo root**: `pnpm install`.
- `DEEPSEEK_API_KEY` in the environment or in **repository root** `.env.local` (`DEEPSEEK_API_KEY=...`).

## API

### `generateVideoScriptText(data)`

- **`data`**: same shape as `generateVideoScript`.
- **Returns**: `Promise<string | null>` — the script text only (no file write). Use when you need the string first (e.g. derive WebVTT, then save both files yourself). `null` if the model returns empty content.

### `generateVideoScript(data, outputDir?)`

- **`data`**: `VideoScriptSourcePayload` — `{ title, content, answers[] }` (optional `sourceUrl` ignored for prompting).
- **`outputDir`**: optional. If omitted, uses `getTtsInputFile()` (`TTS_INPUT_FILE` or default `<SPIDER_OUTPUT_DIR>/input.txt`). If provided, writes `<outputDir>/input.txt`.

### `generateVideoScriptFromFile(jsonFilePath, outputDir?)`

Reads a JSON file (e.g. spider output with `title` / `content` / `answers` / optional `sourceUrl`), then calls `generateVideoScript`.

### `runCaptionAndVttFromSpiderJson(jsonFilePath, outputDir, options?)`

Reads spider JSON → **`generateVideoScriptText`** (DeepSeek) → writes **script** and **estimated WebVTT** in `outputDir` (same timing rule as `webvtt-estimate`). Options: `scriptFilename` (default `input.txt`), `vttFilename` (default `captions.vtt`), `secPerChar`.

### `scriptToEstimatedWebVtt(scriptText, secPerChar?)`

Turns plain script text into WebVTT with cue timing from character count (default ~`0.12` s/char).

### Env-driven CLI (repo root)

From monorepo root:

```bash
pnpm run caption:env
# same as CAPTION_INPUT_JSON=output/spider/output.json (see package.json prefixes)
```

| Variable | Required | Description |
|----------|----------|-------------|
| `CAPTION_INPUT_JSON` | no | Default `<SPIDER_OUTPUT_DIR>/output.json` |
| `CAPTION_OUTPUT_DIR` | no | Default `output/spider` |
| `CAPTION_SCRIPT_FILENAME` | no | Default `input.txt` |
| `CAPTION_VTT_FILENAME` | no | Default `captions.vtt` |
| `CAPTION_SEC_PER_CHAR` | no | Seconds per character for VTT estimate |

Still requires `DEEPSEEK_API_KEY` (or `.env.local`).

### Type export

- **`VideoScriptSourcePayload`** — shared shape for crawlers that feed this package.

## Usage (example)

```ts
import { generateVideoScript } from '@panda-video-generator/caption-generator';

await generateVideoScript({
  title: 'Example',
  content: 'Body text…',
  answers: [],
});
// writes to getTtsInputFile() e.g. output/spider/input.txt
```

Script + WebVTT from a spider JSON file:

```ts
import { runCaptionAndVttFromSpiderJson } from '@panda-video-generator/caption-generator/pipeline';

await runCaptionAndVttFromSpiderJson('output/spider/output.json', 'output/spider');
```

`pnpm exec tsx` resolves this package when your script lives under `packages/spider` with a workspace dependency; from other locations, depend on `@panda-video-generator/caption-generator` in `package.json`.

## Boundary with `@panda-video-generator/spider`

| Package | Responsibility |
|---------|----------------|
| `spider` | Open pages, extract structured fields, write crawl JSON/Markdown |
| `caption-generator` | Turn that structure into a single script file for TTS (via DeepSeek) |

## License

See the LICENSE file in the repository root.
