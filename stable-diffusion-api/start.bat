@echo off
echo ========================================
echo Starting Stable Diffusion API Server
echo ========================================
echo.
echo This will download the model on first run (~4GB)
echo Subsequent runs will be instant!
echo.
echo Server will run on http://localhost:5000
echo.
echo Press Ctrl+C to stop
echo ========================================
echo.

python app.py
