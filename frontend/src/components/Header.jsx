import { CONFIG } from '../config'
import NetworkSwitcher from './NetworkSwitcher'

export default function Header({ userAddress, onConnect, onDisconnect, currentChainId, switchToChain, isSwitching }) {
  // Get supported chains from CONFIG (chains with deployed contracts)
  const SUPPORTED_CHAINS = Object.keys(CONFIG.CONTRACTS).filter(chainId => {
    const address = CONFIG.CONTRACTS[chainId]
    return address && address !== ''
  })

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

              <NetworkSwitcher
                currentChainId={currentChainId}
                switchToChain={switchToChain}
                isSwitching={isSwitching}
              />

              <button onClick={onDisconnect} className="btn-disconnect">
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
