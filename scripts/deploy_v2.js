import hre from "hardhat";

async function main() {
  console.log("Deploying Universal AI NFT v2 to ZetaChain...");

  // ZetaChain Athens testnet Gateway address (ZEVM)
  const GATEWAY_ADDRESS = "0x6c533f7fe93fae114d0954697069df33c9b74fd7";

  console.log(`Gateway: ${GATEWAY_ADDRESS}`);

  const UniversalAINFT = await hre.ethers.getContractFactory("UniversalAINFT");
  const universalAINFT = await UniversalAINFT.deploy(GATEWAY_ADDRESS);

  await universalAINFT.waitForDeployment();

  const contractAddress = await universalAINFT.getAddress();
  console.log(`\n✅ Universal AI NFT v2 deployed to ZetaChain: ${contractAddress}`);
  
  console.log("\n📝 Next steps:");
  console.log("1. Deploy connected contracts on other chains (Ethereum, BSC, etc.)");
  console.log("2. Update frontend config with new contract address");
  console.log("3. Users can now mint from ANY chain!");
  
  console.log("\n🔍 Verify with:");
  console.log(`npx hardhat verify --network zeta_testnet ${contractAddress} ${GATEWAY_ADDRESS}`);
  
  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
