@echo off
rem RoomMaker one-click deploy: double-click this file to push to GitHub
cd /d "%~dp0"
echo ==== RoomMaker deploy ====
if exist .git\index.lock del /f .git\index.lock
git add -A
git commit -m "Add horror game Midnight Frequency v1.1"
git push
echo.
echo ==== DONE. Vercel/Cloudflare will auto-deploy in 1-2 min. ====
pause
