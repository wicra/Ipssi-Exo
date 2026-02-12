# SymfonyPress

---

# Jour 1 — Découvrir Symfony et lire des données

## 🎯 Objectif

À la fin de cette journée, vous devez être capable de créer une application Symfony structurée et d’y afficher des données provenant d’une base de données relationnelle.

Vous travaillez sur **SymfonyPress**, un mini CMS de publication d’articles.

---

## 🧩 Fonctionnalités attendues

Votre application doit proposer :

- Une page d’accueil affichant :
    - une liste d’articles
    - une liste de catégories sous forme de tags
- Une page article accessible par URL
- Une page catégorie affichant les articles associés

---

## 🛠 Travail à réaliser

Vous devez :

1. **Créer un projet Symfony 8**
   https://symfony.com/doc/current/setup.html

2. **Configurer la base de données**
   https://symfony.com/doc/current/doctrine.html

3. **Créer les entités**
    - `Article`
    - `Category`

    https://symfony.com/doc/current/doctrine.html#creating-an-entity-class

4. **Créer la relation**
   `Article` → `ManyToOne` → `Category`

    https://symfony.com/doc/current/doctrine/associations.html

5. **Générer et exécuter les migrations**

6. **Importer le jeu de données fourni**
   `docs/database/fixtures-jour1.sql`

7. **Créer les contrôleurs et les routes**

    Créer **deux contrôleurs distincts** :
    - `src/Controller/HomeController.php` : pour la route `/` (accueil)
    - `src/Controller/ArticleController.php` : pour les routes publiques `/article/{slug}`
    - `src/Controller/CategoryController.php` : pour les routes `/category/{slug}`

    > ⚠️ Les routes publiques ne doivent **PAS** être dans le namespace `Admin`
    - https://symfony.com/doc/current/controller.html
    - https://symfony.com/doc/current/routing.html

8. **Créer les vues Twig**
   https://symfony.com/doc/current/templates.html

---

## 🧭 Routes attendues

| Page      | URL                | Nom de route    |
| --------- | ------------------ | --------------- |
| Accueil   | `/`                | `home`          |
| Article   | `/article/{slug}`  | `article_show`  |
| Catégorie | `/category/{slug}` | `category_show` |

---

## 🧱 Structure Twig attendue

```
templates/
├── components/
│ └── article_card.html.twig
│
├── layout/
│ ├── header.html.twig
│ └── footer.html.twig
│
├── pages/
│ ├── home/
│ │ └── index.html.twig
│ ├── article/
│ │ └── show.html.twig
│ └──  category/
│  └── show.html.twig
│
└── base.html.twig
```

### 📋 Architecture des templates

#### **base.html.twig**

Template parent avec :

- Balise `<html lang="fr">`
- Viewport meta pour responsive design
- Inclusion header/footer

#### **Composants réutilisables**

- `article_card.html.twig` : Version minimaliste (image, titre, date)

#### **HTML sémantique**

Tous les templates utilisent :

- Balises sémantiques : `<main>`, `<nav>`, `<article>`, `<section>`, `<header>`
- Navigation avec `<ul><li>` au lieu de divs
- Attributs ARIA : `aria-label`, `aria-current="page"`, `role="alert"`
- Balises `<time datetime="">` pour les dates

---

## 🧱 Contraintes techniques

- Toutes les données doivent provenir de Doctrine
- Toutes les pages doivent être rendues avec Twig
- Le layout doit être mutualisé (`base.html.twig`)
- Le code doit respecter la structure MVC Symfony
- **Structure HTML sémantique** : `<main>`, `<nav>`, `<article>`, `<section>`, `<header>`
- **Accessibilité** : Attributs ARIA, labels, attributs alt descriptifs sur images
- **Modularité** : Composants réutilisables et macros pour éviter la duplication de code

---

## 🗂 Données de test

Un jeu de données est fourni dans :

```
docs/database/fixtures-jour1.sql
```

À importer après les migrations pour disposer d'articles et de catégories.

