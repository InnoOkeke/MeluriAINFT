import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying Meluri NFT via Factory...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Network:", hre.network.name);

  // Factory address (must be the same on all chains)
  const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS;
  
  if (!FACTORY_ADDRESS) {
    console.error("❌ FACTORY_ADDRESS not set in .env");
    process.exit(1);
  }

  // Gateway addresses
  const GATEWAYS = {
    zeta_testnet: process.env.GATEWAY_ZETACHAIN || "0x6c533f7fe93fae114d0954697069df33c9b74fd7",
    sepolia: process.env.GATEWAY_ETHEREUM || "0x0c487a766110c85d301d96e33579c5b317fa4995",
    polygon_amoy: process.env.GATEWAY_POLYGON || "0x0c487a766110c85d301d96e33579c5b317fa4995",
    somnia_testnet: process.env.GATEWAY_SOMNIA || "0x0c487a766110c85d301d96e33579c5b317fa4995",
    celo_sepolia: process.env.GATEWAY_CELO || "0x0c487a766110c85d301d96e33579c5b317fa4995",
    monad_testnet: process.env.GATEWAY_MONAD || "0x0c487a766110c85d301d96e33579c5b317fa4995",
  };

  const gatewayAddress = GATEWAYS[hre.network.name];
  
  if (!gatewayAddress) {
    console.error(`❌ Gateway not configured for ${hre.network.name}`);
    process.exit(1);
  }

  console.log("Factory:", FACTORY_ADDRESS);
  console.log("Gateway:", gatewayAddress);

  // Deploy implementation first
  console.log("\n📦 Deploying implementation...");
  const MeluriNFT = await hre.ethers.getContractFactory("MeluriNFT");
  const implementation = await MeluriNFT.deploy();
  await implementation.waitForDeployment();
  const implementationAddress = await implementation.getAddress();
  console.log("Implementation:", implementationAddress);

  // Get factory contract
  const factory = await hre.ethers.getContractAt("MeluriNFTFactory", FACTORY_ADDRESS);

  // Use a consistent salt across all chains
  const salt = hre.ethers.id("MeluriAINFT_v1");
  console.log("\nSalt:", salt);

  // Predict address
  const predictedAddress = await factory.predictAddress(
    salt,
    implementationAddress,
    deployer.address,
    "Meluri AI NFT",
    "MELURI",
    500000,
    gatewayAddress
  );
  
  console.log("\n🔮 Predicted proxy address:", predictedAddress);

  // Check if already deployed
  const existingProxy = await factory.deployedProxies(salt);
  if (existingProxy !== hre.ethers.ZeroAddress) {
    console.log("✅ Already deployed at:", existingProxy);
    return existingProxy;
  }

  // Deploy via factory
  console.log("\n🏭 Deploying via factory...");
  const tx = await factory.deployNFT(
    salt,
    implementationAddress,
    deployer.address,
    "Meluri AI NFT",
    "MELURI",
    500000,
    gatewayAddress
  );

  console.log("Transaction sent:", tx.hash);
  const receipt = await tx.wait();
  
  // Get deployed address from event
  const event = receipt.logs.find(log => {
    try {
      const parsed = factory.interface.parseLog(log);
      return parsed?.name === 'NFTDeployed';
    } catch {
      return false;
    }
  });
  
  let proxyAddress = predictedAddress;
  if (event) {
    const parsed = factory.interface.parseLog(event);
    proxyAddress = parsed.args.proxy;
  }

  console.log("\n✅ Meluri AI NFT deployed!");
  console.log("📍 Proxy Address:", proxyAddress);
  console.log("\n🎉 This address should be the SAME on all chains!");
  
  console.log("\n📝 Update your .env:");
  console.log(`CONTRACT_${hre.network.name.toUpperCase()}=${proxyAddress}`);
  
  return proxyAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
