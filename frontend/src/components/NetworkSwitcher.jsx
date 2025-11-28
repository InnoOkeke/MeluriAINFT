import { CONFIG } from '../config'

export default function NetworkSwitcher({ currentChainId, switchToChain, isSwitching }) {
  // Get all supported chains from CONFIG
  const supportedChains = Object.entries(CONFIG.MINT_CHAINS).map(([id, config]) => ({
    id,
    ...config
  }))

  const currentChain = CONFIG.MINT_CHAINS[currentChainId]
  const isSupported = !!currentChain

  const handleNetworkChange = (e) => {
    const selectedChainId = e.target.value
    console.log('NetworkSwitcher: User selected chainId:', selectedChainId)
    switchToChain(selectedChainId)
  }

  return (
    <div className="network-switcher-container">
      <select
        value={isSupported ? currentChainId : ''}
        onChange={handleNetworkChange}
        disabled={isSwitching}
        className={`network-dropdown ${!isSupported ? 'unsupported' : ''} ${isSwitching ? 'switching' : ''}`}
      >
        {isSwitching && (
          <option value={currentChainId} disabled>
            ⏳ Switching...
          </option>
        )}
        {!isSupported && !isSwitching && (
          <option value="" disabled>
            ⚠️ Unsupported Network
          </option>
        )}
        {supportedChains.map((chain) => (
          <option key={chain.id} value={chain.id}>
            {chain.icon} {chain.name}
          </option>
        ))}
      </select>
    </div>
  )
}
