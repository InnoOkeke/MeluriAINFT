import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying Meluri AI NFT Universal Contract...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Network:", hre.network.name);

  // Gateway addresses for different chains
  const GATEWAYS = {
    zeta_testnet: process.env.GATEWAY_ZETACHAIN || "0x6c533f7fe93fae114d0954697069df33c9b74fd7",
    sepolia: process.env.GATEWAY_ETHEREUM || "0x0c487a766110c85d301d96e33579c5b317fa4995",
    base_sepolia: process.env.GATEWAY_BASE || "0x0c487a766110c85d301d96e33579c5b317fa4995",
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

  console.log("Gateway:", gatewayAddress);

  // Deploy the implementation contract
  const MeluriNFT = await hre.ethers.getContractFactory("MeluriNFT");
  console.log("\n📦 Deploying implementation...");
  
  const nft = await hre.upgrades.deployProxy(
    MeluriNFT,
    [
      deployer.address,      // initialOwner
      "Meluri AI NFT",       // name
      "MELURI",              // symbol
      500000,                // gas limit for cross-chain
      gatewayAddress         // gateway address
    ],
    {
      initializer: "initialize",
      kind: "uups"
    }
  );

  await nft.waitForDeployment();

  const contractAddress = await nft.getAddress();
  
  console.log("\n✅ Meluri AI NFT deployed!");
  console.log("📍 Proxy Address:", contractAddress);
  console.log("\n🎉 Features enabled:");
  console.log("  ✓ Mint from ANY connected chain");
  console.log("  ✓ Transfer NFTs cross-chain");
  console.log("  ✓ Upgradeable contract");
  console.log("  ✓ Universal NFT standard");
  
  console.log("\n📝 Next Steps:");
  console.log("1. Deploy on other chains (Ethereum, BSC, etc.)");
  console.log("2. Update frontend config with contract address");
  console.log("3. Users can mint from any chain!");
  
  console.log("\n🌐 Explorer:");
  if (hre.network.name === "zeta_testnet") {
    console.log(`https://athens.explorer.zetachain.com/address/${contractAddress}`);
  } else if (hre.network.name === "sepolia") {
    console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);
  }
  
  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
