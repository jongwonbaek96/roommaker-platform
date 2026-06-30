# Roommaker Platform - GitHub + Vercel deploy setup (Windows PowerShell)
# Usage: open PowerShell in this folder, then run:  ./setup-deploy.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "=== Roommaker deploy setup ===" -ForegroundColor Cyan
Write-Host ""

# 1) Remove broken .git folder if present
if (Test-Path ".git") {
  Write-Host "[1/5] Removing existing .git folder..." -ForegroundColor Yellow
  Remove-Item -Recurse -Force ".git" -ErrorAction SilentlyContinue
}

# 2) git init + commit
Write-Host "[2/5] Initializing git repo and committing..." -ForegroundColor Yellow
git init | Out-Null
git add -A
git commit -m "Initial commit: Roommaker escape-room management platform" | Out-Null
git branch -M main

# 3) Create GitHub repo + push
$hasGh = Get-Command gh -ErrorAction SilentlyContinue
if ($hasGh) {
  Write-Host "[3/5] Creating GitHub repo and pushing (gh)..." -ForegroundColor Yellow
  gh repo create roommaker-platform --private --source=. --remote=origin --push
} else {
  Write-Host "[3/5] GitHub CLI (gh) not found. Manual steps:" -ForegroundColor Magenta
  Write-Host "      1. Create empty repo 'roommaker-platform' at https://github.com/new (uncheck README)"
  Write-Host "      2. Run these two lines (replace USERNAME):"
  Write-Host "         git remote add origin https://github.com/USERNAME/roommaker-platform.git"
  Write-Host "         git push -u origin main"
}

# 4) Vercel deploy
$hasVercel = Get-Command vercel -ErrorAction SilentlyContinue
if ($hasVercel) {
  Write-Host "[4/5] Deploying to Vercel (vercel)..." -ForegroundColor Yellow
  vercel --prod
} else {
  Write-Host "[4/5] Vercel CLI not found. Connect via web:" -ForegroundColor Magenta
  Write-Host "      Go to https://vercel.com/new and Import the GitHub repo, then Deploy."
  Write-Host "      Once connected, every git push will auto-deploy."
}

Write-Host ""
Write-Host "[5/5] Done. Open the deployed URL on your phone and use 'Add to Home Screen'." -ForegroundColor Green
Write-Host ""
