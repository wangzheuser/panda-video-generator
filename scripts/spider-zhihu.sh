#!/bin/bash

# Zhihu Spider Script
# Extracts content from Zhihu question and generates video script
# Usage: ./spider-zhihu.sh <zhihu_url>
# Example: ./spider-zhihu.sh https://www.zhihu.com/question/316150890

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if URL is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Please provide a Zhihu question URL${NC}"
    echo "Usage: ./spider-zhihu.sh <zhihu_url>"
    echo "Example: ./spider-zhihu.sh https://www.zhihu.com/question/316150890"
    exit 1
fi

# Skip leading -- if present (often passed by pnpm/npm)
if [ "$1" == "--" ]; then
    shift
fi

ZHIHU_URL="$1"

# Validate URL
if [[ ! "$ZHIHU_URL" =~ ^https://www\.zhihu\.com/question/ ]]; then
    echo -e "${RED}❌ Error: Invalid Zhihu URL format${NC}"
    echo "Expected format: https://www.zhihu.com/question/<question_id>"
    exit 1
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🕷️  Zhihu Content Spider${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 1: Run Spider
echo -e "${YELLOW}📝 Extracting content from Zhihu...${NC}"
echo "URL: $ZHIHU_URL"
echo ""

if ! pnpm spider "$ZHIHU_URL"; then
    echo -e "${RED}❌ Failed to extract content from Zhihu${NC}"
    exit 1
fi

echo ""

# Check if spider extracted content successfully
if [ ! -f "input/input.txt" ]; then
    echo -e "${RED}❌ Error: Caption file not found at input/input.txt${NC}"
    echo -e "${YELLOW}This usually means:${NC}"
    echo "  1. Spider failed to extract content from Zhihu"
    echo "  2. The page may require login or has anti-bot protection"
    echo "  3. The URL may be invalid or the page structure changed"
    echo ""
    echo -e "${BLUE}Checking spider output files...${NC}"
    ls -la spider/output-*.json 2>/dev/null | tail -1 || echo "No spider output files found"
    exit 1
fi

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Content extraction completed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Find the latest spider output JSON file
LATEST_JSON=$(ls -t spider/output-*.json 2>/dev/null | head -1)

if [ -n "$LATEST_JSON" ]; then
    # Extract title from JSON file
    if command -v jq &> /dev/null; then
        TITLE=$(jq -r '.title' "$LATEST_JSON" 2>/dev/null)
    elif command -v python3 &> /dev/null; then
        TITLE=$(python3 -c "import json; print(json.load(open('$LATEST_JSON'))['title'])" 2>/dev/null)
    else
        # Fallback: use grep and sed (less reliable but works)
        TITLE=$(grep -o '"title"[[:space:]]*:[[:space:]]*"[^"]*"' "$LATEST_JSON" | sed 's/.*"title"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' | head -1)
    fi
    
    if [ -n "$TITLE" ]; then
        # Export title JSON file
        TITLE_JSON="out/title.json"
        mkdir -p out
        
        # Create JSON file with title
        if command -v jq &> /dev/null; then
            echo "{\"title\": \"$TITLE\"}" | jq '.' > "$TITLE_JSON"
        else
            # Use python to create properly formatted JSON
            python3 -c "import json; json.dump({'title': '$TITLE'}, open('$TITLE_JSON', 'w'), ensure_ascii=False, indent=2)" 2>/dev/null || \
            echo "{\"title\": \"$TITLE\"}" > "$TITLE_JSON"
        fi
        
        echo -e "${BLUE}📄 Title JSON exported: $TITLE_JSON${NC}"
        echo "   Title: $TITLE"
        echo ""
    fi
fi

echo -e "${BLUE}📁 Output files:${NC}"
echo "  - Caption: input/input.txt"
if [ -n "$LATEST_JSON" ]; then
    echo "  - Raw data: $LATEST_JSON"
fi
if [ -n "$TITLE_JSON" ] && [ -f "$TITLE_JSON" ]; then
    echo "  - Title JSON: $TITLE_JSON"
fi
echo ""
echo -e "${GREEN}💡 Next step: Run 'pnpm render' to generate video from the extracted content${NC}"
echo ""
