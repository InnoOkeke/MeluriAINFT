import hre from "hardhat";
const { ethers } = hre;

const BSC_CONTRACT = "0xfD77880CD7371fC537704069338E187d4a2c7739";
const TOKEN_ID = "1097813099324026859899819656551551472777686244094";
const USER_ADDRESS = "0x6C8c3FC2717cE887B41E85141B7ACd7e0a197946";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Rescuing NFT with account:", deployer.address);

  const contract = await ethers.getContractAt(
    "MeluriNFT_EVM_Gateway",
    BSC_CONTRACT
  );

  console.log(`Rescuing token ${TOKEN_ID} to ${USER_ADDRESS}...`);

  const tx = await contract.rescueEscrowedToken(TOKEN_ID, USER_ADDRESS);
  await tx.wait();

  console.log("✅ NFT rescued and returned to user!");
  
  const owner = await contract.ownerOf(TOKEN_ID);
  console.log(`New owner: ${owner}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
