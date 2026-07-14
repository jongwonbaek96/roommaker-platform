@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo === Cleaning stale git locks ===
if exist ".git\index.lock" del /f /q ".git\index.lock"
if exist ".git\HEAD.lock" del /f /q ".git\HEAD.lock"
echo === Commit ===
git add -A
git commit -m "Add purchase token gate (Pages Functions) + fix _routes.json"
echo === Push ===
git push
echo.
echo ============ DONE ============
git log --oneline -3
git status --short
pause
