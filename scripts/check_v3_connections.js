import hre from "hardhat";
const { ethers } = hre;

const ZETACHAIN_V3 = "0x433c5f951460a539FE431c54b1bfF249F5eFd4F5";

const ZRC20_ADDRESSES = {
  "Sepolia": "0x05BA149A7bd6dC1F937fA9046A9e05C05f3b18b0",
  "Polygon": "0x777915D031d1e8144c90D025C594b3b8Bf07a08d",
  "BSC": "0xd97B1de3619ed2c6BEb3860147E30cA8A7dC9891",
  "Avalanche": "0xEe9CC614D03e7Dbe994b514079f4914a605B4719",
  "Arbitrum": "0x1de70f3e971B62A0707dA18100392af14f7fB677",
  "Kaia": "0xe1A4f44b12eb72DC6da556Be9Ed1185141d7C23c"
};

async function main() {
  const contract = await ethers.getContractAt("MeluriNFT_Gateway_V3", ZETACHAIN_V3);

  console.log("Checking V3 connections...\n");

  for (const [name, zrc20] of Object.entries(ZRC20_ADDRESSES)) {
    const connected = await contract.connected(zrc20);
    console.log(`${name.padEnd(15)} ${zrc20}`);
    console.log(`${"Connected:".padEnd(15)} ${connected || "(not set)"}\n`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
