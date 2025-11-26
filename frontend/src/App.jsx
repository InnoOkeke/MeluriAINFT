import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ethers } from 'ethers'
import { CONFIG } from './config'
import Header from './components/Header'
import Navigation from './components/Navigation'
import NetworkSwitcher from './components/NetworkSwitcher'
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

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  // Debug: Log currentChainId changes
  useEffect(() => {
    console.log('Current Chain ID updated:', currentChainId)
  }, [currentChainId])

  // Removed aggressive polling - rely on MetaMask events instead

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
      
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      
      if (accounts.length === 0) {
        showStatus('No accounts found', 'error')
        return
      }

      // Create provider and signer
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

    // Remove existing listeners to avoid duplicates
    window.ethereum.removeAllListeners('accountsChanged')
    window.ethereum.removeAllListeners('chainChanged')
    window.ethereum.removeAllListeners('disconnect')

    window.ethereum.on('accountsChanged', async (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else {
        setUserAddress(accounts[0])
        // Refresh provider and signer
        const web3Provider = new ethers.BrowserProvider(window.ethereum)
        const web3Signer = await web3Provider.getSigner()
        setProvider(web3Provider)
        setSigner(web3Signer)
        showStatus('Account changed', 'info')
      }
    })

    window.ethereum.on('chainChanged', async (chainIdHex) => {
      console.log('Chain changed event:', chainIdHex)
      const chainId = parseInt(chainIdHex, 16).toString()
      console.log('Parsed chain ID:', chainId)
      setCurrentChainId(chainId)
      // Refresh provider and signer
      const web3Provider = new ethers.BrowserProvider(window.ethereum)
      const web3Signer = await web3Provider.getSigner()
      setProvider(web3Provider)
      setSigner(web3Signer)
      
      const chainName = CONFIG.MINT_CHAINS[chainId]?.name || 'Unknown Network'
      showStatus(`Switched to ${chainName}`, 'info')
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
    const chain = CONFIG.MINT_CHAINS[chainId]
    
    if (!window.ethereum) {
      throw new Error('No wallet connected')
    }
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chain.chainId }],
      })
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: chain.chainId,
              chainName: chain.name,
              nativeCurrency: chain.nativeCurrency,
              rpcUrls: [chain.rpcUrl],
              blockExplorerUrls: [chain.explorer]
            }],
          })
        } catch (addError) {
          throw new Error(`Failed to add ${chain.name} network`)
        }
      } else {
        throw switchError
      }
    }
    
    // Refresh provider and signer after chain switch
    const web3Provider = new ethers.BrowserProvider(window.ethereum)
    const web3Signer = await web3Provider.getSigner()
    setProvider(web3Provider)
    setSigner(web3Signer)
  }

  const handleTransferClick = (nft) => {
    setCurrentNFT(nft)
    setShowTransferModal(true)
  }

  const handleTransferComplete = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <Router>
      <div className="app">
        <Header 
          userAddress={userAddress}
          onConnect={() => connectWallet()}
          onDisconnect={disconnectWallet}
          currentChainId={currentChainId}
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
