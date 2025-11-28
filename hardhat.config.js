import "dotenv/config";
import "@nomicfoundation/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.26",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "cancun",
      viaIR: true,
    },
  },
  networks: {
    hardhat: {},
    zeta_testnet: {
      url: process.env.RPC_ZETACHAIN || "https://zetachain-athens-evm.blockpi.network/v1/rpc/public",
      chainId: 7001,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gas: 8000000,
      gasPrice: 20000000000, // 20 gwei
    },
    sepolia: {
      url: process.env.RPC_ETHEREUM || "https://ethereum-sepolia.rpc.subquery.network/public",
      chainId: 11155111,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gas: 3000000,
      gasPrice: 5000000000, // 5 gwei (reduced from 20)
    },
    base_sepolia: {
      url: process.env.RPC_BASE || "https://base.meowrpc.com",
      chainId: 84532,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      timeout: 120000,
      gas: 3000000,
      gasPrice: 1000000000, // 1 gwei
    },
    polygon_amoy: {
      url: process.env.RPC_POLYGON || "https://rpc-amoy.polygon.technology",
      chainId: 80002,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gas: 5000000,
      gasPrice: 30000000000, // 30 gwei
    },
    bsc_testnet: {
      url: process.env.RPC_BSC || "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gas: 5000000,
      gasPrice: 10000000000, // 10 gwei
    },
    kaia_testnet: {
      url: process.env.RPC_KAIA || "https://public-en-kairos.node.kaia.io",
      chainId: 1001,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gas: 5000000,
      gasPrice: 25000000000, // 25 gwei
    },
    avalanche_fuji: {
      url: process.env.RPC_AVALANCHE || "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gas: 5000000,
      gasPrice: 25000000000, // 25 gwei
    },
    arbitrum_sepolia: {
      url: process.env.RPC_ARBITRUM || "https://sepolia-rollup.arbitrum.io/rpc",
      chainId: 421614,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gas: 5000000,
      gasPrice: 100000000, // 0.1 gwei (Arbitrum is very cheap)
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
};
