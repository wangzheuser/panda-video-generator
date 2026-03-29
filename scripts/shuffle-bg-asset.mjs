/**
 * Cross-platform (Windows / macOS / Linux): pick a random media file in a dir and rename to 0.<ext>.
 * If 0.<ext> exists, rename it to 0-YYYYMMDD-HHMMSS-<pid>.<ext> first.
 *
 * Usage: node scripts/shuffle-bg-asset.mjs <video|bgm>
 * Env: VIDEO_DIR, BGM_DIR — optional; default public/video and public/bgm (relative to repo root).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");

const BLUE = "\x1b[0;34m";
const YELLOW = "\x1b[1;33m";
const NC = "\x1b[0m";

function timestamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-` +
    `${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}-` +
    `${process.pid}`
  );
}

function resolveDir(envKey, defaultRel) {
  const raw = process.env[envKey] ?? defaultRel;
  return path.isAbsolute(raw)
    ? path.normalize(raw)
    : path.join(projectRoot, raw);
}

function listFilesWithExt(dir, ext) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    if (/** @type {NodeJS.ErrnoException} */ (e).code === "ENOENT") return [];
    throw e;
  }
  const suffix = `.${ext.toLowerCase()}`;
  return entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(suffix))
    .map((e) => path.join(dir, e.name));
}

function main() {
  const kind = process.argv[2];
  if (kind !== "video" && kind !== "bgm") {
    console.error("Usage: node scripts/shuffle-bg-asset.mjs <video|bgm>");
    process.exit(1);
  }

  const isVideo = kind === "video";
  const dir = isVideo
    ? resolveDir("VIDEO_DIR", "public/video")
    : resolveDir("BGM_DIR", "public/bgm");
  const ext = isVideo ? "mp4" : "mp3";
  const emoji = isVideo ? "🎬" : "🎵";
  const label = isVideo ? "shuffle-bg-videos" : "shuffle-bgm";

  fs.mkdirSync(dir, { recursive: true });

  const zeroPath = path.join(dir, `0.${ext}`);
  if (fs.existsSync(zeroPath)) {
    fs.renameSync(zeroPath, path.join(dir, `0-${timestamp()}.${ext}`));
  }

  const candidates = listFilesWithExt(dir, ext);
  if (candidates.length === 0) {
    console.log(`${YELLOW}⚠️  ${label}: no .${ext} in ${dir} — skip${NC}`);
    return;
  }

  const idx = Math.floor(Math.random() * candidates.length);
  const picked = candidates[idx];
  const base = path.basename(picked);
  fs.renameSync(picked, zeroPath);

  console.log(`${BLUE}${emoji} New 0.${ext} ← ${base}${NC}`);
}

main();
