# Push new/updated games to GitHub -> Vercel auto-deploys
# Usage: open PowerShell in this folder, then run:  ./publish.ps1 "your message"
param([string]$msg = "Update games")
Set-Location $PSScriptRoot
git add -A
git commit -m "$msg"
git push
Write-Host ""
Write-Host "Pushed. Vercel will auto-deploy in 1-2 min. Refresh the app on your phone." -ForegroundColor Green
