import { CONFIG } from '../config'

export default function Header({ userAddress, onConnect, onDisconnect, currentChainId }) {
  const SUPPORTED_CHAINS = ['7001', '11155111', '80002', '50312', '11142220', '10143']
  const currentChain = CONFIG.MINT_CHAINS[currentChainId]
  const isSupported = SUPPORTED_CHAINS.includes(currentChainId)
  
  return (
    <header className="header">
      <div className="header-content">
        <div>
          <h1>🎨 Meluri AI NFT</h1>
          <p className="tagline">Create with AI, Mint Anywhere</p>
        </div>
        
        {!userAddress ? (
          <button onClick={onConnect} className="btn btn-primary btn-connect">
            <span className="wallet-icon">👛</span>
            Connect Wallet
          </button>
        ) : (
          <div className="wallet-info-container">
            <div className="wallet-info">
              <span className="wallet-icon">✓</span>
              <span className="wallet-address">
                {`${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`}
              </span>
              {currentChainId && currentChain && (
                <span className={`network-badge ${isSupported ? 'supported' : 'unsupported'}`}>
                  {currentChain.icon} {currentChain.name}
                </span>
              )}
              <button onClick={onDisconnect} className="btn-disconnect">
                Disconnect
              </button>
            </div>
            
            {currentChainId && !isSupported && (
              <div className="network-warning-inline">
                <span>⚠️ Please switch to ZetaChain Athens, Ethereum Sepolia, or Base Sepolia in your wallet</span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
