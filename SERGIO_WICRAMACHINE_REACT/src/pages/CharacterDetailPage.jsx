import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchCharacterById } from '../services/api'
import EvaluationForm from '../components/EvaluationForm'

function getStatusClass(status) {
  switch (status?.toLowerCase()) {
    case 'alive': return 'status-alive'
    case 'dead': return 'status-dead'
    default: return 'status-unknown'
  }
}

function getStatusLabel(status) {
  switch (status?.toLowerCase()) {
    case 'alive': return 'Vivant'
    case 'dead': return 'Mort'
    default: return 'Inconnu'
  }
}

export default function CharacterDetailPage() {
  const { id } = useParams()
  const [character, setCharacter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadCharacter() {
      setLoading(true)
      setError(null)
      setCharacter(null)
      try {
        const data = await fetchCharacterById(id)
        if (!cancelled) setCharacter(data)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Une erreur est survenue, veuillez réessayer.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadCharacter()

    return () => { cancelled = true }
  }, [id])

  return (
    <div className="detail-container">
      <Link to="/" className="detail-back">
        ← Retour à l'accueil
      </Link>

      {loading && (
        <div className="loader">
          <div className="spinner" role="status" aria-label="Chargement" />
          <span>Chargement…</span>
        </div>
      )}

      {!loading && error && (
        <div className="error-box" role="alert">
          <p>{error}</p>
          <Link to="/" style={{ color: '#ff6b6b', textDecoration: 'underline', fontSize: '0.9rem' }}>
            Retour à l'accueil
          </Link>
        </div>
      )}

      {!loading && !error && character && (
        <>
          <div className="detail-card">
            <img src={character.image} alt={character.name} />
            <div className="detail-info">
              <h1 className="detail-name">{character.name}</h1>

              <div className={`detail-badge ${getStatusClass(character.status)}`}>
                <span className="status-dot" />
                {getStatusLabel(character.status)}
              </div>

              <div className="detail-stats">
                <div className="detail-stat">
                  <span className="detail-stat-label">Espèce</span>
                  <span className="detail-stat-value">{character.species}</span>
                </div>
                <div className="detail-stat">
                  <span className="detail-stat-label">Origine</span>
                  <span className="detail-stat-value">{character.origin?.name}</span>
                </div>
                {character.type && (
                  <div className="detail-stat">
                    <span className="detail-stat-label">Type</span>
                    <span className="detail-stat-value">{character.type}</span>
                  </div>
                )}
                <div className="detail-stat">
                  <span className="detail-stat-label">Genre</span>
                  <span className="detail-stat-value">{character.gender}</span>
                </div>
                <div className="detail-stat">
                  <span className="detail-stat-label">Lieu</span>
                  <span className="detail-stat-value">{character.location?.name}</span>
                </div>
              </div>
            </div>
          </div>

          <EvaluationForm characterName={character.name} />
        </>
      )}
    </div>
  )
}
