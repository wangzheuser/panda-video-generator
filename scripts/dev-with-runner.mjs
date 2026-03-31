/**
 * Start Next.js dev server, then open the script runner UI once ready.
 * Run via `pnpm automation` (optional args are forwarded to `next dev`, e.g. `pnpm automation -- -p 3001`).
 */
import { spawn } from "node:child_process";
import process from "node:process";
import { projectRoot } from "./lib/project-root.mjs";

const forwardedArgs = process.argv.slice(2);

function resolvePort(argv) {
  if (process.env.PORT) return process.env.PORT;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-p" || a === "--port") {
      const v = argv[i + 1];
      if (v && !v.startsWith("-")) return v;
    }
    if (a.startsWith("--port=")) return a.slice("--port=".length);
  }
  return "3000";
}

function openUrl(url) {
  const detached = { detached: true, stdio: "ignore" };
  if (process.platform === "darwin") {
    spawn("open", [url], detached).unref();
  } else if (process.platform === "win32") {
    spawn("cmd", ["/c", "start", "", url], detached).unref();
  } else {
    spawn("xdg-open", [url], detached).unref();
  }
}

async function waitForRunnerPage(port, timeoutMs) {
  const base = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${base}/scripts`, { redirect: "follow" });
      if (res.ok) return true;
    } catch {
      /* server not listening yet */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

const port = resolvePort(forwardedArgs);
let opened = false;

const child = spawn(
  "pnpm",
  ["exec", "next", "dev", ...forwardedArgs],
  {
    cwd: projectRoot,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  },
);

function tryOpenRunner() {
  if (opened) return;
  opened = true;
  const url = `http://127.0.0.1:${port}/scripts`;
  console.log(`\n\x1b[0;32mOpening automation wizard:\x1b[0m ${url}\n`);
  openUrl(url);
}

const poll = async () => {
  const ok = await waitForRunnerPage(port, 120_000);
  if (ok) tryOpenRunner();
  else if (!opened) {
    console.warn(
      "\n\x1b[0;33mdev-with-runner:\x1b[0m timed out waiting for /scripts — open it manually.\n",
    );
  }
};
poll().catch(() => {});

child.on("exit", (code, signal) => {
  if (signal) process.exit(1);
  process.exit(code ?? 0);
});

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    child.kill(sig);
  });
}