> 💡 **Note importante** : Ce fichier de fixtures est adapté au schéma du Jour 1 (sans utilisateur). Lorsque vous ajouterez l'entité `User` au Jour 3, vous devrez utiliser `fixtures-jour3.sql` à la place.

---

## ⚠️ Gestion des migrations et des données

### Comprendre l'évolution du schéma

Au cours de cette formation, votre base de données va **évoluer** :

- **Jour 1** : `Article` + `Category` (sans utilisateur)
- **Jour 3** : Ajout de l'entité `User` et de la relation `Article → User`

Cette évolution est **normale et professionnelle**. En production, les migrations permettent de faire évoluer le schéma sans perdre les données. En développement, il est souvent plus simple de **recréer la base de données**.

### Stratégie recommandée

Quand vous ajouterez l'entité `User` (Jour 3), vos données du Jour 1 deviendront **incompatibles** car elles n'ont pas de `user_id`.

**Solution : reset complet de la BDD**

```bash
# 1. Supprimer le schéma existant
symfony console doctrine:schema:drop --force --full-database

# 2. Recréer le schéma avec les nouvelles migrations
symfony console doctrine:migrations:migrate

# 3. Importer les nouvelles fixtures
symfony console doctrine:query:sql "$(cat docs/database/fixtures-jour3.sql)"
# OU via MySQL directement :
mysql -u root -p symfony_press < docs/database/fixtures-jour3.sql
```

> 💡 **Astuce** : Ne vous attachez pas aux données de test des premiers jours. L'important est de comprendre comment gérer l'évolution du schéma.

### Commandes utiles

```bash
# Vérifier l'état des migrations
symfony console doctrine:migrations:status

# Voir le SQL généré par une migration (sans l'exécuter)
symfony console doctrine:migrations:migrate --dry-run

# Créer une nouvelle migration après modification d'entités
symfony console make:migration
```

---

# Jour 2 — Écrire et gérer les données (CRUD)

## 🎯 Objectif

Mettre en place un **back-office moderne** permettant aux administrateurs de créer, modifier et supprimer des articles via les formulaires Symfony.

---

## 🧭 Contexte

Vous continuez le projet **SymfonyPress**.
Après avoir appris à **lire** les données (Jour 1), vous devez maintenant permettre de **les écrire** et de les maintenir.

Vous allez implémenter un **CRUD complet** pour l’entité `Article`.

---

## 🧩 Fonctionnalités attendues

Un espace d’administration doit permettre :

- La création d’un article
- La modification d’un article
- La suppression d’un article
- L’association d’un article à une catégorie

---

## 🧭 URLs (bonnes pratiques modernes)

Toutes les routes d’administration doivent être préfixées par `/admin`.

| Action             | URL                        | Nom de route           | Méthode  |
| ------------------ | -------------------------- | ---------------------- | -------- |
| Liste des articles | `/admin/article`           | `admin_article_index`  | GET      |
| Création           | `/admin/article/new`       | `admin_article_new`    | GET/POST |
| Édition            | `/admin/article/{id}/edit` | `admin_article_edit`   | GET/POST |
| Suppression        | `/admin/article/{id}`      | `admin_article_delete` | POST     |

---

## 🛠 Travail à réaliser

### 1. Créer un formulaire Symfony

Créer la classe :

```
src/Form/ArticleType.php
```

Le formulaire doit gérer :

- `title`
- `content`
- `category`

Le champ `slug` **ne doit pas être présent** (il est doit être généré automatiquement) :

Documentation :

- https://symfony.com/doc/current/forms.html
- https://symfony.com/doc/current/form/form_customization.html
- https://symfony.com/doc/current/the-fast-track/en/13-lifecycle.html#generating-slugs

---

### 2. Valider les données

Les contraintes doivent être définies dans l’entité `Article` avec `#[Assert\...]`.

Exemples :

- `NotBlank`
- `Length`

Documentation :
https://symfony.com/doc/current/validation.html

