@echo off
cd /d "%~dp0"
echo === Ajaia Docs setup ===
if not exist ".env.local" if exist "env.local.txt" ren "env.local.txt" ".env.local"
if not exist ".env.local" (echo ERROR: .env.local missing. Put your Supabase keys in it. & pause & exit /b 1)
where node >NUL 2>&1 || (echo ERROR: Node.js not found. Install from https://nodejs.org & pause & exit /b 1)
node -v
echo --- Installing packages (1-3 min) ---
call npm install || (echo npm install FAILED & pause & exit /b 1)
echo --- Running tests ---
call npm test
echo --- Starting app: open http://localhost:3000 ---
start "" http://localhost:3000
call npm run dev
pause
