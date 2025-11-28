import hre from "hardhat";
const { ethers, upgrades } = hre;

// V3 Universal contract on ZetaChain
const UNIVERSAL_V3 = "0x433c5f951460a539FE431c54b1bfF249F5eFd4F5";

// Gateway addresses per network
const GATEWAYS = {
  sepolia: "0x0c487a766110c85d301d96e33579c5b317fa4995",
  polygon_amoy: "0x0c487a766110c85d301d96e33579c5b317fa4995",
  bsc_testnet: "0x0c487a766110c85d301d96e33579c5b317fa4995",
  kaia_testnet: "0x17c57f0b20ff169f779aceb320c8d7297d8cb1de",
  avalanche_fuji: "0x0dA86Dc3F9B71F84a0E97B0e2291e50B7a5df10f",
  arbitrum_sepolia: "0x0dA86Dc3F9B71F84a0E97B0e2291e50B7a5df10f"
};

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = hre.network.name;
  
  console.log(`Deploying MeluriNFT_EVM_Gateway_V3 on ${network}`);
  console.log("Account:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  const gateway = GATEWAYS[network];
  if (!gateway) {
    console.error(`No gateway address configured for ${network}`);
    process.exit(1);
  }

  console.log("\nGateway:", gateway);
  console.log("Universal (ZetaChain V3):", UNIVERSAL_V3);

  const MeluriNFT_V3 = await ethers.getContractFactory("MeluriNFT_EVM_Gateway_V3");

  console.log("\nDeploying proxy...");
  const contract = await upgrades.deployProxy(
    MeluriNFT_V3,
    [deployer.address, "Meluri NFT", "MELURI", gateway],
    { initializer: "initialize" }
  );

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("✅ Contract deployed to:", address);

  // Set universal contract
  console.log("\nSetting universal contract...");
  const tx = await contract.setUniversal(UNIVERSAL_V3);
  await tx.wait();
  console.log("✅ Universal contract set!");

  console.log("\n📝 Save this address:");
  console.log(`${network.toUpperCase()}_V3=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
