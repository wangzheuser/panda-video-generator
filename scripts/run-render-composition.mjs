/**
 * Remotion `Video` only — no sync, no cover.
 */
import fs from "node:fs";
import path from "node:path";
import { projectRoot } from "./lib/project-root.mjs";
import { run } from "./lib/run-cmd.mjs";
import { writeRenderPropsFromTitle } from "./lib/render-props.mjs";

const BLUE = "\x1b[0;34m";
const GREEN = "\x1b[0;32m";
const YELLOW = "\x1b[1;33m";
const NC = "\x1b[0m";

function resolvePath(relOrAbs) {
  if (path.isAbsolute(relOrAbs)) return relOrAbs;
  return path.join(projectRoot, relOrAbs);
}

const VIDEO_PUBLIC_DIR = resolvePath(
  process.env.VIDEO_PUBLIC_DIR ?? "public/video",
);
const TITLE_PUBLIC = path.join(VIDEO_PUBLIC_DIR, "title.json");
const OUTPUT_FILE = path.join(projectRoot, "output", "video", "video.mp4");
const PROPS_PATH = path.join(projectRoot, "output", "video", "render-props.json");

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });

let propsFile = "";
if (fs.existsSync(TITLE_PUBLIC)) {
  if (writeRenderPropsFromTitle(TITLE_PUBLIC, PROPS_PATH)) {
    propsFile = PROPS_PATH;
  }
} else {
  console.log(`${YELLOW}⚠️  No ${TITLE_PUBLIC} — using default title${NC}`);
}

const renderBase = [
  "exec",
  "remotion",
  "render",
  "Video",
  OUTPUT_FILE,
  "--codec=h264",
  "--crf=23",
];
const renderArgs =
  propsFile && fs.existsSync(propsFile)
    ? [...renderBase, `--props=${propsFile}`]
    : renderBase;

console.log(`${BLUE}🎬 Remotion only → ${OUTPUT_FILE}${NC}`);
if (run("pnpm", renderArgs) !== 0) {
  if (propsFile && fs.existsSync(propsFile)) fs.rmSync(propsFile, { force: true });
  process.exit(1);
}

if (propsFile && fs.existsSync(propsFile)) {
  fs.rmSync(propsFile, { force: true });
}

console.log(`${GREEN}✅ Done: ${OUTPUT_FILE}${NC}`);
