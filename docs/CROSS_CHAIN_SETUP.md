# Cross-Chain Transfer Setup

## Issue
Cross-chain transfers are failing because the `universal` contract address hasn't been set on the deployed contracts.

## Solution
Run the setup script on each network to configure the universal address.

### Step 1: Setup on ZetaChain Athens
```bash
npx hardhat run scripts/setup_universal.js --network zetachain
```

### Step 2: Setup on Ethereum Sepolia
```bash
npx hardhat run scripts/setup_universal.js --network ethereum
```

### Step 3: Setup on Base Sepolia
```bash
npx hardhat run scripts/setup_universal.js --network base
```

## What This Does
The script sets the `universal` contract address to the contract's own address (`0x1E56eb8A5D345FFE83d2935e06D811905ce9890C`) on each chain. This tells the contract where to send cross-chain messages.

## Verification
After running the scripts, you can verify by:
1. Checking the console output shows "✅ Universal address set successfully!"
2. Trying a cross-chain transfer in the frontend
3. The transfer should now work without reverting

## Note
- You must use the same private key that deployed the contract (the owner)
- The private key should be in your `.env` file as `PRIVATE_KEY`
- Each network needs to be configured separately

## Alternative: Manual Setup
If you prefer to set it manually, you can call the `setUniversal()` function on each deployed contract with the contract's own address as the parameter.
