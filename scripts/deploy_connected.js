import hre from "hardhat";

async function main() {
  const zetaChainContractAddress = process.argv[2];
  
  if (!zetaChainContractAddress) {
    console.error("Usage: npx hardhat run scripts/deploy_connected.js --network <network> <ZETACHAIN_CONTRACT_ADDRESS>");
    process.exit(1);
  }

  console.log("Deploying Connected Contract...");
  console.log(`Network: ${hre.network.name}`);
  console.log(`ZetaChain Contract: ${zetaChainContractAddress}`);

  // Gateway addresses for different chains
  const GATEWAYS = {
    sepolia: "0x6c533f7fe93fae114d0954697069df33c9b74fd7", // Ethereum Sepolia
    bsc_testnet: "0x6c533f7fe93fae114d0954697069df33c9b74fd7", // BSC Testnet
    mumbai: "0x6c533f7fe93fae114d0954697069df33c9b74fd7", // Polygon Mumbai
  };

  const gatewayAddress = GATEWAYS[hre.network.name] || process.env.GATEWAY_ADDRESS;

  if (!gatewayAddress) {
    console.error("Gateway address not found for this network");
    process.exit(1);
  }

  console.log(`Gateway: ${gatewayAddress}`);

  const ConnectedContract = await hre.ethers.getContractFactory("UniversalAINFTConnected");
  const connected = await ConnectedContract.deploy(gatewayAddress, zetaChainContractAddress);

  await connected.waitForDeployment();

  const contractAddress = await connected.getAddress();
  console.log(`\n✅ Connected Contract deployed to ${hre.network.name}: ${contractAddress}`);
  
  console.log("\n📝 Users on this chain can now mint NFTs!");
  console.log("The NFTs will be created on ZetaChain and owned by the minter.");
  
  console.log("\n🔍 Verify with:");
  console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress} ${gatewayAddress} ${zetaChainContractAddress}`);
  
  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