> 💡 **Note pour la suite** : Au Jour 3, vous ajouterez l'entité `User` et une relation `Article → User`. Le schéma va donc évoluer. Ne vous inquiétez pas si vos données actuelles deviennent incompatibles : c'est le processus normal de développement.

---

### 3. Persister avec Doctrine

Dans le contrôleur :

- Créer un objet `Article`
- Lier le formulaire
- Valider
- Persister avec `EntityManagerInterface`

Aucun SQL brut n’est autorisé.

Documentation :
https://symfony.com/doc/current/doctrine.html

---

### 4. Implémenter les contrôleurs CRUD admin

Créer :

```
src/Controller/Admin/ArticleController.php
```

Il doit gérer :

- La liste des articles
- La création
- L’édition
- La suppression

Documentation :
https://symfony.com/doc/current/controller.html#generating-controllers

---

### 5. Styliser les formulaires

Les formulaires doivent être lisibles et utilisables.

Les templates doivent être structurés dans :

```
templates/pages/admin/article/
```

Avec une structure HTML sémantique : `<main><section>` pour les pages de formulaire, et utilisation de `<header>` pour les titres.

Documentation Twig :
https://symfony.com/doc/current/templates.html

---

## 🧱 Contraintes

- Interdiction de SQL brut
- Validation obligatoire
- Tous les formulaires doivent utiliser `FormType`
- Les actions admin doivent être dans un namespace `Admin`
- **Structure des templates** : Utiliser `<main>`, `<header>`, `<section>` pour sémantique HTML
- **Composants réutilisables** : Utiliser `article_card.html.twig` pour affichage des articles

---

## ✅ Résultat attendu

À la fin du Jour 2, SymfonyPress doit proposer :

- Un back-office fonctionnel
- Des formulaires validés
- Des URLs propres
- Un CRUD complet respectant les standards professionnels
- Une structure de templates modulaire avec composants réutilisables
- Une architecture HTML sémantique et accessible

---

# Jour 3 — Sécurité, médias et réalisme applicatif

## 🎯 Objectif

Transformer SymfonyPress d’un simple CRUD en une **véritable application web sécurisée**, avec gestion des utilisateurs, des droits et des médias.

À la fin de cette journée, votre CMS doit se comporter comme une **application de production**.

---

## 🧭 Contexte

Jusqu’ici, SymfonyPress permet :

- de lire des articles (Jour 1)
- de les gérer via un back-office (Jour 2)

Il est maintenant temps de le rendre **réaliste** :

- seuls les utilisateurs autorisés doivent pouvoir administrer
- les articles doivent pouvoir contenir des médias
- l’application doit gérer correctement les erreurs

---

## 🧩 Fonctionnalités attendues

Votre application doit proposer :

- Un système d’authentification :
    - inscription
    - connexion
    - déconnexion
- Un back-office **protégé**
- La possibilité d’uploader une image de couverture pour un article
- Des pages d’erreur propres (403, 404, 500…)

---

## 🧭 URLs attendues

| Fonction    | URL          | Nom de route   |
| ----------- | ------------ | -------------- |
| Inscription | `/register`  | `app_register` |
| Connexion   | `/login`     | `app_login`    |
| Déconnexion | `/logout`    | `app_logout`   |
| Back-office | `/admin/...` | — (protégé)    |

---

## 🛠 Travail à réaliser

> ⚠️ **IMPORTANT - Gestion des données** : L'ajout de l'entité `User` va modifier le schéma de la base de données. La table `article` aura désormais une colonne `user_id` obligatoire. Vos données actuelles (importées avec `fixtures-jour1.sql`) seront **incompatibles**.
>
> **Solution recommandée** :
>
> 1. Reset complet de la BDD après les nouvelles migrations (voir section Dépannage)
> 2. Import du nouveau fichier `docs/database/fixtures-jour3.sql` qui contient des utilisateurs et des articles avec `user_id`

### 1. Mettre en place la sécurité

Configurer le composant Security de Symfony :

- création de l’entité `User`
- authentification par formulaire
- gestion des mots de passe
- rôles (`ROLE_USER`, `ROLE_ADMIN` optionnel)

