# Spider & Content Generation Tools

This directory contains content scraping and AI generation tools for automated video content creation.

## Available Tools

### 1. Zhihu Question Spider (spider-zhihu.ts)

Extract content from Zhihu question pages and generate video scripts.

**Usage:**

```bash
# Using pnpm command
pnpm spider:zhihu -- https://www.zhihu.com/question/316150890

# Or run script directly
sh scripts/spider-zhihu.sh https://www.zhihu.com/question/316150890

# Or use tsx
tsx spider/spider-zhihu.ts https://www.zhihu.com/question/316150890
```

**Features:**
- Scrape Zhihu question titles, content, and answers
- Generate video narration scripts using DeepSeek AI
- Automatically create TTS input files and title.json
- Output files saved to `output/tts/` and `output/video/`

### 2. Daily News Generator (news-generator.ts)

Generate daily important news summaries and video scripts using DeepSeek AI.

**Usage:**

```bash
# Generate today's news (recommended)
pnpm generate:news

# Or use direct command
pnpm news:generate

# Generate news for specific date
pnpm generate:news -- 2026-03-02
pnpm news:generate 2026-03-02

# Run script directly
sh scripts/generate-news.sh
sh scripts/generate-news.sh 2026-03-02

# Or use tsx
tsx spider/news-generator.ts
tsx spider/news-generator.ts 2026-03-02
```

**Features:**
- Automatically fetch current date (or use specified date)
- Generate 10 important news items using DeepSeek AI
- Each news item includes 80-120 character description
- Generate complete video narration script (1600-2000 characters)
- Automatically create dated video titles
- Output files:
  - `output/tts/input.txt` - Video script
  - `output/video/title.json` - Video title
  - `output/tts/news-metadata.json` - Metadata

**Output Example:**

Generated script format:
```
Hello everyone, today is Monday, March 2, 2026, bringing you today's top news.

1. China successfully launched a new-generation manned spacecraft test vehicle...

2. The UN Security Council held an emergency meeting on the Middle East situation...

...

That's all for today's news. Thank you for watching.
```

## Configuration Requirements

### Environment Variables

Create a `.env.local` file in the project root:

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### Install Dependencies

```bash
pnpm install
```

Key dependencies:
- `openai` - DeepSeek API client
- `puppeteer-extra` - Browser automation (Zhihu spider)
- `puppeteer-extra-plugin-stealth` - Anti-detection

## Workflow

### Complete Video Generation Flow

1. **Generate Content Script**
   ```bash
   # Choose one:
   pnpm generate:news              # News
   pnpm spider:zhihu -- <url>      # Zhihu
   ```

2. **Generate Video**
   ```bash
   pnpm render:video
   ```

3. **Upload to Platforms** (Optional)
   ```bash
   pnpm test:upload:bilibili
   pnpm test:upload:douyin
   # etc...
   ```

## Output File Structure

```
output/
├── tts/
│   ├── input.txt              # Video script (for TTS)
│   ├── audio.mp3              # Generated audio (TTS output)
│   ├── audio.vtt              # Subtitle file (TTS output)
│   └── news-metadata.json     # News metadata (news generator only)
├── video/
│   ├── title.json             # Video title
│   ├── video.mp4              # Final video (render output)
│   └── cover.jpg              # Video cover (render output)
└── spider/
    └── output-*.json          # Raw scraped data (Zhihu spider)
```

## Core Files

- `spider.ts` - ZhihuSpider class definition
- `spider-zhihu.ts` - Zhihu spider main program
- `news-generator.ts` - Daily news generator main program
- `caption-generator.ts` - DeepSeek video script generator (used by Zhihu)

## Tech Stack

- **Node.js/TypeScript** - Runtime and language
- **Puppeteer** - Web scraping
- **DeepSeek API** - AI content generation
- **Remotion** - Video rendering engine

## Notes

1. **API Key Security**: Do not commit `.env.local` to version control
2. **Scraping Etiquette**: Zhihu spider includes random delays to simulate human behavior
3. **Content Review**: Generated content may require manual review
4. **Date Format**: News generator uses YYYY-MM-DD format (e.g., 2026-03-02)
5. **Network Requirements**: Stable internet connection required for DeepSeek API

## Troubleshooting

### DeepSeek API Error

```bash
❌ Error: DEEPSEEK_API_KEY is not set
```

**Solution**: Set `DEEPSEEK_API_KEY` in `.env.local`

### Zhihu Spider Failure

```bash
❌ Error: Failed to extract content
```

**Possible Causes**:
- Network connection issues
- Zhihu page structure changes
- Anti-scraping detection

**Solutions**: 
- Check debug files: `output/spider/debug-*.png` and `debug-*.html`
- Increase delay times
- Update selectors

## Development & Extension

### Adding New Content Sources

Follow the implementation patterns in `spider-zhihu.ts` and `news-generator.ts`:

1. Create new spider/generator file
2. Use DeepSeek API to generate scripts
3. Output to standard path (`output/tts/input.txt`)
4. Add commands to `package.json`

### Customizing Prompts

Edit the `userPrompt` variable in the respective files to adjust AI-generated content style.

## License

See LICENSE file in project root.
