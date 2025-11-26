import MyNFTs from '../components/MyNFTs'

export default function MyNFTsPage({ 
  signer, 
  userAddress, 
  showStatus, 
  refreshTrigger,
  onTransferClick 
}) {
  return (
    <div className="page">
      <MyNFTs 
        signer={signer}
        userAddress={userAddress}
        showStatus={showStatus}
        refreshTrigger={refreshTrigger}
        onTransferClick={onTransferClick}
      />
    </div>
  )
}
