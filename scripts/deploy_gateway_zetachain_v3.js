import hre from "hardhat";
const { ethers, upgrades } = hre;

const GATEWAY = "0x6c533f7fe93fae114d0954697069df33c9b74fd7";
const UNISWAP_ROUTER = "0x2ca7d64A7EFE2D62A725E2B35Cf7230D6677FfEe";
const WZETA = "0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying MeluriNFT_Gateway_V3 with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  console.log("\nDeploying V3 contract with Uniswap integration...");
  console.log("Gateway:", GATEWAY);
  console.log("Uniswap Router:", UNISWAP_ROUTER);
  console.log("WZETA:", WZETA);

  const MeluriNFT_V3 = await ethers.getContractFactory("MeluriNFT_Gateway_V3");

  console.log("Deploying proxy...");
  const contract = await upgrades.deployProxy(
    MeluriNFT_V3,
    [deployer.address, "Meluri NFT", "MELURI", GATEWAY],
    { initializer: "initialize" }
  );

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("✅ MeluriNFT_Gateway_V3 deployed to:", address);

  // Initialize V3 features
  console.log("\nInitializing V3 features...");
  const initTx = await contract.initializeV3(UNISWAP_ROUTER, WZETA);
  await initTx.wait();
  console.log("✅ V3 features initialized!");

  // Verify
  const router = await contract.uniswapRouter();
  const wzeta = await contract.wzeta();
  console.log("\nVerification:");
  console.log("Uniswap Router:", router);
  console.log("WZETA:", wzeta);

  console.log("\n📝 Save this address to .env as CONTRACT_ZETACHAIN_V3");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
