import hre from "hardhat";

async function main() {
  const zetaChainContract = process.argv[2];
  
  if (!zetaChainContract) {
    console.error("❌ Error: ZetaChain contract address required");
    console.log("\nUsage:");
    console.log("npx hardhat run scripts/deploy_meluri_connected.js --network <network> <ZETACHAIN_CONTRACT>");
    process.exit(1);
  }

  console.log("🚀 Deploying Meluri AI NFT Connected Contract...\n");

  // Gateway addresses for different chains
  const GATEWAYS = {
    sepolia: "0x6c533f7fe93fae114d0954697069df33c9b74fd7",
    bsc_testnet: "0x6c533f7fe93fae114d0954697069df33c9b74fd7",
    mumbai: "0x6c533f7fe93fae114d0954697069df33c9b74fd7",
  };

  const gatewayAddress = GATEWAYS[hre.network.name];

  if (!gatewayAddress) {
    console.error(`❌ Gateway not configured for ${hre.network.name}`);
    process.exit(1);
  }

  console.log("Network:", hre.network.name);
  console.log("Gateway:", gatewayAddress);
  console.log("ZetaChain Contract:", zetaChainContract);

  const ConnectedNFT = await hre.ethers.getContractFactory("MeluriNFT_Connected");
  const nft = await ConnectedNFT.deploy(gatewayAddress, zetaChainContract);

  await nft.waitForDeployment();

  const contractAddress = await nft.getAddress();
  
  console.log("\n✅ Connected Contract deployed!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("\n🎉 Users on", hre.network.name, "can now mint Meluri AI NFTs!");
  console.log("The NFTs will be created on ZetaChain.");
  
  console.log("\n🔍 Verify:");
  console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress} ${gatewayAddress} ${zetaChainContract}`);
  
  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
