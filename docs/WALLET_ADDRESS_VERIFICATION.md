# Wallet Address Verification ✅

## Summary

**Good news!** The app is already correctly using the **connected wallet address** everywhere, not any hardcoded or private key addresses.

## Frontend (React App) ✅

### How It Works

1. **User connects wallet** → MetaMask/Web3 wallet
2. **App gets address** → `const address = await signer.getAddress()`
3. **Stores in state** → `setUserAddress(address)`
4. **Uses everywhere** → All components use `userAddress` prop

### Where `userAddress` is Used

#### ✅ Header Component
```javascript
// Shows connected wallet address
{`${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`}
```

#### ✅ MintNFT Component
```javascript
// Mints NFT to connected wallet
const tx = await contract.mintAINFT(userAddress, metadataUri)

// Stores owner as connected wallet
owner: userAddress
```

#### ✅ MyNFTs Component
```javascript
// Checks if connected wallet owns the NFT
if (owner.toLowerCase() === userAddress.toLowerCase()) {
  // Add to gallery
}
```

#### ✅ TransferModal Component
```javascript
// Uses connected wallet as default receiver
const receiver = receiverAddress.trim() || userAddress
```

### No Hardcoded Addresses

Verified that there are **NO hardcoded wallet addresses** in:
- ✅ `frontend/src/App.jsx`
- ✅ `frontend/src/components/*.jsx`
- ✅ `frontend/src/config.js` (only has contract address, which is correct)

## Backend Scripts ✅

### How They Work

All Hardhat scripts use `getSigners()` which gets the wallet from:
1. **Hardhat config** → Uses `PRIVATE_KEY` from `.env`
2. **Or MetaMask** → If using Hardhat with MetaMask
3. **Or Ledger** → If using hardware wallet

### Scripts Using Connected Wallet

#### ✅ deploy.js
```javascript
// Uses first signer from Hardhat config
const [deployer] = await hre.ethers.getSigners()
```

#### ✅ mint.js
```javascript
// Uses provided address or first signer
const recipientAddress = process.argv[3] || (await hre.ethers.getSigners())[0].address
```

#### ✅ sendCrossChain.js
```javascript
// Verifies ownership with signer
const [signer] = await hre.ethers.getSigners()
if (owner.toLowerCase() !== signer.address.toLowerCase()) {
  console.error("Error: You are not the owner of this NFT")
}
```

## Configuration Files

### ✅ hardhat.config.js
```javascript
accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
```
- Uses `PRIVATE_KEY` from `.env` for deployment
- This is **correct** - deployment scripts need a funded account
- Frontend doesn't use this - it uses connected wallet

### ✅ frontend/src/config.js
```javascript
CONTRACT_ADDRESS: '0x6e9ba39CedDa49eb2647Aef28ae30da9B005fc21'
```
- Only has **contract address** (the deployed smart contract)
- No wallet addresses
- This is **correct**

### ✅ .env.example
```
PRIVATE_KEY=your_private_key_here
GATEWAY_ADDRESS=0x6c533f7fe93fae114d0954697069df33c9b74fd7
```
- Shows what's needed for deployment
- User adds their own private key
- Not used by frontend

## How Addresses Flow

### Frontend Flow
```
1. User clicks "Connect Wallet"
   ↓
2. MetaMask popup appears
   ↓
3. User approves connection
   ↓
4. App gets address: await signer.getAddress()
   ↓
5. Stores in state: setUserAddress(address)
   ↓
6. All components use: userAddress prop
   ↓
7. Minting: contract.mintAINFT(userAddress, ...)
   ↓
8. NFT minted to connected wallet ✅
```

### Script Flow
```
1. Run: npx hardhat run scripts/mint.js
   ↓
2. Hardhat loads config
   ↓
3. Gets signer from PRIVATE_KEY in .env
   ↓
4. Script uses: (await getSigners())[0].address
   ↓
5. Mints to that address ✅
```

## Security

### ✅ Frontend
- **No private keys** - Never touches private keys
- **Uses wallet** - All signing done by MetaMask
- **User controlled** - User approves every transaction
- **No hardcoded addresses** - Always uses connected wallet

### ✅ Scripts
- **Private key in .env** - Not committed to git
- **User's own key** - Each user has their own
- **Optional** - Can use MetaMask with Hardhat instead

## Testing

### Test Frontend
1. Connect wallet with MetaMask
2. Check header shows your address
3. Mint NFT
4. Check NFT is minted to your address
5. View in gallery - should show your NFTs

### Test Scripts
1. Add your `PRIVATE_KEY` to `.env`
2. Run: `npx hardhat run scripts/mint.js --network zeta_testnet <CONTRACT>`
3. NFT minted to your address from `.env`

## Common Questions

### Q: Where does the frontend get wallet addresses?
**A:** From the connected wallet (MetaMask). User connects, app gets address via `signer.getAddress()`.

### Q: Does the frontend use private keys?
**A:** No! Never. All signing is done by the wallet (MetaMask).

### Q: What about the PRIVATE_KEY in .env?
**A:** That's only for Hardhat scripts (deployment, testing). The frontend never sees it.

### Q: Can I use a different wallet?
**A:** Yes! The frontend works with any Web3 wallet (MetaMask, Coinbase Wallet, etc.).

### Q: Is my private key safe?
**A:** Yes! It's only in your local `.env` file (not committed to git). The frontend never uses it.

## Summary

✅ **Frontend uses connected wallet** - Gets address from MetaMask  
✅ **No hardcoded addresses** - All dynamic from wallet  
✅ **Scripts use .env** - For deployment only  
✅ **Secure** - Private keys never exposed  
✅ **User controlled** - User approves all transactions  

Everything is already set up correctly! The app uses the connected wallet address everywhere in the frontend, and deployment scripts use the private key from `.env` (which is correct for deployment).

No changes needed! 🎉
