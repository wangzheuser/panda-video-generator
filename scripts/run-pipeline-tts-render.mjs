/**
 * TTS (with sync) → render video + cover.
 */
import path from "node:path";
import { projectRoot } from "./lib/project-root.mjs";
import { run } from "./lib/run-cmd.mjs";

const BLUE = "\x1b[0;34m";
const NC = "\x1b[0m";

console.log(`${BLUE}━━ Pipeline: TTS → Remotion ━━${NC}`);

if (run("node", [path.join(projectRoot, "scripts", "run-tts.mjs")]) !== 0) {
  process.exit(1);
}
if (run("node", [path.join(projectRoot, "scripts", "run-render-video.mjs")]) !== 0) {
  process.exit(1);
}
