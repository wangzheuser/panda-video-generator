#!/bin/bash

# TTS: narration text → audio.mp3 + audio.vtt (Edge-TTS via Node).
# After generation, runs scripts/sync-outputs-to-public.sh (TTS + captions + title → public).
# Paths via env:
#   TTS_INPUT_FILE    — default: $SPIDER_OUTPUT_DIR/input.txt (narration; same tree as output.json)
#   SPIDER_OUTPUT_DIR — default: output/spider
#   TTS_OUTPUT_DIR    — default: output/tts (audio.mp3 / audio.vtt)
#   TTS_PUBLIC_DIR    — default: public/tts
# Optional: EDGE_TTS_VOICE

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

SPIDER_OUTPUT_DIR="${SPIDER_OUTPUT_DIR:-output/spider}"
TTS_OUTPUT_DIR="${TTS_OUTPUT_DIR:-output/tts}"
TTS_PUBLIC_DIR="${TTS_PUBLIC_DIR:-public/tts}"
if [ -z "${TTS_INPUT_FILE:-}" ]; then
  TTS_INPUT_FILE="$SPIDER_OUTPUT_DIR/input.txt"
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🎙️  TTS (Edge-TTS, Node)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Input: ${TTS_INPUT_FILE}${NC}"
echo -e "${BLUE}Output dir: ${TTS_OUTPUT_DIR}${NC}"
echo -e "${BLUE}After: sync-outputs-to-public → public/${NC}"
echo ""

if [ ! -f "$TTS_INPUT_FILE" ]; then
    echo -e "${RED}❌ Error: Input file not found: $TTS_INPUT_FILE${NC}"
    exit 1
fi

if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}❌ Error: ffmpeg is required (merge / atempo).${NC}"
    exit 1
fi

if ! pnpm exec tsx packages/tts-node/src/cli.ts "$TTS_INPUT_FILE" "$TTS_OUTPUT_DIR"; then
    echo -e "${RED}❌ Failed to generate audio${NC}"
    exit 1
fi

MP3_OUT="$TTS_OUTPUT_DIR/audio.mp3"
VTT_OUT="$TTS_OUTPUT_DIR/audio.vtt"
if [ ! -f "$MP3_OUT" ] || [ ! -f "$VTT_OUT" ]; then
    echo -e "${RED}❌ Error: Audio files not found in $TTS_OUTPUT_DIR${NC}"
    exit 1
fi

bash "$SCRIPT_DIR/sync-outputs-to-public.sh"

echo ""
echo -e "${GREEN}✅ TTS done: $MP3_OUT, $VTT_OUT (synced under public/)${NC}"
