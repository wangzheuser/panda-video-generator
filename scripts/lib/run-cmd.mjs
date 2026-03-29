import { spawnSync } from "node:child_process";
import { projectRoot } from "./project-root.mjs";

/**
 * Run a command with inherited stdio. `shell: true` so `pnpm` and `ffmpeg` resolve on Windows.
 */
export function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, {
    cwd: projectRoot,
    stdio: "inherit",
    shell: true,
    env: process.env,
    ...options,
  });
  return result.status ?? 1;
}

export function hasFfmpeg() {
  const r = spawnSync("ffmpeg", ["-version"], {
    stdio: "ignore",
    shell: true,
  });
  return r.status === 0;
}
