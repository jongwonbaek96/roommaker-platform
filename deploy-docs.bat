@echo off
chcp 65001 >nul
rem ============================================================
rem  RoomMaker 제작 MD 뷰어 배포 (지시서 #05)
rem  더블클릭하면: 매니페스트 재생성 -> 커밋 -> 푸시 -> 자동배포
rem ============================================================
cd /d "%~dp0"
echo ==== RoomMaker docs deploy ====

echo [1/4] Cleaning stale git locks...
if exist ".git\index.lock" del /f /q ".git\index.lock"
if exist ".git\HEAD.lock" del /f /q ".git\HEAD.lock"

echo [2/4] Regenerating docs manifest...
where node >nul 2>nul
if %errorlevel%==0 (
  node tools\gen-docs-manifest.mjs
) else (
  echo   ^(node not found - skipping, using existing manifest^)
)

echo [3/4] Commit...
git add -A
git commit -m "Add production docs viewer (/admin/docs): view/edit/download game MD"

echo [4/4] Push...
git push

echo.
echo ============ DONE ============
git log --oneline -3
echo.
echo Cloudflare Pages / Vercel will auto-deploy in 1-2 min.
echo Then open:  https://roommaker-platform.pages.dev/admin/docs
pause
