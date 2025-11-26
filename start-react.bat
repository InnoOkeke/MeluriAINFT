@echo off
echo ========================================
echo   Meluri AI NFT - React Frontend
echo ========================================
echo.

cd frontend

echo Installing dependencies...
call npm install

echo.
echo Starting development server...
echo The app will open at http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause
