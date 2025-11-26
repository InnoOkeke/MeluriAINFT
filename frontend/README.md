# Universal AI NFT Frontend

A web interface for minting and sending AI NFTs cross-chain using ZetaChain's Universal App architecture.

## Features

- 🎨 **Mint AI NFTs** - Create NFTs with custom metadata
- 🚀 **Cross-Chain Transfers** - Send NFTs to 6+ different blockchains
- 🔍 **NFT Explorer** - Check NFT ownership and metadata
- 📊 **Contract Info** - View total supply and gateway details

## Quick Start

### Option 1: Python HTTP Server (Recommended)

```bash
cd frontend
python -m http.server 8000
```

Then open: http://localhost:8000

### Option 2: Node.js HTTP Server

```bash
npm install -g http-server
cd frontend
http-server -p 8000
```

Then open: http://localhost:8000

### Option 3: VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click `index.html` and select "Open with Live Server"

## Setup

1. **Install MetaMask** - Browser extension for Ethereum wallets

2. **Get Testnet ZETA** - Visit the faucet:
   - https://labs.zetachain.com/get-zeta
   - Request testnet ZETA tokens for gas fees

3. **Connect Wallet** - Click "Connect Wallet" button in the app

4. **Switch to ZetaChain** - The app will prompt you to add/switch to ZetaChain Athens testnet

## Usage Guide

### 1. Mint an NFT

1. Enter recipient address (defaults to your wallet)
2. Enter metadata URI (IPFS or HTTP URL)
   - Example: `ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/metadata.json`
3. Click "Mint NFT"
4. Confirm transaction in MetaMask
5. Note the Token ID from the success message

### 2. Send NFT Cross-Chain

1. Enter the Token ID you want to send
2. Enter receiver address on destination chain
3. Select destination chain from dropdown:
   - Ethereum Sepolia
   - BSC Testnet
   - Polygon Mumbai
   - Arbitrum Sepolia
   - Base Sepolia
   - ZetaChain Athens
4. Click "Send Cross-Chain"
5. Confirm transaction (requires ~0.1 ZETA for gas)
6. Wait 2-5 minutes for cross-chain message processing

### 3. Check NFT Details

1. Enter Token ID
2. Click "Check NFT"
3. View owner, token URI, and metadata

### 4. View Contract Info

1. Click "Get Info"
2. See total NFTs minted and gateway address

## Supported Chains

| Chain | Chain ID | Testnet |
|-------|----------|---------|
| Ethereum Sepolia | 11155111 | ✅ |
| BSC Testnet | 97 | ✅ |
| Polygon Mumbai | 80001 | ✅ |
| Arbitrum Sepolia | 421614 | ✅ |
| Base Sepolia | 84532 | ✅ |
| ZetaChain Athens | 7001 | ✅ |

## Contract Details

- **Contract Address**: `0x6e9ba39CedDa49eb2647Aef28ae30da9B005fc21`
- **Network**: ZetaChain Athens Testnet
- **Gateway**: `0x6c533f7fe93fae114d0954697069df33c9b74fd7`
- **Explorer**: https://athens.explorer.zetachain.com/address/0x6e9ba39CedDa49eb2647Aef28ae30da9B005fc21

## Testing Cross-Chain Functionality

### Test Scenario 1: Mint and Check
1. Mint an NFT to your address
2. Use "Check NFT" to verify ownership
3. Confirm metadata is stored correctly

### Test Scenario 2: Cross-Chain Transfer
1. Mint an NFT on ZetaChain
2. Send it to Ethereum Sepolia (or another chain)
3. Wait 2-5 minutes for processing
4. Check on destination chain explorer
5. Verify NFT was burned on ZetaChain (Check NFT will show "not found")

### Test Scenario 3: Failed Transfer (Revert)
1. Send NFT with insufficient gas (use 0.001 ZETA)
2. Transaction should revert
3. NFT should be re-minted to original owner
4. Verify ownership restored on ZetaChain

## Troubleshooting

### "Please install MetaMask"
- Install MetaMask browser extension
- Refresh the page

### "Failed to connect wallet"
- Unlock MetaMask
- Approve connection request

### "Insufficient funds"
- Get testnet ZETA from faucet
- Ensure you have at least 0.2 ZETA

### "Transaction failed"
- Check you own the NFT
- Ensure sufficient gas (0.1 ZETA)
- Verify contract address is correct

### Cross-chain transfer not arriving
- Wait 5-10 minutes (can take time)
- Check ZetaChain explorer for transaction status
- Verify destination chain is supported

## Development

### Update Contract Address

Edit `config.js`:
```javascript
const CONFIG = {
    CONTRACT_ADDRESS: 'YOUR_NEW_CONTRACT_ADDRESS',
    // ...
};
```

### Customize Chains

Edit `config.js` to add/remove destination chains:
```javascript
DESTINATION_CHAINS: {
    'CHAIN_ID': {
        name: 'Chain Name',
        explorer: 'https://explorer.url'
    }
}
```

## Resources

- [ZetaChain Docs](https://www.zetachain.com/docs)
- [Universal Apps](https://www.zetachain.com/docs/developers/evm/gateway)
- [NFT Standards](https://www.zetachain.com/docs/developers/standards/nft)
- [Testnet Faucet](https://labs.zetachain.com/get-zeta)

## License

MIT
