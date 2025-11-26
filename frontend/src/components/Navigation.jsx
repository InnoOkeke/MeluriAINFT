import { NavLink } from 'react-router-dom'

export default function Navigation() {
  return (
    <nav className="navigation">
      <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        🎨 Mint NFT
      </NavLink>
      <NavLink to="/my-nfts" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        🖼️ My NFTs
      </NavLink>
    </nav>
  )
}
