import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying Meluri AI NFT...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Network:", hre.network.name);

  // Gateway addresses
  const GATEWAYS = {
    zeta_testnet: process.env.GATEWAY_ZETACHAIN || "0x6c533f7fe93fae114d0954697069df33c9b74fd7",
    sepolia: process.env.GATEWAY_ETHEREUM || "0x0c487a766110c85d301d96e33579c5b317fa4995",
    base_sepolia: process.env.GATEWAY_BASE || "0x0c487a766110c85d301d96e33579c5b317fa4995",
  };

  const gatewayAddress = GATEWAYS[hre.network.name];
  
  if (!gatewayAddress) {
    console.error(`❌ Gateway not configured for ${hre.network.name}`);
    process.exit(1);
  }

  console.log("Gateway:", gatewayAddress);
  console.log("\n📦 Deploying...");

  const MeluriNFT = await hre.ethers.getContractFactory("MeluriNFT");
  const nft = await MeluriNFT.deploy();
  
  await nft.waitForDeployment();
  const contractAddress = await nft.getAddress();

  console.log("\n📍 Contract deployed:", contractAddress);
  
  // Initialize
  console.log("\n⚙️  Initializing...");
  const tx = await nft.initialize(
    deployer.address,
    "Meluri AI NFT",
    "MELURI",
    500000,
    gatewayAddress
  );
  await tx.wait();
  
  console.log("\n✅ Meluri AI NFT deployed and initialized!");
  console.log("📍 Address:", contractAddress);
  console.log("\n🎉 Users can now mint from this chain!");
  
  if (hre.network.name === "zeta_testnet") {
    console.log("\n🌐 Explorer:");
    console.log(`https://athens.explorer.zetachain.com/address/${contractAddress}`);
  } else if (hre.network.name === "sepolia") {
    console.log("\n🌐 Explorer:");
    console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);
  } else if (hre.network.name === "base_sepolia") {
    console.log("\n🌐 Explorer:");
    console.log(`https://sepolia.basescan.org/address/${contractAddress}`);
  }
  
  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
