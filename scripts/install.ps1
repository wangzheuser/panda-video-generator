# Windows install helper (PowerShell 5+). Run from repo clone root:
#   powershell -ExecutionPolicy Bypass -File scripts/install.ps1
# Optional: -SkipFfmpeg
param(
  [switch]$SkipFfmpeg
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Write-Title {
  param([string]$Text)
  Write-Host ""
  Write-Host "--------------------------------------------------" -ForegroundColor Cyan
  Write-Host " $Text" -ForegroundColor Cyan
  Write-Host "--------------------------------------------------" -ForegroundColor Cyan
  Write-Host ""
}

Write-Title "Panda Video Generator — Windows 安装"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "未检测到 Node.js。请安装 Node.js 20 LTS: https://nodejs.org/" -ForegroundColor Red
  exit 1
}

node -e 'const p=process.version.slice(1).split(".").map(Number);process.exit(p[0]>20||(p[0]===20&&p[1]>=9)?0:1)'
if ($LASTEXITCODE -ne 0) {
  Write-Host "需要 Node.js >= 20.9（当前: $(node -v)）。请升级后重试。" -ForegroundColor Red
  exit 1
}
Write-Host "OK Node.js $(node -v)" -ForegroundColor Green

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Write-Host "正在通过 Corepack 启用 pnpm…"
  corepack enable
  corepack prepare pnpm@latest --activate
}
Write-Host "OK pnpm $(pnpm -v)" -ForegroundColor Green

if (-not $SkipFfmpeg) {
  if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Host "未检测到 ffmpeg，尝试使用 winget 安装（可能需要管理员窗口）…"
    $winget = Get-Command winget -ErrorAction SilentlyContinue
    if ($winget) {
      winget install -e --id Gyan.FFmpeg --accept-package-agreements --accept-source-agreements
      if ($LASTEXITCODE -ne 0) {
        Write-Host "winget 安装 ffmpeg 未成功（可忽略若暂不跑 TTS）" -ForegroundColor Yellow
      }
      # Refresh PATH in this session (common winget install location)
      $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
      $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
      $env:Path = "$machinePath;$userPath"
    } else {
      Write-Host "未找到 winget。请手动安装 ffmpeg 或从 https://ffmpeg.org/download.html 下载，也可使用 Chocolatey: choco install ffmpeg" -ForegroundColor Yellow
      Write-Host "继续仅安装 npm 依赖…（之后 TTS 仍需要 ffmpeg）" -ForegroundColor Yellow
    }
  }
  if (Get-Command ffmpeg -ErrorAction SilentlyContinue) {
    Write-Host "OK ffmpeg 可用" -ForegroundColor Green
  }
} else {
  Write-Host "已跳过 ffmpeg（-SkipFfmpeg）" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "正在执行 pnpm install（含 workspace 与 Playwright Chromium）…"
pnpm install

Write-Host ""
Write-Host "安装完成。可运行: pnpm check:setup" -ForegroundColor Green
