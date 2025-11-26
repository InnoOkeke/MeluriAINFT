import hre from "hardhat";

async function main() {
  const CONTRACT_ADDRESSES = {
    zeta_testnet: "0x1E56eb8A5D345FFE83d2935e06D811905ce9890C",
    sepolia: "0x1E56eb8A5D345FFE83d2935e06D811905ce9890C",
  };
  
  const contractAddress = CONTRACT_ADDRESSES[hre.network.name];
  
  if (!contractAddress) {
    console.error(`No contract for ${hre.network.name}`);
    return;
  }
  
  console.log(`\nChecking contract on ${hre.network.name}...`);
  console.log(`Contract: ${contractAddress}\n`);
  
  const [signer] = await hre.ethers.getSigners();
  const contract = await hre.ethers.getContractAt("MeluriNFT", contractAddress, signer);
  
  try {
    const owner = await contract.owner();
    console.log("Owner:", owner);
    
    const universal = await contract.universal();
    console.log("Universal:", universal);
    
    const gasLimit = await contract.gasLimitAmount();
    console.log("Gas Limit:", gasLimit.toString());
    
    const gateway = await contract.gateway();
    console.log("Gateway:", gateway);
    
    if (universal === hre.ethers.ZeroAddress) {
      console.log("\n⚠️  Universal address is not set!");
      console.log("Run: npx hardhat run scripts/setup_universal.js --network", hre.network.name);
    } else {
      console.log("\n✅ Contract is properly configured");
    }
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
