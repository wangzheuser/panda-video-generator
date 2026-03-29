#!/usr/bin/env bash
# Pick a random .mp4 under VIDEO_DIR and make it 0.mp4 (the path the composition reads).
# If 0.mp4 already exists, move it to 0-YYYYMMDD-HHMMSS-<pid>.mp4 first.
# Any number of clips is fine; no consecutive 0..N requirement.
# Skips (exit 0) if no .mp4 files remain.

set -e
shopt -s nullglob

YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

VIDEO_DIR="${VIDEO_DIR:-public/video}"
mkdir -p "$VIDEO_DIR"

if [[ -f "$VIDEO_DIR/0.mp4" ]]; then
	stamp="$(date +%Y%m%d-%H%M%S)-$$"
	mv "$VIDEO_DIR/0.mp4" "$VIDEO_DIR/0-${stamp}.mp4"
fi

candidates=("$VIDEO_DIR"/*.mp4)
n=${#candidates[@]}
if [[ "$n" -eq 0 ]]; then
	printf '%b\n' "${YELLOW}⚠️  shuffle-bg-videos: no .mp4 in $VIDEO_DIR — skip${NC}"
	exit 0
fi

idx=$((RANDOM % n))
picked="${candidates[idx]}"
base="$(basename "$picked")"
mv "$picked" "$VIDEO_DIR/0.mp4"

printf '%b\n' "${BLUE}🎬 New 0.mp4 ← $base${NC}"
