import hre from "hardhat";
const { ethers } = hre;

const PROXY_ADDRESS = "0x1bFa005D37C803710cC8C64C02DfB06322FA6841";

async function main() {
  console.log("Checking V3 contract status...\n");

  const contract = await ethers.getContractAt("MeluriNFT_Gateway_V3", PROXY_ADDRESS);

  try {
    const router = await contract.uniswapRouter();
    console.log("Uniswap Router:", router);
  } catch (e) {
    console.log("Uniswap Router: Not set or error");
  }

  try {
    const wzeta = await contract.wzeta();
    console.log("WZETA:", wzeta);
  } catch (e) {
    console.log("WZETA: Not set or error");
  }

  try {
    const gateway = await contract.gateway();
    console.log("Gateway:", gateway);
  } catch (e) {
    console.log("Gateway: Error");
  }

  try {
    const owner = await contract.owner();
    console.log("Owner:", owner);
  } catch (e) {
    console.log("Owner: Error");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
