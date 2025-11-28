import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'
import { CONFIG } from './config'

// Get the project ID from WalletConnect Cloud (free)
// Users can get this from https://cloud.walletconnect.com
const projectId = 'e3cdce8b52918105b472fccabf0ba198'

// Configure metadata for your app
const metadata = {
    name: 'Meluri AI NFT',
    description: 'Create with AI, Mint Anywhere - Universal Cross-Chain NFTs',
    url: 'https://yourdomain.com',
    icons: ['https://yourdomain.com/icon.png']
}

// Create array of supported chains from CONFIG
const chains = Object.entries(CONFIG.MINT_CHAINS).map(([id, chain]) => ({
    chainId: parseInt(id),
    name: chain.name,
    currency: chain.nativeCurrency.symbol,
    explorerUrl: chain.explorer,
    rpcUrl: chain.rpcUrl
}))

// Create the Web3Modal configuration
const ethersConfig = defaultConfig({
    metadata,
    enableEIP6963: true, // Enable EIP-6963 for better wallet discovery
    enableInjected: true, // Enable injected wallets (MetaMask, etc.)
    enableCoinbase: true, // Enable Coinbase Wallet
    rpcUrl: CONFIG.MINT_CHAINS['11155111'].rpcUrl, // Default RPC
    defaultChainId: 11155111 // Default to Ethereum Sepolia
})

// Create the modal instance
export const web3Modal = createWeb3Modal({
    ethersConfig,
    chains,
    projectId,
    enableAnalytics: false, // Optional - disable if you don't want analytics
    themeMode: 'dark',
    themeVariables: {
        '--w3m-font-family': 'inherit',
        '--w3m-accent': '#6366f1'
    }
})
