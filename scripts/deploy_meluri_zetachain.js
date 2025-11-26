import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying Meluri AI NFT to ZetaChain Athens...\n");

  // ZetaChain Athens Gateway (ZEVM)
  const GATEWAY_ADDRESS = "0x6c533f7fe93fae114d0954697069df33c9b74fd7";

  console.log("Gateway:", GATEWAY_ADDRESS);
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);

  const MeluriNFT = await hre.ethers.getContractFactory("MeluriNFT_ZetaChain");
  const nft = await MeluriNFT.deploy(GATEWAY_ADDRESS);

  await nft.waitForDeployment();

  const contractAddress = await nft.getAddress();
  
  console.log("\n✅ Meluri AI NFT deployed to ZetaChain!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("\n📝 Next Steps:");
  console.log("1. Save this address for connected chain deployments");
  console.log("2. Deploy connected contracts on other chains");
  console.log("3. Update frontend config.js with this address");
  
  console.log("\n🔍 Verify:");
  console.log(`npx hardhat verify --network zeta_testnet ${contractAddress} ${GATEWAY_ADDRESS}`);
  
  console.log("\n🌐 Explorer:");
  console.log(`https://athens.explorer.zetachain.com/address/${contractAddress}`);
  
  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
