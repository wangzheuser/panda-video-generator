# @panda-video-generator/spider

**Public contract:** one JSON object with **`title`** and **`content`** (strings only).

**Inputs (two modes):** local **`.md`** file, or **Zhihu question URL**.  
**Invocation:** `pnpm spider:extract` reads **only environment variables** (no CLI arguments).

## Required environment variables

| Variable | Values | Meaning |
|----------|--------|---------|
| `SPIDER_MODE` | `md` or `zhihu` (`markdown` accepted as alias for `md`) | Which input type to use |
| `SPIDER_SOURCE` | Path or URL | **`md`:** path to `.md` (relative to cwd ok). **`zhihu`:** full question URL |
| `SPIDER_OUTPUT_DIR` | Directory path | Target directory for the JSON file (created if missing; relative to cwd ok) |

## Optional environment variables

| Variable | Default | Meaning |
|----------|---------|---------|
| `SPIDER_OUTPUT_FILENAME` | `output.json` | Filename inside `SPIDER_OUTPUT_DIR` |

## Examples

```bash
# Markdown → ./out/article.json
SPIDER_MODE=md \
SPIDER_SOURCE=docs/post.md \
SPIDER_OUTPUT_DIR=./out \
SPIDER_OUTPUT_FILENAME=article.json \
pnpm spider:extract

# Zhihu → output/spider/result.json
SPIDER_MODE=zhihu \
SPIDER_SOURCE=https://www.zhihu.com/question/316150890 \
SPIDER_OUTPUT_DIR=output/spider \
pnpm spider:extract
```

JSON shape:

```json
{
  "title": "...",
  "content": "..."
}
```

## Other spider-related env (crawl / CI)

- `PUPPETEER_EXECUTABLE_PATH` — custom Chromium for zhihu mode
- `SPIDER_SAVE_DEBUG=1` — write debug HTML/PNG under `output/spider/` during crawl

## Monorepo note

**`pnpm spider:zhihu`** runs `zhihu/cli-zhihu-video-prep.ts` (crawl + caption + video paths). That is separate from **`spider:extract`** (env-only JSON).

## Layout

| Path | Role |
|------|------|
| `extract-json.ts` | Parse md / fetch zhihu → `{ title, content }` |
| `cli-extract-json.ts` | `pnpm spider:extract` (env-driven) |
| `generic-url-spider.ts` | `GenericPageSpider` (Puppeteer) |
| `zhihu/` | Zhihu wrapper + video-prep CLI |

## License

See the LICENSE file in the repository root.
