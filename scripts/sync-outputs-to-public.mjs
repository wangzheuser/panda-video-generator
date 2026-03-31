/**
 * Copy pipeline artifacts from output/* → public/* (see former sync-outputs-to-public.sh).
 * Flags: --require-tts
 */
import fs from "node:fs";
import path from "node:path";
import { projectRoot } from "./lib/project-root.mjs";

const BLUE = "\x1b[0;34m";
const GREEN = "\x1b[0;32m";
const YELLOW = "\x1b[1;33m";
const RED = "\x1b[0;31m";
const NC = "\x1b[0m";

function resolvePath(relOrAbs) {
  if (path.isAbsolute(relOrAbs)) return relOrAbs;
  return path.join(projectRoot, relOrAbs);
}

const requireTts = process.argv.includes("--require-tts");

const TTS_OUTPUT_DIR = resolvePath(
  process.env.TTS_OUTPUT_DIR ?? "output/tts",
);
const TTS_PUBLIC_DIR = resolvePath(
  process.env.TTS_PUBLIC_DIR ?? "public/tts",
);
const SPIDER_OUTPUT_DIR = resolvePath(
  process.env.SPIDER_OUTPUT_DIR ?? "output/spider",
);
const SPIDER_PUBLIC_DIR = resolvePath(
  process.env.SPIDER_PUBLIC_DIR ?? "public/spider",
);
const TITLE_LEGACY = resolvePath(
  process.env.TITLE_LEGACY ?? "output/video/title.json",
);
const VIDEO_PUBLIC_DIR = resolvePath(
  process.env.VIDEO_PUBLIC_DIR ?? "public/video",
);

const MP3_SRC = path.join(TTS_OUTPUT_DIR, "audio.mp3");
const VTT_SRC = path.join(TTS_OUTPUT_DIR, "audio.vtt");
const CAPTIONS_SRC = path.join(SPIDER_OUTPUT_DIR, "captions.vtt");
const TITLE_SPIDER = path.join(SPIDER_OUTPUT_DIR, "title.json");

function exists(p) {
  return fs.existsSync(p);
}

console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}`);
console.log(`${BLUE}📦 Sync outputs → public (Remotion)${NC}`);
console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}`);
console.log("");

if (requireTts) {
  if (!exists(MP3_SRC) || !exists(VTT_SRC)) {
    console.log(
      `${RED}❌ Missing TTS artifacts: ${MP3_SRC} and/or ${VTT_SRC} — run: pnpm tts${NC}`,
    );
    process.exit(1);
  }
}

if (exists(MP3_SRC) && exists(VTT_SRC)) {
  fs.mkdirSync(TTS_PUBLIC_DIR, { recursive: true });
  for (const f of ["audio.mp3", "audio.vtt"]) {
    const dest = path.join(TTS_PUBLIC_DIR, f);
    if (exists(dest)) fs.rmSync(dest, { force: true });
  }
  fs.copyFileSync(MP3_SRC, path.join(TTS_PUBLIC_DIR, "audio.mp3"));
  fs.copyFileSync(VTT_SRC, path.join(TTS_PUBLIC_DIR, "audio.vtt"));
  console.log(
    `${GREEN}✅ TTS → ${TTS_PUBLIC_DIR}/{audio.mp3,audio.vtt}${NC}`,
  );
} else {
  console.log(
    `${YELLOW}⚠️  Skipped TTS (missing ${MP3_SRC} or ${VTT_SRC})${NC}`,
  );
}

if (exists(CAPTIONS_SRC)) {
  fs.mkdirSync(SPIDER_PUBLIC_DIR, { recursive: true });
  const dest = path.join(SPIDER_PUBLIC_DIR, "captions.vtt");
  if (exists(dest)) fs.rmSync(dest, { force: true });
  fs.copyFileSync(CAPTIONS_SRC, dest);
  console.log(`${GREEN}✅ Captions → ${dest}${NC}`);
} else {
  console.log(
    `${YELLOW}⚠️  Skipped captions (no ${CAPTIONS_SRC})${NC}`,
  );
}

let titleFile = "";
if (exists(TITLE_SPIDER)) {
  titleFile = TITLE_SPIDER;
} else if (exists(TITLE_LEGACY)) {
  titleFile = TITLE_LEGACY;
  console.log(
    `${YELLOW}⚠️  Title from legacy ${TITLE_LEGACY} — prefer ${TITLE_SPIDER}${NC}`,
  );
}

const destTitle = path.join(VIDEO_PUBLIC_DIR, "title.json");

if (titleFile) {
  fs.mkdirSync(VIDEO_PUBLIC_DIR, { recursive: true });

  if (exists(destTitle)) fs.rmSync(destTitle, { force: true });
  fs.copyFileSync(titleFile, destTitle);
  console.log(`${GREEN}✅ Title → ${destTitle}${NC}`);
  try {
    const t = JSON.parse(fs.readFileSync(titleFile, "utf8"));
    if (t.title) console.log(`${BLUE}   Title: ${t.title}${NC}`);
  } catch {
    /* ignore */
  }
} else {
  if (exists(destTitle)) {
    fs.rmSync(destTitle, { force: true });
    console.log(
      `${YELLOW}⚠️  Removed stale ${destTitle} (no ${TITLE_SPIDER} or ${TITLE_LEGACY})${NC}`,
    );
  } else {
    console.log(
      `${YELLOW}⚠️  Skipped title (no ${TITLE_SPIDER} or ${TITLE_LEGACY})${NC}`,
    );
  }
}

console.log("");
console.log(`${GREEN}✅ Sync done${NC}`);
