# Universal AI NFT - Testing Guide

Complete guide for testing the cross-chain NFT functionality.

## 🚀 Quick Start

### 1. Frontend is Running
The frontend server is now running at: **http://localhost:8000**

Open this URL in your browser to access the DApp.

### 2. Prerequisites Checklist

- ✅ MetaMask installed
- ✅ ZetaChain Athens testnet added to MetaMask
- ✅ Testnet ZETA tokens in wallet (get from https://labs.zetachain.com/get-zeta)
- ✅ Contract deployed at: `0x6e9ba39CedDa49eb2647Aef28ae30da9B005fc21`

## 📋 Test Scenarios

### Test 1: Basic NFT Minting ✅

**Objective**: Verify NFT minting works correctly

**Steps**:
1. Open http://localhost:8000
2. Click "Connect Wallet"
3. Approve MetaMask connection
4. Ensure you're on ZetaChain Athens (chain ID 7001)
5. In "Mint AI NFT" section:
   - Recipient: Your wallet address (auto-filled)
   - Token URI: `ipfs://QmTest123/metadata.json`
6. Click "Mint NFT"
7. Confirm transaction in MetaMask
8. Wait for confirmation

**Expected Result**:
- Success message with Token ID (e.g., "Token ID: 1")
- Transaction visible on ZetaChain explorer
- NFT minted to your address

**Verify**:
```bash
npx hardhat run scripts/checkNFT.js --network zeta_testnet 0x6e9ba39CedDa49eb2647Aef28ae30da9B005fc21 1
```

---

### Test 2: Check NFT Details ✅

**Objective**: Verify NFT data retrieval

**Steps**:
1. In "Check NFT" section, enter Token ID from Test 1
2. Click "Check NFT"

**Expected Result**:
- Owner: Your wallet address
- Token URI: The metadata URI you entered
- Metadata: Same as Token URI

---

### Test 3: Cross-Chain Transfer to Ethereum Sepolia 🌉

**Objective**: Test cross-chain NFT transfer

**Prerequisites**:
- At least 0.2 ZETA in wallet for gas
- NFT minted from Test 1

**Steps**:
1. In "Send NFT Cross-Chain" section:
   - Token ID: Enter your NFT token ID
   - Receiver Address: Your wallet address (or another address)
   - Destination Chain: Select "Ethereum Sepolia"
2. Click "Send Cross-Chain"
3. Confirm transaction in MetaMask (will cost ~0.1 ZETA)
4. Wait for confirmation

**Expected Result**:
- Success message
- Transaction hash displayed
- NFT burned on ZetaChain

**Verify on ZetaChain** (should fail - NFT burned):
```bash
npx hardhat run scripts/checkNFT.js --network zeta_testnet 0x6e9ba39CedDa49eb2647Aef28ae30da9B005fc21 1
```

**Monitor Cross-Chain**:
- Check ZetaChain explorer: https://athens.explorer.zetachain.com/
- Look for your transaction
- Wait 2-5 minutes for cross-chain processing
- NFT should appear on Ethereum Sepolia

---

### Test 4: Cross-Chain Transfer to BSC Testnet 🌉

**Objective**: Test transfer to different chain

**Steps**:
1. Mint a new NFT (Test 1)
2. Send to BSC Testnet (chain ID: 97)
3. Use receiver address on BSC

**Expected Result**:
- NFT burned on ZetaChain
- NFT minted on BSC Testnet after 2-5 minutes

---

### Test 5: Contract Info Display 📊

**Objective**: Verify contract information retrieval

**Steps**:
1. In "Contract Info" section
2. Click "Get Info"

**Expected Result**:
- Total Supply: Number of NFTs minted
- Gateway: `0x6c533f7fe93fae114d0954697069df33c9b74fd7`

---

### Test 6: Multiple NFTs 🎨

**Objective**: Test minting multiple NFTs

**Steps**:
1. Mint NFT with URI: `ipfs://QmTest1/metadata.json`
2. Mint NFT with URI: `ipfs://QmTest2/metadata.json`
3. Mint NFT with URI: `ipfs://QmTest3/metadata.json`
4. Check each NFT's details

**Expected Result**:
- Token IDs increment: 1, 2, 3, etc.
- Each has correct metadata
- Total supply increases

---

### Test 7: Revert Handling (Advanced) 🔄

**Objective**: Test automatic revert when transfer fails

**Steps**:
1. Mint an NFT
2. Try to send cross-chain with very low gas (0.001 ZETA)
3. Transaction should fail/revert

**Expected Result**:
- Transaction reverts
- NFT should be re-minted to original owner (if revert handler works)
- Check NFT ownership to verify

**Note**: This tests the `onRevert` function in the contract.

---

## 🧪 Command Line Testing

### Mint via Script
```bash
npx hardhat run scripts/mint.js --network zeta_testnet 0x6e9ba39CedDa49eb2647Aef28ae30da9B005fc21 YOUR_ADDRESS ipfs://QmTest/metadata.json
```

### Send Cross-Chain via Script
```bash
npx hardhat run scripts/sendCrossChain.js --network zeta_testnet 0x6e9ba39CedDa49eb2647Aef28ae30da9B005fc21 TOKEN_ID RECEIVER_ADDRESS 11155111
```

### Check NFT via Script
```bash
npx hardhat run scripts/checkNFT.js --network zeta_testnet 0x6e9ba39CedDa49eb2647Aef28ae30da9B005fc21 TOKEN_ID
```

---

## 🔍 Verification Checklist

After testing, verify:

- [ ] NFTs mint successfully with correct metadata
- [ ] NFT ownership is tracked correctly
- [ ] Cross-chain transfers burn NFT on source chain
- [ ] Cross-chain messages are sent via Gateway
- [ ] Contract info displays correctly
- [ ] Multiple NFTs can be minted
- [ ] Token IDs increment properly
- [ ] Frontend UI is responsive and user-friendly
- [ ] Error messages are clear and helpful
- [ ] MetaMask integration works smoothly

---

## 🐛 Common Issues & Solutions

### Issue: "Insufficient funds"
**Solution**: Get more testnet ZETA from https://labs.zetachain.com/get-zeta

### Issue: "Not the owner"
**Solution**: Ensure you're using the wallet that owns the NFT

### Issue: "NFT not found"
**Solution**: 
- Check token ID is correct
- NFT may have been burned (sent cross-chain)
- Verify on explorer

### Issue: Cross-chain transfer not arriving
**Solution**:
- Wait longer (can take 5-10 minutes)
- Check ZetaChain explorer for transaction status
- Verify destination chain is supported
- Ensure sufficient gas was provided

### Issue: "Please connect wallet first"
**Solution**: Click "Connect Wallet" and approve in MetaMask

---

## 📊 Expected Gas Costs

| Operation | Estimated Gas (ZETA) |
|-----------|---------------------|
| Mint NFT | ~0.01 ZETA |
| Send Cross-Chain | ~0.1 ZETA |
| Check NFT | Free (read-only) |
| Get Contract Info | Free (read-only) |

---

## 🌐 Supported Destination Chains

| Chain | Chain ID | Status |
|-------|----------|--------|
| Ethereum Sepolia | 11155111 | ✅ Supported |
| BSC Testnet | 97 | ✅ Supported |
| Polygon Mumbai | 80001 | ✅ Supported |
| Arbitrum Sepolia | 421614 | ✅ Supported |
| Base Sepolia | 84532 | ✅ Supported |
| ZetaChain Athens | 7001 | ✅ Supported |

---

## 📝 Test Results Template

Use this template to document your test results:

```
Test Date: ___________
Tester: ___________

Test 1 - Basic Minting: ☐ Pass ☐ Fail
Token ID: _____
Notes: ___________

Test 2 - Check NFT: ☐ Pass ☐ Fail
Notes: ___________

Test 3 - Cross-Chain (Sepolia): ☐ Pass ☐ Fail
Transaction Hash: ___________
Time to Complete: _____ minutes
Notes: ___________

Test 4 - Cross-Chain (BSC): ☐ Pass ☐ Fail
Transaction Hash: ___________
Notes: ___________

Test 5 - Contract Info: ☐ Pass ☐ Fail
Total Supply: _____
Notes: ___________

Test 6 - Multiple NFTs: ☐ Pass ☐ Fail
Token IDs: _____
Notes: ___________

Overall Result: ☐ All Pass ☐ Some Failures
```

---

## 🎯 Success Criteria

The Universal AI NFT system is working correctly if:

1. ✅ NFTs can be minted with custom metadata
2. ✅ NFT ownership is tracked accurately
3. ✅ Cross-chain transfers burn NFT on source
4. ✅ Gateway receives cross-chain messages
5. ✅ Frontend UI is functional and intuitive
6. ✅ All supported chains can receive NFTs
7. ✅ Error handling works properly
8. ✅ Gas estimation is reasonable

---

## 📚 Additional Resources

- **Contract Explorer**: https://athens.explorer.zetachain.com/address/0x6e9ba39CedDa49eb2647Aef28ae30da9B005fc21
- **ZetaChain Docs**: https://www.zetachain.com/docs
- **Testnet Faucet**: https://labs.zetachain.com/get-zeta
- **Gateway Docs**: https://www.zetachain.com/docs/developers/evm/gateway
- **NFT Standards**: https://www.zetachain.com/docs/developers/standards/nft

---

## 🚀 Next Steps

After successful testing:

1. Deploy to mainnet (when ready)
2. Add more destination chains
3. Implement metadata generation
4. Add NFT marketplace integration
5. Create mobile app version
6. Add analytics dashboard
7. Implement batch minting
8. Add royalty support

Happy Testing! 🎉
