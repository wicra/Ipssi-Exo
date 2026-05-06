# FORMATION IPSSI

## NodeJs : Communication avec IA

### PROJET FINAL

**Chatbot Assistant Recrutement Tech**

**Pipeline RAG complète de A à Z**

---

### Groupe : BD3 26.1  —  Bac+3 Dev
**Formatrice : Agbefou Carine**
**Date : Mai 2026**

---

## 1. Contexte et objectif

### 1.1 Ce que vous construisez

Un chatbot capable de répondre aux questions d'un candidat qui postule à un poste de développeur IA. Le chatbot s'appuie sur un corpus de documents fournis — il ne répond que sur la base de ces documents et dit "je ne sais pas" si la réponse n'est pas dans le corpus.

### 1.2 Pourquoi ce sujet

Ce sujet vous concerne directement en tant que futurs développeurs. Vous connaissez le domaine, les questions sont naturelles, et vous pouvez facilement tester si les réponses sont correctes. C'est aussi un cas d'usage réel — de nombreuses entreprises déploient ce type de chatbot RH.

### 1.3 Ce que le chatbot doit savoir faire

- Répondre correctement aux questions sur le corpus fourni
- Citer le fichier source de sa réponse
- Dire "Je ne trouve pas cette information dans les documents fournis" pour les questions hors contexte
- Gérer les erreurs API proprement

🎯 **Objectif pédagogique : ce projet couvre l'intégralité du programme.**

- **Jour 1** : appels API fetch, .env, providers
- **Jour 2** : messages[], rôles, historique
- **Jour 3** : RAG concept, bases vectorielles
- **Jour 4** : chunking, embedding, Pinecone, pipeline complète
- **Jour 5** : gestion erreurs, max_tokens, Ethical AI

---

## 2. Le corpus fourni

Vous travaillez tous sur le même corpus — 4 fichiers `.txt` que vous créez dans votre dossier `documents/`. Copiez le contenu ci-dessous dans chaque fichier.

### 2.1 fiche_poste.txt

**FICHE DE POSTE — DÉVELOPPEUR IA**

**Intitulé du poste** : Développeur IA / Intégrateur d'API LLM
**Niveau** : Bac+3 à Bac+5
**Type de contrat** : CDI ou alternance
**Lieu** : Remote ou hybride

#### MISSIONS PRINCIPALES :

- Intégrer des API d'intelligence artificielle générative dans des applications Node.js
- Concevoir et implémenter des pipelines RAG (Retrieval-Augmented Generation)
- Développer des chatbots et agents conversationnels avec Tool Use
- Optimiser les coûts d'inférence et mettre en place des garde-fous
- Assurer la qualité et la fiabilité des réponses générées

#### COMPÉTENCES TECHNIQUES REQUISES :

- Maîtrise de Node.js et JavaScript asynchrone (async/await)
- Expérience avec les API REST et le protocole fetch
- Connaissance des LLM : Mistral, Groq, HuggingFace
- Maîtrise de Pinecone ou équivalent pour les bases vectorielles
- Compréhension des concepts : tokens, embeddings, chunking, prompting
- Bonnes pratiques : gestion des erreurs, refactorisation, sécurité des clés API

#### PROFIL RECHERCHÉ :

- Curieux, autonome, à l'aise avec la documentation technique
- Sensibilité aux enjeux éthiques de l'IA
- Capacité à vulgariser des concepts techniques

---

### 2.2 guide_entretien.txt

**GUIDE D'ENTRETIEN TECHNIQUE — DÉVELOPPEUR IA**

#### Sur le RAG :

- Décrivez les 5 étapes d'une pipeline RAG
- Pourquoi utilise-t-on une base vectorielle plutôt qu'une base SQL ?
- Qu'est-ce que le chunking et quels paramètres faut-il régler ?

#### CE QU'ON ÉVALUE :

- La clarté des explications : sait-on expliquer un concept simplement ?
- La pratique : a-t-on déjà codé ces fonctionnalités ?
- La curiosité : connaît-on les outils récents du marché ?
- L'éthique : est-on conscient des risques liés à l'IA ?

#### DÉROULEMENT DE L'ENTRETIEN :

L'entretien se déroule en deux parties :

1. Une partie technique (45 minutes)
2. Une partie comportementale (15 minutes)

#### QUESTIONS TECHNIQUES TYPIQUES :

- **Sur Node.js et les API** :
  - Expliquez la différence entre GET et POST dans une requête HTTP
  - Comment gérez-vous les erreurs dans un appel fetch ?
  - Pourquoi utilise-t-on dotenv pour les clés API ?

- **Sur les LLM et l'IA générative** :
  - Qu'est-ce qu'un token ? Comment impacte-t-il les coûts ?

---

### 2.3 faq_rh.txt

**FAQ RECRUTEMENT — QUESTIONS FRÉQUENTES DES CANDIDATS**

- **Q : Quel est le processus de recrutement ?**
  - R : Le processus comprend 3 étapes : 1) envoi du CV et lettre de motivation, 2) entretien technique de 60 minutes, 3) entretien RH de 30 minutes. La réponse est donnée sous 5 jours ouvrés.

