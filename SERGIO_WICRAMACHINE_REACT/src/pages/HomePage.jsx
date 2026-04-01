import { useState, useEffect } from 'react'
import { fetchCharacters } from '../services/api'
import CharacterGrid from '../components/CharacterGrid'
import Pagination from '../components/Pagination'

export default function HomePage() {
  const [currentUrl, setCurrentUrl] = useState('https://rickandmortyapi.com/api/character')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadCharacters() {
      setLoading(true)
      setError(null)
      try {
        const result = await fetchCharacters(currentUrl)
        if (!cancelled) {
          setData(result)
        }
      } catch (err) {
        if (!cancelled) {
          if (err.message === '429') {
            setError('Trop de requêtes — veuillez patienter quelques secondes avant de réessayer.')
          } else {
            setError('Une erreur est survenue, veuillez réessayer.')
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadCharacters()

    return () => { cancelled = true }
  }, [currentUrl])

  function handlePrev() {
    if (data?.info?.prev) setCurrentUrl(data.info.prev)
  }

  function handleNext() {
    if (data?.info?.next) setCurrentUrl(data.info.next)
  }

  return (
    <div>
      <h1 className="page-title">Multivers Explorer</h1>
      <p className="page-subtitle">
        Explorez les personnages de l'univers Rick &amp; Morty
      </p>

      {loading && (
        <div className="loader">
          <div className="spinner" role="status" aria-label="Chargement" />
          <span>Chargement…</span>
        </div>
      )}

      {!loading && error && (
        <div className="error-box" role="alert">
          <p>{error}</p>
          <button
            className="btn-retry"
            onClick={() => setCurrentUrl((u) => u)}
          >
            Réessayer
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          <CharacterGrid characters={data.results} />
          <Pagination
            info={data.info}
            onPrev={handlePrev}
            onNext={handleNext}
            loading={loading}
          />
        </>
      )}
    </div>
  )
}
