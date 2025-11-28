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
      const supportedChains = Object.keys(CONFIG.CONTRACTS).filter(chainId => {
        const address = CONFIG.CONTRACTS[chainId]
        return address && address !== ''
      })
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
        showStatus(`Please switch to ${CONFIG.MINT_CHAINS[selectedChain]?.name} using the button above`, 'error')
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
      const contractAddress = CONFIG.CONTRACTS[selectedChain]
      if (!contractAddress) {
        throw new Error(`Contract not deployed on selected chain`)
      }
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer)

      showStatus('Minting NFT... Please confirm in wallet', 'info')
      const tx = await contract.mint(userAddress, metadataUri)
      
      showStatus('Transaction submitted. Waiting for confirmation...', 'info')
      const receipt = await tx.wait()
      
      // Parse logs to get token ID from Transfer event
      let tokenId
      
      // Try to find Transfer event in logs
      for (const log of receipt.logs || []) {
        try {
          const parsed = contract.interface.parseLog(log)
          if (parsed && parsed.name === 'Transfer') {
            // Transfer event has (from, to, tokenId)
            tokenId = parsed.args.tokenId?.toString() || parsed.args[2]?.toString()
            console.log('Found Transfer event, tokenId:', tokenId)
            break
          }
        } catch (e) {
          // Skip logs that don't match our interface
          continue
        }
      }
      
      if (!tokenId) {
        console.warn('Could not extract tokenId from transaction logs')
        tokenId = 'Unknown'
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



      {currentChainId && (
        <div className="current-network-info" style={{ 
          padding: '10px', 
          marginBottom: '15px', 
          background: currentChainId === selectedChain ? '#e8f5e9' : '#fff3e0', 
          borderRadius: '8px',
          fontSize: '14px',
          border: currentChainId === selectedChain ? '1px solid #4caf50' : '1px solid #ff9800'
        }}>
          <strong>Connected to:</strong> {CONFIG.MINT_CHAINS[currentChainId]?.icon} {CONFIG.MINT_CHAINS[currentChainId]?.name || `Chain ${currentChainId}`}
          {currentChainId !== selectedChain && (
            <div style={{ marginTop: '8px' }}>
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  
                  console.log('=== SWITCH BUTTON CLICKED ===')
                  console.log('Target chain:', selectedChain)
                  console.log('Current chain:', currentChainId)
                  
                  switchToChain(selectedChain)
                    .then(() => {
                      console.log('=== SWITCH SUCCESSFUL ===')
                      showStatus(`Switched to ${CONFIG.MINT_CHAINS[selectedChain]?.name}!`, 'success')
                    })
                    .catch((error) => {
                      console.error('=== SWITCH ERROR ===', error)
                      
                      // Network change errors are actually success - the network switched!
                      if (error.code === 'NETWORK_ERROR' && error.message.includes('network changed')) {
                        console.log('Network switched successfully (caught by ethers)')
                        showStatus(`Switched to ${CONFIG.MINT_CHAINS[selectedChain]?.name}!`, 'success')
                      } else if (error.code === 4001) {
                        showStatus('Network switch cancelled', 'info')
                      } else {
                        showStatus(`Failed: ${error.message}`, 'error')
                      }
                    })
                }}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '5px 10px' }}
              >
                🔄 Switch to {CONFIG.MINT_CHAINS[selectedChain]?.name}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="chainSelect">Choose Blockchain:</label>
        <select 
          id="chainSelect"
          value={selectedChain}
          onChange={(e) => setSelectedChain(e.target.value)}
          className="chain-dropdown"
        >
          {Object.entries(CONFIG.MINT_CHAINS)
            .filter(([chainId]) => {
              const address = CONFIG.CONTRACTS[chainId]
              return address && address !== ''
            })
            .map(([chainId, chain]) => (
              <option key={chainId} value={chainId}>
                {chain.icon} {chain.name}
              </option>
            ))}
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
