import hre from "hardhat";

async function main() {
  const contractAddress = process.argv[2];
  const tokenId = process.argv[3];

  if (!contractAddress || !tokenId) {
    console.error("Usage: npx hardhat run scripts/checkNFT.js --network zeta_testnet <CONTRACT_ADDRESS> <TOKEN_ID>");
    process.exit(1);
  }

  console.log("Checking NFT details...");
  console.log(`Contract: ${contractAddress}`);
  console.log(`Token ID: ${tokenId}`);

  const UniversalAINFT = await hre.ethers.getContractFactory("UniversalAINFT");
  const contract = UniversalAINFT.attach(contractAddress);

  try {
    const owner = await contract.ownerOf(tokenId);
    const tokenURI = await contract.tokenURI(tokenId);
    const metadata = await contract.nftMetadata(tokenId);
    
    console.log("\n=== NFT Details ===");
    console.log(`Owner: ${owner}`);
    console.log(`Token URI: ${tokenURI}`);
    console.log(`Metadata: ${metadata}`);
  } catch (error) {
    console.log("NFT not found or has been burned (possibly sent cross-chain)");
  }
  
  const totalSupply = await contract.totalSupply();
  console.log(`\nTotal NFTs minted: ${totalSupply}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
