# ZetaChain Gateway Addresses - Athens Testnet

## Gateway Addresses by Network

### ZetaChain Athens (7001)
- **Gateway ZEVM**: `0x6c533f7fE93fAE114d0954697069Df33C9B74fD7`

### EVM Testnets - Gateway EVM
All EVM testnets use the same Gateway address:
- **Gateway EVM**: `0x0c487a766110c85d301d96e33579c5b317fa4995`

Supported Networks:
- Ethereum Sepolia (11155111)
- Base Sepolia (84532)
- Polygon Amoy (80002)
- BSC Testnet (97)
- Arbitrum Sepolia (421614)
- Avalanche Fuji (43113)
- Kaia Kairos (1001)

## Key Points

1. **EVM → ZetaChain**: Use `depositAndCall()` on Gateway EVM
2. **ZetaChain → EVM**: Use `call()` on Gateway ZEVM with ZRC20 gas payment
3. **EVM → EVM**: Route through ZetaChain (EVM → ZetaChain → EVM)

## Gas Requirements

- **From EVM**: Send native token (ETH/BNB/MATIC) as msg.value
- **From ZetaChain**: Transfer ZRC20 tokens to contract for gas

## Contract Functions

### Gateway EVM (on EVM chains)
```solidity
function depositAndCall(
    address receiver,      // Universal contract on ZetaChain
    bytes calldata payload,
    RevertOptions calldata revertOptions
) external payable;
```

### Gateway ZEVM (on ZetaChain)
```solidity
function call(
    bytes memory receiver,     // Connected contract on EVM
    address zrc20,            // ZRC20 for gas payment
    bytes calldata message,
    CallOptions calldata callOptions,
    RevertOptions calldata revertOptions
) external;
```

## References
- Network Contracts: https://www.zetachain.com/docs/reference/network/contracts/
- RPC Endpoints: https://www.zetachain.com/docs/reference/network/api
- EVM Integration: https://www.zetachain.com/docs/developers/evm/cctx
