# Windows 安装助手 (PowerShell 5+)。从仓库克隆根目录运行：
#   powershell -ExecutionPolicy Bypass -File scripts/install.ps1
# Requires ffmpeg on PATH. Use -InstallSystemFfmpeg to try winget/choco when missing.
param(
  [switch]$InstallSystemFfmpeg
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

Write-Title "Panda Video Generator - Windows 设置"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "未找到 Node.js。请安装 Node.js 20 LTS：https://nodejs.org/" -ForegroundColor Red
  exit 1
}

$version = node -e "console.log(process.version)"
$parts = $version.Substring(1) -split "\."
$major = [int]$parts[0]
$minor = [int]$parts[1]

if ($major -lt 20 -or ($major -eq 20 -and $minor -lt 9)) {
  Write-Host "需要 Node.js >= 20.9（当前：$version）。请升级。" -ForegroundColor Red
  exit 1
}
Write-Host "OK Node.js $version" -ForegroundColor Green

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Write-Host "正在通过 Corepack 启用 pnpm..."
  corepack enable
  corepack prepare pnpm@latest --activate
}
Write-Host "OK pnpm $(pnpm -v)" -ForegroundColor Green

Write-Host ""
Write-Host "ffmpeg must be on PATH (TTS merge / atempo). Install: winget install Gyan.FFmpeg" -ForegroundColor Cyan
Write-Host "Or re-run with -InstallSystemFfmpeg to attempt auto-install." -ForegroundColor Cyan
Write-Host ""

function Ensure-FfmpegOnPath {
  if (Get-Command ffmpeg -ErrorAction SilentlyContinue) {
    Write-Host "OK ffmpeg on PATH" -ForegroundColor Green
    return
  }

  if (-not $InstallSystemFfmpeg) {
    Write-Host "ffmpeg not found. Install on PATH or run with -InstallSystemFfmpeg." -ForegroundColor Red
    exit 1
  }

  Write-Host "Installing system ffmpeg..."
  $installed = $false

  $winget = Get-Command winget -ErrorAction SilentlyContinue
  if ($winget) {
    winget install -e --id Gyan.FFmpeg --accept-package-agreements --accept-source-agreements
    if ($LASTEXITCODE -eq 0) { $installed = $true }
  }

  if (-not $installed) {
    $choco = Get-Command choco -ErrorAction SilentlyContinue
    if ($choco) {
      choco install ffmpeg -y
      if ($LASTEXITCODE -eq 0) { $installed = $true }
    }
  }

  if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Host "ffmpeg still not on PATH after install attempt. Add ffmpeg manually and re-run." -ForegroundColor Red
    exit 1
  }
  Write-Host "OK ffmpeg on PATH" -ForegroundColor Green
}

Ensure-FfmpegOnPath

Write-Host ""
Write-Host "Running pnpm install (workspace, Playwright Chromium)..."
pnpm install

Write-Host ""
Write-Host "Done. Run: pnpm check:setup" -ForegroundColor Green
