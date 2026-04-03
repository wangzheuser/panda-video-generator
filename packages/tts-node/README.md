# @panda-video-generator/tts-node

Node.js **Edge-TTS** pipeline (concatenate segments, WebVTT, ffmpeg `atempo` where needed):

- Non-empty lines in the input file = one TTS paragraph each
- Batched concurrent synthesis (default 3 at a time)
- **ffmpeg**: concat MP3s + `atempo` (default **1.1×**)
- Writes **`audio.mp3`** and **`audio.vtt`** in the output directory

## Requirements

- **ffmpeg**: system install on **PATH** required (e.g. `brew install ffmpeg`, `apt install ffmpeg`, Windows `winget install Gyan.FFmpeg`). Or run repo install with `--install-system-ffmpeg` / `-InstallSystemFfmpeg` where supported.
- Network access (Microsoft Edge TTS endpoint)

## CLI

From monorepo root:

```bash
# Full pipeline: check input + ffmpeg → synthesize → copy audio to public/ (see run-tts.mjs + sync-outputs-to-public)
pnpm tts

# CLI only (no copy to public/): optional args [input_file] [output_dir]; see src/cli.ts for defaults
pnpm exec tsx packages/tts-node/src/cli.ts output/spider/input.txt output/tts

# Defaults when args omitted: TTS_INPUT_FILE or <SPIDER_OUTPUT_DIR>/input.txt → TTS_OUTPUT_DIR (resolved from cwd)
pnpm exec tsx packages/tts-node/src/cli.ts
```

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `SPIDER_OUTPUT_DIR` | `output/spider` | Used when building default input path if `TTS_INPUT_FILE` is unset |
| `TTS_INPUT_FILE` | `<SPIDER_OUTPUT_DIR>/input.txt` | Narration text (non-empty lines = TTS paragraphs) |
| `TTS_OUTPUT_DIR` | `output/tts` | Output folder for **`audio.mp3`** and **`audio.vtt`** |
| `TTS_PUBLIC_DIR` | `public/tts` | Used by **`pnpm tts`** post-step sync (not read by `cli.ts` alone) |
| `EDGE_TTS_VOICE` | `zh-CN-YunjianNeural` | Neural voice name (also overridable in `processNarrationFile({ voice })`) |
| `EDGE_TTS_BATCH_SIZE` | `3` | Concurrent paragraph syntheses (capped at **8** in code) |
| `EDGE_TTS_TIMEOUT_MS` | `120000` | Per-paragraph WebSocket timeout (minimum enforced: **15000**) |

## Programmatic

```ts
import { processNarrationFile } from '@panda-video-generator/tts-node';

await processNarrationFile('/abs/path/input.txt', '/abs/path/output/tts', {
  voice: 'zh-CN-XiaoxiaoNeural',
  speedFactor: 1.1,
  batchSize: 3,
});
```

Optional **`batchSize`** falls back to `EDGE_TTS_BATCH_SIZE` (or **3**). Temporary **`sentence*.mp3`** files are created during synthesis and removed after merge.

## Implementation notes

- Depends on [`node-edge-tts`](https://www.npmjs.com/package/node-edge-tts) (WebSocket Edge Read Aloud API).
- Durations come from [`music-metadata`](https://www.npmjs.com/package/music-metadata) on each sentence MP3 before merge.
- The package entry also exports `normalizeVoiceForEdgeReadAloud` and VTT helpers (`generateVtt`, `splitTextForVtt`, `formatVttTime`) for advanced use; **`processNarrationFile`** already writes **`audio.vtt`**.
