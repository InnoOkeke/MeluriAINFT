# 🚀 Universal AI NFT - Quick Start Guide

## ✅ What's Fixed

1. **Image Size** - NFT images now display at a reasonable size (400px max)
2. **Wallet Connection** - Simplified to work with ANY wallet (MetaMask, Trust Wallet, Coinbase Wallet, etc.)
3. **No Watermarks** - Set up local Stable Diffusion API (completely free!)

---

## 🎯 Start in 3 Steps

### Step 1: Start the Frontend

```bash
cd frontend
python -m http.server 8000
```

Open: **http://localhost:8000**

### Step 2: Start Stable Diffusion API (Optional but Recommended)

**Option A: With Python installed**

```bash
cd stable-diffusion-api
pip install -r requirements.txt
python app.py
```

**Option B: Skip for now**

The app will fallback to online APIs (may have watermarks)

### Step 3: Connect & Create!

1. Click "Connect Wallet" (works with any Web3 wallet)
2. Enter a prompt: "A futuristic cyberpunk city at night"
3. Click "Generate AI Art"
4. Click "Mint NFT"

---

## 🎨 Image Generation Options

The app tries these in order:

1. **Local Stable Diffusion** (NO watermark, FREE) - If running
2. **Hugging Face API** (No watermark, rate limited)
3. **Pollinations.ai** (May have small watermark)

---

## 💡 Stable Diffusion Setup (Detailed)

### Requirements

- Python 3.10 or 3.11
- 8GB+ RAM
- (Optional) NVIDIA GPU for faster generation

### Installation

```bash
cd stable-diffusion-api

# Install dependencies
pip install -r requirements.txt

# Start the server
python app.py
```

**First run**: Downloads model (~4GB), takes 5-10 minutes
**Subsequent runs**: Instant startup!

### Performance

- **With GPU**: 3-5 seconds per image
- **CPU only**: 30-60 seconds per image

### Troubleshooting

**Out of Memory?**

Edit `app.py`, change:
```python
width=512, height=512
```
to:
```python
width=256, height=256
```

**Too Slow?**

Edit `app.py`, change:
```python
num_inference_steps=30
```
to:
```python
num_inference_steps=20
```

---

## 🔗 Wallet Connection

Works with:
- ✅ MetaMask
- ✅ Trust Wallet
- ✅ Coinbase Wallet
- ✅ Rainbow Wallet
- ✅ Any Web3-compatible wallet

Just click "Connect Wallet" and approve!

---

## 📋 Full Workflow

1. **Connect Wallet** → Any Web3 wallet works
2. **Enter Prompt** → Describe your NFT
3. **Generate** → AI creates the image (no watermark if using local API)
4. **Choose Chain** → Select where to mint (ZetaChain, Ethereum, BSC, etc.)
5. **Mint** → NFT is created on your chosen chain
6. **Transfer** → Send to other chains anytime!

---

## 🌐 Supported Chains

- ⚡ ZetaChain Athens (Testnet)
- 🔷 Ethereum Sepolia
- 🟡 BSC Testnet
- 🟣 Polygon Mumbai
- 🔵 Arbitrum Sepolia
- 🔵 Base Sepolia

---

## 🐛 Common Issues

### "Please install MetaMask"
- Install any Web3 wallet (MetaMask, Trust Wallet, etc.)
- Refresh the page

### "Failed to generate image"
- Check if Stable Diffusion API is running
- App will fallback to online APIs automatically

### "Transaction failed"
- Ensure you have testnet tokens
- Get ZETA: https://labs.zetachain.com/get-zeta

### Images too large
- Already fixed! Max width is now 400px

---

## 📊 Contract Details

- **Address**: `0x6e9ba39CedDa49eb2647Aef28ae30da9B005fc21`
- **Network**: ZetaChain Athens Testnet
- **Explorer**: https://athens.explorer.zetachain.com/address/0x6e9ba39CedDa49eb2647Aef28ae30da9B005fc21

---

## 🎉 You're Ready!

Open http://localhost:8000 and start creating cross-chain AI NFTs!

**Pro Tip**: Run the local Stable Diffusion API for the best experience (no watermarks, unlimited generations)
