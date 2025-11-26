import hre from "hardhat";

async function main() {
  const contractAddress = "0x1E56eb8A5D345FFE83d2935e06D811905ce9890C";
  
  console.log("\nChecking contract on Base Sepolia...");
  console.log("Contract address:", contractAddress);
  
  const [signer] = await hre.ethers.getSigners();
  console.log("Your address:", signer.address);
  
  // Check if contract exists
  const code = await hre.ethers.provider.getCode(contractAddress);
  console.log("\nContract code exists:", code !== "0x");
  console.log("Code length:", code.length);
  
  try {
    const MeluriNFT = await hre.ethers.getContractAt("MeluriNFT", contractAddress, signer);
    
    // Try to read various properties
    console.log("\n--- Contract State ---");
    
    try {
      const owner = await MeluriNFT.owner();
      console.log("Owner:", owner);
    } catch (e) {
      console.log("Owner: Error -", e.message);
    }
    
    try {
      const name = await MeluriNFT.name();
      console.log("Name:", name);
    } catch (e) {
      console.log("Name: Error -", e.message);
    }
    
    try {
      const symbol = await MeluriNFT.symbol();
      console.log("Symbol:", symbol);
    } catch (e) {
      console.log("Symbol: Error -", e.message);
    }
    
    try {
      const universal = await MeluriNFT.universal();
      console.log("Universal:", universal);
    } catch (e) {
      console.log("Universal: Error -", e.message);
    }
    
    try {
      const totalSupply = await MeluriNFT.totalSupply();
      console.log("Total Supply:", totalSupply.toString());
    } catch (e) {
      console.log("Total Supply: Error -", e.message);
    }
    
    try {
      const gasLimit = await MeluriNFT.gasLimitAmount();
      console.log("Gas Limit:", gasLimit.toString());
    } catch (e) {
      console.log("Gas Limit: Error -", e.message);
    }
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
