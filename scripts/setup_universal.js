import hre from "hardhat";

async function main() {
  // Contract addresses per network
  const CONTRACT_ADDRESSES = {
    zeta_testnet: "0x1E56eb8A5D345FFE83d2935e06D811905ce9890C",
    sepolia: "0x1E56eb8A5D345FFE83d2935e06D811905ce9890C",
    somnia_testnet: "0xD64086b23C7d4499C0FD7524a47E404994097BA0",
    celo_sepolia: "0xD64086b23C7d4499C0FD7524a47E404994097BA0",
    monad_testnet: "0xD64086b23C7d4499C0FD7524a47E404994097BA0",
  };
  
  const contractAddress = CONTRACT_ADDRESSES[hre.network.name];
  
  if (!contractAddress) {
    console.error(`❌ No contract address configured for ${hre.network.name}`);
    return;
  }
  
  const network = hre.network.name;
  console.log(`\nSetting up universal contract address on ${network}...`);
  console.log(`Contract address: ${contractAddress}`);
  
  // Get signer from the network configuration
  const signers = await hre.ethers.getSigners();
  if (!signers || signers.length === 0) {
    console.error("❌ No signer available. Make sure PRIVATE_KEY is set in .env");
    return;
  }
  
  const signer = signers[0];
  console.log("Using account:", signer.address);
  console.log("Signer type:", typeof signer);
  console.log("Has sendTransaction?", typeof signer.sendTransaction);
  
  // Get the contract instance with signer
  const MeluriNFT = await hre.ethers.getContractAt("MeluriNFT", contractAddress, signer);
  console.log("Contract runner:", MeluriNFT.runner ? "exists" : "missing");
  
  // Check current universal address
  try {
    // Check ownership first
    const owner = await MeluriNFT.owner();
    console.log("Contract owner:", owner);
    console.log("Your address:", signer.address);
    
    if (owner.toLowerCase() !== signer.address.toLowerCase()) {
      console.error("❌ You are not the owner of this contract!");
      console.error("   Contract owner:", owner);
      console.error("   Your address:", signer.address);
      return;
    }
    
    const currentUniversal = await MeluriNFT.universal();
    console.log("Current universal address:", currentUniversal);
    
    if (currentUniversal === hre.ethers.ZeroAddress || currentUniversal === "0x0000000000000000000000000000000000000000") {
      console.log("\n⚠️  Universal address not set. Setting it now...");
      
      // Set the universal address to the contract itself (for same-contract cross-chain)
      const tx = await MeluriNFT.setUniversal(contractAddress);
      console.log("Transaction sent:", tx.hash);
      console.log("Waiting for confirmation...");
      
      await tx.wait();
      
      console.log("✅ Universal address set successfully!");
      
      // Verify
      const newUniversal = await MeluriNFT.universal();
      console.log("New universal address:", newUniversal);
    } else {
      console.log("✅ Universal address already set.");
    }
    
    // Also check gas limit
    const gasLimit = await MeluriNFT.gasLimitAmount();
    console.log("Gas limit for cross-chain:", gasLimit.toString());
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.message.includes("Ownable")) {
      console.error("\n⚠️  You need to run this with the contract owner's private key");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
