import hre from "hardhat";
const { ethers } = hre;

// V3 ZetaChain contract
const ZETACHAIN_V3 = "0x433c5f951460a539FE431c54b1bfF249F5eFd4F5";

// V3 EVM contracts (fresh deployments)
const CONTRACTS = {
  sepolia: "0xe1eEa3ACeD7ba7c4d80F7989DAb402E6b611e8B5",
  polygon_amoy: "0x3D4e79a6180B349ec3f6C33D5c47da217E7aD7E4",
  bsc_testnet: "0x7F010b6b1eBc01C02f6689dfBCffe6819043A398",
  kaia_testnet: "0xb9b01938B8c9ed745444dc91a402365A3A7833C5",
  avalanche_fuji: "0x861C31645AC69e35e8E83c3507681E4C110307FB",
  arbitrum_sepolia: "0x1cf3A60860401F26d2b8393616Fe08f3Cd6Db603"
};

// ZRC20 Gas Token addresses
const ZRC20_ADDRESSES = {
  sepolia: "0x05BA149A7bd6dC1F937fA9046A9e05C05f3b18b0",
  polygon_amoy: "0x777915D031d1e8144c90D025C594b3b8Bf07a08d",
  bsc_testnet: "0xd97B1de3619ed2c6BEb3860147E30cA8A7dC9891",
  avalanche_fuji: "0xEe9CC614D03e7Dbe994b514079f4914a605B4719",
  arbitrum_sepolia: "0x1de70f3e971B62A0707dA18100392af14f7fB677",
  kaia_testnet: "0xe1A4f44b12eb72DC6da556Be9Ed1185141d7C23c"
};

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Setting up V3 connections with account:", deployer.address);

  // Connect to ZetaChain V3 contract
  const zetachainContract = await ethers.getContractAt(
    "MeluriNFT_Gateway_V3",
    ZETACHAIN_V3
  );

  console.log("\n🔗 Setting up connected contracts on ZetaChain V3...");
  
  for (const [network, zrc20] of Object.entries(ZRC20_ADDRESSES)) {
    if (CONTRACTS[network]) {
      console.log(`Setting connection for ${network}...`);
      const evmAddress = CONTRACTS[network];
      const tx = await zetachainContract.setConnected(zrc20, evmAddress);
      await tx.wait();
      console.log(`✅ Connected ${network} (${evmAddress}) via ZRC20 ${zrc20}`);
    }
  }

  console.log("\n🔗 Setting up universal contract on EVM chains...");
  
  for (const [network, address] of Object.entries(CONTRACTS)) {
    console.log(`\nSetting universal for ${network}...`);
    const evmContract = await ethers.getContractAt(
      "MeluriNFT_EVM_Gateway_V3",
      address
    );
    const tx = await evmContract.setUniversal(ZETACHAIN_V3);
    await tx.wait();
    console.log(`✅ Set V3 universal contract for ${network}`);
  }

  console.log("\n✅ All V3 connections configured!");
  console.log("\n📝 Update frontend config with V3 address:");
  console.log(`ZetaChain V3: ${ZETACHAIN_V3}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
