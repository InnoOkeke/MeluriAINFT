import hre from "hardhat";

async function main() {
  const gatewayAddress = "0x0c487a766110c85d301d96e33579c5b317fa4995"; // Base Sepolia Gateway
  
  console.log("\nDeploying fresh MeluriNFT to Base Sepolia...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
  
  // Deploy the implementation
  console.log("\nDeploying implementation...");
  const MeluriNFT = await hre.ethers.getContractFactory("MeluriNFT");
  
  const proxy = await hre.upgrades.deployProxy(
    MeluriNFT,
    [
      deployer.address,        // initialOwner
      "Meluri AI NFT",         // name
      "MELURI",                // symbol
      1000000,                 // gas limit
      gatewayAddress           // gateway address
    ],
    { 
      initializer: "initialize",
      kind: "uups"
    }
  );
  
  await proxy.waitForDeployment();
  const proxyAddress = await proxy.getAddress();
  
  console.log("\n✅ MeluriNFT deployed successfully!");
  console.log("Proxy address:", proxyAddress);
  
  // Set universal address
  console.log("\nSetting universal address...");
  const tx = await proxy.setUniversal(proxyAddress);
  await tx.wait();
  console.log("✅ Universal address set!");
  
  // Verify
  const owner = await proxy.owner();
  const universal = await proxy.universal();
  const name = await proxy.name();
  
  console.log("\n--- Contract Info ---");
  console.log("Owner:", owner);
  console.log("Name:", name);
  console.log("Universal:", universal);
  console.log("\n⚠️  Update your .env and frontend config with this new address:");
  console.log("CONTRACT_BASE=" + proxyAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
