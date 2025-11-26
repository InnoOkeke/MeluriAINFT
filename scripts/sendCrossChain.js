import hre from "hardhat";

async function main() {
  const contractAddress = process.argv[2];
  const tokenId = process.argv[3];
  const receiverAddress = process.argv[4];
  const destinationChainId = process.argv[5] || "11155111"; // Default to Sepolia

  if (!contractAddress || !tokenId || !receiverAddress) {
    console.error("Usage: npx hardhat run scripts/sendCrossChain.js --network zeta_testnet <CONTRACT_ADDRESS> <TOKEN_ID> <RECEIVER_ADDRESS> [DESTINATION_CHAIN_ID]");
    process.exit(1);
  }

  console.log("Sending NFT cross-chain...");
  console.log(`Contract: ${contractAddress}`);
  console.log(`Token ID: ${tokenId}`);
  console.log(`Receiver: ${receiverAddress}`);
  console.log(`Destination Chain ID: ${destinationChainId}`);

  const UniversalAINFT = await hre.ethers.getContractFactory("UniversalAINFT");
  const contract = UniversalAINFT.attach(contractAddress);

  // Verify ownership
  const owner = await contract.ownerOf(tokenId);
  const [signer] = await hre.ethers.getSigners();
  
  console.log(`Current owner: ${owner}`);
  console.log(`Signer: ${signer.address}`);
  
  if (owner.toLowerCase() !== signer.address.toLowerCase()) {
    console.error("Error: You are not the owner of this NFT");
    process.exit(1);
  }

  // Convert receiver address to bytes (20 bytes for EVM address)
  const receiverBytes = hre.ethers.solidityPacked(["address"], [receiverAddress]);

  console.log(`Receiver bytes: ${receiverBytes}`);

  // Send with gas for cross-chain call
  // The amount depends on destination chain gas requirements
  const tx = await contract.sendNFTCrossChain(
    tokenId,
    receiverBytes,
    destinationChainId,
    { 
      value: hre.ethers.parseEther("0.1"), // Increased gas for cross-chain call
      gasLimit: 500000
    }
  );
  
  console.log(`\nTransaction hash: ${tx.hash}`);
  console.log("Waiting for confirmation...");
  
  const receipt = await tx.wait();
  console.log(`Confirmed in block: ${receipt.blockNumber}`);
  console.log("\n✅ NFT sent cross-chain successfully!");
  console.log("The NFT will be minted on the destination chain once the cross-chain message is processed.");
  console.log("This may take a few minutes. Monitor the transaction on ZetaChain explorer.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
