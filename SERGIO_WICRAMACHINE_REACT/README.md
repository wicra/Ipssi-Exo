# Multivers Explorer

Mini-application React permettant d'explorer les personnages de l'univers **Rick and Morty** via l'[API publique](https://rickandmortyapi.com).

## Fonctionnalités

- **Liste paginée** des personnages en grille (image, nom, espèce)  
- **Pagination** Précédent / Suivant avec désactivation automatique selon `info.prev` / `info.next`  
- **Page de détail** par personnage (`/character/:id`) avec nom, image, statut, espèce, origine  
- **Rendu conditionnel** : loader, message d'erreur et gestion du code 429  
- **Formulaire d'évaluation** (Formik + Zod) avec :  
  - Nom (obligatoire, min 3 caractères)  
  - Email (obligatoire, format valide)  
  - Note (obligatoire, entier entre 1 et 5)  
  - Commentaire (facultatif, max 200 caractères)  
  - Affichage des erreurs en rouge sous chaque champ  
  - Modale de confirmation via `<dialog>` natif + `useRef`

## Stack technique

- [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- [React Router DOM v6](https://reactrouter.com/)
- [Formik](https://formik.org/) + [Zod](https://zod.dev/) + [zod-formik-adapter](https://www.npmjs.com/package/zod-formik-adapter)

## Lancer le projet

```bash
npm install
npm run dev
```

Ouvrez ensuite [http://localhost:5173](http://localhost:5173).

## Structure

```
src/
├── components/
│   ├── Header.jsx          # Navigation persistante
│   ├── CharacterCard.jsx   # Carte d'un personnage
│   ├── CharacterGrid.jsx   # Grille de personnages
│   ├── Pagination.jsx      # Boutons Précédent / Suivant
│   └── EvaluationForm.jsx  # Formulaire Formik + Zod + <dialog>
├── pages/
│   ├── HomePage.jsx        # Route /
│   └── CharacterDetailPage.jsx  # Route /character/:id
├── services/
│   └── api.js              # Appels fetch vers l'API Rick and Morty
├── App.jsx                 # Routing principal
├── main.jsx
└── index.css
```
