import hre from "hardhat";
const { ethers } = hre;

const CONTRACT = "0x433c5f951460a539FE431c54b1bfF249F5eFd4F5";
const WZETA = "0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf";
const AMOUNT = "1.0"; // 1 WZETA

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Funding contract with WZETA...");
  console.log("Account:", deployer.address);
  console.log("Contract:", CONTRACT);

  const wzeta = await ethers.getContractAt("@zetachain/protocol-contracts/contracts/zevm/interfaces/IZRC20.sol:IZRC20", WZETA);

  // Check current balance
  const currentBalance = await wzeta.balanceOf(CONTRACT);
  console.log(`\nCurrent contract WZETA balance: ${ethers.formatEther(currentBalance)}`);

  // Check deployer balance
  const deployerBalance = await wzeta.balanceOf(deployer.address);
  console.log(`Deployer WZETA balance: ${ethers.formatEther(deployerBalance)}`);

  if (deployerBalance < ethers.parseEther(AMOUNT)) {
    console.log("\n❌ Insufficient WZETA balance!");
    console.log("You need to get WZETA first. Options:");
    console.log("1. Swap ZETA for WZETA on ZetaChain DEX");
    console.log("2. Use ZetaChain faucet");
    return;
  }

  // Transfer WZETA to contract
  console.log(`\nTransferring ${AMOUNT} WZETA to contract...`);
  const tx = await wzeta.transfer(CONTRACT, ethers.parseEther(AMOUNT));
  await tx.wait();

  const newBalance = await wzeta.balanceOf(CONTRACT);
  console.log(`✅ Contract funded!`);
  console.log(`New contract WZETA balance: ${ethers.formatEther(newBalance)}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
