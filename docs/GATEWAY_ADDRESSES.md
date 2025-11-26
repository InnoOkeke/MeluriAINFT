# ZetaChain Gateway Addresses

## Athens Testnet (7001)

### Connected EVM Chains Gateway Address
For Athens testnet, the gateway address on connected EVM chains is:
**`0x0c487a766110c85d301d96e33579c5b317fa4995`**

This is the same gateway address for:
- Ethereum Sepolia
- Base Sepolia
- Polygon Amoy (if supported)
- Linea Sepolia (if supported)
- BSC Testnet
- Arbitrum Sepolia

### ZetaChain Gateway Address
On ZetaChain Athens itself:
**`0x6c533f7fe93fae114d0954697069df33c9b74fd7`**

## How to Verify

You can verify the gateway addresses by:
1. Checking ZetaChain docs: https://www.zetachain.com/docs/
2. Using the ZetaChain CLI:
   ```bash
   zetachain q gateway list
   ```

## Important Notes

- The gateway address is the same across all connected EVM chains (except ZetaChain itself)
- ZetaChain has its own gateway address
- Always verify gateway addresses before deployment
- Gateway addresses may change between testnet and mainnet

## Current Configuration

Your `.env` file should have:
```
GATEWAY_ETHEREUM=0x0c487a766110c85d301d96e33579c5b317fa4995
GATEWAY_BASE=0x0c487a766110c85d301d96e33579c5b317fa4995
GATEWAY_POLYGON=0x0c487a766110c85d301d96e33579c5b317fa4995
GATEWAY_LINEA=0x0c487a766110c85d301d96e33579c5b317fa4995
GATEWAY_ZETACHAIN=0x6c533f7fe93fae114d0954697069df33c9b74fd7
```
