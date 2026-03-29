/**
 * Zhihu URL → spider → TTS → render.
 */
import fs from "node:fs";
import path from "node:path";
import { projectRoot } from "./lib/project-root.mjs";
import { run } from "./lib/run-cmd.mjs";

const BLUE = "\x1b[0;34m";
const GREEN = "\x1b[0;32m";
const RED = "\x1b[0;31m";
const YELLOW = "\x1b[1;33m";
const NC = "\x1b[0m";

const argv = process.argv.slice(2).filter((a) => a !== "--");
const zhiHuUrl = argv[0];

if (!zhiHuUrl) {
  console.log(`${RED}❌ Error: Please provide a Zhihu question URL${NC}`);
  console.log("Usage: pnpm pipeline:zhihu-video -- <zhihu_url>");
  process.exit(1);
}

const urlOk = /^https:\/\/www\.zhihu\.com\/question\//.test(zhiHuUrl);
if (!urlOk) {
  console.log(`${RED}❌ Error: Invalid Zhihu URL format${NC}`);
  console.log("Expected format: https://www.zhihu.com/question/<question_id>");
  process.exit(1);
}

console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}`);
console.log(`${BLUE}🎬 Pipeline: Zhihu → video${NC}`);
console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}`);
console.log("");

console.log(`${YELLOW}📝 Step 1/2: Extracting content from Zhihu...${NC}`);
console.log(`URL: ${zhiHuUrl}`);
console.log("");

if (run("node", [path.join(projectRoot, "scripts", "run-spider-zhihu.mjs"), zhiHuUrl]) !== 0) {
  console.log(`${RED}❌ Failed to extract content from Zhihu${NC}`);
  process.exit(1);
}

console.log("");
console.log(`${GREEN}✅ Step 1 completed: Content extracted and caption generated${NC}`);
console.log("");

console.log(`${YELLOW}🎬 Step 2/2: TTS + Remotion render...${NC}`);
console.log("");

if (run("node", [path.join(projectRoot, "scripts", "run-pipeline-tts-render.mjs")]) !== 0) {
  console.log(`${RED}❌ Failed to render video${NC}`);
  process.exit(1);
}

console.log("");
console.log(`${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}`);
console.log(`${GREEN}✅ All steps completed successfully!${NC}`);
console.log(`${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}`);
console.log("");

const TTS_OUTPUT_DIR = process.env.TTS_OUTPUT_DIR ?? "output/tts";
const TTS_INPUT_FILE =
  process.env.TTS_INPUT_FILE ?? path.join(TTS_OUTPUT_DIR, "input.txt");
const SPIDER_OUTPUT_DIR =
  process.env.SPIDER_OUTPUT_DIR ?? "output/spider";
const TITLE_JSON = path.join(SPIDER_OUTPUT_DIR, "title.json");

console.log(`${BLUE}📁 Final output files:${NC}`);
console.log("  - Video: output/video/video.mp4");
console.log(`  - Audio: ${path.join(TTS_OUTPUT_DIR, "audio.mp3")}`);
console.log(`  - Subtitles: ${path.join(TTS_OUTPUT_DIR, "audio.vtt")}`);
console.log(`  - Caption: ${TTS_INPUT_FILE}`);
if (fs.existsSync(TITLE_JSON)) {
  console.log(`  - Title JSON: ${TITLE_JSON}`);
}
console.log("");
