import CharacterCard from './CharacterCard'

export default function CharacterGrid({ characters }) {
  return (
    <div className="characters-grid">
      {characters.map((character) => (
        <CharacterCard key={character.id} character={character} />
      ))}
    </div>
  )
}
