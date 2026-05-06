# Chatbot RAG — Assistant Recrutement Développeur IA

Pipeline RAG complète de A à Z — Projet Final IPSSI BD3 26.1

## Description

Un chatbot qui répond aux questions d'un candidat postulant à un poste de développeur IA.
Il s'appuie uniquement sur les documents du corpus fourni (Pinecone + Mistral embeddings + GROQ LLM).

## Technologies utilisées

- **GROQ** — LLM `llama-3.3-70b-versatile` avec streaming
- **Mistral AI** — Embeddings `mistral-embed` (1024 dimensions)
- **Pinecone** — Base vectorielle serverless

## Installation

```bash
npm install
```

## Configuration

Copier `.env.example` en `.env` et renseigner les clés API :

```bash
cp .env.example .env
```

Obtenir les clés :
- GROQ : https://console.groq.com
- Mistral : https://console.mistral.ai
- Pinecone : https://app.pinecone.io

## Lancement

### Étape 1 — Créer l'index Pinecone

```bash
node create-index.js
```

### Étape 2 — Indexer les documents

```bash
node embed-documents.js
```

### Étape 3 — Lancer le chatbot RAG

```bash
node rag-pipeline.js
```

## Structure du projet

```
├── create-index.js        # Crée l'index Pinecone
├── embed-documents.js     # Charge, découpe, vectorise et stocke les documents
├── rag-pipeline.js        # Pipeline RAG complète (chatbot principal)
├── chatbot.js             # Chatbot simple sans RAG (historique uniquement)
├── .env.example           # Modèle de configuration (sans vraies clés)
├── package.json
└── documents/
    ├── fiche_poste.txt
    ├── guide_entretien.txt
    ├── faq_rh.txt
    └── competences_tech.txt
```

## Fonctionnement de la pipeline RAG

1. **Chargement** — lecture des fichiers `.txt` dans `documents/`
2. **Chunking** — découpage en blocs de 500 caractères (overlap 50)
3. **Embedding** — vectorisation via `mistral-embed`
4. **Stockage** — upsert dans Pinecone avec métadonnées (source, texte)
5. **Requête** — vectorisation de la question + recherche cosine dans Pinecone
6. **Génération** — envoi du contexte + question à GROQ avec streaming

## Exemple d'utilisation

```
Vous : Quel est le salaire pour un Bac+3 ?
Assistant : [Source : faq_rh.txt]
Pour un profil Bac+3, la fourchette est de 32 000 à 40 000 euros brut annuel...

Vous : Qui a gagné la coupe du monde ?
Assistant : Je ne trouve pas cette information dans les documents fournis.
```
