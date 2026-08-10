@echo off
REM TranTxt - Start Both Servers

echo.
echo ========================================
echo   TranTxt - Starting Both Servers
echo ========================================
echo.

echo Starting Backend Server on port 3004...
start cmd /k "cd D:\coding\vibe\trantxt\backend && npm run dev"

timeout /t 3 /nobreak

echo Starting Frontend Server on port 5173...
start cmd /k "cd D:\coding\vibe\trantxt\frontend && npm run dev"

echo.
echo ========================================
echo   Both servers starting...
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3004
echo.
echo Waiting for servers to start (30 seconds)...
timeout /t 30 /nobreak

echo.
echo Opening browser...
start http://localhost:5173
echo.
echo Done! App should now be running.
