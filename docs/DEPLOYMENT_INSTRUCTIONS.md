# Deployment Instructions for All 8 ZetaChain-Supported Networks

## Overview
This guide will help you deploy the **MeluriNFT** contract (UUPS upgradeable) to all 8 ZetaChain-supported testnet networks.

The MeluriNFT contract uses:
- ✅ ZetaChain's official UniversalNFTCore standard
- ✅ OpenZeppelin's UUPS upgradeable proxy pattern
- ✅ ERC721 with enumerable and URI storage extensions
- ✅ Cross-chain transfer capabilities via ZetaChain Gateway

## Supported Networks
1. **ZetaChain Athens** (Chain ID: 7001)
2. **Ethereum Sepolia** (Chain ID: 11155111)
3. **Base Sepolia** (Chain ID: 84532)
4. **Polygon Amoy** (Chain ID: 80002)
5. **Arbitrum Sepolia** (Chain ID: 421614)
6. **BSC Testnet** (Chain ID: 97)
7. **Kaia Testnet** (Chain ID: 1001)
8. **Avalanche Fuji** (Chain ID: 43113)

## Prerequisites

### 1. Get Testnet Tokens
You'll need native tokens on each network:

- **ZetaChain Athens**: Get ZETA from [ZetaChain Faucet](https://labs.zetachain.com/get-zeta)
- **Ethereum Sepolia**: Get ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
- **Base Sepolia**: Get ETH from [Base Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
- **Polygon Amoy**: Get MATIC from [Polygon Faucet](https://faucet.polygon.technology/)
- **Arbitrum Sepolia**: Get ETH from [Arbitrum Faucet](https://faucet.quicknode.com/arbitrum/sepolia)
- **BSC Testnet**: Get BNB from [BSC Faucet](https://testnet.bnbchain.org/faucet-smart)
- **Kaia Testnet**: Get KAIA from [Kaia Faucet](https://faucet.kaia.io/)
- **Avalanche Fuji**: Get AVAX from [Avalanche Faucet](https://core.app/tools/testnet-faucet/)

### 2. Configure Environment
Make sure your `.env` file has your private key:
```bash
PRIVATE_KEY=your_private_key_here
```

## Deployment Options

### Option 1: Verify Setup First (Recommended)
```bash
npx hardhat run scripts/verify_setup.js
```

This checks:
- Private key configuration
- Network configurations
- Contract compilation
- Frontend setup

### Option 2: Deploy to All Networks at Once
```bash
npx hardhat run scripts/deploy_all_chains.js --network zeta_testnet
```

This will:
- Deploy MeluriNFT (UUPS proxy) to all 8 networks sequentially
- Save deployment addresses to `deployments/deployment-[timestamp].json`
- Print configuration updates for `config.js` and `.env`

### Option 3: Deploy to Individual Networks

Deploy to specific networks one at a time:

```bash
# ZetaChain
npx hardhat run scripts/deploy_single.js --network zeta_testnet

# Ethereum Sepolia
npx hardhat run scripts/deploy_single.js --network sepolia

# Base Sepolia
npx hardhat run scripts/deploy_single.js --network base_sepolia

# Polygon Amoy
npx hardhat run scripts/deploy_single.js --network polygon_amoy

# Arbitrum Sepolia
npx hardhat run scripts/deploy_single.js --network arbitrum_sepolia

# BSC Testnet
npx hardhat run scripts/deploy_single.js --network bsc_testnet

# Kaia Testnet
npx hardhat run scripts/deploy_single.js --network kaia_testnet

# Avalanche Fuji
npx hardhat run scripts/deploy_single.js --network avalanche_fuji
```

## Post-Deployment Steps

### 1. Update Frontend Configuration

After deployment, update `frontend/src/config.js` with the contract addresses:

```javascript
CONTRACTS: {
  '7001': '0x...', // ZetaChain Athens
  '11155111': '0x...', // Ethereum Sepolia
  '84532': '0x...', // Base Sepolia
  '80002': '0x...', // Polygon Amoy
  '421614': '0x...', // Arbitrum Sepolia
  '97': '0x...', // BSC Testnet
  '1001': '0x...', // Kaia Testnet
  '43113': '0x...', // Avalanche Fuji
},
```

### 2. Update .env File

Add the deployed contract addresses to your `.env`:

```bash
CONTRACT_ZETACHAIN=0x...
CONTRACT_SEPOLIA=0x...
CONTRACT_BASE=0x...
CONTRACT_POLYGON=0x...
CONTRACT_ARBITRUM=0x...
CONTRACT_BSC=0x...
CONTRACT_KAIA=0x...
CONTRACT_AVALANCHE=0x...
```

### 3. Start the Frontend

```bash
# Windows
start-react.bat

# Linux/Mac
cd frontend && npm install && npm run dev
```

The app will be available at `http://localhost:5173`

## Testing Cross-Chain Functionality

1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask
2. **Switch Networks**: Use the network dropdown to switch between chains
3. **Mint NFT**: Generate an AI image and mint it on any chain
4. **Transfer Cross-Chain**: Click "Transfer" on any NFT to send it to another chain

## Troubleshooting

### Issue: "Insufficient funds for gas"
**Solution**: Make sure you have enough native tokens on the network you're deploying to.

### Issue: "Network not found"
**Solution**: Check that the network is configured in `hardhat.config.js` and your RPC URL is correct.

### Issue: "Nonce too high"
**Solution**: Reset your MetaMask account or wait a few minutes and try again.

### Issue: Frontend shows "Only headers, no body content"
**Solution**: Make sure you're running the frontend from the `frontend` directory using `npm run dev`, not opening the root `index.html` file.

## Verification

After deployment, verify your proxy contracts on block explorers:

```bash
# Example for ZetaChain
npx hardhat verify --network zeta_testnet <PROXY_ADDRESS>
```

Note: The deployment scripts will show you the exact verification command for each network.

## Gateway Addresses Reference

- **ZetaChain**: `0x6c533f7fe93fae114d0954697069df33c9b74fd7`
- **All Connected Chains**: `0x0c487a766110c85d301d96e33579c5b317fa4995`

## Support

For issues or questions:
- Check the [ZetaChain Documentation](https://www.zetachain.com/docs/)
- Visit the [ZetaChain Discord](https://discord.gg/zetachain)
