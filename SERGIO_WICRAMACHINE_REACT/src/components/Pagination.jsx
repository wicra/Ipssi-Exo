export default function Pagination({ info, onPrev, onNext, loading }) {
  return (
    <div className="pagination">
      <button
        className="btn-page"
        onClick={onPrev}
        disabled={!info.prev || loading}
        aria-label="Page précédente"
      >
        ← Précédent
      </button>

      <span className="page-info">
        {loading ? 'Chargement…' : `Page en cours`}
      </span>

      <button
        className="btn-page"
        onClick={onNext}
        disabled={!info.next || loading}
        aria-label="Page suivante"
      >
        Suivant →
      </button>
    </div>
  )
}
