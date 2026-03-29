#!/usr/bin/env bash
# Pick a random .mp3 under BGM_DIR and make it 0.mp3 (the path the composition reads).
# If 0.mp3 already exists, move it to 0-YYYYMMDD-HHMMSS-<pid>.mp3 first.
# Any number of tracks is fine; gaps in numeric names are OK.
# Skips (exit 0) if no .mp3 files remain.

set -e
shopt -s nullglob

YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

BGM_DIR="${BGM_DIR:-public/bgm}"
mkdir -p "$BGM_DIR"

if [[ -f "$BGM_DIR/0.mp3" ]]; then
	stamp="$(date +%Y%m%d-%H%M%S)-$$"
	mv "$BGM_DIR/0.mp3" "$BGM_DIR/0-${stamp}.mp3"
fi

candidates=("$BGM_DIR"/*.mp3)
n=${#candidates[@]}
if [[ "$n" -eq 0 ]]; then
	printf '%b\n' "${YELLOW}⚠️  shuffle-bgm: no .mp3 in $BGM_DIR — skip${NC}"
	exit 0
fi

idx=$((RANDOM % n))
picked="${candidates[idx]}"
base="$(basename "$picked")"
mv "$picked" "$BGM_DIR/0.mp3"

printf '%b\n' "${BLUE}🎵 New 0.mp3 ← $base${NC}"
