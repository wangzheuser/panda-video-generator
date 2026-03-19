#!/usr/bin/env bash
# Full pipeline: Zhihu URL -> Spider + DeepSeek -> weixin-mp-article.json -> Playwright (公众号填表/发布)
# Usage: pnpm weixin-mp:from-zhihu -- <zhihu_url>
# Example: pnpm weixin-mp:from-zhihu -- https://www.zhihu.com/question/2017898437954281589

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

# Parse URL (skip leading -- from pnpm)
URL="$1"
if [[ "$URL" == "--" ]]; then
  shift
  URL="$1"
fi

if [[ -z "$URL" ]]; then
  echo "Usage: pnpm weixin-mp:from-zhihu -- <zhihu_url>"
  echo "Example: pnpm weixin-mp:from-zhihu -- https://www.zhihu.com/question/2017898437954281589"
  exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Spider + DeepSeek (Zhihu -> 公众号文稿)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pnpm exec tsx spider/zhihu-to-weixin-mp-article.ts "$URL"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Playwright (填表 + 封面 + 草稿)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pnpm exec playwright test automations/WeixinMp/write-article-weixin-mp.spec.ts --project=chromium --headed

echo ""
echo "Done."
