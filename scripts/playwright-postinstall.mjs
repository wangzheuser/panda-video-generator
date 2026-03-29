import { execSync } from "node:child_process";

// Vercel (and similar) builders: no Chromium needed for `next build`; `--with-deps` often fails on their images.
if (process.env.VERCEL) {
  console.log(
    "Skipping Playwright browser install on Vercel (not required for Next.js build).",
  );
  process.exit(0);
}

execSync("pnpm exec playwright install --with-deps chromium", {
  stdio: "inherit",
});
