/**
 * Service d'appel à l'API Rick and Morty
 */

const BASE_URL = 'https://rickandmortyapi.com/api'

export async function fetchCharacters(url = `${BASE_URL}/character`) {
  const response = await fetch(url)
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('429')
    }
    throw new Error(`Erreur réseau : ${response.status}`)
  }
  return response.json()
}

export async function fetchCharacterById(id) {
  const response = await fetch(`${BASE_URL}/character/${id}`)
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Personnage introuvable.')
    }
    throw new Error(`Erreur réseau : ${response.status}`)
  }
  return response.json()
}
