import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { CONFIG, CONTRACT_ABI } from '../config'
import NFTDetailsModal from './NFTDetailsModal'

export default function MyNFTs({ signer, userAddress, showStatus, refreshTrigger, onTransferClick }) {
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [selectedNFT, setSelectedNFT] = useState(null)

  // Auto-refresh only when a new NFT is minted (refreshTrigger changes)
  useEffect(() => {
    if (refreshTrigger && signer && userAddress) {
      // Delay to ensure blockchain has updated
      const timer = setTimeout(() => {
        loadMyNFTs()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [refreshTrigger])

  const loadMyNFTs = async () => {
    if (!userAddress) {
      return // Silently return if no user address
    }

    setLoading(true)
    console.log('Loading NFTs for address:', userAddress)

    try {
      // Get all supported chains from CONFIG (only chains with deployed contracts)
      const supportedChains = Object.keys(CONFIG.CONTRACTS).filter(chainId => {
        const address = CONFIG.CONTRACTS[chainId]
        return address && address !== '' && address !== '0x0000000000000000000000000000000000000000'
      })
      const allNFTs = []

      // Fetch NFTs from all supported chains
      for (const chainId of supportedChains) {
        try {
          const chainInfo = CONFIG.MINT_CHAINS[chainId]
          const contractAddress = CONFIG.CONTRACTS[chainId]

          if (!contractAddress) {
            console.log(`No contract address for ${chainInfo.name}, skipping`)
            continue
          }

          console.log(`Checking ${chainInfo.name} (${chainId})...`)

          // Try primary RPC URL first, then fallbacks
          let provider = null
          const rpcUrls = [chainInfo.rpcUrl, ...(chainInfo.fallbackRpcUrls || [])]

          for (const rpcUrl of rpcUrls) {
            try {
              console.log(`Trying RPC: ${rpcUrl}`)
              provider = new ethers.JsonRpcProvider(rpcUrl)
              // Test the connection
              await provider.getBlockNumber()
              console.log(`Connected to ${rpcUrl}`)
              break
            } catch (rpcError) {
              console.log(`Failed to connect to ${rpcUrl}:`, rpcError.message)
              provider = null
            }
          }

          if (!provider) {
            console.error(`Could not connect to any RPC for ${chainInfo.name}`)
            continue
          }

          // Check if contract exists on this chain
          const code = await provider.getCode(contractAddress)
          if (code === '0x') {
            console.log(`Contract not deployed on ${chainInfo.name}`)
            continue
          }

          // Create contract instance
          const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider)

          // Get user's NFT balance
          console.log(`Fetching NFT balance from ${chainInfo.name}...`)
          const balance = await contract.balanceOf(userAddress)
          console.log(`User has ${balance.toString()} NFT(s) on ${chainInfo.name}`)

          // Fetch each NFT by index
          for (let i = 0; i < balance; i++) {
            try {
              const tokenId = await contract.tokenOfOwnerByIndex(userAddress, i)
              console.log(`Found NFT #${tokenId.toString()} on ${chainInfo.name}`)

              const tokenURI = await contract.tokenURI(tokenId)
              const nftData = await parseTokenURI(tokenId.toString(), tokenURI)

              // Add chain info
              nftData.chain = chainInfo.name
              nftData.chainIcon = chainInfo.icon
              nftData.chainId = chainId
              allNFTs.push(nftData)
            } catch (e) {
              console.log(`Error fetching NFT at index ${i}:`, e.message)
              continue
            }
          }
        } catch (error) {
          console.error(`Error loading NFTs from chain ${chainId}:`, error)
          continue
        }
      }

      console.log(`Total NFTs found: ${allNFTs.length}`)
      setNfts(allNFTs)
      setShowGallery(true)

      // Show success message if NFTs found
      if (allNFTs.length > 0) {
        showStatus(`Found ${allNFTs.length} NFT(s) across all chains`, 'success')
      }

    } catch (error) {
      console.error('Error loading NFTs:', error)
      // Silently handle errors - just show empty gallery
      setShowGallery(true)
      setNfts([])
    } finally {
      setLoading(false)
    }
  }

  const parseTokenURI = async (tokenId, tokenURI) => {
    try {
      let metadata
      if (tokenURI.startsWith('data:application/json')) {
        const base64Data = tokenURI.split(',')[1]
        metadata = JSON.parse(atob(base64Data))
      } else {
        const response = await fetch(tokenURI)
        metadata = await response.json()
      }

      return {
        tokenId,
        name: metadata.name,
        image: metadata.image
      }
    } catch (e) {
      return {
        tokenId,
        name: `NFT #${tokenId}`,
        image: null
      }
    }
  }

  return (
    <>
      <section className="card my-nfts-section">
        <div className="nft-header">
          <h2>🖼️ My NFTs</h2>
          <button
            onClick={loadMyNFTs}
            className="btn btn-secondary btn-refresh"
            disabled={loading || !signer}
            title="Refresh NFTs"
          >
            {loading ? '⏳ Loading...' : '🔄 Refresh'}
          </button>
        </div>

        {!signer ? (
          <div className="no-nfts-container">
            <p className="no-nfts">Connect your wallet to view your NFTs</p>
          </div>
        ) : loading ? (
          <div className="nft-loading">
            <div className="loader-animation">
              <div className="loader-circle"></div>
              <div className="loader-circle"></div>
              <div className="loader-circle"></div>
            </div>
            <p>Loading your NFTs...</p>
          </div>
        ) : showGallery ? (
          <div className="nft-gallery">
            {nfts.length === 0 ? (
              <div className="no-nfts-container">
                <p className="no-nfts">You don't own any NFTs yet</p>
                <p className="no-nfts-hint">Mint your first one above!</p>
              </div>
            ) : (
              nfts.map((nft) => (
                <div
                  key={`${nft.chainId}-${nft.tokenId}`}
                  className="nft-gallery-card"
                  onClick={() => setSelectedNFT(nft)}
                >
                  {nft.image && <img src={nft.image} alt={nft.name} />}
                  <div className="nft-gallery-info">
                    <h4>{nft.name}</h4>
                    <p>Token ID: {nft.tokenId}</p>
                    {nft.chain && (
                      <p className="nft-chain">
                        <span className="chain-badge">
                          {nft.chainIcon} {nft.chain}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}
      </section>

      {selectedNFT && (
        <NFTDetailsModal
          nft={selectedNFT}
          userAddress={userAddress}
          onClose={() => setSelectedNFT(null)}
          onTransfer={onTransferClick}
        />
      )}
    </>
  )
}
