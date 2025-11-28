# Meluri AI NFT - Universal Cross-Chain NFT Platform

Create AI-generated NFTs and mint them on any blockchain using ZetaChain's Universal App architecture.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start the App

```bash
npm run dev
```

Or use the quick start script:
```bash
start-react.bat
```

The app will open at `http://localhost:5173`

**Important**: Don't open the root `index.html` file directly - it's just a redirect. Always run the dev server from the `frontend` directory.

### 3. Connect Your Wallet

- Click "Connect Wallet"
- Approve the connection in MetaMask (or your Web3 wallet)
- Start creating and minting NFTs!

## ✨ Features

### 🎨 AI Art Generation
- **Local Stable Diffusion** (optional, best quality, no watermark)
- **Hugging Face API** (free, no watermark, good quality)
- **Pollinations AI** (always available fallback)

### ⚡ Multi-Chain Support
Mint NFTs on any of these ZetaChain-supported testnets:
- ⚡ ZetaChain Athens
- 🔷 Ethereum Sepolia
- 🔵 Base Sepolia
- 🟣 Polygon Amoy
- 🔷 Arbitrum Sepolia
- 🟡 BSC Testnet
- 🌸 Kaia Testnet
- 🔺 Avalanche Fuji

### 🌐 Cross-Chain Transfers
Transfer your NFTs between any supported chains using ZetaChain's Universal App protocol.

### 👛 Wallet Support
Works with any Web3 wallet:
- MetaMask
- Coinbase Wallet
- Trust Wallet
- Rainbow Wallet
- And more!

## 📁 Project Structure

```
universal-ai-nft/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.jsx          # Main app
│   │   ├── config.js        # Configuration
│   │   └── *.css            # Styles
│   ├── index.html           # HTML template
│   ├── vite.config.js       # Vite config
│   └── package.json         # Dependencies
├── contracts/               # Solidity contracts
│   └── UniversalAINFT.sol  # Main NFT contract
├── scripts/                 # Deployment scripts
├── stable-diffusion-api/    # Optional local AI API
└── hardhat.config.js        # Hardhat configuration
```

## 🎨 AI Image Generation

The app tries multiple APIs in order:

1. **Local Stable Diffusion** (if running)
   - Best quality, no watermark
   - Requires Python setup (optional)
   - See `stable-diffusion-api/` folder

2. **Hugging Face API** (default)
   - Free tier available
   - No watermark
   - Good quality
   - No installation needed

3. **Pollinations AI** (fallback)
   - Always available
   - No setup required

## 🔧 Configuration

Edit `frontend/src/config.js` to customize:
- Contract addresses
- Supported chains
- AI API endpoints
- Sample prompts

## 📝 Smart Contract

The Universal AI NFT contract needs to be deployed on all 8 supported networks.

### Quick Deploy to All Networks
```bash
npx hardhat run scripts/deploy_all_chains.js --network zeta_testnet
```

### Deploy to Single Network
```bash
npx hardhat run scripts/deploy_single.js --network <network_name>
```

Supported networks: `zeta_testnet`, `sepolia`, `base_sepolia`, `polygon_amoy`, `arbitrum_sepolia`, `bsc_testnet`, `kaia_testnet`, `avalanche_fuji`

**Features**:
- ERC721 compliant
- Cross-chain transfers via ZetaChain
- On-chain metadata storage
- AI-generated art support

See [DEPLOYMENT_INSTRUCTIONS.md](DEPLOYMENT_INSTRUCTIONS.md) for detailed deployment guide.

## 🛠️ Development

### Install Dependencies
```bash
npm install
cd frontend && npm install
```

### Start Frontend
```bash
cd frontend
npm run dev
```

### Build for Production
```bash
cd frontend
npm run build
```

### Deploy Contract
```bash
npx hardhat run scripts/deploy.js --network zetachain-athens
```

## 🐛 Troubleshooting

### Wallet Won't Connect
- Make sure MetaMask (or another Web3 wallet) is installed
- Check that your wallet is unlocked
- Try refreshing the page

### AI Generation Fails
- The app will automatically try fallback APIs
- Hugging Face API works without any setup
- Local Stable Diffusion is optional

### Transaction Fails
- Make sure you have enough testnet tokens
- Check that you're on the correct network
- The app will prompt you to switch networks if needed

### Build Errors
```bash
cd frontend
rm -rf node_modules .vite
npm install
npm run dev
```

## 🌟 Technologies

- **Frontend**: React 19 + Vite
- **Blockchain**: Ethers.js v6
- **Smart Contracts**: Solidity + Hardhat
- **Cross-Chain**: ZetaChain Universal Apps
- **AI**: Stable Diffusion, Hugging Face, Pollinations

## 📚 Documentation

- **[🚀 READY TO DEPLOY](READY_TO_DEPLOY.md)** - Complete deployment guide (START HERE!)
- [Quick Start - Frontend](QUICK_START_FRONTEND.md) - Fix "no body content" issue
- [Deployment Instructions](DEPLOYMENT_INSTRUCTIONS.md) - Detailed deployment steps
- [Fixes Applied](FIXES_APPLIED.md) - Summary of recent changes
- [Frontend README](frontend/REACT_README.md)
- [Wallet Connection Guide](WALLET_CONNECTION_FIX.md)

## 🎯 Usage

1. **Connect Wallet**: Click "Connect Wallet" and approve
2. **Generate Art**: Enter a prompt and click "Generate AI Art"
3. **Select Chain**: Choose which blockchain to mint on
4. **Mint NFT**: Enter name/description and click "Mint NFT"
5. **Transfer** (optional): Send your NFT to another chain

## 🔗 Links

- [ZetaChain Docs](https://www.zetachain.com/docs/)
- [Hardhat Docs](https://hardhat.org/docs)
- [Ethers.js Docs](https://docs.ethers.org/)
- [React Docs](https://react.dev/)

## 📄 License

ISC

## 🤝 Contributing

Contributions welcome! Feel free to open issues or submit PRs.

---

Built with ❤️ using ZetaChain Universal Apps
