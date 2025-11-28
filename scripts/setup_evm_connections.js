import hre from "hardhat";
const { ethers } = hre;

// Contract addresses
const UNIVERSAL_CONTRACT = "0x433c5f951460a539FE431c54b1bfF249F5eFd4F5"; // V3

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = hre.network.name;
  
  console.log(`Setting up ${network} with account:`, deployer.address);

  // Get contract address for current network
  const contracts = {
    sepolia: "0xcfF748eAb26428566B8F0252614DEEFCdEA6adB5",
    polygon_amoy: "0x05f803661e2bFbEBD76d7B5C7F4Eb9354817Fa0f",
    bsc_testnet: "0xfD77880CD7371fC537704069338E187d4a2c7739",
    kaia_testnet: "0x68584b0e881B58913983e6357679Ba60a9cDBc2b",
    avalanche_fuji: "0x13561632183ea118b7Cf99b080877139749b56B7",
    arbitrum_sepolia: "0x3D4e79a6180B349ec3f6C33D5c47da217E7aD7E4"
  };

  const contractAddress = contracts[network];
  if (!contractAddress) {
    console.error(`No contract found for network: ${network}`);
    process.exit(1);
  }

  console.log(`Contract address: ${contractAddress}`);
  console.log(`Setting universal to: ${UNIVERSAL_CONTRACT}`);

  const contract = await ethers.getContractAt(
    "MeluriNFT_EVM_Gateway",
    contractAddress
  );

  const tx = await contract.setUniversal(UNIVERSAL_CONTRACT);
  await tx.wait();

  console.log(`✅ Universal contract set for ${network}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
