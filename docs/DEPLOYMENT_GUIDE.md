# Deployment Guide - Universal AI NFT

## Step-by-Step Deployment to ZetaChain Testnet

### 1. Prerequisites

Ensure you have:
- Node.js v18+ installed
- MetaMask wallet with ZetaChain Athens testnet configured
- Testnet ZETA tokens from https://labs.zetachain.com/get-zeta

### 2. Environment Setup

```bash
# Navigate to project directory
cd universal-ai-nft

# Install dependencies
npm install

# Create .env file
copy .env.example .env
```

Edit `.env` and add your private key:
```
PRIVATE_KEY=your_private_key_without_0x_prefix
GATEWAY_ADDRESS=0x6c533f7fe93fae114d0954697069df33c9b74fd7
```

**⚠️ IMPORTANT**: Never commit your `.env` file or share your private key!

### 3. Compile Contracts

```bash
npm run compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

### 4. Deploy to ZetaChain Testnet

```bash
npm run deploy
```

Expected output:
```
Deploying Universal AI NFT contract to ZetaChain testnet...
Universal AI NFT deployed to: 0x...
Gateway address: 0x6c533f7fe93fae114d0954697069df33c9b74fd7

Verify with:
npx hardhat verify --network zeta_testnet 0x... 0x6c533f7fe93fae114d0954697069df33c9b74fd7
```

**Save the deployed contract address!** You'll need it for all interactions.

### 5. Verify Contract (Optional but Recommended)

```bash
npx hardhat verify --network zeta_testnet <YOUR_CONTRACT_ADDRESS> 0x6c533f7fe93fae114d0954697069df33c9b74fd7
```

### 6. Test Minting

```bash
npm run mint <CONTRACT_ADDRESS> <RECIPIENT_ADDRESS> <TOKEN_URI>
```

Example:
```bash
npm run mint 0x123... 0xYourAddress ipfs://QmExample/metadata.json
```

Expected output:
```
Minting AI NFT...
Contract: 0x...
Recipient: 0x...
Token URI: ipfs://...
Transaction hash: 0x...
NFT minted successfully!
Token ID: 1
Total NFTs minted: 1
```

### 7. Test Cross-Chain Transfer

```bash
npm run send <CONTRACT_ADDRESS> <TOKEN_ID> <RECEIVER_ADDRESS> <DESTINATION_CHAIN_ID>
```

Example (send to Ethereum Sepolia):
```bash
npm run send 0x123... 1 0xReceiverAddress 11155111
```

Expected output:
```
Sending NFT cross-chain...
Transaction hash: 0x...
NFT sent cross-chain successfully!
The NFT will be minted on the destination chain once the cross-chain message is processed.
```

### 8. Check NFT Status

```bash
npm run check <CONTRACT_ADDRESS> <TOKEN_ID>
```

Example:
```bash
npm run check 0x123... 1
```

### 9. Launch Frontend

```bash
npm run frontend
```

Then open http://localhost:8000 in your browser.

## Network Configuration

### ZetaChain Athens Testnet

- **Chain ID**: 7001 (0x1B59)
- **RPC URL**: https://zetachain-athens-evm.blockpi.network/v1/rpc/public
- **Gateway Address**: 0x6c533f7fe93fae114d0954697069df33c9b74fd7
- **Explorer**: https://athens.explorer.zetachain.com/
- **Faucet**: https://labs.zetachain.com/get-zeta

### Supported Destination Chains

| Chain | Chain ID | Testnet |
|-------|----------|---------|
| Ethereum Sepolia | 11155111 | Yes |
| BSC Testnet | 97 | Yes |
| Polygon Mumbai | 80001 | Yes |
| ZetaChain Athens | 7001 | Yes |

## Troubleshooting

### Issue: "insufficient funds for gas"
**Solution**: Get more testnet ZETA from the faucet

### Issue: "Caller is not the gateway"
**Solution**: Ensure you're using the correct Gateway address in deployment

### Issue: "Not the owner"
**Solution**: You can only send NFTs you own. Check ownership with `npm run check`

### Issue: Frontend not connecting
**Solution**: 
1. Ensure MetaMask is installed
2. Add ZetaChain Athens testnet to MetaMask
3. Switch to ZetaChain network in MetaMask

## Next Steps

1. **Customize Metadata**: Create proper IPFS metadata for your AI NFTs
2. **Add AI Integration**: Connect to AI services for dynamic NFT generation
3. **Deploy to Mainnet**: When ready, update network config for mainnet
4. **Build Advanced UI**: Enhance the frontend with more features

## Support

- ZetaChain Discord: https://discord.gg/zetachain
- Documentation: https://www.zetachain.com/docs
- GitHub Issues: Create an issue in your repository

## Security Checklist

- [ ] Private key stored securely in `.env`
- [ ] `.env` added to `.gitignore`
- [ ] Contract verified on explorer
- [ ] Tested on testnet before mainnet
- [ ] Gateway address verified
- [ ] Sufficient gas for cross-chain calls

## Contract Addresses

After deployment, record your addresses here:

- **Universal AI NFT Contract**: `<YOUR_CONTRACT_ADDRESS>`
- **Gateway Contract**: `0x6c533f7fe93fae114d0954697069df33c9b74fd7`
- **Deployment Transaction**: `<TX_HASH>`
- **Deployment Block**: `<BLOCK_NUMBER>`

---

**Ready to mint and launch everywhere! 🚀**
