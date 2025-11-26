import hre from "hardhat";

async function main() {
  const contractAddress = process.argv[2];
  const recipientAddress = process.argv[3] || (await hre.ethers.getSigners())[0].address;
  const tokenURI = process.argv[4] || "ipfs://QmExample123/metadata.json";

  if (!contractAddress) {
    console.error("Usage: npx hardhat run scripts/mint.js --network zeta_testnet <CONTRACT_ADDRESS> [RECIPIENT_ADDRESS] [TOKEN_URI]");
    process.exit(1);
  }

  console.log("Minting AI NFT...");
  console.log(`Contract: ${contractAddress}`);
  console.log(`Recipient: ${recipientAddress}`);
  console.log(`Token URI: ${tokenURI}`);

  const UniversalAINFT = await hre.ethers.getContractFactory("UniversalAINFT");
  const contract = UniversalAINFT.attach(contractAddress);

  const tx = await contract.mintAINFT(recipientAddress, tokenURI);
  console.log(`Transaction hash: ${tx.hash}`);
  
  const receipt = await tx.wait();
  console.log("NFT minted successfully!");
  
  // Get the token ID from the event
  const event = receipt.logs.find(log => {
    try {
      return contract.interface.parseLog(log).name === "NFTMinted";
    } catch (e) {
      return false;
    }
  });
  
  if (event) {
    const parsedEvent = contract.interface.parseLog(event);
    console.log(`Token ID: ${parsedEvent.args.tokenId}`);
  }
  
  const totalSupply = await contract.totalSupply();
  console.log(`Total NFTs minted: ${totalSupply}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
