#!/usr/bin/env bash
# macOS / Linux install helper. On Windows, use `pnpm install:project` or install.ps1.
# Usage (from repo root): bash scripts/install.sh [--skip-ffmpeg]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

SKIP_FFMPEG=false
for arg in "$@"; do
  if [[ "$arg" == "--skip-ffmpeg" ]]; then
    SKIP_FFMPEG=true
  fi
done

KERNEL="$(uname -s 2>/dev/null || echo unknown)"

if [[ "$KERNEL" =~ ^(MINGW|MSYS|CYGWIN_NT) ]]; then
  echo "检测到 Windows 环境，改用 PowerShell 安装脚本…"
  POWERSHELL="${POWERSHELL:-powershell.exe}"
  if ! command -v "$POWERSHELL" >/dev/null 2>&1 && command -v pwsh >/dev/null 2>&1; then
    POWERSHELL=pwsh
  fi
  EXTRA=()
  [[ "$SKIP_FFMPEG" == true ]] && EXTRA+=("-SkipFfmpeg")
  exec "$POWERSHELL" -NoProfile -ExecutionPolicy Bypass -File "$SCRIPT_DIR/install.ps1" "${EXTRA[@]}"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Panda Video Generator — 安装依赖（macOS / Linux）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

need_node() {
  if ! command -v node >/dev/null 2>&1; then
    echo "❌ 未检测到 Node.js。请先安装 Node.js 20 LTS: https://nodejs.org/"
    exit 1
  fi
  if ! node -e 'const p=process.version.slice(1).split(".").map(Number);process.exit(p[0]>20||(p[0]===20&&p[1]>=9)?0:1)'; then
    echo "❌ 需要 Node.js >= 20.9（当前: $(node -v)）。请升级: https://nodejs.org/"
    exit 1
  fi
  echo "✅ Node.js $(node -v)"
}

ensure_pnpm() {
  if command -v pnpm >/dev/null 2>&1; then
    echo "✅ pnpm $(pnpm -v)"
    return
  fi
  echo "正在通过 Corepack 启用 pnpm…"
  corepack enable
  corepack prepare pnpm@latest --activate
  echo "✅ pnpm $(pnpm -v)"
}

ensure_ffmpeg_unix() {
  if [[ "$SKIP_FFMPEG" == true ]]; then
    echo "⏭  已跳过 ffmpeg（--skip-ffmpeg）"
    return
  fi
  if command -v ffmpeg >/dev/null 2>&1; then
    echo "✅ ffmpeg 已在 PATH"
    return
  fi
  echo "未检测到 ffmpeg，尝试按系统安装…"
  case "$KERNEL" in
    Darwin)
      if command -v brew >/dev/null 2>&1; then
        echo "使用 Homebrew 安装 ffmpeg…"
        brew install ffmpeg
      else
        echo "❌ 未安装 Homebrew，无法自动安装 ffmpeg。"
        echo "   请安装 https://brew.sh 后执行: brew install ffmpeg"
        echo "   或带上 --skip-ffmpeg 仅安装 npm 依赖。"
        exit 1
      fi
      ;;
    Linux)
      if command -v apt-get >/dev/null 2>&1; then
        echo "使用 apt 安装 ffmpeg（可能需要输入密码）…"
        sudo apt-get update -qq
        sudo apt-get install -y ffmpeg
      elif command -v dnf >/dev/null 2>&1; then
        echo "使用 dnf 安装 ffmpeg…"
        sudo dnf install -y ffmpeg-free || sudo dnf install -y ffmpeg
      elif command -v yum >/dev/null 2>&1; then
        sudo yum install -y ffmpeg
      elif command -v pacman >/dev/null 2>&1; then
        sudo pacman -S --noconfirm ffmpeg
      else
        echo "⚠️  无法识别包管理器，请手动安装 ffmpeg 后重新运行本脚本，或使用 --skip-ffmpeg"
        exit 1
      fi
      ;;
    *)
      echo "⚠️  未知系统 ($KERNEL)，请手动安装 ffmpeg 或使用 --skip-ffmpeg"
      exit 1
      ;;
  esac
  command -v ffmpeg >/dev/null 2>&1 && echo "✅ ffmpeg 已就绪"
}

need_node
ensure_pnpm
ensure_ffmpeg_unix

echo ""
echo "正在执行 pnpm install（含 workspace 与 Playwright Chromium，请保持网络畅通）…"
pnpm install

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " ✅ 安装完成。可运行 pnpm check:setup 自检，或 pnpm dev 启动站点。"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
