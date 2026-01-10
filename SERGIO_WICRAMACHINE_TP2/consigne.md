TP 2 : Créer un blog
Consigne
L'objectif de l'exercice est de créer un blog complet et fonctionnel avec : - une page d'accueil servant de catalogue - une page servant à voir les informations d'un article - une page de connexion - une page d'inscription

Ajouter à cela un back-office permettant de gérer les articles (voir tous les articles, ajouter, modifier, supprimer). À défaut de créer les pages HTML permettant de faire ces opérations.

Seuls les utilisateurs connectés peuvent créer leurs articles.

Base de données
Le projet sera relié à une base de données au choix : - relationnelle via Sequelize - non-relationnelle via Mongoose

Front-end
Il n'est pas demandé de faire du CSS. Le style des pages peut rester minimal tant que les éléments pour faire les requêtes sont présents (boutons, formulaires, etc.) ou qu'elles affichent les données dans le HTML. Le style peut aussi bien être généré.

Sécurité
Les routes privées doivent être protégées par un JWT stocké dans un cookie. Une route de déconnexion sera ajoutée pour se déconnecter.

Les mots de passe seront hashés en base de données.

Traitement des logs
Chaque requête que traitera l'application sera loggée dans la console.

`${Date} - ${method} ${path de la requête}` 
Base de données
Le projet sera relié à une base de données au choix : - relationnelle via Sequelize - non-relationnelle via Mongoose

Table Utilisateur
Champ	Type	Contraintes	Description
id	INT / ObjectId	PK / unique	Identifiant de l’utilisateur
username	STRING	unique, required	Nom d’utilisateur
email	STRING	unique, required	Email de l’utilisateur
password	STRING	required	Mot de passe hashé
createdAt	DATETIME	default NOW	Date de création
updatedAt	DATETIME	default NOW	Date de mise à jour
Table Article
Champ	Type	Contraintes	Description
id	INT / ObjectId	PK / unique	Identifiant de l’article
title	STRING	required	Titre de l’article
content	TEXT	required	Contenu de l’article
userId	INT / ObjectId	FK → Users.id / ref User	Auteur de l’article
createdAt	DATETIME	default NOW	Date de création
updatedAt	DATETIME	default NOW	Date de mise à jour
Consigne de remise
Le TP sera remis avant le Mardi 13 janvier 2025 à 20h.

Par DM sur Teams (Jeremy ANTOINE), vous rendrez :

Soit le dossier du TP compressé au format ZIP
Soit le lien du projet GitHub (en public) me permettant de récupérer le projet
Collaboration
Le projet pourra être fait par groupe de 2 maximum. Dans ce cas, le nom des auteurs sera indiqué dans le package.json et la note sera mutualisée.
Notation
Vous serez évalués sur (par ordre d'importance) :

La mise en place du serveur web et de l'API
Les scripts de récupération et l'envoi des données depuis le front
La qualité du code et la séparation des responsabilités
La sécurité
La gestion des bases de données
Les pages côté front-end (affichage et interaction avec l’API)
Aides et questions
N'hésitez pas à poser des questions si vous êtes bloqués, je reste disponible jusqu'à lundi pour vous répondre.