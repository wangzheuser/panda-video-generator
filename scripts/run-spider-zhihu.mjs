/**
 * Zhihu spider CLI (tsx).
 */
import path from "node:path";
import { projectRoot } from "./lib/project-root.mjs";
import { run } from "./lib/run-cmd.mjs";

const BLUE = "\x1b[0;34m";
const RED = "\x1b[0;31m";
const NC = "\x1b[0m";

const argv = process.argv.slice(2).filter((a) => a !== "--");
const url = argv[0];

if (!url) {
  console.log(`${RED}❌ Error: Please provide a Zhihu question URL${NC}`);
  console.log("Usage: pnpm spider:zhihu -- <url>");
  process.exit(1);
}

console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}`);
console.log(`${BLUE}🕷️  Zhihu Content Spider${NC}`);
console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}`);
console.log("");

const cliPath = path.join("packages", "spider", "zhihu", "cli-zhihu-video-prep.ts");
if (run("pnpm", ["exec", "tsx", cliPath, url]) !== 0) {
  console.log(`${RED}❌ Failed to extract content from Zhihu${NC}`);
  process.exit(1);
}

console.log("");
