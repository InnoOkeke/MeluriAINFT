# Quick Command Reference

## Pre-Deployment

### Verify Setup
```bash
npx hardhat run scripts/verify_setup.js
```

### Compile Contracts
```bash
npx hardhat compile
```

### Clean Build
```bash
npx hardhat clean
npx hardhat compile
```

---

## Deployment

### Deploy to All 8 Networks
```bash
npx hardhat run scripts/deploy_all_chains.js --network zeta_testnet
```

### Deploy to Single Network
```bash
# ZetaChain Athens
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

---

## Frontend

### Install Dependencies
```bash
cd frontend
npm install
```

### Start Development Server
```bash
cd frontend
npm run dev
```

### Build for Production
```bash
cd frontend
npm run build
```

### Preview Production Build
```bash
cd frontend
npm run preview
```

---

## Verification

### Verify Proxy Contract
```bash
npx hardhat verify --network <network_name> <PROXY_ADDRESS>
```

Example:
```bash
npx hardhat verify --network zeta_testnet 0x1234567890123456789012345678901234567890
```

---

## Testing

### Run Tests (if available)
```bash
npx hardhat test
```

### Run Specific Test
```bash
npx hardhat test test/MeluriNFT.test.js
```

---

## Network Management

### List Available Networks
```bash
npx hardhat run scripts/list_networks.js
```

### Check Network Connection
```bash
npx hardhat run scripts/check_network.js --network <network_name>
```

---

## Troubleshooting

### Clear Cache
```bash
npx hardhat clean
rm -rf cache artifacts
npx hardhat compile
```

### Reset MetaMask Account
1. Open MetaMask
2. Settings → Advanced
3. Clear activity tab data
4. Reset account

### Check Node Version
```bash
node --version
npm --version
```

Required: Node.js v18 or higher

---

## Useful Hardhat Commands

### Show Accounts
```bash
npx hardhat accounts
```

### Show Network Config
```bash
npx hardhat config
```

### Run Console
```bash
npx hardhat console --network <network_name>
```

---

## Git Commands

### Check Status
```bash
git status
```

### Commit Changes
```bash
git add .
git commit -m "Deploy to all 8 networks"
git push
```

### Create New Branch
```bash
git checkout -b deployment-updates
```

---

## Environment Setup

### Copy Environment Template
```bash
cp .env.example .env
```

### Edit Environment File
```bash
# Windows
notepad .env

# Linux/Mac
nano .env
```

---

## Quick Deployment Workflow

```bash
# 1. Verify everything is ready
npx hardhat run scripts/verify_setup.js

# 2. Compile contracts
npx hardhat compile

# 3. Deploy to all networks
npx hardhat run scripts/deploy_all_chains.js --network zeta_testnet

# 4. Update frontend config with deployed addresses
# Edit frontend/src/config.js

# 5. Start frontend
cd frontend
npm install
npm run dev

# 6. Open browser to http://localhost:5173
```

---

## Faucet Links

Get testnet tokens:

- **ZetaChain**: https://labs.zetachain.com/get-zeta
- **Ethereum Sepolia**: https://sepoliafaucet.com/
- **Base Sepolia**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- **Polygon Amoy**: https://faucet.polygon.technology/
- **Arbitrum Sepolia**: https://faucet.quicknode.com/arbitrum/sepolia
- **BSC Testnet**: https://testnet.bnbchain.org/faucet-smart
- **Kaia Testnet**: https://faucet.kaia.io/
- **Avalanche Fuji**: https://core.app/tools/testnet-faucet/

---

## Block Explorers

View your transactions:

- **ZetaChain**: https://athens.explorer.zetachain.com
- **Ethereum Sepolia**: https://sepolia.etherscan.io
- **Base Sepolia**: https://sepolia.basescan.org
- **Polygon Amoy**: https://amoy.polygonscan.com
- **Arbitrum Sepolia**: https://sepolia.arbiscan.io
- **BSC Testnet**: https://testnet.bscscan.com
- **Kaia Testnet**: https://kairos.kaiascan.io
- **Avalanche Fuji**: https://testnet.snowtrace.io
