# Meluri AI NFT - React Frontend

Modern React frontend for creating AI-generated NFTs and minting them cross-chain using ZetaChain.

## Features

✨ **AI Art Generation** with multiple fallback APIs:
- Local Stable Diffusion (no watermark, best quality)
- Hugging Face Inference API (free, no watermark)
- Pollinations AI (always available fallback)

🔗 **Multi-Chain Support**:
- ZetaChain Athens
- Ethereum Sepolia
- BSC Testnet
- Polygon Mumbai
- Arbitrum Sepolia
- Base Sepolia

🌐 **Cross-Chain NFT Transfers** powered by ZetaChain

👛 **Wallet Integration**:
- MetaMask
- WalletConnect
- Any Web3 wallet

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### 3. Build for Production

```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Wallet connection
│   │   ├── CreateArt.jsx       # AI art generation
│   │   ├── MintNFT.jsx         # NFT minting
│   │   ├── SuccessSection.jsx  # Post-mint actions
│   │   ├── MyNFTs.jsx          # NFT gallery
│   │   ├── TransferModal.jsx   # Cross-chain transfer
│   │   └── StatusMessage.jsx   # Toast notifications
│   ├── App.jsx                 # Main app component
│   ├── config.js               # Contract addresses & chains
│   ├── main.jsx                # React entry point
│   ├── App.css                 # Component styles
│   └── index.css               # Global styles
├── index-react.html            # HTML template
├── vite.config.js              # Vite configuration
└── package.json
```

## Configuration

Edit `src/config.js` to update:
- Contract addresses
- Supported chains
- AI API endpoints
- Sample prompts

## AI Image Generation

The app tries multiple APIs in order:

1. **Local Stable Diffusion** (`http://localhost:5000`)
   - Best quality, no watermark
   - Requires running the Python API (see `../stable-diffusion-api/`)

2. **Hugging Face** (free tier)
   - Good quality, no watermark
   - Optional: Add API token for faster inference

3. **Pollinations AI** (fallback)
   - Always available
   - May have watermark

## Wallet Connection

Supports multiple connection methods:
- Browser extension wallets (MetaMask, etc.)
- WalletConnect for mobile wallets
- Automatic reconnection on page reload

## Technologies

- **React 19** - UI framework
- **Vite** - Build tool & dev server
- **Ethers.js 6** - Ethereum interactions
- **Web3Modal** - Wallet connection
- **WalletConnect** - Mobile wallet support

## Development

### Hot Module Replacement

Vite provides instant HMR for fast development.

### Component Development

Each component is self-contained with its own state management and can be easily modified or extended.

### Styling

Uses CSS with modern features:
- CSS Grid & Flexbox
- Backdrop filters
- CSS animations
- Responsive design

## Troubleshooting

### WalletConnect Not Working

Make sure the libraries are properly loaded. The app will fallback to MetaMask if WalletConnect fails.

### AI Generation Fails

1. Check if local Stable Diffusion API is running
2. Verify Hugging Face API is accessible
3. Pollinations should always work as final fallback

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Migration from Vanilla JS

The React version provides:
- Better state management
- Component reusability
- Easier testing
- Type safety (with TypeScript if needed)
- Better developer experience

All functionality from the vanilla JS version is preserved.
