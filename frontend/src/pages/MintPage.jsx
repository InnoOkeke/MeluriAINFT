import { useState } from 'react'
import CreateArt from '../components/CreateArt'
import MintNFT from '../components/MintNFT'
import SuccessSection from '../components/SuccessSection'

export default function MintPage({ 
  signer, 
  userAddress, 
  switchToChain, 
  showStatus,
  onTransferClick,
  currentChainId 
}) {
  const [generatedImage, setGeneratedImage] = useState('')
  const [currentNFT, setCurrentNFT] = useState(null)

  return (
    <div className="page">
      <CreateArt 
        generatedImage={generatedImage}
        setGeneratedImage={setGeneratedImage}
        showStatus={showStatus}
      />

      <MintNFT 
        signer={signer}
        userAddress={userAddress}
        generatedImage={generatedImage}
        setCurrentNFT={setCurrentNFT}
        switchToChain={switchToChain}
        showStatus={showStatus}
        currentChainId={currentChainId}
      />

      {currentNFT && (
        <SuccessSection 
          nft={currentNFT}
          onTransfer={() => onTransferClick(currentNFT)}
          onMintAnother={() => {
            setGeneratedImage('')
            setCurrentNFT(null)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        />
      )}
    </div>
  )
}
