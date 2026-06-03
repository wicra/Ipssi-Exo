# Todo API - DevOps & Dockerization Project

Ce projet est une API REST de gestion de tâches (Todo API) développée avec Node.js (Express), entièrement dockerisée, préparée pour la CI/CD et intégrant des tests automatisés (Jest & Supertest).

## 🚀 Fonctionnalités & Architecture

L'application expose les routes CRUD classiques pour gérer des tâches avec le schéma de données suivant :
- **id** : Identifiant unique (UUID)
- **title** : Titre de la tâche (optionnel)
- **description** : Description détaillée (obligatoire)
- **status** : Statut actuel (ex: `pending`, `in-progress`, `completed`)
- **createdAt** / **updatedAt** : Horodatages automatiques

### 📁 Structure du Projet

```text
SERGIO_WICRAMACHINE_TODO_API/
├── src/
│   ├── middleware/
│   │   └── errorHandler.js   # Middleware global de capture d'erreurs
│   ├── models/
│   │   └── task.js           # Modèle de données & stockage JSON
│   ├── routes/
│   │   └── tasks.js          # Endpoints CRUD de l'API
│   ├── app.js                # Initialisation d'Express (Helmet, CORS, etc.)
│   └── index.js              # Point d'entrée de démarrage du serveur
├── tests/
│   ├── unit/
│   │   └── task.test.js      # Tests unitaires du modèle Task
│   └── integration/
│       └── api.test.js       # Tests d'intégration des routes HTTP
├── docker-compose.yml        # Orchestration locale avec persistance
├── .dockerignore             # Fichiers ignorés lors du build Docker
├── .gitignore                # Fichiers exclus de Git
├── package.json              # Dépendances & scripts du projet
└── README.md                 # Ce fichier de documentation
```

---

## 🛠️ Lancement Local (Développement)

