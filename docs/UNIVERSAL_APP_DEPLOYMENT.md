# Universal App Deployment Guide

## Overview

The new Universal App architecture allows users to mint NFTs from **any connected chain** (Ethereum, BSC, Polygon, etc.), and the NFT is created on ZetaChain.

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  Ethereum   │────────▶│   ZetaChain  │◀────────│     BSC     │
│  (Sepolia)  │         │   (Athens)   │         │  (Testnet)  │
│             │         │              │         │             │
│  Connected  │         │  Main NFT    │         │  Connected  │
│  Contract   │         │  Contract    │         │  Contract   │
└─────────────┘         └──────────────┘         └─────────────┘
       │                        │                        │
       └────────────────────────┴────────────────────────┘
                    All NFTs stored on ZetaChain
```

## Deployment Steps

### Step 1: Deploy Main Contract on ZetaChain

```bash
npx hardhat run scripts/deploy_v2.js --network zeta_testnet
```

This deploys `UniversalAINFT_v2.sol` on ZetaChain Athens.

**Save the contract address!** You'll need it for Step 2.

### Step 2: Deploy Connected Contracts on Other Chains

Deploy on Ethereum Sepolia:
```bash
npx hardhat run scripts/deploy_connected.js --network sepolia <ZETACHAIN_CONTRACT_ADDRESS>
```

Deploy on BSC Testnet:
```bash
npx hardhat run scripts/deploy_connected.js --network bsc_testnet <ZETACHAIN_CONTRACT_ADDRESS>
```

Deploy on Polygon Mumbai:
```bash
npx hardhat run scripts/deploy_connected.js --network mumbai <ZETACHAIN_CONTRACT_ADDRESS>
```

### Step 3: Update Frontend Config

Update `frontend/src/config.js`:

```javascript
export const CONFIG = {
  // Main contract on ZetaChain
  CONTRACT_ADDRESS: '0xYourZetaChainContractAddress',
  
  // Connected contracts on other chains
  CONNECTED_CONTRACTS: {
    '11155111': '0xYourSepoliaContractAddress',  // Ethereum Sepolia
    '97': '0xYourBSCContractAddress',            // BSC Testnet
    '80001': '0xYourMumbaiContractAddress',      // Polygon Mumbai
  },
  
  // ... rest of config
}
```

## How It Works

### Minting from Ethereum (or any chain)

1. User connects wallet on Ethereum
2. User clicks "Mint NFT"
3. Transaction sent to **Connected Contract** on Ethereum
4. Connected Contract calls ZetaChain Gateway
5. Gateway forwards message to **Main Contract** on ZetaChain
6. Main Contract mints NFT on ZetaChain
7. NFT is owned by user's address

### Viewing NFTs

- All NFTs are stored on ZetaChain
- Users can view their NFTs by connecting to ZetaChain
- Frontend shows NFTs from ZetaChain regardless of which chain user is on

### Transferring NFTs

- NFTs can be transferred to other chains
- Burned on ZetaChain, minted on destination chain
- Cross-chain messaging handled by ZetaChain Gateway

## Benefits

✅ **Mint from anywhere** - Users don't need to bridge to ZetaChain first  
✅ **Single source of truth** - All NFTs on ZetaChain  
✅ **Lower gas costs** - Minting on ZetaChain is cheaper  
✅ **True Universal App** - Works across all connected chains  

## Network Configuration

Add these networks to `hardhat.config.js`:

```javascript
networks: {
  zeta_testnet: {
    url: "https://zetachain-athens-evm.blockpi.network/v1/rpc/public",
    chainId: 7001,
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  },
  sepolia: {
    url: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    chainId: 11155111,
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  },
  bsc_testnet: {
    url: "https://data-seed-prebsc-1-s1.binance.org:8545",
    chainId: 97,
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  },
  mumbai: {
    url: "https://rpc-mumbai.maticvigil.com",
    chainId: 80001,
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  },
}
```

## Testing

### Test Minting from Ethereum

1. Connect MetaMask to Ethereum Sepolia
2. Go to your dApp
3. Click "Mint NFT"
4. Confirm transaction
5. Switch to ZetaChain to see your NFT!

### Test Minting from BSC

1. Connect MetaMask to BSC Testnet
2. Go to your dApp
3. Click "Mint NFT"
4. Confirm transaction
5. Switch to ZetaChain to see your NFT!

## Gas Costs

- **Minting from Ethereum**: ~$0.50-1.00 (Sepolia testnet)
- **Minting from BSC**: ~$0.10-0.20 (BSC testnet)
- **Minting on ZetaChain**: ~$0.01-0.05 (ZetaChain testnet)
- **Cross-chain transfer**: ~0.01 ZETA

## Troubleshooting

### "Transaction reverted"
- Make sure you have enough gas on the source chain
- Check that gateway address is correct
- Verify ZetaChain contract address is correct

### "NFT not showing"
- Switch to ZetaChain network
- NFTs are stored on ZetaChain, not source chain
- Refresh the NFT gallery

### "Connected contract not found"
- Deploy connected contract on that chain first
- Update frontend config with contract address

## Summary

With this Universal App architecture:
- ✅ Users can mint from **any chain**
- ✅ NFTs are stored on **ZetaChain**
- ✅ **Lower costs** than bridging
- ✅ **Better UX** - no manual bridging needed

This is the true power of ZetaChain Universal Apps! 🚀
