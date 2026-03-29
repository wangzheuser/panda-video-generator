/**
 * Environment sanity check (replaces check-setup.sh); works on Windows.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { projectRoot } from "./lib/project-root.mjs";

let fail = 0;

function hasCmd(cmd, args = ["--version"]) {
  const r = spawnSync(cmd, args, { stdio: "ignore", shell: true });
  return r.status === 0;
}

function nodeVersionOk() {
  const m = /^v(\d+)\.(\d+)\.(\d+)/.exec(process.version);
  if (!m) return false;
  const major = Number(m[1]);
  const minor = Number(m[2]);
  return major > 20 || (major === 20 && minor >= 9);
}

console.log("=== Panda Video Generator — environment check ===");
console.log("");

if (nodeVersionOk()) {
  console.log(`[OK] node ${process.version} (need >=20.9, see package.json engines)`);
} else {
  console.log(
    `[!!] node ${process.version} — need >=20.9: https://nodejs.org/`,
  );
  fail = 1;
}

if (hasCmd("pnpm", ["-v"])) {
  try {
    const v = spawnSync("pnpm", ["-v"], {
      encoding: "utf8",
      shell: true,
    }).stdout?.trim();
    console.log(`[OK] pnpm ${v}`);
  } catch {
    console.log("[OK] pnpm");
  }
} else {
  console.log(
    "[!!] pnpm not found — try: corepack enable && corepack prepare pnpm@latest --activate",
  );
  fail = 1;
}

if (hasCmd("ffmpeg", ["-version"])) {
  const line = spawnSync("ffmpeg", ["-version"], {
    encoding: "utf8",
    shell: true,
  }).stdout?.split("\n")[0];
  console.log(`[OK] ffmpeg ${line ?? ""}`.trim());
} else {
  console.log(
    "[--] ffmpeg not on PATH — needed for pnpm tts / cover; install ffmpeg for your OS",
  );
}

const pkg = path.join(projectRoot, "package.json");
const nm = path.join(projectRoot, "node_modules");
if (fs.existsSync(pkg) && fs.existsSync(nm)) {
  console.log("[OK] node_modules exists (run pnpm install if you just cloned)");
} else {
  console.log("[--] run pnpm install in repo root");
}

console.log("");
console.log(
  "Playwright: Chromium is fetched when you run pnpm install (needs network).",
);
console.log(
  "If login/upload fails: pnpm exec playwright install --with-deps chromium",
);
console.log("");

process.exit(fail);
