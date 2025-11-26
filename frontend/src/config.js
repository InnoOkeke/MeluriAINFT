export const CONFIG = {
  // Universal NFT contracts on each chain
  CONTRACTS: {
    '7001': '0x1E56eb8A5D345FFE83d2935e06D811905ce9890C',    // ZetaChain Athens
    '11155111': '0x1E56eb8A5D345FFE83d2935e06D811905ce9890C', // Ethereum Sepolia
    '50312': '0xD64086b23C7d4499C0FD7524a47E404994097BA0',   // Somnia Testnet
    '11142220': '0xD64086b23C7d4499C0FD7524a47E404994097BA0', // Celo Sepolia
    '10143': '0xD64086b23C7d4499C0FD7524a47E404994097BA0',   // Monad Testnet
  },
  
  // Default contract (same across all chains)
  CONTRACT_ADDRESS: '0x1E56eb8A5D345FFE83d2935e06D811905ce9890C',
  GATEWAY_ADDRESS: '0x6c533f7fe93fae114d0954697069df33c9b74fd7',
  
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
      zrc20: '0x0000000000000000000000000000000000000000', // ZetaChain uses address(0)
      group: 1 // Cross-chain group
    },
    '11155111': {
      name: 'Ethereum Sepolia',
      rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
      fallbackRpcUrls: [
        'https://rpc.sepolia.org',
        'https://eth-sepolia.public.blastapi.io',
        'https://sepolia.gateway.tenderly.co'
      ],
      chainId: '0xaa36a7',
      nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
      explorer: 'https://sepolia.etherscan.io',
      icon: '🔷',
      zrc20: '0x65a45c57636f9BcCeD4fe193A602008578BcA90b', // ETH.ETHSEP ZRC-20
      group: 1 // Cross-chain group
    },
    '50312': {
      name: 'Somnia Testnet',
      rpcUrl: 'https://dream-rpc.somnia.network',
      chainId: '0xc498',
      nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
      explorer: 'https://somnia-testnet.socialscan.io',
      icon: '💭',
      zrc20: '0x0000000000000000000000000000000000000000',
      group: 2 // Cross-chain group
    },
    '11142220': {
      name: 'Celo Sepolia',
      rpcUrl: 'https://forno.celo-sepolia.celo-testnet.org',
      chainId: '0xaa0e5c',
      nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
      explorer: 'https://celo-sepolia.blockscout.com',
      icon: '🌿',
      zrc20: '0x0000000000000000000000000000000000000000',
      group: 2 // Cross-chain group
    },
    '10143': {
      name: 'Monad Testnet',
      rpcUrl: 'https://testnet-rpc.monad.xyz',
      chainId: '0x279f',
      nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
      explorer: 'https://testnet.monad.xyz',
      icon: '🔮',
      zrc20: '0x0000000000000000000000000000000000000000',
      group: 2 // Cross-chain group
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

export const CONTRACT_ABI = [
  "function mint(address to, string memory uri) public",
  "function transferCrossChain(uint256 tokenId, address receiver, address destination) external payable",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function totalSupply() public view returns (uint256)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event TokenTransfer(address indexed destination, address indexed receiver, uint256 indexed tokenId, string uri)"
]
