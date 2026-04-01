/**
 * Environment sanity check (replaces check-setup.sh); works on Windows.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { projectRoot } from "./lib/project-root.mjs";

const RULE = "─".repeat(58);

/** Number of scored checks (Playwright 为说明项，不计分). */
const TOTAL_CHECKS = 5;

let passed = 0;
let failed = 0;

function recordPass() {
  passed += 1;
}

function recordFail() {
  failed += 1;
}

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

/** @param {"ok" | "fail" | "warn" | "skip" | "info"} level */
function item(level, headline, detailLines = []) {
  const tag =
    level === "ok"
      ? "通过 "
      : level === "fail"
        ? "失败 "
        : level === "warn"
          ? "注意 "
          : level === "info"
            ? "提示 "
            : "跳过 ";
  console.log(`  ${tag} ${headline}`);
  for (const line of detailLines) {
    console.log(`        ${line}`);
  }
}

function section(title) {
  console.log("");
  console.log(`${title}`);
  console.log(RULE);
}

/**
 * @returns {"ok" | "warn" | "skip"}
 */
function checkPuppeteerChrome() {
  const nm = path.join(projectRoot, "node_modules");
  if (!fs.existsSync(nm)) {
    item("skip", "Puppeteer（STEP1 通用网页）", [
      "依赖未安装，无法检测；完成 pnpm install 后将自动运行 postinstall。",
    ]);
    return "skip";
  }

  const r = spawnSync(
    "pnpm",
    [
      "--filter",
      "@panda-video-generator/spider",
      "exec",
      "puppeteer",
      "browsers",
      "list",
    ],
    {
      cwd: projectRoot,
      encoding: "utf8",
      shell: true,
      windowsHide: true,
    },
  );

  if (r.status !== 0) {
    item("warn", "Puppeteer（STEP1 通用网页）", [
      "未能列出已安装浏览器。",
      "可执行：node scripts/puppeteer-postinstall.mjs",
      "或设置环境变量 PUPPETEER_EXECUTABLE_PATH 指向本机 Chrome/Chromium。",
    ]);
    return "warn";
  }

  const out = (r.stdout ?? "").trim();
  const first = out.split("\n").find((l) => l.length) ?? "";
  if (!first.toLowerCase().includes("chrome")) {
    item("warn", "Puppeteer（STEP1 通用网页）", [
      "未检测到 Chrome for Testing；STEP1「通用网页」可能报错。",
      "修复：node scripts/puppeteer-postinstall.mjs",
      "若环境变量 PUPPETEER_SKIP_CHROMIUM_DOWNLOAD 已开启，请先关闭再安装依赖。",
    ]);
    return "warn";
  }

  item("ok", "Puppeteer · Chrome for Testing", [first]);
  return "ok";
}

function printScoreSummary() {
  const allPass = failed === 0 && passed === TOTAL_CHECKS;
  const emoji = allPass ? "✅" : "⚠️";
  let line = `  ${emoji}  ${passed}/${TOTAL_CHECKS} Checked`;
  if (failed > 0) {
    line += `   ${failed}/${TOTAL_CHECKS} Failed`;
  }
  console.log("");
  console.log(RULE);
  console.log(line);
  if (allPass) {
    console.log(
      "  结果：五项检查均已通过；",
    );
  } else {
    console.log(
      "  结果：请先处理上述「失败 / 注意」项，再运行其他命令。",
    );
  }
}

console.log("");
console.log("  Panda Video Generator · 环境检查");
console.log(RULE);
console.log(
  "  本脚本校验本地开发与流水线常用前提；未列出的项请参考 README。",
);

section("1. 运行时");

if (nodeVersionOk()) {
  recordPass();
  item("ok", `Node.js ${process.version}`, [
    "要求：>= 20.9（见 package.json engines）。",
  ]);
} else {
  recordFail();
  item("fail", `Node.js ${process.version}`, [
    "要求：>= 20.9。",
    "安装或升级：https://nodejs.org/",
  ]);
}

if (hasCmd("pnpm", ["-v"])) {
  recordPass();
  const v = spawnSync("pnpm", ["-v"], {
    encoding: "utf8",
    shell: true,
    windowsHide: true,
  }).stdout?.trim();
  item("ok", `pnpm ${v ?? ""}`.trim(), ["包管理器可用于安装 workspace 与脚本依赖。"]);
} else {
  recordFail();
  item("fail", "pnpm 未找到", [
    "建议：corepack enable && corepack prepare pnpm@latest --activate",
  ]);
}

if (hasCmd("ffmpeg", ["-version"])) {
  recordPass();
  const line = spawnSync("ffmpeg", ["-version"], {
    encoding: "utf8",
    shell: true,
    windowsHide: true,
  }).stdout
    ?.split("\n")[0]
    ?.trim();
  item("ok", "ffmpeg（系统 PATH）", line ? [line] : ["已可用。"]);
} else {
  recordFail();
  item("fail", "ffmpeg 不在 PATH 中", [
    "TTS 合并等步骤需要系统级 ffmpeg。",
    "macOS: brew install ffmpeg",
    "Ubuntu: sudo apt install ffmpeg",
    "Windows: winget install Gyan.FFmpeg",
    "或：pnpm install:project -- --install-system-ffmpeg（尝试自动安装）。",
  ]);
}

section("2. 仓库与 node_modules");

const pkg = path.join(projectRoot, "package.json");
const nm = path.join(projectRoot, "node_modules");
if (fs.existsSync(pkg) && fs.existsSync(nm)) {
  recordPass();
  item("ok", "依赖目录已就绪", ["已检测到 package.json 与 node_modules。"]);
} else {
  recordFail();
  item("warn", "依赖可能未安装", [
    "请在仓库根目录执行：pnpm install",
    "或一键：pnpm install:project",
  ]);
}

section("3. 浏览器组件");

const puppeteerResult = checkPuppeteerChrome();
if (puppeteerResult === "ok") {
  recordPass();
} else {
  recordFail();
}

item("info", "Playwright · Chromium", [
  "随 pnpm install 的 postinstall 下载安装（需可用网络）。",
  "用于平台登录与上传自动化；若异常：pnpm exec playwright install --with-deps chromium",
]);

printScoreSummary();
console.log("");

if (passed + failed !== TOTAL_CHECKS) {
  console.error(
    "[check-setup] Internal error: score mismatch. Expected",
    TOTAL_CHECKS,
    "got",
    passed + failed,
  );
  process.exit(1);
}

process.exit(failed > 0 ? 1 : 0);
