import { Link } from 'react-router-dom'

export default function CharacterCard({ character }) {
  return (
    <Link to={`/character/${character.id}`} className="character-card">
      <img
        src={character.image}
        alt={character.name}
        loading="lazy"
      />
      <div className="character-card-body">
        <p className="character-card-name">{character.name}</p>
        <p className="character-card-species">
          <span className="species-dot" />
          {character.species}
        </p>
      </div>
    </Link>
  )
}
