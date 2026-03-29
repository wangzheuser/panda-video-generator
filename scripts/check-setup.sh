#!/usr/bin/env bash
# Run from repo root: pnpm check:setup
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== Panda Video Generator — environment check ==="
echo ""

fail=0

if command -v node >/dev/null 2>&1; then
  echo "[OK] node $(node -v) (need >=20.9, see package.json engines)"
else
  echo "[!!] node not found — install Node.js 20 LTS: https://nodejs.org/"
  fail=1
fi

if command -v pnpm >/dev/null 2>&1; then
  echo "[OK] pnpm $(pnpm -v)"
else
  echo "[!!] pnpm not found — try: corepack enable && corepack prepare pnpm@latest --activate"
  fail=1
fi

if command -v ffmpeg >/dev/null 2>&1; then
  echo "[OK] ffmpeg $(ffmpeg -version 2>/dev/null | head -1)"
else
  echo "[--] ffmpeg not on PATH — needed for pnpm tts / cover steps; e.g. brew install ffmpeg (macOS)"
fi

if [ -f "package.json" ] && [ -d "node_modules" ]; then
  echo "[OK] node_modules exists (run pnpm install if you just cloned)"
else
  echo "[--] run pnpm install in repo root"
fi

echo ""
echo "Playwright: Chromium is fetched when you run pnpm install (needs network)."
echo "If login/upload fails: pnpm exec playwright install --with-deps chromium"
echo ""

exit "$fail"
