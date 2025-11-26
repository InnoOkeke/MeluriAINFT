import { CONFIG } from '../config'

export default function NFTDetailsModal({ nft, userAddress, onClose, onTransfer }) {
  if (!nft) return null

  const viewOnExplorer = () => {
    const explorer = CONFIG.MINT_CHAINS[nft.chainId].explorer
    // Link to transaction hash if available, otherwise wallet address
    if (nft.txHash) {
      window.open(`${explorer}/tx/${nft.txHash}`, '_blank')
    } else {
      window.open(`${explorer}/address/${userAddress}`, '_blank')
    }
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content nft-details-modal" onClick={(e) => e.stopPropagation()}>
        <span className="modal-close" onClick={onClose}>&times;</span>
        
        <div className="nft-details-content">
          <div className="nft-details-image">
            <img src={nft.image} alt={nft.name} />
          </div>
          
          <div className="nft-details-info">
            <h2>{nft.name}</h2>
            
            <div className="nft-details-grid">
              <div className="detail-item">
                <span className="detail-label">Token ID</span>
                <span className="detail-value">{nft.tokenId}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Chain</span>
                <span className="detail-value">
                  <span className="chain-badge">
                    {nft.chainIcon} {nft.chain}
                  </span>
                </span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Owner</span>
                <span className="detail-value">{`${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`}</span>
              </div>
            </div>

            <div className="nft-actions">
              <button onClick={viewOnExplorer} className="btn btn-primary">
                🔍 View on Explorer
              </button>
              <button onClick={() => { onTransfer(nft); onClose(); }} className="btn btn-secondary">
                🌐 Transfer to Another Chain
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
