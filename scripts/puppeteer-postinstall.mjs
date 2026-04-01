import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

// Vercel builders: Next build does not need Puppeteer Chrome.
if (process.env.VERCEL) {
  console.log(
    "Skipping Puppeteer Chrome install on Vercel (not required for Next.js build).",
  );
  process.exit(0);
}

execSync(
  "pnpm --filter @panda-video-generator/spider exec puppeteer browsers install chrome",
  { cwd: root, stdio: "inherit" },
);
