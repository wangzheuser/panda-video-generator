# @panda-video-generator/spider

**Public contract (lightweight extract):** one JSON object with **`title`** and **`content`** (strings only). **Zhihu full pipeline** writes **`output.json`** with **`answers[]`** as well (see below).

**Lightweight extract (env-only, no CLI args on the Node entrypoints):**

| Script | Input |
|--------|-------|
| `pnpm spider:extract:file` | Local **UTF-8 text file** (`SPIDER_SOURCE`) |
| `pnpm spider:extract:url` | Any **http(s)** page (`SPIDER_SOURCE` = URL) |

**Important:** root `package.json` runs these with **`cross-env SPIDER_OUTPUT_DIR=output/spider`**, so **`pnpm spider:extract:file|url` always writes under `output/spider`** regardless of any `SPIDER_OUTPUT_DIR` you set on the shell before `pnpm`. To use a **custom output directory**, call the CLI with **`pnpm exec tsx`** (see examples).

**Local file title rule:** if the first non-empty line is `# Heading` (Markdown-style ATX), that line is the title and the rest is `content`; otherwise `title` is the **filename without extension** and `content` is the **entire file**.

**Zhihu full pipeline** (crawl + caption + paths under `SPIDER_OUTPUT_DIR`): **`pnpm spider:zhihu -- <url>`** — URL must be **`https://www.zhihu.com/question/...`**. Separate from the lightweight extract commands.

## Environment variables (lightweight extract)

| Variable | Required | Meaning |
|----------|----------|---------|
| `SPIDER_SOURCE` | Yes | **`extract:file`:** path to UTF-8 text file. **`extract:url`:** full page URL (`http://` / `https://`) |
| `SPIDER_OUTPUT_DIR` | Yes for **`pnpm exec tsx …` only** | Target directory for the JSON (created if missing; relative to **cwd**). Ignored when using `pnpm spider:extract:*` (fixed to `output/spider` by the script). |
| `SPIDER_OUTPUT_FILENAME` | No | Default `output.json` |

## Examples

```bash
# Lightweight file → output/spider/article.json (default output dir from pnpm script)
SPIDER_SOURCE=docs/notes.txt \
SPIDER_OUTPUT_FILENAME=article.json \
pnpm spider:extract:file

# Lightweight URL → output/spider/page.json
SPIDER_SOURCE=https://example.com/blog/post \
SPIDER_OUTPUT_FILENAME=page.json \
pnpm spider:extract:url

# Custom output directory (bypass pnpm script — SPIDER_OUTPUT_DIR respected)
SPIDER_SOURCE=docs/notes.txt \
SPIDER_OUTPUT_DIR=./out \
SPIDER_OUTPUT_FILENAME=article.json \
pnpm exec tsx packages/spider/cli-extract-text-file-json.ts

SPIDER_SOURCE=https://example.com/blog/post \
SPIDER_OUTPUT_DIR=./out \
SPIDER_OUTPUT_FILENAME=page.json \
pnpm exec tsx packages/spider/cli-extract-page-url-json.ts
```

JSON shape (lightweight extract):

```json
{
  "title": "...",
  "content": "..."
}
```

(Multiple answers on a page are **flattened** into `content` for this shape.)

## Other spider-related env (crawl / CI)

- `PUPPETEER_EXECUTABLE_PATH` — custom Chromium for browser-backed extract (`extract:url`, Zhihu).
- `SPIDER_SAVE_DEBUG=1` — write debug HTML/PNG under the spider output directory during crawl.

## Layout

| Path | Role |
|------|------|
| `extract-json.ts` | `parseTextFileToSpiderJson` / `extractPageUrlToSpiderJson` → `{ title, content }` |
| `cli-extract-text-file-json.ts` | `pnpm spider:extract:file` (or run via `tsx` with custom `SPIDER_OUTPUT_DIR`) |
| `cli-extract-page-url-json.ts` | `pnpm spider:extract:url` (same) |
| `generic-url-spider.ts` | `GenericPageSpider` (Puppeteer) |
| `zhihu/` | Zhihu wrapper + `pnpm spider:zhihu` video-prep CLI |
| `paths.ts` | Package export: `getSpiderOutputDir`, `getSpiderOutputJsonPath`, etc. |

## License

See the LICENSE file in the repository root.