### Prérequis
- [Node.js](https://nodejs.org/) (version 20 recommandée)
- [npm](https://www.npmjs.com/)

### Étape 1 : Installer les dépendances
```bash
npm install
```

### Étape 2 : Démarrer le serveur
* En mode classique :
  ```bash
  npm start
  ```
* En mode développement (avec auto-reload) :
  ```bash
  npm run dev
  ```
Le serveur sera disponible sur [http://localhost:3000](http://localhost:3000).

### Étape 3 : Exécuter les tests
```bash
npm test
```

---

## 🐳 Lancement avec Docker (Recommandé)

Le projet utilise un **Volume Docker** pour stocker localement le fichier de données JSON (`data/tasks.json`). Cela garantit que vos tâches sont conservées même après l'arrêt ou la suppression des conteneurs.

### Prérequis
- [Docker](https://www.docker.com/) et Docker Compose

### Étape 1 : Lancer l'environnement
```bash
docker compose up --build
```
L'API démarre et est accessible sur le port **3000** : `http://localhost:3000`.

### Étape 2 : Vérifier la persistance (Volume)
1. Créez une tâche via l'API (voir section Documentation API ci-dessous).
2. Arrêtez le conteneur :
   ```bash
   docker compose down
   ```
3. Relancez-le :
   ```bash
   docker compose up
   ```
4. Listez les tâches : vos données sont toujours présentes grâce au montage de volume configuré dans le `docker-compose.yml` (`./data:/usr/src/app/data`).

---

## Rapport d'Exécution des Exercices Pratiques

Ce projet valide les exigences de l'exercice de mise en pratique des bases DevOps (API Node.js et Dockerisation). Les tests de validation suivants ont été effectués pour prouver le bon fonctionnement de l'infrastructure et de la persistance des données.

### Exercice 1 : Volumes Basiques et Partage de Données

Cet exercice valide la création et l'utilisation d'un volume partagé entre conteneurs.

1. **Création et écriture dans le volume**
   - Création du volume Docker dédié aux logs (`todo-logs`).
   - Lancement d'un conteneur interactif (`todo-writer`) avec montage du volume sur `/data`.
   - Écriture de données de test dans les fichiers `first_log.log` et `second_log.log`.
   
   ![Preuve de la création du volume partagé](capture/image.png)
   ![Preuve de l'écriture dans le volume partagé](capture/image%20copy.png)

2. **Lecture depuis un nouveau conteneur**
   - Lancement d'un second conteneur indépendant (`todo-reader`), montant le même volume `todo-logs`.
   - Affichage du contenu des fichiers, confirmant que les données écrites par le premier conteneur sont bien partagées et persistées.
   
   ![Preuve de lancement du second conteneur](capture/image%20copy%202.png)
   ![Preuve de la lecture depuis le second conteneur](capture/image%20copy%203.png)

### Exercice 2 : Todo App et Persistance via Docker Compose

Cet exercice valide la persistance des données de l'API Node.js à travers les redémarrages de l'infrastructure globale.

1. **Démarrage de l'infrastructure**
   - Lancement des services définis dans le `docker-compose.yml` en arrière-plan (`api`, `db`, `redis`).

2. **Création d'une donnée via l'API**
   - Envoi d'une requête HTTP POST vers l'endpoint `/api/tasks` pour enregistrer une nouvelle tâche.
   - Validation de la réponse HTTP 201 Created contenant l'identifiant unique de la tâche.
   
   ![Preuve de la requête API](capture/image%20copy%204.png)
   ![Preuve de la création de la tâche via l'API](capture/image%20copy%205.png)

3. **Validation de la persistance**
   - Arrêt complet et suppression des conteneurs via la commande d'extinction de Docker Compose.
   - Redémarrage à zéro de l'infrastructure.
   - Envoi d'une requête HTTP GET vers l'endpoint `/api/tasks`.
   - Vérification de la présence de la tâche précédemment créée, confirmant l'efficacité du volume lié aux données applicatives.
   
   ![Preuve de la persistance des données après redémarrage](capture/image%20copy%206.png)

---

## 📖 API Documentation

### 🔍 Health Check
* **GET** `/health`
  * Retourne l'état de l'API.
  * **Réponse (200 OK) :**
    ```json
    { "status": "ok", "timestamp": "2026-06-03T11:45:00.000Z" }
    ```

### 📋 Gestion des tâches (Tasks)

* **GET** `/api/tasks`
  * Récupère la liste de toutes les tâches.
  * **Réponse (200 OK) :** `[]` ou liste de tâches.

* **POST** `/api/tasks`
  * Crée une nouvelle tâche.
  * **Corps de la requête :**
    ```json
    {
      "title": "Ma première tâche",
      "description": "Installer et configurer Docker sur ma machine",
      "status": "pending"
    }
    ```
  * **Réponse (201 Created) :** Tâche créée avec son `id`, `createdAt` et `updatedAt`.

* **GET** `/api/tasks/:id`
  * Récupère les détails d'une tâche spécifique par son identifiant unique.
  * **Réponse (200 OK / 404 Not Found)**

* **PUT** `/api/tasks/:id`
  * Modifie une tâche existante.
  * **Corps de la requête (champs optionnels) :**
    ```json
    {
      "status": "completed"
    }
    ```
  * **Réponse (200 OK / 404 Not Found)**

* **DELETE** `/api/tasks/:id`
  * Supprime une tâche.
  * **Réponse (204 No Content / 404 Not Found)**

---

## 📋 Gestion Agile & Scrum / Kanban (Projet Solo)

Pour suivre l'avancement de ce projet solo en mode DevOps, un tableau Kanban simple est structuré comme suit :

### Backlog du Projet (Sprint 1)
- [x] Initialisation de l'API et structure Express
- [x] Écriture du modèle de données local persistant (JSON file database)
- [x] Implémentation complète du CRUD et gestionnaire d'erreurs
- [x] Dockerisation (Dockerfile + docker-compose.yml + Volume)
- [x] Rédaction et automatisation des tests unitaires & d'intégration
- [ ] Mettre en place la CI/CD (Workflow GitHub Actions pour l'exécution automatique des tests lors des commits) *(À faire dans la partie 2 du cours)*
