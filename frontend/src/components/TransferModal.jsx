import { useState } from 'react'
import { ethers } from 'ethers'
import { CONFIG, CONTRACT_ABI } from '../config'

export default function TransferModal({ nft, signer, userAddress, switchToChain, onClose, showStatus }) {
  const [selectedDestChain, setSelectedDestChain] = useState('')
  const [receiverAddress, setReceiverAddress] = useState('')
  const [loading, setLoading] = useState(false)

  const confirmTransfer = async () => {
    if (!selectedDestChain) {
      showStatus('Please select a destination chain', 'error')
      return
    }

    setLoading(true)

    try {
      // Check if on correct network
      const network = await signer.provider.getNetwork()
      const currentChain = network.chainId.toString()
      
      console.log('Current chain:', currentChain, 'NFT chain:', nft.chainId)
      
      if (currentChain !== nft.chainId) {
        const nftChainInfo = CONFIG.MINT_CHAINS[nft.chainId]
        showStatus(`⚠️ Please switch to ${nftChainInfo?.name || nft.chain} in your wallet to transfer this NFT`, 'error')
        setLoading(false)
        return
      }
      
      showStatus('Preparing transfer...', 'info')

      // Get the correct contract address for this chain
      const contractAddress = CONFIG.CONTRACTS[nft.chainId] || CONFIG.CONTRACT_ADDRESS
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer)
      const receiver = receiverAddress.trim() || userAddress
      const destChain = CONFIG.MINT_CHAINS[selectedDestChain]
      const zrc20Address = destChain.zrc20

      showStatus('Initiating cross-chain transfer...', 'info')
      
      // For ZetaChain destination, use address(0) and no value
      // For other chains, use ZRC-20 address and send gas
      const txOptions = selectedDestChain === '7001' 
        ? { gasLimit: 500000 }
        : { value: ethers.parseEther('0.01'), gasLimit: 500000 }

      // Verify ownership
      const owner = await contract.ownerOf(nft.tokenId)
      console.log('NFT owner:', owner, 'User:', userAddress)
      
      if (owner.toLowerCase() !== userAddress.toLowerCase()) {
        throw new Error('You do not own this NFT')
      }

      console.log('Transfer params:', {
        tokenId: nft.tokenId,
        receiver,
        destination: zrc20Address,
        options: txOptions
      })

      // Skip gas estimation and try the transfer directly
      showStatus('Sending transaction...', 'info')
      
      const tx = await contract.transferCrossChain(
        nft.tokenId,
        receiver,
        zrc20Address,
        txOptions
      )

      showStatus('Transaction submitted. Waiting for confirmation...', 'info')
      const receipt = await tx.wait()
      
      console.log('Transfer receipt:', receipt)

      onClose()
      showStatus('NFT transfer initiated! It will arrive in 2-5 minutes.', 'success')
      
    } catch (error) {
      console.error('Error transferring NFT:', error)
      
      // Better error messages
      if (error.code === 'ACTION_REJECTED') {
        showStatus('Transaction rejected by user', 'info')
      } else if (error.message.includes('switch')) {
        showStatus(error.message, 'error')
      } else {
        showStatus(`Transfer failed: ${error.reason || error.message}`, 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="modal-close" onClick={onClose}>&times;</span>
        <h2>🌐 Transfer NFT Cross-Chain</h2>
        
        <div className="transfer-info">
          <div className="info-item">
            <span className="info-label">Current Chain:</span>
            <span className="info-value">{nft.chainIcon} {nft.chain}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Token ID:</span>
            <span className="info-value">#{nft.tokenId}</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="destChainSelect">Destination Chain:</label>
          <select 
            id="destChainSelect"
            value={selectedDestChain}
            onChange={(e) => setSelectedDestChain(e.target.value)}
            className="chain-dropdown"
          >
            <option value="">Select destination chain...</option>
            {Object.entries(CONFIG.MINT_CHAINS)
              .filter(([chainId, chain]) => {
                // Only show chains in the same cross-chain group
                const currentChain = CONFIG.MINT_CHAINS[nft.chainId];
                return chainId !== nft.chainId && chain.group === currentChain?.group;
              })
              .map(([chainId, chain]) => (
                <option key={chainId} value={chainId}>
                  {chain.icon} {chain.name}
                </option>
              ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="transferReceiver">Receiver Address (optional):</label>
          <input 
            type="text" 
            id="transferReceiver"
            value={receiverAddress}
            onChange={(e) => setReceiverAddress(e.target.value)}
            placeholder="Leave empty to use your address" 
          />
        </div>

        <div className="transfer-warning">
          <p>⚠️ <strong>Important:</strong></p>
          <ul>
            <li>NFT will be burned on current chain</li>
            <li>NFT will be minted on destination chain</li>
            <li>Process takes 2-5 minutes</li>
            <li>Small gas fee (~0.01 ZETA) for cross-chain</li>
          </ul>
        </div>

        <button 
          onClick={confirmTransfer}
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? '⏳ Transferring...' : '🚀 Confirm Transfer'}
        </button>
      </div>
    </div>
  )
}
