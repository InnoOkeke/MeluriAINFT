# Deployment Status

## ✅ Deployed Contracts

### ZetaChain Athens Testnet
- **Contract Address:** `0x1E56eb8A5D345FFE83d2935e06D811905ce9890C`
- **Network:** ZetaChain Athens (Chain ID: 7001)
- **Gateway:** `0x6c533f7fe93fae114d0954697069df33c9b74fd7`
- **Explorer:** https://athens.explorer.zetachain.com/address/0x1E56eb8A5D345FFE83d2935e06D811905ce9890C
- **Status:** ✅ Deployed and initialized

### Base Sepolia
- **Contract Address:** `0xE06A265d64Eb33756245D92EE3fbd94F8B45080C`
- **Network:** Base Sepolia (Chain ID: 84532)
- **Gateway:** `0x0c487a766110c85d301d96e33579c5b317fa4995`
- **Status:** ⚠️ Deployed but initialization failed

### Ethereum Sepolia
- **Status:** ⏳ Pending deployment

## Next Steps

1. **Fix Base Sepolia initialization** - Need to check gateway compatibility
2. **Deploy to Ethereum Sepolia** - Once Base is working
3. **Update frontend config** - Add all contract addresses
4. **Test cross-chain minting** - Mint from each chain

## Current Issue

Base Sepolia initialization is reverting. This could be because:
- Gateway address might be different for Base
- UniversalNFTCore might not be compatible with Base yet
- Need to check ZetaChain docs for Base-specific configuration

## Deployer Address

`0x9fa9C08Bb83cf70774fd38Ee638ad98D4B6CBDCf`

Make sure this address has:
- ✅ ZETA tokens on ZetaChain Athens
- ⏳ ETH on Base Sepolia
- ⏳ ETH on Ethereum Sepolia
