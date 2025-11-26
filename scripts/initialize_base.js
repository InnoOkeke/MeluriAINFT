import hre from "hardhat";

async function main() {
  const contractAddress = "0x1E56eb8A5D345FFE83d2935e06D811905ce9890C";
  const gatewayAddress = "0x0c487a766110c85d301d96e33579c5b317fa4995"; // Base Sepolia Gateway
  
  console.log("\nInitializing contract on Base Sepolia...");
  console.log("Contract address:", contractAddress);
  
  const [signer] = await hre.ethers.getSigners();
  console.log("Using account:", signer.address);
  
  const MeluriNFT = await hre.ethers.getContractAt("MeluriNFT", contractAddress, signer);
  
  try {
    // Check if already initialized
    try {
      const owner = await MeluriNFT.owner();
      if (owner !== "0x0000000000000000000000000000000000000000") {
        console.log("✅ Contract already initialized");
        console.log("Owner:", owner);
        return;
      }
    } catch (e) {
      // Not initialized yet
    }
    
    console.log("\nInitializing contract...");
    const tx = await MeluriNFT.initialize(
      signer.address,           // initialOwner
      "Meluri AI NFT",          // name
      "MELURI",                 // symbol
      1000000,                  // gas limit
      gatewayAddress            // gateway address
    );
    
    console.log("Transaction sent:", tx.hash);
    console.log("Waiting for confirmation...");
    
    await tx.wait();
    
    console.log("✅ Contract initialized successfully!");
    
    // Verify
    const owner = await MeluriNFT.owner();
    console.log("New owner:", owner);
    
    // Now set universal address
    console.log("\nSetting universal address...");
    const tx2 = await MeluriNFT.setUniversal(contractAddress);
    console.log("Transaction sent:", tx2.hash);
    await tx2.wait();
    
    console.log("✅ Universal address set successfully!");
    
    const universal = await MeluriNFT.universal();
    console.log("Universal address:", universal);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
