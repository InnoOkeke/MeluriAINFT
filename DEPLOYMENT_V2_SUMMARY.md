# Meluri NFT V2 Deployment Summary

## ✅ Successfully Deployed on 7 Chains

### Architecture
- **Escrow-based transfers**: Tokens are escrowed (not burned) during cross-chain transfers
- **Transfer tracking**: Each transfer gets a unique `transferId` for status queries
- **Revert protection**: Failed transfers automatically return tokens to original owner
- **EVM-to-EVM routing**: All transfers route through ZetaChain universal contract

### Deployed Contracts

#### ZetaChain (Universal Contract)
- **Address**: `0x0dc7DbaF6518e437039500138d8f86AFf84268Ec`
- **Network**: ZetaChain Athens Testnet (Chain ID: 7001)
- **Role**: Hub contract that routes all cross-chain transfers

#### Connected EVM Contracts

| Chain | Contract Address | Chain ID | ZRC20 Gas Token |
|-------|-----------------|----------|-----------------|
| **Sepolia** | `0x74aEe6713B8188E52d1B3f1d2E2E0B8D689312D3` | 11155111 | `0x05BA149A7bd6dC1F937fA9046A9e05C05f3b18b0` |
| **Polygon Amoy** | `0x68584b0e881B58913983e6357679Ba60a9cDBc2b` | 80002 | `0x777915D031d1e8144c90D025C594b3b8Bf07a08d` |
| **BSC Testnet** | `0x73350A3522B2A55aEb603Cfd10313E7E75B6295f` | 97 | `0xd97B1de3619ed2c6BEb3860147E30cA8A7dC9891` |
| **Avalanche Fuji** | `0x3D5887BcD5953af75D1F27fc5599dD99f1B6384c` | 43113 | `0xEe9CC614D03e7Dbe994b514079f4914a605B4719` |
| **Arbitrum Sepolia** | `0xb9b01938B8c9ed745444dc91a402365A3A7833C5` | 421614 | `0x1de70f3e971B62A0707dA18100392af14f7fB677` |
| **Kaia Testnet** | `0x1b45C638B1325234b4FF50b02F5C901d0c2E66b6` | 1001 | `0xe1A4f44b12eb72DC6da556Be9Ed1185141d7C23c` |

**Note**: Base Sepolia deployment pending (RPC compatibility issue with OpenZeppelin upgrades plugin)

### Gas Configuration

| Network | Gas Limit | Gas Price |
|---------|-----------|-----------|
| ZetaChain | 8,000,000 | 20 gwei |
| Sepolia | 3,000,000 | 5 gwei (reduced) |
| Polygon Amoy | 5,000,000 | 30 gwei |
| BSC Testnet | 5,000,000 | 10 gwei |
| Avalanche Fuji | 5,000,000 | 25 gwei |
| Arbitrum Sepolia | 5,000,000 | 0.1 gwei |
| Kaia Testnet | 5,000,000 | 25 gwei |

## New Features in V2

### 1. Transfer Tracking
```solidity
function transferCrossChain(
    uint256 tokenId,
    address receiver,
    address destination
) external payable returns (bytes32 transferId)
```
- Returns unique `transferId` for each transfer
- Query status with `getTransferStatus(transferId)`

### 2. Escrow System
- Tokens are escrowed in contract during transfer
- Only burned on successful delivery
- Automatically returned on revert

### 3. Status Queries
```solidity
struct OutgoingTransfer {
    address originalOwner;
    uint256 tokenId;
    address destinationReceiver;
    address destination;
    string uri;
    uint256 timestamp;
    bool completed;
    bool reverted;
}

function getTransferStatus(bytes32 transferId) external view returns (OutgoingTransfer memory);
function isEscrowed(uint256 tokenId) external view returns (bool);
```

### 4. Emergency Recovery
```solidity
function rescueEscrowedToken(uint256 tokenId, address to) external onlyOwner;
```

## Cross-Chain Transfer Examples

### Example 1: BSC → Sepolia
```javascript
// On BSC contract
const tx = await contract.transferCrossChain(
    tokenId,
    receiverAddress,
    sepoliaZRC20Address // 0x05BA149A7bd6dC1F937fA9046A9e05C05f3b18b0
);
const receipt = await tx.wait();
// Extract transferId from events
```

### Example 2: Polygon → ZetaChain
```javascript
// On Polygon contract
const tx = await contract.transferCrossChain(
    tokenId,
    receiverAddress,
    ethers.ZeroAddress // address(0) = ZetaChain
);
```

### Example 3: Arbitrum → Avalanche
```javascript
// On Arbitrum contract
const tx = await contract.transferCrossChain(
    tokenId,
    receiverAddress,
    avalancheZRC20Address // 0xEe9CC614D03e7Dbe994b514079f4914a605B4719
);
```

## Next Steps

1. **Update Frontend**:
   - Update contract addresses in `frontend/src/config.js`
   - Add transfer tracking UI
   - Show escrow status

2. **Testing**:
   - Test cross-chain transfers between all 7 chains
   - Verify revert handling
   - Test transfer status queries

3. **Base Sepolia**:
   - Try alternative RPC endpoint
   - Or deploy using non-upgradeable pattern

## Contract Verification

To verify contracts on block explorers:
```bash
npx hardhat verify --network sepolia 0x74aEe6713B8188E52d1B3f1d2E2E0B8D689312D3
npx hardhat verify --network polygon_amoy 0x68584b0e881B58913983e6357679Ba60a9cDBc2b
# ... etc
```

## Deployment Scripts

- **Deploy ZetaChain**: `scripts/deploy_gateway_zetachain_v2.js`
- **Deploy EVM**: `scripts/deploy_gateway_evm_v2.js`
- **Setup Connections**: `scripts/setup_connections_v2.js`
- **Deploy All**: `deploy_all_v2.bat`

## Contract Source

- **ZetaChain**: `contracts/MeluriNFT_Gateway.sol`
- **EVM Chains**: `contracts/MeluriNFT_EVM_Gateway.sol`
