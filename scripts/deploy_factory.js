import hre from "hardhat";

async function main() {
  console.log("🏭 Deploying MeluriNFTFactory...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Network:", hre.network.name);

  // Deploy the factory
  const Factory = await hre.ethers.getContractFactory("MeluriNFTFactory");
  console.log("\n📦 Deploying factory...");
  
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  
  const factoryAddress = await factory.getAddress();
  
  console.log("\n✅ Factory deployed!");
  console.log("📍 Factory Address:", factoryAddress);
  
  console.log("\n📝 Save this address - you'll need it for all chains!");
  console.log("FACTORY_ADDRESS=" + factoryAddress);
  
  return factoryAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
