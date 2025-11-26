/**
 * Example interaction script for Universal AI NFT
 * This demonstrates how to interact with the contract programmatically
 */

const { ethers } = require("hardhat");

async function main() {
  // Configuration
  const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE";
  const GATEWAY_ADDRESS = "0x6c533f7fe93fae114d0954697069df33c9b74fd7";

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("Using account:", signer.address);

  // Get contract instance
  const UniversalAINFT = await ethers.getContractFactory("UniversalAINFT");
  const contract = UniversalAINFT.attach(CONTRACT_ADDRESS);

  // Example 1: Mint an NFT
  console.log("\n=== Minting NFT ===");
  const tokenURI = "ipfs://QmExample123/metadata.json";
  const mintTx = await contract.mintAINFT(signer.address, tokenURI);
  const mintReceipt = await mintTx.wait();
  
  // Get token ID from event
  const mintEvent = mintReceipt.logs.find(log => {
    try {
      return contract.interface.parseLog(log).name === "NFTMinted";
    } catch (e) {
      return false;
    }
  });
  
  const tokenId = contract.interface.parseLog(mintEvent).args.tokenId;
  console.log("Minted Token ID:", tokenId.toString());

  // Example 2: Check NFT details
  console.log("\n=== Checking NFT Details ===");
  const owner = await contract.ownerOf(tokenId);
  const uri = await contract.tokenURI(tokenId);
  const metadata = await contract.nftMetadata(tokenId);
  
  console.log("Owner:", owner);
  console.log("Token URI:", uri);
  console.log("Metadata:", metadata);

  // Example 3: Send NFT cross-chain
  console.log("\n=== Sending NFT Cross-Chain ===");
  const receiverAddress = "0xReceiverAddressHere";
  const destinationChainId = 11155111; // Ethereum Sepolia
  
  // Convert receiver to bytes
  const receiverBytes = ethers.solidityPacked(["address"], [receiverAddress]);
  
  const sendTx = await contract.sendNFTCrossChain(
    tokenId,
    receiverBytes,
    destinationChainId,
    { value: ethers.parseEther("0.01") }
  );
  
  console.log("Send Transaction Hash:", sendTx.hash);
  await sendTx.wait();
  console.log("NFT sent cross-chain successfully!");

  // Example 4: Get contract info
  console.log("\n=== Contract Info ===");
  const totalSupply = await contract.totalSupply();
  const gateway = await contract.gateway();
  
  console.log("Total Supply:", totalSupply.toString());
  console.log("Gateway Address:", gateway);

  // Example 5: Listen to events
  console.log("\n=== Listening to Events ===");
  
  contract.on("NFTMinted", (tokenId, owner, tokenURI) => {
    console.log("NFT Minted Event:");
    console.log("  Token ID:", tokenId.toString());
    console.log("  Owner:", owner);
    console.log("  Token URI:", tokenURI);
  });

  contract.on("NFTSentCrossChain", (tokenId, from, to, chainId) => {
    console.log("NFT Sent Cross-Chain Event:");
    console.log("  Token ID:", tokenId.toString());
    console.log("  From:", from);
    console.log("  Destination Chain:", chainId.toString());
  });

  contract.on("NFTReceivedCrossChain", (tokenId, to, fromChainId) => {
    console.log("NFT Received Cross-Chain Event:");
    console.log("  Token ID:", tokenId.toString());
    console.log("  To:", to);
    console.log("  From Chain:", fromChainId.toString());
  });
}

main()
  .then(() => {
    console.log("\n✅ Interaction complete!");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
