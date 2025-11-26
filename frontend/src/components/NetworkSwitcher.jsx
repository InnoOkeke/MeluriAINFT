import { CONFIG } from '../config'

export default function NetworkSwitcher({ currentChainId, switchToChain }) {
  const SUPPORTED_CHAINS = ['7001', '11155111', '84532'] // ZetaChain, Sepolia, Base Sepolia
  
  if (!currentChainId || SUPPORTED_CHAINS.includes(currentChainId)) {
    // Show network selector for supported chains
    return (
      <div className="network-selector">
        <label htmlFor="networkSelect">Current Network:</label>
        <select 
          id="networkSelect"
          value={currentChainId || '7001'}
          onChange={(e) => switchToChain(e.target.value)}
          className="network-dropdown"
        >
          <option value="7001">⚡ ZetaChain Athens</option>
          <option value="11155111">🔷 Ethereum Sepolia</option>
          <option value="84532">🔵 Base Sepolia</option>
        </select>
      </div>
    )
  }

  // Show warning if on unsupported network
  const currentChain = CONFIG.MINT_CHAINS[currentChainId]

  return (
    <div className="network-switcher">
      <div className="network-warning">
        <div className="warning-icon">⚠️</div>
        <div className="warning-content">
          <h3>Unsupported Network</h3>
          <p>
            You're on <strong>{currentChain?.name || 'Unknown Network'}</strong>
          </p>
          <p>
            Please switch to one of the supported networks:
          </p>
          <div className="network-buttons">
            <button onClick={() => switchToChain('7001')} className="btn btn-secondary">
              ⚡ ZetaChain Athens
            </button>
            <button onClick={() => switchToChain('11155111')} className="btn btn-secondary">
              🔷 Ethereum Sepolia
            </button>
            <button onClick={() => switchToChain('84532')} className="btn btn-secondary">
              🔵 Base Sepolia
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
