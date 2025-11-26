@echo off
echo ========================================
echo   Stable Diffusion API - Installation
echo ========================================
echo.
echo Detected Python 3.13 - Using compatible installation method
echo.

echo Step 1: Upgrading pip...
python -m pip install --upgrade pip setuptools wheel
echo.

echo Step 2: Installing basic dependencies...
pip install flask flask-cors
echo.

echo Step 3: Installing Pillow (image processing)...
pip install --upgrade Pillow
echo.

echo Step 4: Installing PyTorch (this may take a while)...
echo Choose your installation:
echo [1] CPU only (smaller, works on any PC)
echo [2] CUDA 11.8 (for NVIDIA GPUs)
echo [3] CUDA 12.1 (for newer NVIDIA GPUs)
echo.
set /p choice="Enter choice (1-3): "

if "%choice%"=="1" (
    echo Installing CPU version...
    pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
) else if "%choice%"=="2" (
    echo Installing CUDA 11.8 version...
    pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
) else if "%choice%"=="3" (
    echo Installing CUDA 12.1 version...
    pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
) else (
    echo Invalid choice, installing CPU version...
    pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
)
echo.

echo Step 5: Installing AI libraries...
pip install diffusers transformers accelerate safetensors
echo.

echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo To start the API server, run:
echo   python app.py
echo.
echo Or use:
echo   start.bat
echo.

pause
