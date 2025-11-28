export const CONFIG = {
  // Gateway V3 contract addresses (with Uniswap auto-swap for gas)
  CONTRACTS: {
    '7001': '0x433c5f951460a539FE431c54b1bfF249F5eFd4F5',      // ZetaChain Athens V3 (Universal with Uniswap) ✅
    '11155111': '0xe1eEa3ACeD7ba7c4d80F7989DAb402E6b611e8B5',  // Ethereum Sepolia V3 ✅
    '80002': '0x3D4e79a6180B349ec3f6C33D5c47da217E7aD7E4',     // Polygon Amoy V3 ✅
    '421614': '0x1cf3A60860401F26d2b8393616Fe08f3Cd6Db603',    // Arbitrum Sepolia V3 ✅
    '97': '0x7F010b6b1eBc01C02f6689dfBCffe6819043A398',        // BSC Testnet V3 ✅
    '1001': '0xb9b01938B8c9ed745444dc91a402365A3A7833C5',      // Kaia Testnet V3 ✅
    '43113': '0x861C31645AC69e35e8E83c3507681E4C110307FB',     // Avalanche Fuji V3 ✅
  },

  // Universal contract on ZetaChain (Gateway V3 with Uniswap)
  UNIVERSAL_CONTRACT: '0x433c5f951460a539FE431c54b1bfF249F5eFd4F5',

  AI_IMAGE_APIS: {
    local: 'http://localhost:5000/generate-base64',
    huggingface: 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
    pollinations: 'https://image.pollinations.ai/prompt/'
  },

  MINT_CHAINS: {
    '7001': {
      name: 'ZetaChain Athens',
      rpcUrl: 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
      chainId: '0x1B59',
      nativeCurrency: { name: 'ZETA', symbol: 'ZETA', decimals: 18 },
      explorer: 'https://athens.explorer.zetachain.com',
      icon: '⚡',
      gateway: '0x6c533f7fe93fae114d0954697069df33c9b74fd7',
      zrc20: '0x0000000000000000000000000000000000000000'
    },
    '11155111': {
      name: 'Ethereum Sepolia',
      rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
      chainId: '0xaa36a7',
      nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
      explorer: 'https://sepolia.etherscan.io',
      icon: '🔷',
      gateway: '0x0c487a766110c85d301d96e33579c5b317fa4995',
      zrc20: '0x05BA149A7bd6dC1F937fA9046A9e05C05f3b18b0'
    },
    '80002': {
      name: 'Polygon Amoy',
      rpcUrl: 'https://rpc-amoy.polygon.technology',
      chainId: '0x13882',
      nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
      explorer: 'https://amoy.polygonscan.com',
      icon: '🟣',
      gateway: '0x0c487a766110c85d301d96e33579c5b317fa4995',
      zrc20: '0x777915D031d1e8144c90D025C594b3b8Bf07a08d'
    },
    '421614': {
      name: 'Arbitrum Sepolia',
      rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
      chainId: '0x66eee',
      nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
      explorer: 'https://sepolia.arbiscan.io',
      icon: '🔷',
      gateway: '0x0dA86Dc3F9B71F84a0E97B0e2291e50B7a5df10f',
      zrc20: '0x1de70f3e971B62A0707dA18100392af14f7fB677'
    },
    '97': {
      name: 'BSC Testnet',
      rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      chainId: '0x61',
      nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
      explorer: 'https://testnet.bscscan.com',
      icon: '🟡',
      gateway: '0x0c487a766110c85d301d96e33579c5b317fa4995',
      zrc20: '0xd97B1de3619ed2c6BEb3860147E30cA8A7dC9891'
    },
    '1001': {
      name: 'Kaia Testnet',
      rpcUrl: 'https://public-en-kairos.node.kaia.io',
      chainId: '0x3e9',
      nativeCurrency: { name: 'KAIA', symbol: 'KAIA', decimals: 18 },
      explorer: 'https://kairos.kaiascan.io',
      icon: '🌸',
      gateway: '0x17c57f0b20ff169f779aceb320c8d7297d8cb1de',
      zrc20: '0xe1A4f44b12eb72DC6da556Be9Ed1185141d7C23c'
    },
    '43113': {
      name: 'Avalanche Fuji',
      rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
      chainId: '0xa869',
      nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
      explorer: 'https://testnet.snowtrace.io',
      icon: '🔺',
      gateway: '0x0dA86Dc3F9B71F84a0E97B0e2291e50B7a5df10f',
      zrc20: '0xEe9CC614D03e7Dbe994b514079f4914a605B4719'
    }
  },

  SAMPLE_PROMPTS: [
    'A futuristic cyberpunk city at night with neon lights',
    'A majestic dragon flying over mountains',
    'An astronaut exploring an alien planet',
    'A magical forest with glowing mushrooms',
    'A steampunk robot in a Victorian setting',
    'An underwater city with bioluminescent creatures'
  ]
}

// Gateway V2 contract ABIs (with transfer tracking)
export const CONTRACT_ABI_ZETACHAIN = [
  "function mint(address to, string memory uri) public",
  "function transferCrossChain(uint256 tokenId, address receiver, address destination) external payable returns (bytes32)",
  "function getTransferStatus(bytes32 transferId) external view returns (tuple(address originalOwner, uint256 tokenId, address destinationReceiver, address destination, string uri, uint256 timestamp, bool completed, bool reverted))",
  "function isEscrowed(uint256 tokenId) external view returns (bool)",
  "function approve(address to, uint256 tokenId) public",
  "function getApproved(uint256 tokenId) public view returns (address)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
  "function name() public view returns (string memory)",
  "function symbol() public view returns (string memory)"
]

export const CONTRACT_ABI_EVM = [
  "function mint(address to, string memory uri) public",
  "function transferCrossChain(uint256 tokenId, address receiver, address destination) external payable returns (bytes32)",
  "function getTransferStatus(bytes32 transferId) external view returns (tuple(address originalOwner, uint256 tokenId, address destinationReceiver, address destination, string uri, uint256 timestamp, bool completed, bool reverted))",
  "function isEscrowed(uint256 tokenId) external view returns (bool)",
  "function approve(address to, uint256 tokenId) public",
  "function getApproved(uint256 tokenId) public view returns (address)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
  "function name() public view returns (string memory)",
  "function symbol() public view returns (string memory)"
]

// Use ZetaChain ABI for backward compatibility
export const CONTRACT_ABI = CONTRACT_ABI_ZETACHAIN
