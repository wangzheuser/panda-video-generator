#!/bin/bash

# Render Video Script
# Converts text file to video (TTS + Render)
# Usage: ./render-video.sh
# Requires: output/tts/input.txt

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🎬 Text to Video Renderer${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if input file exists
if [ ! -f "output/tts/input.txt" ]; then
    echo -e "${RED}❌ Error: Input file not found at output/tts/input.txt${NC}"
    echo "Please create output/tts/input.txt with your text content first"
    exit 1
fi

# Step 1: Run TTS
echo -e "${YELLOW}🎙️  Step 1/3: Generating audio with TTS...${NC}"
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Error: python3 is not installed${NC}"
    exit 1
fi

# Setup virtual environment
VENV_DIR="tts/venv"
VENV_PYTHON="$VENV_DIR/bin/python"

echo -e "${BLUE}Setting up TTS virtual environment...${NC}"

# Create virtual environment if it doesn't exist
if [ ! -d "$VENV_DIR" ]; then
    echo -e "${YELLOW}Creating virtual environment at $VENV_DIR...${NC}"
    python3 -m venv "$VENV_DIR"
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to create virtual environment${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Virtual environment created${NC}"
fi

# Check if virtual environment Python exists
if [ ! -f "$VENV_PYTHON" ]; then
    echo -e "${RED}❌ Error: Virtual environment Python not found at $VENV_PYTHON${NC}"
    exit 1
fi

# Check if TTS dependencies are installed in venv
echo -e "${BLUE}Checking TTS dependencies in virtual environment...${NC}"
MISSING_DEPS=()

if ! "$VENV_PYTHON" -c "import edge_tts" 2>/dev/null; then
    MISSING_DEPS+=("edge-tts")
fi

if ! "$VENV_PYTHON" -c "import pydub" 2>/dev/null; then
    MISSING_DEPS+=("pydub")
fi

# Install missing dependencies
if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
    echo -e "${YELLOW}Installing missing dependencies: ${MISSING_DEPS[*]}...${NC}"
    "$VENV_PYTHON" -m pip install --quiet --upgrade pip
    "$VENV_PYTHON" -m pip install --quiet -r tts/requirements.txt
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install TTS dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ All TTS dependencies are installed${NC}"
fi

echo ""

# Run TTS using virtual environment Python
if ! "$VENV_PYTHON" tts/tts.py output/tts/input.txt output/tts; then
    echo -e "${RED}❌ Failed to generate audio${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Step 1 completed: Audio and VTT files generated${NC}"
echo ""

# Check if audio files were created
if [ ! -f "output/tts/audio.mp3" ] || [ ! -f "output/tts/audio.vtt" ]; then
    echo -e "${RED}❌ Error: Audio files not found${NC}"
    exit 1
fi

# Copy TTS files to public/tts/ for Remotion to access
echo -e "${BLUE}📋 Copying TTS files to public/tts/ for Remotion access...${NC}"
mkdir -p public/tts
# Remove existing files/symlinks first to avoid cp errors
rm -f public/tts/audio.mp3 public/tts/audio.vtt
cp output/tts/audio.mp3 public/tts/audio.mp3
cp output/tts/audio.vtt public/tts/audio.vtt
echo -e "${GREEN}✅ TTS files copied to public/tts/${NC}"
echo ""

# Step 2: Render Video
echo -e "${YELLOW}🎬 Step 2/3: Rendering video with Remotion...${NC}"
echo ""

# Use fixed output filename
OUTPUT_FILE="output/video/video.mp4"

# Ensure output directory exists
mkdir -p output/video

# Copy title.json to public/video/ if it exists, so Remotion can access it
# Always overwrite to ensure latest title is used
if [ -f "output/video/title.json" ]; then
    mkdir -p public/video
    # Remove old file first to avoid any caching issues
    rm -f "public/video/title.json"
    cp "output/video/title.json" "public/video/title.json"
    echo -e "${BLUE}📋 Title JSON copied to public/video/title.json${NC}"
    echo -e "${BLUE}   Title: $(node -e "const fs=require('fs'); const d=JSON.parse(fs.readFileSync('output/video/title.json','utf8')); console.log(d.title)")${NC}"
else
    echo -e "${YELLOW}⚠️  output/video/title.json not found, component will use default title${NC}"
fi

# Step 2: Render Video
echo -e "${YELLOW}🎬 Step 2/3: Rendering video with Remotion...${NC}"
echo ""

# Use fixed output filename
OUTPUT_FILE="output/video/video.mp4"

# Ensure output directory exists
mkdir -p output/video

# Read title from title.json if it exists and pass it as prop
# Use --props with file path to avoid shell parsing issues with special characters
PROPS_FILE=""
if [ -f "output/video/title.json" ]; then
    # Create a temporary props file with the title (in correct format for Remotion)
    PROPS_FILE="output/video/render-props.json"
    node -e "
        const fs = require('fs');
        try {
            const data = JSON.parse(fs.readFileSync('output/video/title.json', 'utf8'));
            if (data.title) {
                const props = JSON.stringify({ title: data.title }, null, 2);
                fs.writeFileSync('$PROPS_FILE', props, 'utf8');
            }
        } catch (e) {
            // Silently fail if JSON is invalid
        }
    "
    # Props file will be cleaned up after cover generation
fi

# Random BGM index (0-13) for Content composition, passed via env (public/bgm/0.mp3..13.mp3)
BGM_INDEX=$((RANDOM % 14))
export REMOTION_BGM_INDEX=$BGM_INDEX
# Random background video index (0-3) for Video composition, passed via env (public/video/0.mp4..3.mp4)
BG_VIDEO_INDEX=$((RANDOM % 4))
export REMOTION_BG_VIDEO_INDEX=$BG_VIDEO_INDEX
echo -e "${BLUE}🎵 BGM index: $BGM_INDEX (bgm/$BGM_INDEX.mp3) | 🎬 BG video: $BG_VIDEO_INDEX (video/$BG_VIDEO_INDEX.mp4)${NC}"

# Render video with H.264 codec (default audio is AAC for H.264)
# Format: MP4/H.264, audio AAC, CRF 23 for quality
RENDER_OPTS="--codec=h264 --crf=23"
if [ -n "$PROPS_FILE" ] && [ -f "$PROPS_FILE" ]; then
    echo -e "${BLUE}📝 Using title from output/video/title.json${NC}"
    echo -e "${BLUE}🎬 Rendering with H.264 codec, CRF 23...${NC}"
    # Use --props with file path to avoid shell parsing issues
    if ! pnpm exec remotion render Video "$OUTPUT_FILE" --props="$PROPS_FILE" $RENDER_OPTS; then
        echo -e "${RED}❌ Failed to render video${NC}"
        rm -f "$PROPS_FILE"
        exit 1
    fi
    # Don't delete PROPS_FILE yet - we'll need it for cover image generation
else
    echo -e "${BLUE}🎬 Rendering with H.264 codec, CRF 23...${NC}"
    if ! pnpm exec remotion render Video "$OUTPUT_FILE" $RENDER_OPTS; then
        echo -e "${RED}❌ Failed to render video${NC}"
        exit 1
    fi
fi

# Step 3: Generate cover image
echo ""
echo -e "${YELLOW}🖼️  Step 3/3: Generating cover image...${NC}"
echo ""

COVER_OUTPUT="output/video/cover.jpg"
COVER_PNG_OUTPUT="output/video/cover.png"

# Method 1: Use Remotion still command (recommended - renders Cover-Still component)
COVER_GENERATED=false
if [ -n "$PROPS_FILE" ] && [ -f "$PROPS_FILE" ]; then
    # Try with props file first
    if pnpm exec remotion still Cover-Still "$COVER_PNG_OUTPUT" --props="$PROPS_FILE" 2>/dev/null; then
        echo -e "${GREEN}✅ Cover image generated using Remotion Still: $COVER_PNG_OUTPUT${NC}"
        COVER_GENERATED=true
    fi
fi

# If props file method failed or doesn't exist, try without props
if [ "$COVER_GENERATED" = false ]; then
    if pnpm exec remotion still Cover-Still "$COVER_PNG_OUTPUT" 2>/dev/null; then
        echo -e "${GREEN}✅ Cover image generated using Remotion Still: $COVER_PNG_OUTPUT${NC}"
        COVER_GENERATED=true
    fi
fi

# Convert PNG to JPG if PNG was generated and ffmpeg is available
if [ "$COVER_GENERATED" = true ] && command -v ffmpeg &> /dev/null; then
    if ffmpeg -i "$COVER_PNG_OUTPUT" -frames:v 1 -update 1 -q:v 2 "$COVER_OUTPUT" -y -loglevel warning 2>&1; then
        echo -e "${GREEN}✅ Cover image also saved as JPG: $COVER_OUTPUT${NC}"
    fi
fi

# Method 2: Extract first frame from video using ffmpeg (fallback if Remotion still failed)
if [ "$COVER_GENERATED" = false ]; then
    echo -e "${YELLOW}⚠️  Remotion still command failed, trying ffmpeg extraction...${NC}"
    
    if command -v ffmpeg &> /dev/null; then
        if ffmpeg -i "$OUTPUT_FILE" -vf "select=eq(n\,0)" -vframes 1 "$COVER_OUTPUT" -y -loglevel warning 2>&1; then
            echo -e "${GREEN}✅ Cover image extracted from video first frame: $COVER_OUTPUT${NC}"
            COVER_GENERATED=true
        else
            echo -e "${YELLOW}⚠️  Failed to extract cover image from video${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  ffmpeg not found, skipping cover image extraction${NC}"
    fi
fi

# Clean up props file after cover generation
if [ -n "$PROPS_FILE" ] && [ -f "$PROPS_FILE" ]; then
    rm -f "$PROPS_FILE"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Video rendering completed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${BLUE}📁 Output files:${NC}"
echo "  - Video: $OUTPUT_FILE"
if [ -f "$COVER_OUTPUT" ]; then
    echo "  - Cover (JPG): $COVER_OUTPUT"
fi
if [ -f "$COVER_PNG_OUTPUT" ]; then
    echo "  - Cover (PNG): $COVER_PNG_OUTPUT"
fi
echo "  - Audio: output/tts/audio.mp3"
echo "  - Subtitles: output/tts/audio.vtt"
echo "  - Caption: output/tts/input.txt"
echo ""
