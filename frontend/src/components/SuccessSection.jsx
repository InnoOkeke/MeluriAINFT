import { CONFIG } from '../config'

export default function SuccessSection({ nft, onTransfer, onMintAnother }) {
  const viewOnExplorer = () => {
    // Use the explorer for the chain where NFT was minted
    const explorer = CONFIG.MINT_CHAINS[nft.chain].explorer
    // Link to the transaction hash if available, otherwise wallet address
    if (nft.txHash) {
      window.open(`${explorer}/tx/${nft.txHash}`, '_blank')
    } else {
      window.open(`${explorer}/address/${nft.owner}`, '_blank')
    }
  }

  return (
    <section className="card success-section" id="successSection">
      <div className="step-header">
        <span className="step-number">✓</span>
        <h2>🎉 NFT Minted Successfully!</h2>
      </div>

      <div className="success-content">
        <div className="nft-card">
          <img src={nft.image} alt={nft.name} />
          <div className="nft-info">
            <h3>{nft.name}</h3>
            <p><strong>Token ID:</strong> {nft.tokenId}</p>
            <p><strong>Chain:</strong> {nft.chainName}</p>
            <p><strong>Owner:</strong> {`${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}`}</p>
          </div>
        </div>

        <div className="success-actions">
          <button onClick={viewOnExplorer} className="btn btn-primary">
            🔍 View on Explorer
          </button>
          <button onClick={onTransfer} className="btn btn-secondary">
            🌐 Transfer to Another Chain
          </button>
          <button onClick={onMintAnother} className="btn btn-success">
            🎨 Mint Another NFT
          </button>
        </div>
      </div>
    </section>
  )
}