Documentation :
https://symfony.com/doc/current/security.html

---

### 2. Protéger le back-office

Toutes les routes `/admin` doivent :

- être accessibles **uniquement** aux utilisateurs connectés
- idéalement réservées aux utilisateurs ayant le rôle `ROLE_ADMIN` (optionnel)

**Deux méthodes possibles** :

#### Méthode A : Configuration centralisée (recommandée)

Dans `config/packages/security.yaml` :

```yaml
access_control:
    - { path: ^/admin, roles: ROLE_USER }
    # OU pour admin uniquement :
    # - { path: ^/admin, roles: ROLE_ADMIN }
```

#### Méthode B : Protection programmatique

Dans chaque contrôleur admin :

```php
public function index(): Response
{
    $this->denyAccessUnlessGranted('IS_AUTHENTICATED');
    // ...
}
```

> 💡 La méthode A est plus maintenable car centralisée.

Documentation :
https://symfony.com/doc/current/security/access_control.html

---

### 3. Ajouter une image de couverture aux articles

Modifier l’entité `Article` pour ajouter :

- un champ `image` (string nullable)

Ce champ doit contenir **le nom du fichier**, pas le fichier lui-même.

> Ne pas oublier de générer et exécuter une migration.

---

### 4. Implémenter l’upload de fichiers

Le formulaire `ArticleType` doit permettre :

- d’uploader une image
- de stocker le fichier sur le serveur
- de sauvegarder son nom dans l’entité

Contraintes :

- pas de base64
- pas de stockage en base
- uniquement des fichiers images

Documentation :
https://symfony.com/doc/current/controller/upload_file.html

> Pensez à activer l’extension PHP `fileinfo` si nécessaire.

---

### 5. Afficher l’image dans le front

Les pages :

- liste d'articles (page d'accueil et catégorie via le composant `article_card.html.twig`)
- page article (`article/show.html.twig`)

doivent afficher l'image de couverture lorsqu'elle existe avec :

- `loading="lazy"` pour optimisation performance
- `alt="{{ article.title }}` pour accessibilité
- Dimensions explicites (`width` et `height`) pour éviter layout shift

---

### 6. Gérer les pages d’erreur

Créer des pages Twig personnalisées pour :

- 403 (accès refusé) → `error403.html.twig`
- 404 (page non trouvée) → `error404.html.twig`
- 500 (erreur serveur) → `error.html.twig`

Dans :

```
templates/bundles/TwigBundle/Exception/
```

**Structure attendue** : Les pages d'erreur doivent hériter de `base.html.twig` pour cohérence visuelle et inclure header/footer, avec une structure sémantique `<main><section>`.

Documentation :
https://symfony.com/doc/current/controller/error_pages.html

---

### 7. Créer au moins une requête personnalisée

Implémenter dans `ArticleRepository` une requête métier, par exemple :

- les derniers articles
- les articles d’une catégorie
- les articles d’un auteur

Utiliser le QueryBuilder de Doctrine (pas de SQL brut).

Documentation :
https://symfony.com/doc/current/doctrine.html#querying-for-objects-the-repository

---

## 🧱 Contraintes

- Toute la sécurité doit passer par le composant Security
- Aucun accès admin sans authentification
- Les fichiers doivent être stockés sur le serveur
- Les requêtes personnalisées doivent utiliser Doctrine
- L’architecture MVC doit être respectée- **Templates** : Respecter la structure HTML sémantique et l'accessibilité
- **Composants** : Utiliser les composants existants (`article_card`, etc...)
- **Images** : Optimiser avec `loading="lazy"`, `alt` descriptifs et dimensions

---

## ✅ Résultat attendu

À la fin du Jour 3, SymfonyPress doit proposer :

- une authentification fonctionnelle
- un back-office sécurisé
- des articles avec images optimisées (lazy loading, dimensions, alt)
- une application robuste face aux erreurs
- une base technique prête pour la production
- une architecture de templates scalable et maintenable
- des composants réutilisables et une structure HTML sémantique moderne
