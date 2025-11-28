import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ethers } from 'ethers'
import { CONFIG } from './config'
import Header from './components/Header'
import Navigation from './components/Navigation'
import MintPage from './pages/MintPage'
import MyNFTsPage from './pages/MyNFTsPage'
import TransferModal from './components/TransferModal'
import StatusMessage from './components/StatusMessage'
import './App.css'

const CONTRACT_ABI = [
  "function mint(address to, string memory uri) public",
  "function transferCrossChain(uint256 tokenId, address receiver, address destination) external payable",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function totalSupply() public view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event TokenTransfer(address indexed destination, address indexed receiver, uint256 indexed tokenId, string uri)"
]

function App() {
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [userAddress, setUserAddress] = useState(null)
  const [currentChainId, setCurrentChainId] = useState(null)
  const [currentNFT, setCurrentNFT] = useState(null)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [status, setStatus] = useState({ message: '', type: '' })
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isSwitching, setIsSwitching] = useState(false)

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  useEffect(() => {
    console.log('Current Chain ID updated:', currentChainId)
  }, [currentChainId])

  useEffect(() => {
    if (!signer || !window.ethereum || isSwitching) return

    const pollChainId = async () => {
      try {
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' })
        const chainId = parseInt(chainIdHex, 16).toString()

        if (chainId !== currentChainId) {
          console.log('Chain change detected via polling:', currentChainId, '->', chainId)
          setCurrentChainId(chainId)

          const web3Provider = new ethers.BrowserProvider(window.ethereum)
          const web3Signer = await web3Provider.getSigner()
          setProvider(web3Provider)
          setSigner(web3Signer)

          const chainName = CONFIG.MINT_CHAINS[chainId]?.name || 'Unknown Network'
          showStatus(`Network: ${chainName}`, 'info')
        }
      } catch (error) {
        console.log('Polling error (ignored):', error.message)
      }
    }

    const interval = setInterval(pollChainId, 2000)
    return () => clearInterval(interval)
  }, [signer, currentChainId, isSwitching])

  const checkIfWalletIsConnected = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          const web3Provider = new ethers.BrowserProvider(window.ethereum)
          const web3Signer = await web3Provider.getSigner()
          const address = await web3Signer.getAddress()
          const network = await web3Provider.getNetwork()

          setProvider(web3Provider)
          setSigner(web3Signer)
          setUserAddress(address)
          setCurrentChainId(network.chainId.toString())

          subscribeToProviderEvents()
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      showStatus('Please install MetaMask or another Web3 wallet', 'error')
      setTimeout(() => {
        window.open('https://metamask.io/download/', '_blank')
      }, 2000)
      return
    }

    try {
      showStatus('Connecting to wallet...', 'info')

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length === 0) {
        showStatus('No accounts found', 'error')
        return
      }

      const web3Provider = new ethers.BrowserProvider(window.ethereum)
      const web3Signer = await web3Provider.getSigner()
      const address = await web3Signer.getAddress()
      const network = await web3Provider.getNetwork()

      setProvider(web3Provider)
      setSigner(web3Signer)
      setUserAddress(address)
      setCurrentChainId(network.chainId.toString())

      subscribeToProviderEvents()
      showStatus('Wallet connected successfully!', 'success')

    } catch (error) {
      console.error('Error connecting wallet:', error)

      if (error.code === 4001) {
        showStatus('Connection rejected by user', 'info')
      } else if (error.code === -32002) {
        showStatus('Please check MetaMask - connection request pending', 'info')
      } else {
        showStatus('Failed to connect wallet: ' + error.message, 'error')
      }
    }
  }

  const subscribeToProviderEvents = () => {
    if (!window.ethereum) return

    console.log('Setting up provider event listeners...')

    if (window.ethereum.autoRefreshOnNetworkChange !== undefined) {
      window.ethereum.autoRefreshOnNetworkChange = false
    }

    window.ethereum.removeAllListeners?.('accountsChanged')
    window.ethereum.removeAllListeners?.('chainChanged')
    window.ethereum.removeAllListeners?.('disconnect')

    window.ethereum.on('accountsChanged', async (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else {
        setUserAddress(accounts[0])
        const web3Provider = new ethers.BrowserProvider(window.ethereum)
        const web3Signer = await web3Provider.getSigner()
        setProvider(web3Provider)
        setSigner(web3Signer)
        showStatus('Account changed', 'info')
      }
    })

    window.ethereum.on('chainChanged', async (chainIdHex) => {
      console.log('Chain changed event received:', chainIdHex)

      try {
        const chainId = parseInt(chainIdHex, 16).toString()
        console.log('Parsed chain ID:', chainId)
        setCurrentChainId(chainId)

        const web3Provider = new ethers.BrowserProvider(window.ethereum)
        const web3Signer = await web3Provider.getSigner()
        setProvider(web3Provider)
        setSigner(web3Signer)

        const chainName = CONFIG.MINT_CHAINS[chainId]?.name || 'Unknown Network'
        showStatus(`Switched to ${chainName}`, 'info')
        setIsSwitching(false)
      } catch (error) {
        console.error('Error handling chain change:', error)
        setIsSwitching(false)
      }
    })

    window.ethereum.on('disconnect', () => {
      disconnectWallet()
    })
  }

  const disconnectWallet = () => {
    setProvider(null)
    setSigner(null)
    setUserAddress(null)
    showStatus('Wallet disconnected', 'info')
  }

  const showStatus = (message, type) => {
    setStatus({ message, type })
    if (type === 'success' || type === 'error') {
      setTimeout(() => setStatus({ message: '', type: '' }), 5000)
    }
  }

  const switchToChain = async (chainId) => {
    console.log('switchToChain called with chainId:', chainId)

    if (!chainId) {
      console.error('No chainId provided to switchToChain')
      return
    }

    const chain = CONFIG.MINT_CHAINS[chainId]
    console.log('Chain config found:', chain)

    if (!chain) {
      console.error('No configuration found for chainId:', chainId)
      showStatus(`Configuration missing for network ID: ${chainId}`, 'error')
      return
    }

    if (currentChainId === chainId) {
      console.log('Already on chain:', chainId)
      showStatus(`You are already on ${chain.name}`, 'info')
      return
    }

    if (!window.ethereum) {
      showStatus('No wallet connected', 'error')
      return
    }

    setIsSwitching(true)
    console.log('🔄 Starting network switch process...')
    console.log('📍 Current network:', currentChainId)
    console.log('🎯 Target network:', chainId)
    showStatus(`Requesting switch to ${chain.name}...`, 'info')

    const targetChainId = chain.chainId.toLowerCase()

    try {
      console.log('⚡ Step 1: Trying to switch to existing network')

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      })

      console.log('✅ Successfully switched to', chain.name)
      showStatus(`Switched to ${chain.name}`, 'success')
      setIsSwitching(false)

    } catch (switchError) {
      console.log('⚠️ Switch failed:', switchError.code, switchError.message)

      // Error 4902 = chain not added, -32603 = unrecognized chain (also means not added)
      if (switchError.code === 4902 || switchError.code === -32603 || switchError.message?.includes('Unrecognized chain')) {
        console.log('⚡ Step 2: Network not found, adding it now...')

        try {
          const params = {
            chainId: targetChainId,
            chainName: chain.name,
            nativeCurrency: chain.nativeCurrency,
            rpcUrls: [chain.rpcUrl],
            blockExplorerUrls: [chain.explorer]
          }

          console.log('📦 Adding network with params:', params)

          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [params],
          })

          console.log('✅ Network added and switched!')
          showStatus(`Added ${chain.name}`, 'success')
          setIsSwitching(false)

        } catch (addError) {
          console.error('❌ Failed to add network:', addError)
          setIsSwitching(false)

          if (addError.code === 4001) {
            showStatus('Adding network cancelled', 'info')
          } else {
            showStatus(`Failed to add ${chain.name}`, 'error')
          }
        }
      }
      else if (switchError.code === 4001) {
        console.log('👤 User cancelled the switch')
        showStatus('Network switch cancelled', 'info')
        setIsSwitching(false)
      }
      else {
        console.error('❌ Unexpected error:', switchError)
        showStatus(`Failed to switch: ${switchError.message}`, 'error')
        setIsSwitching(false)
      }
    }
  }

  const handleTransferClick = (nft) => {
    setCurrentNFT(nft)
    setShowTransferModal(true)
  }

  const handleTransferComplete = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <Router basename="/MeluriAINFT">
      <div className="app">
        <Header
          userAddress={userAddress}
          onConnect={() => connectWallet()}
          onDisconnect={disconnectWallet}
          currentChainId={currentChainId}
          switchToChain={switchToChain}
          isSwitching={isSwitching}
        />

        {userAddress && <Navigation />}

        <main className="container">
          <Routes>
            <Route
              path="/"
              element={
                <MintPage
                  signer={signer}
                  userAddress={userAddress}
                  switchToChain={switchToChain}
                  showStatus={showStatus}
                  onTransferClick={handleTransferClick}
                  currentChainId={currentChainId}
                />
              }
            />
            <Route
              path="/my-nfts"
              element={
                <MyNFTsPage
                  signer={signer}
                  userAddress={userAddress}
                  showStatus={showStatus}
                  refreshTrigger={refreshTrigger}
                  onTransferClick={handleTransferClick}
                />
              }
            />
          </Routes>
        </main>

        {showTransferModal && (
          <TransferModal
            nft={currentNFT}
            signer={signer}
            userAddress={userAddress}
            switchToChain={switchToChain}
            onClose={() => {
              setShowTransferModal(false)
              handleTransferComplete()
            }}
            showStatus={showStatus}
          />
        )}

        <StatusMessage status={status} />
      </div>
    </Router>
  )
}

export default App
