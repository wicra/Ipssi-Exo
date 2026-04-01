import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const location = useLocation()
  const isDetail = location.pathname.startsWith('/character/')

  return (
    <header className="header">
      <Link to="/" className="header-logo">
        Multivers <span>Explorer</span>
      </Link>
      <nav className="header-nav">
        {isDetail && (
          <Link to="/">← Retour à l'accueil</Link>
        )}
        {!isDetail && (
          <span style={{ color: '#7a8fa8', fontSize: '0.85rem' }}>
            Rick &amp; Morty API
          </span>
        )}
      </nav>
    </header>
  )
}
