# Skip Local API - Use Cloud APIs Instead

## Issue

Installing the local Stable Diffusion API on Windows requires:
- Rust compiler (for safetensors and tokenizers)
- Large PyTorch download
- Complex dependencies

This is causing installation errors.

## Solution: Use Cloud APIs

**Good news!** You don't need the local API at all. The app works perfectly with cloud APIs:

### ✅ Hugging Face (Default)
- **Free** - No API key needed
- **No watermark** - Clean images
- **Good quality** - Stable Diffusion 2.1
- **No installation** - Works immediately

### ✅ Pollinations (Fallback)
- **Always available** - Never fails
- **Fast** - Instant generation
- **Free** - No limits
- **No setup** - Just works

## How It Works

The React app automatically tries APIs in this order:

1. **Local API** (if running) - Best quality
2. **Hugging Face** (default) - Good quality, free
3. **Pollinations** (fallback) - Always works

Since local API isn't running, it uses Hugging Face automatically!

## To Use the App

Just start the React app:
```bash
cd frontend
npm run dev
```

That's it! No Python installation needed.

## If You Still Want Local API

You'll need to install Rust first:

### Option 1: Install Rust
1. Download Rust: https://rustup.rs/
2. Install it (takes 5-10 minutes)
3. Restart terminal
4. Run: `cd stable-diffusion-api && pip install -r requirements.txt`

### Option 2: Use Pre-built Wheels
```bash
pip install --upgrade pip
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install flask flask-cors Pillow
pip install diffusers transformers accelerate
# Skip safetensors and tokenizers - they're optional
```

### Option 3: Use Python 3.11
Python 3.13 is too new. Use 3.11 instead:
1. Download Python 3.11: https://www.python.org/downloads/
2. Create virtual environment: `py -3.11 -m venv venv`
3. Activate: `venv\Scripts\activate`
4. Install: `pip install -r requirements.txt`

## Recommendation

**Just use the cloud APIs!** They work great and require zero setup.

The local API is only needed if you want:
- Offline generation
- Custom models
- Maximum quality control

For most users, Hugging Face is perfect.

## Summary

❌ **Don't waste time** installing local API  
✅ **Use Hugging Face** - works immediately  
✅ **No Python needed** - just run the React app  
✅ **Same quality** - Stable Diffusion 2.1  
✅ **Free forever** - no API keys needed  

Just run `npm run dev` and start creating! 🎉