- **Q : Y a-t-il du télétravail ?**
  - R : Oui, le poste est 100% remote possible. Une présence en présentiel est demandée une fois par mois pour les réunions d'équipe.

- **Q : Quelle est la fourchette de salaire ?**
  - R : Pour un profil Bac+3, la fourchette est de 32 000 à 40 000 euros brut annuel selon l'expérience. Pour un Bac+5, la fourchette est de 42 000 à 55 000 euros.

- **Q : Y a-t-il des avantages en plus du salaire ?**
  - R : Oui : tickets restaurant, mutuelle prise en charge à 100%, abonnement transport remboursé à 50%, budget formation annuel de 2 000 euros.

- **Q : Acceptez-vous les alternants ?**
  - R : Oui, nous recrutons des alternants en Bac+3 et Bac+5. Le rythme peut être 3 semaines entreprise / 1 semaine école ou selon le calendrier de votre école.

- **Q : Quand peut-on commencer ?**
  - R : Le poste est à pourvoir dès que possible. Un préavis de 2 mois est compris.

---

### 2.4 competences_tech.txt

**RÉFÉRENTIEL DE COMPÉTENCES TECHNIQUES — DÉVELOPPEUR IA**

#### NIVEAU DÉBUTANT (requis pour l'alternance) :

- Bases de JavaScript et Node.js
- Comprendre ce qu'est une API REST
- Avoir utilisé fetch ou axios
- Connaître les concepts de base de l'IA générative

#### NIVEAU INTERMÉDIAIRE (requis pour CDI Bac+3) :

- Maîtriser les appels API avec authentification Bearer
- Savoir utiliser dotenv pour sécuriser les clés
- Comprendre les tokens et leur impact sur les coûts
- Avoir implémenté un chatbot avec historique messages[]
- Connaître les providers : Mistral, Groq, HuggingFace

#### NIVEAU AVANCÉ (requis pour CDI Bac+5) :

- Maîtriser la mise en place d'une pipeline RAG complète
- Savoir créer et utiliser un vector store avec Pinecone
- Implémenter le Function Calling et la boucle agentique
- Appliquer les bonnes pratiques : refactorisation, garde-fous de coût
- Connaître les principes d'Ethical AI : biais, transparence, RGPD

#### OUTILS ET TECHNOLOGIES DU MARCHÉ :

- **LLM** : Mistral AI, Groq, OpenAI, Anthropic Claude
- **Bases vectorielles** : Pinecone, Weaviate, Chroma
- **Frameworks** : LangChain, LlamaIndex
- **Cloud** : AWS Bedrock, Azure OpenAI, Google Vertex AI

---

## 3. Livrables attendus

Chaque groupe rend un dossier complet contenant les éléments suivants.

### 3.1 Fichiers de code

- `create-index.js` — crée l'index Pinecone
- `embed-documents.js` — charge, découpe, vectorise et stocke les documents
- `rag-pipeline.js` — pipeline complète avec retrieveContext et generateCompletion
- `.env.example` — fichier modèle sans les vraies clés (MISTRAL_API_KEY=votre_cle_ici)

### 3.2 Documentation

- `README.md` — comment installer et lancer le projet (npm install, node create-index.js, etc.)

### 3.3 Preuves de fonctionnement

- **Capture d'écran 1** : terminal montrant les vecteurs indexés dans Pinecone
- **Capture d'écran 2** : le chatbot répondant correctement à une question sur le corpus
- **Capture d'écran 3** : le chatbot répondant "je ne sais pas" à une question hors corpus

⚠️ **Ne jamais inclure vos vraies clés API dans les fichiers rendus.**

Le fichier `.env` ne doit PAS être dans le rendu — seulement `.env.example`

---

## 4. Répartition des groupes

Vous travaillez en groupe. Un seul projet par groupe. Chaque membre doit pouvoir expliquer l'ensemble du code.

### Groupe

#### Membres

- **Groupe Lille 2** : Azzedine Amari, Mohammed Yecir, Amine Chebbour, Mougou Ayman
- **Groupe 2** : Dzioch Tristan, Milosavljevic Nikola, Azag Dillon, Blanchi Melvyn
- **Groupe 3** : Radi Amir, Bougherara Safi, Wafo Mbe Rayan, Delamare Clément
- **Groupe 4** : Mouzda Binti-Warda, Lechantre Thibault, Margarian Diana
- **Groupe 5** : Louvet Valentin, Djemai Nassim, Fortunato Axel, Perfillon Keziah
- **Groupe Lille 3** : Baldé Hady, Bekolo Nick, Monthe Elake Leroy
- **Groupe Lille 1** : Octau Killian, Sergio Wicramachine, Amine Haddane, Sergent Grégory
- **Groupe Lyon** : Zermadini Rania, Lefebvre Nolan, Rivoire Thomas

---

## 5. Déroulement de la démonstration

Durée par groupe : 15 minutes de présentation et 5 minutes environ de questions. Chaque membre doit obligatoirement avoir un rôle dans la présentation (avec la démo).

⚠️ **Chaque membre doit être capable d'expliquer n'importe quelle partie du code.**

Une question peut être posée à n'importe qui dans le groupe.



