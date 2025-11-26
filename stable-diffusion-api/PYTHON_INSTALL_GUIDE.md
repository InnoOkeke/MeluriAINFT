# Python Installation Guide for Stable Diffusion API

## Issue: Python 3.13 Compatibility

You're using Python 3.13, which is very new. Some packages (like Pillow) may have compatibility issues.

## Solution Options

### Option 1: Use the Install Script (Recommended)

Run the automated installer:
```bash
cd stable-diffusion-api
install.bat
```

This will:
1. Upgrade pip/setuptools
2. Install packages in the correct order
3. Let you choose CPU or GPU version of PyTorch
4. Handle compatibility issues automatically

### Option 2: Manual Installation

#### Step 1: Upgrade pip
```bash
python -m pip install --upgrade pip setuptools wheel
```

#### Step 2: Install basic packages
```bash
pip install flask flask-cors
pip install --upgrade Pillow
```

#### Step 3: Install PyTorch

**For CPU only (works on any PC):**
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

**For NVIDIA GPU (CUDA 11.8):**
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

**For NVIDIA GPU (CUDA 12.1):**
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
```

#### Step 4: Install AI libraries
```bash
pip install diffusers transformers accelerate safetensors
```

### Option 3: Use Python 3.11 (Most Stable)

If you continue having issues, consider using Python 3.11 which has better package compatibility:

1. Download Python 3.11 from: https://www.python.org/downloads/
2. Install it alongside Python 3.13
3. Create a virtual environment:
   ```bash
   py -3.11 -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   ```

### Option 4: Skip Local API (Use Hugging Face Instead)

If installation is too complex, you can skip the local Stable Diffusion API entirely!

The frontend already has Hugging Face as a fallback:
- **No installation needed**
- **Free to use**
- **No watermark**
- **Good quality**

Just use the React or vanilla JS frontend without running the Python API.

To get better results with Hugging Face:
1. Get a free API token: https://huggingface.co/settings/tokens
2. Add it to `frontend/src/components/CreateArt.jsx`:
   ```javascript
   headers: {
     'Authorization': 'Bearer YOUR_TOKEN_HERE'
   }
   ```

## Troubleshooting

### Error: "Failed to build Pillow"
```bash
# Try upgrading pip first
python -m pip install --upgrade pip setuptools wheel

# Then install Pillow separately
pip install --upgrade Pillow
```

### Error: "No module named 'torch'"
```bash
# Install PyTorch from official source
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

### Error: "CUDA not available"
This is normal if you don't have an NVIDIA GPU. The API will use CPU mode automatically.

### Slow generation on CPU
- First image takes 2-5 minutes (model loading)
- Subsequent images take 30-60 seconds
- Consider using Hugging Face API instead for faster results

## Recommended Setup

**For best experience:**
1. Use Python 3.11 (not 3.13)
2. Install CUDA version if you have NVIDIA GPU
3. Or just use Hugging Face API (no local installation needed)

**For quick start:**
1. Skip local API installation
2. Use the React frontend
3. It will automatically use Hugging Face or Pollinations
4. No Python needed!

## Summary

You have 3 ways to generate AI images:

1. **Local Stable Diffusion** (best quality, no watermark)
   - Requires Python setup
   - Use `install.bat` for easy installation

2. **Hugging Face API** (good quality, no watermark)
   - No installation needed
   - Free tier available
   - Optional: Add API token for faster results

3. **Pollinations AI** (always works)
   - No installation needed
   - Always available as fallback
   - May have watermark

Choose what works best for you!
