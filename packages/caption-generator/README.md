# @panda-video-generator/caption-generator

**Video narration script** generation via the **DeepSeek** API: takes **structured text you already have** (title, body in `content`, optional Q&A `answers`), returns prose suited for subtitles/TTS, and writes **`output/tts/input.txt`** (or `<outputDir>/input.txt`).

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
- **`outputDir`**: defaults to repo `output/tts` (see `types/paths`). When using the default TTS layout, the file is `output/tts/input.txt`. Internally uses `generateVideoScriptText` then writes `input.txt`.

### `generateVideoScriptFromFile(jsonFilePath, outputDir?)`

Reads a JSON file (e.g. spider output with `title` / `content` / `answers` / optional `sourceUrl`), then calls `generateVideoScript`.

### Type export

- **`VideoScriptSourcePayload`** — shared shape for crawlers that feed this package.

## Usage (example)

```ts
import { generateVideoScript } from '@panda-video-generator/caption-generator';

await generateVideoScript(
  {
    title: 'Example',
    content: 'Body text…',
    answers: [],
  },
  'output/tts',
);
```

`pnpm exec tsx` resolves this package when your script lives under `packages/spider` with a workspace dependency; from other locations, depend on `@panda-video-generator/caption-generator` in `package.json`.

## Boundary with `@panda-video-generator/spider`

| Package | Responsibility |
|---------|----------------|
| `spider` | Open pages, extract structured fields, write crawl JSON/Markdown |
| `caption-generator` | Turn that structure into a single script file for TTS (via DeepSeek) |

## License

See the LICENSE file in the repository root.
