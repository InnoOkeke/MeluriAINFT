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

      if (!contractAddress) {
        throw new Error(`No contract address found for chain ${nft.chainId}`)
      }

      console.log('Creating contract instance:', contractAddress)

      // Get fresh provider and signer to avoid stale connection issues
      let activeSigner = signer
      if (!signer.provider) {
        console.log('Signer has no provider, getting fresh one...')
        const provider = new ethers.BrowserProvider(window.ethereum)
        activeSigner = await provider.getSigner()
      }

      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, activeSigner)

      // Verify contract has the method
      if (typeof contract.transferCrossChain !== 'function') {
        throw new Error('Contract does not have transferCrossChain method')
      }

      const receiver = receiverAddress.trim() || userAddress
      const destChain = CONFIG.MINT_CHAINS[selectedDestChain]

      // For cross-chain transfers, destination parameter depends on SOURCE chain:
      // - FROM ZetaChain: use destination chain's ZRC20 gas token
      // - FROM EVM chain: use address(0) if going to ZetaChain, ZRC20 if going to another EVM
      let destination
      if (nft.chainId === '7001') {
        // FROM ZetaChain to another EVM chain - use destination's ZRC20 gas token
        destination = destChain.zrc20
        if (!destination || destination === ethers.ZeroAddress) {
          throw new Error(`No ZRC20 gas token configured for ${destChain.name}`)
        }
      } else if (selectedDestChain === '7001') {
        // FROM EVM chain TO ZetaChain - use address(0)
        destination = ethers.ZeroAddress
      } else {
        // FROM EVM chain TO another EVM chain - use destination's ZRC20 gas token
        destination = destChain.zrc20
        if (!destination || destination === ethers.ZeroAddress) {
          throw new Error(`No ZRC20 gas token configured for ${destChain.name}`)
        }
      }

      showStatus('Initiating cross-chain transfer...', 'info')

      // Send appropriate amount based on chain's native token value
      // This ensures enough for gas after swaps on ZetaChain
      let transferAmount = '0.005' // Default for ETH-based chains (Sepolia, Arbitrum)

      // Adjust amount based on source chain
      if (nft.chainId === '7001') { // ZetaChain
        transferAmount = '0.5' // 0.5 ZETA for gas swapping
      } else
        if (nft.chainId === '1001') { // Kaia
          transferAmount = '20.0' // 5 KAIA
        } else if (nft.chainId === '97') { // BSC
          transferAmount = '0.01' // 0.01 BNB
        } else if (nft.chainId === '80002') { // Polygon
          transferAmount = '1.0' // 1 POL
        } else if (nft.chainId === '43113') { // Avalanche
          transferAmount = '0.1' // 0.1 AVAX
        }

      const txOptions = { value: ethers.parseEther(transferAmount), gasLimit: 6000000 }

      // Verify ownership
      const owner = await contract.ownerOf(nft.tokenId)
      console.log('NFT owner:', owner, 'User:', userAddress)

      if (owner.toLowerCase() !== userAddress.toLowerCase()) {
        throw new Error('You do not own this NFT')
      }

      console.log('Transfer params:', {
        tokenId: nft.tokenId,
        receiver,
        destination,
        destinationIsZero: destination === ethers.ZeroAddress,
        destChain: destChain.name,
        destChainId: selectedDestChain,
        zrc20: destChain.zrc20,
        options: txOptions
      })

      // Debug: Check contract and function
      console.log('Contract address:', await contract.getAddress())
      console.log('Contract interface functions:', contract.interface.fragments.map(f => f.name))

      // Try to encode the function call manually to verify
      try {
        const encodedData = contract.interface.encodeFunctionData('transferCrossChain', [
          nft.tokenId,
          receiver,
          destination
        ])
        console.log('Encoded function data:', encodedData)
        console.log('Data length:', encodedData.length)
      } catch (encodeError) {
        console.error('Error encoding function:', encodeError)
      }

      showStatus('Sending transaction...', 'info')

      const tx = await contract.transferCrossChain(
        nft.tokenId,
        receiver,
        destination,
        txOptions // This is correct - ethers v6 accepts overrides as last param
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
            <span className="info-value">
              {nft.chainIcon || CONFIG.MINT_CHAINS[nft.chainId]?.icon || '🔗'} {nft.chainName || nft.chain || CONFIG.MINT_CHAINS[nft.chainId]?.name || `Chain ${nft.chainId}`}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Token ID:</span>
            <span className="info-value">#{nft.tokenId || 'Unknown'}</span>
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
          <label htmlFor="transferReceiver">Destination Address (optional):</label>
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
