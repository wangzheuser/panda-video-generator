#!/bin/bash

# Copy pipeline artifacts from output/ dirs into public/ so Remotion `staticFile(...)`
# matches paths in types/paths.ts (REMOTION_PATHS).
#
# Synced mapping:
#   $TTS_OUTPUT_DIR/audio.{mp3,vtt}     → $TTS_PUBLIC_DIR/
#   $SPIDER_OUTPUT_DIR/captions.vtt   → $SPIDER_PUBLIC_DIR/
#   title: spider first, else legacy  → $VIDEO_PUBLIC_DIR/title.json
#
# Env (defaults match repo layout):
#   TTS_OUTPUT_DIR, TTS_PUBLIC_DIR
#   SPIDER_OUTPUT_DIR, SPIDER_PUBLIC_DIR
#   TITLE_LEGACY (fallback title source)
#   VIDEO_PUBLIC_DIR
#
# Flags:
#   --require-tts  Exit 1 if TTS mp3/vtt missing under TTS_OUTPUT_DIR (for render).
#
# Usage (repo root): ./scripts/sync-outputs-to-public.sh [--require-tts]

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

REQUIRE_TTS=0
for arg in "$@"; do
  case "$arg" in
    --require-tts) REQUIRE_TTS=1 ;;
  esac
done

TTS_OUTPUT_DIR="${TTS_OUTPUT_DIR:-output/tts}"
TTS_PUBLIC_DIR="${TTS_PUBLIC_DIR:-public/tts}"
SPIDER_OUTPUT_DIR="${SPIDER_OUTPUT_DIR:-output/spider}"
SPIDER_PUBLIC_DIR="${SPIDER_PUBLIC_DIR:-public/spider}"
TITLE_LEGACY="${TITLE_LEGACY:-output/video/title.json}"
VIDEO_PUBLIC_DIR="${VIDEO_PUBLIC_DIR:-public/video}"

MP3_SRC="$TTS_OUTPUT_DIR/audio.mp3"
VTT_SRC="$TTS_OUTPUT_DIR/audio.vtt"
CAPTIONS_SRC="$SPIDER_OUTPUT_DIR/captions.vtt"
TITLE_SPIDER="$SPIDER_OUTPUT_DIR/title.json"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 Sync outputs → public (Remotion)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ "$REQUIRE_TTS" -eq 1 ]; then
  if [ ! -f "$MP3_SRC" ] || [ ! -f "$VTT_SRC" ]; then
    echo -e "${RED}❌ Missing TTS artifacts: $MP3_SRC and/or $VTT_SRC — run: pnpm tts${NC}"
    exit 1
  fi
fi

if [ -f "$MP3_SRC" ] && [ -f "$VTT_SRC" ]; then
  mkdir -p "$TTS_PUBLIC_DIR"
  rm -f "$TTS_PUBLIC_DIR/audio.mp3" "$TTS_PUBLIC_DIR/audio.vtt"
  cp "$MP3_SRC" "$TTS_PUBLIC_DIR/audio.mp3"
  cp "$VTT_SRC" "$TTS_PUBLIC_DIR/audio.vtt"
  echo -e "${GREEN}✅ TTS → $TTS_PUBLIC_DIR/{audio.mp3,audio.vtt}${NC}"
else
  echo -e "${YELLOW}⚠️  Skipped TTS (missing $MP3_SRC or $VTT_SRC)${NC}"
fi

if [ -f "$CAPTIONS_SRC" ]; then
  mkdir -p "$SPIDER_PUBLIC_DIR"
  rm -f "$SPIDER_PUBLIC_DIR/captions.vtt"
  cp "$CAPTIONS_SRC" "$SPIDER_PUBLIC_DIR/captions.vtt"
  echo -e "${GREEN}✅ Captions → $SPIDER_PUBLIC_DIR/captions.vtt${NC}"
else
  echo -e "${YELLOW}⚠️  Skipped captions (no $CAPTIONS_SRC)${NC}"
fi

TITLE_FILE=""
if [ -f "$TITLE_SPIDER" ]; then
  TITLE_FILE="$TITLE_SPIDER"
elif [ -f "$TITLE_LEGACY" ]; then
  TITLE_FILE="$TITLE_LEGACY"
  echo -e "${YELLOW}⚠️  Title from legacy $TITLE_LEGACY — prefer $TITLE_SPIDER${NC}"
fi

if [ -n "$TITLE_FILE" ]; then
  mkdir -p "$VIDEO_PUBLIC_DIR"
  rm -f "$VIDEO_PUBLIC_DIR/title.json"
  cp "$TITLE_FILE" "$VIDEO_PUBLIC_DIR/title.json"
  echo -e "${GREEN}✅ Title → $VIDEO_PUBLIC_DIR/title.json${NC}"
  echo -e "${BLUE}   Title: $(TitleSrc="$TITLE_FILE" node -e "const fs=require('fs'); const d=JSON.parse(fs.readFileSync(process.env.TitleSrc,'utf8')); console.log(d.title)")${NC}"
else
  echo -e "${YELLOW}⚠️  Skipped title (no $TITLE_SPIDER or $TITLE_LEGACY)${NC}"
fi

echo ""
echo -e "${GREEN}✅ Sync done${NC}"
