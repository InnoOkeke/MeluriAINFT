import { useState } from 'react'
import { ethers } from 'ethers'
import { CONFIG, CONTRACT_ABI } from '../config'

import { useEffect } from 'react'

export default function MintNFT({ 
  signer, 
  userAddress, 
  generatedImage, 
  setCurrentNFT,
  switchToChain,
  showStatus,
  currentChainId 
}) {
  const [nftName, setNftName] = useState('')
  const [nftDescription, setNftDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedChain, setSelectedChain] = useState('7001')

  // Auto-select chain based on connected wallet
  useEffect(() => {
    if (currentChainId) {
      const supportedChains = ['7001', '11155111', '50312', '11142220', '10143']
      if (supportedChains.includes(currentChainId)) {
        setSelectedChain(currentChainId)
      }
    }
  }, [currentChainId])

  const mintNFT = async () => {
    if (!signer) {
      showStatus('Please connect wallet first', 'error')
      return
    }

    if (!generatedImage) {
      showStatus('Please generate an image first', 'error')
      return
    }

    if (!nftName.trim()) {
      showStatus('Please enter an NFT name', 'error')
      return
    }

    setLoading(true)

    try {
      // Check if on correct network
      const network = await signer.provider.getNetwork()
      const currentChain = network.chainId.toString()
      
      if (currentChain !== selectedChain) {
        showStatus(`Please switch to ${CONFIG.MINT_CHAINS[selectedChain]?.name} in your wallet`, 'error')
        setLoading(false)
        return
      }

      const metadata = {
        name: nftName,
        description: nftDescription || 'AI Generated NFT',
        image: generatedImage,
        attributes: [
          { trait_type: 'AI Generated', value: 'Yes' },
          { trait_type: 'Created', value: new Date().toISOString() }
        ]
      }

      const metadataJson = JSON.stringify(metadata)
      const metadataUri = `data:application/json;base64,${btoa(metadataJson)}`

      showStatus('Preparing to mint...', 'info')

      // Get the correct contract address for the selected chain
      const contractAddress = CONFIG.CONTRACTS[selectedChain] || CONFIG.CONTRACT_ADDRESS
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer)

      showStatus('Minting NFT... Please confirm in wallet', 'info')
      const tx = await contract.mint(userAddress, metadataUri)
      
      showStatus('Transaction submitted. Waiting for confirmation...', 'info')
      const receipt = await tx.wait()
      
      // Parse logs to get token ID from Transfer event
      const event = receipt.logs?.find(log => {
        try {
          const parsed = contract.interface.parseLog(log)
          return parsed?.name === 'Transfer'
        } catch {
          return false
        }
      })
      
      let tokenId
      if (event) {
        const parsed = contract.interface.parseLog(event)
        tokenId = parsed?.args?.tokenId?.toString()
      }
      
      const chainInfo = CONFIG.MINT_CHAINS[selectedChain]
      
      setCurrentNFT({
        tokenId,
        name: nftName,
        image: generatedImage,
        chain: selectedChain,
        chainName: chainInfo?.name || 'Unknown Chain',
        chainIcon: chainInfo?.icon || '🔗',
        chainId: selectedChain,
        owner: userAddress,
        metadata: metadataUri,
        txHash: receipt.hash
      })

      showStatus(`NFT minted successfully! Token ID: ${tokenId}`, 'success')
      
      setTimeout(() => {
        document.getElementById('successSection')?.scrollIntoView({ behavior: 'smooth' })
      }, 500)
      
    } catch (error) {
      console.error('Error minting NFT:', error)
      showStatus(`Error: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card mint-section" id="mintSection">
      <div className="step-header">
        <span className="step-number">2</span>
        <h2>Select Chain and Mint</h2>
      </div>

      <div className="form-group">
        <label htmlFor="chainSelect">Choose Blockchain:</label>
        <select 
          id="chainSelect"
          value={selectedChain}
          onChange={(e) => setSelectedChain(e.target.value)}
          className="chain-dropdown"
        >
          <option value="7001">⚡ ZetaChain Athens</option>
          <option value="11155111">🔷 Ethereum Sepolia</option>
          <option value="50312">� Somnioa Testnet</option>
          <option value="11142220">🌿 Celo Sepolia</option>
          <option value="10143">🔮 Monad Testnet</option>
        </select>
      </div>

      <div className="nft-details-form">
        <div className="form-group">
          <label htmlFor="nftName">NFT Name:</label>
          <input 
            type="text" 
            id="nftName"
            value={nftName}
            onChange={(e) => setNftName(e.target.value)}
            placeholder="My Awesome NFT" 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="nftDescription">Description (optional):</label>
          <textarea 
            id="nftDescription"
            value={nftDescription}
            onChange={(e) => setNftDescription(e.target.value)}
            placeholder="Describe your NFT..." 
            rows="2"
          />
        </div>
      </div>

      <button 
        onClick={mintNFT}
        className="btn btn-mint" 
        disabled={!generatedImage || loading}
      >
        {loading ? '⏳ Minting...' : '🚀 Mint NFT'}
      </button>
    </section>
  )
}
