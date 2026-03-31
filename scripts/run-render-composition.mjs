/**
 * Remotion render for one composition (no sync — run sync/tts separately if needed).
 *
 * Usage:
 *   node scripts/run-render-composition.mjs [compositionId]
 *   pnpm run render:composition -- Video-Vertical
 *   (pnpm forwards a literal "--" in argv; we skip it.)
 *
 * Keep ALLOWED in sync with src/lib/remotion-compositions.ts + src/remotion/Root.tsx.
 */
import fs from "node:fs";
import path from "node:path";
import { projectRoot } from "./lib/project-root.mjs";
import { run } from "./lib/run-cmd.mjs";
import { writeRenderPropsFromTitle } from "./lib/render-props.mjs";

const BLUE = "\x1b[0;34m";
const GREEN = "\x1b[0;32m";
const YELLOW = "\x1b[1;33m";
const RED = "\x1b[0;31m";
const NC = "\x1b[0m";

const ALLOWED = new Set([
  "Intro",
  "Video",
  "Content",
  "Intro-Vertical",
  "Video-Vertical",
  "Content-Vertical",
  "Cover",
]);

function resolvePath(relOrAbs) {
  if (path.isAbsolute(relOrAbs)) return relOrAbs;
  return path.join(projectRoot, relOrAbs);
}

/** pnpm/npm `run script -- args` often passes `--` as its own argv element */
function firstCompositionArg() {
  const rest = process.argv.slice(2).filter((a) => a !== "--");
  return rest[0]?.trim() ?? "";
}

const rawArg = firstCompositionArg();
const compositionId = rawArg || "Video";
if (!ALLOWED.has(compositionId)) {
  console.log(
    `${RED}❌ Unknown composition: ${rawArg || "(empty)"}${NC}\n` +
      `${YELLOW}Allowed: ${[...ALLOWED].sort().join(", ")}${NC}`,
  );
  process.exit(1);
}

const VIDEO_PUBLIC_DIR = resolvePath(
  process.env.VIDEO_PUBLIC_DIR ?? "public/video",
);
const TITLE_PUBLIC = path.join(VIDEO_PUBLIC_DIR, "title.json");
const outName = compositionId === "Video" ? "video" : compositionId.replace(/[^a-zA-Z0-9-]/g, "-");
const OUTPUT_FILE = path.join(projectRoot, "output", "video", `${outName}.mp4`);
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
  compositionId,
  OUTPUT_FILE,
  "--codec=h264",
  "--crf=23",
];
const renderArgs =
  propsFile && fs.existsSync(propsFile)
    ? [...renderBase, `--props=${propsFile}`]
    : renderBase;

console.log(`${BLUE}🎬 Remotion · ${compositionId} → ${OUTPUT_FILE}${NC}`);
if (run("pnpm", renderArgs) !== 0) {
  if (propsFile && fs.existsSync(propsFile)) fs.rmSync(propsFile, { force: true });
  process.exit(1);
}

if (propsFile && fs.existsSync(propsFile)) {
  fs.rmSync(propsFile, { force: true });
}

console.log(`${GREEN}✅ Done: ${OUTPUT_FILE}${NC}`);
