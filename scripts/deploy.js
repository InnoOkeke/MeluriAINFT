import hre from "hardhat";

async function main() {
  console.log("Deploying Universal AI NFT contract to ZetaChain testnet...");

  // ZetaChain Athens testnet Gateway address
  const GATEWAY_ADDRESS = process.env.GATEWAY_ADDRESS || "0x6c533f7fe93fae114d0954697069df33c9b74fd7";
  
  // Gas ZRC20 token address (use address(0) for native gas or specific ZRC20)
  // For testnet, you can use address(0) or a specific testnet ZRC20
  const GAS_ZRC20 = process.env.GAS_ZRC20 || "0x0000000000000000000000000000000000000000";

  console.log(`Gateway: ${GATEWAY_ADDRESS}`);
  console.log(`Gas ZRC20: ${GAS_ZRC20}`);

  const UniversalAINFT = await hre.ethers.getContractFactory("UniversalAINFT");
  const universalAINFT = await UniversalAINFT.deploy(GATEWAY_ADDRESS, GAS_ZRC20);

  await universalAINFT.waitForDeployment();

  const contractAddress = await universalAINFT.getAddress();
  console.log(`\nUniversal AI NFT deployed to: ${contractAddress}`);
  
  console.log("\nVerify with:");
  console.log(`npx hardhat verify --network zeta_testnet ${contractAddress} ${GATEWAY_ADDRESS} ${GAS_ZRC20}`);
  
  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
