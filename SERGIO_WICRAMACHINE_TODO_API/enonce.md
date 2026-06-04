Cours DevOps - Partie 3 : CI/CD, GitLab-CI &
Kubernetes
Jusqu'ici, à chaque modif de la Todo API, on a fait la même danse à la main : docker build , docker run , on
teste à l'œil, on docker push si on est motivé. Ça marche. Mais c'est vous qui faites le robot.
Aujourd'hui, on remplace le robot humain par un vrai robot. Vous poussez du code sur GitLab, et tout seul : ça
lint, ça teste, ça build l'image, ça la pousse sur DockerHub, et ça déploie sur un cluster Kubernetes. Vous ne
touchez plus rien. Un git push et l'app part en prod. 🔥
C'est exactement le métier DevOps : automatiser le chemin du code source jusqu'à la prod, pour que
personne ne fasse plus jamais ce travail à la main.
On prend la Todo API qu'on a dockerisée en J1, et on construit autour d'elle une pipeline CI/CD
complète : un push déclenche tests + build + push + déploiement Kubernetes, sans intervention
humaine.
Planning de la Journée
1. Révisions rapides : ce qu'on a fait avec Docker, et pourquoi ça nous mène ici
2. DevOps & CI/CD : de quoi on parle : les définitions, les 3 piliers, l'histoire des outils, DevSecOps
3. Anatomie d'une pipeline : les stages, les environnements, les branches Git, manuel vs automatisé
4. La CI au choix : GitHub Actions ET GitLab-CI, première pipeline verte sur ClickFast
5. Les jobs qui comptent : tests avec et sans base de données, cache, build + push DockerHub, secrets,
déploiement SSH (sur la Todo API)
6. Kubernetes / K3S : pourquoi orchestrer, pod/deployment/service/namespace, installer K3S, déployer la
Todo API, scaling, rolling update, dépannage
7. Monitoring : Prometheus + Grafana, l'endpoint /metrics
8. Rédiger une procédure de déploiement : pourquoi, et un template prêt à l'emploi
9. Après-midi - Projet de groupe : "Le Pipeline qui tourne en prod"
1 - Révisions rapides
Ce qu'on a construit ces deux derniers jours :
On repart de là, parce que toute la journée se construit dessus. Pas de nouvelle notion ici, juste un rappel
express pour que tout le monde soit aligné.
Une image Docker, c'est le snapshot immuable de votre app + son environnement. On la build avec
docker build -t mon-image .
Un container, c'est une instance qui tourne à partir d'une image. On le lance avec docker run -p
5000:8080 mon-image .
Le Dockerfile, c'est la recette pour construire l'image (image de base, copie du code, install des
dépendances, commande de lancement).
docker-compose, c'est pour orchestrer plusieurs conteneurs ensemble (votre Todo API + sa base
PostgreSQL) avec un seul fichier docker-compose.yml et trois commandes : up , down , build .
Les volumes, c'est ce qui fait survivre vos données quand le conteneur meurt (vos tâches restent en base
après un docker compose down ).
DockerHub, c'est le registry public où on publie nos images.
Registry ? Un entrepôt d'images Docker en ligne. Vous y poussez vos images ( docker push ) et
n'importe qui peut les récupérer ( docker pull ). DockerHub est le registry public le plus connu.
Et le fil rouge, c'est la Todo API : un CRUD de tâches en Node.js/Express, branché sur PostgreSQL, le tout
dockerisé. Aujourd'hui, on arrête de la déployer à la main. On automatise tout.
Question pour démarrer la journée : c'est quoi votre pire souvenir de mise en production manuelle ? Un déploiement
raté un vendredi soir, un fichier oublié, un "ça marchait vraiment sur ma machine hein" ? Gardez ça en tête, parce
que la CI/CD existe précisément pour éliminer ces galères.
On a tout ce qu'il faut côté Docker. Le prochain palier, c'est d'enchaîner ces commandes automatiquement à
chaque modification. Avant de coder ça, posons le vocabulaire : CI, CD, DevOps. On en parle tout le temps,
mais c'est quoi exactement ?
2 - DevOps & CI/CD : de quoi on parle
Quel est le problème quand les développeurs et les ops ne se parlent pas ?
Imaginez la scène. Le dev a fini sa feature, ça tourne nickel sur son laptop. Il balance un zip à l'équipe ops : "à
vous de jouer, mettez ça en prod". L'ops installe, et là... ça casse. Version de Node différente, une variable
d'environnement manquante, une dépendance système absente. Chacun accuse l'autre. Le dev dit "ça marche
chez moi", l'ops dit "ton code est pourri". Résultat : la prod attend, le client râle.
Ce mur entre Dev et Ops, c'est précisément ce que le DevOps vient casser.
L'essentiel
DevOps, CI, CD : trois mots, trois idées
Posons les définitions une bonne fois.
DevOps : faire collaborer les développeurs (Dev) et les opérationnels (Ops) pour livrer du code plus vite
et plus sûrement. Ce n'est pas un outil, c'est une culture + un ensemble de pratiques. Source de
référence : Atlassian - What is DevOps.
CI (Continuous Integration / Intégration Continue) : à chaque modification du code, on l'intègre
automatiquement au reste du projet et on lance des vérifications (build + tests). But : détecter tôt les
casses/problèmes, pas trois semaines plus tard. Doc : GitLab - CI/CD.
CD (Continuous Delivery/Deployment / Livraison ou Déploiement Continu) : on automatise la suite,
jusqu'à la mise en production. En Delivery, l'image est prête à déployer et un humain clique sur "go". En
Deployment, même le "go" est automatique.
La différence Delivery / Deployment est subtile mais elle compte :
Terme Ce qui est automatique Le "go" final
Continuous Delivery build + test + préparation du livrable un humain valide
Continuous Deployment tout, jusqu'à la prod automatique
La plupart des boîtes font de la Delivery sur la prod (un humain garde la main pour le déploiement critique) et
du Deployment complet sur les environnements de test. On y revient en section 3 avec les environnements.
Les 3 piliers du DevOps
On l'a vu en J1, mais c'est la colonne vertébrale de la journée, donc on le reprend :
Culture : collaboration entre équipes, responsabilité partagée, feedback continu. Le dev ne "jette" plus
son code par-dessus le mur : il est responsable jusqu'en prod.
Automation : tests automatisés, déploiement automatique, infrastructure as code. C'est le cœur de la
journée : la pipeline.
Measurement : métriques de performance, monitoring, alerting. On en parle en section 7 avec
Prometheus/Grafana.
Aujourd'hui on attaque surtout le pilier Automation, mais on touche aussi au Measurement en fin de
journée. Le pilier Culture, lui, est invisible dans le code mais omniprésent : la pipeline force tout le monde à
travailler proprement (tests verts obligatoires, branches protégées).
Petite histoire des outils CI/CD
Quelqu'un a déjà entendu parler de Jenkins ? De Travis ?
travis_sctott.jpg
(pas lui)
Pour comprendre pourquoi GitLab-CI et GitHub Actions existent, faut savoir d'où on vient. C'est une histoire de
"on automatise de plus en plus, et c'est de plus en plus simple".
Jenkins (2011, fork de Hudson) : l'ancêtre, le grand-père de la CI. Un serveur que vous installez et
maintenez vous-même, avec des centaines de plugins. Surpuissant, mais lourd : il faut une machine
dédiée, gérer les mises à jour, configurer chaque job à la main. On en trouve encore partout en
entreprise.
Travis CI (2011) : la révolution du "CI as a Service". Plus besoin d'installer un serveur : vous mettez un
fichier .travis.yml dans votre repo, et Travis exécute la pipeline sur ses machines. Énorme dans
l'écosystème open-source des années 2010.
GitLab CI/CD (2015) : GitLab intègre la CI directement dans la plateforme Git. Votre code, vos merge
requests, vos pipelines : tout au même endroit. Un seul fichier .gitlab-ci.yml à la racine, et c'est parti.
GitHub Actions (2019) : la réponse de GitHub. Même idée que GitLab-CI, intégrée à GitHub, avec une
marketplace énorme d'actions réutilisables. Des fichiers .yml dans .github/workflows/ .
La tendance est claire : de "j'installe et je maintiens un serveur" (Jenkins) vers "je mets un fichier YAML
dans mon repo et la plateforme s'occupe du reste" (GitLab/GitHub). C'est pour ça qu'aujourd'hui on
travaille avec GitLab-CI et GitHub Actions, pas Jenkins. Moins de plomberie, plus de valeur.
À quoi sert vraiment une pipeline ?
Mais attends, du coup, j'ai pas compris : c'est quoi une pipeline ?
Une pipeline, c'est une suite d'étapes automatiques déclenchées par un événement (en général : un git
push ). Chaque étape fait une chose, et si une étape échoue, la pipeline s'arrête : on ne déploie jamais du code
cassé.
Pipeline ? Une chaîne de montage pour votre code. À l'entrée : votre commit. À la sortie : votre app en
prod. Entre les deux, des stations de contrôle automatiques (tests, build...) qui bloquent tout si quelque
chose cloche.
Concrètement, ce que ça vous apporte :
On attrape les bugs tôt : les tests tournent à chaque push. Un test cassé, et vous le savez en 2 minutes,
pas en prod.
Fini "ça marche chez moi" : la pipeline build et teste dans un environnement neutre, identique pour tout
le monde.
Déploiements reproductibles : la même suite d'étapes, à chaque fois. Pas d'oubli, pas d'étape sautée à
23h un vendredi.
Tout le monde peut déployer : plus besoin du "gourou" qui seul sait comment mettre en prod. Un push
suffit.
Traçabilité : chaque pipeline garde un log. Qui a déployé quoi, quand, et est-ce que ça a marché.
Bonus perso : cette pipeline qu'on va brancher aujourd'hui, Netflix en déclenche plusieurs milliers par
jour. Le principe est exactement le même que le vôtre, juste à une autre échelle. 👉 Mini-challenge horscours : trouvez une offre d'emploi DevOps d'une boîte qui vous attire, et listez les outils CI/CD qu'ils
demandent. Vous verrez GitLab-CI, GitHub Actions, ou Jenkins quasi à chaque fois.
Pour aller plus loin : DevSecOps
Le DevSecOps, c'est DevOps avec le Sec (sécurité) injecté dans la pipeline, au lieu d'être un contrôle qu'on fait
à la fin (trop tard).
DevSecOps ? "Shift left security" : on déplace les contrôles de sécurité vers la gauche, c'est-à-dire tôt
dans le cycle, directement dans la pipeline. Référence : Red Hat - What is DevSecOps.
Concrètement, on ajoute des jobs de sécurité à la pipeline :
SAST (Static Application Security Testing) : un scanner lit votre code source et repère les patterns
dangereux (injection SQL, secrets en dur).
Dependency scanning : on vérifie que vos dépendances npm n'ont pas de failles connues ( npm audit
fait déjà une partie du job).
Container scanning : on scanne l'image Docker pour détecter des CVE dans les paquets système.
CVE ? Common Vulnerabilities and Exposures : un identifiant public pour une faille de sécurité connue.
Exemple : CVE-2021-44228 (la fameuse Log4Shell).
On ne fera pas de DevSecOps complet aujourd'hui, mais gardez l'idée : un npm audit dans votre pipeline,
c'est déjà du DevSecOps. Vous le toucherez du doigt en section 5 quand on parlera des secrets.
On a le vocabulaire. Maintenant, passons du concept au concret : à quoi ressemble une pipeline, étape par
étape ? C'est ce qu'on décortique tout de suite, parce qu'on va devoir choisir nous-mêmes l'ordre des étapes
dans nos fichiers YAML.
3 - Anatomie d'une pipeline
On sait à quoi sert une pipeline. Regardons maintenant ce qu'il y a dedans. Une pipeline, c'est une séquence de
stages (étapes), et chaque stage contient un ou plusieurs jobs (tâches).
L'essentiel
Les stages classiques d'une pipeline
L'ordre compte : on ne build pas si les tests cassent, on ne déploie pas si le build casse. Voilà la séquence
typique, du plus rapide au plus engageant :
1. lint : on vérifie le style du code (formatage, conventions). Ultra rapide, ça casse en premier si le code est
mal foutu.
2. test : on lance les tests unitaires et d'intégration. Si un test échoue, stop.
3. build : on construit l'image Docker. Si le build échoue (Dockerfile cassé), stop.
4. push : on pousse l'image sur le registry (DockerHub). Maintenant elle est disponible partout.
5. deploy : on déploie l'image sur le serveur / le cluster Kubernetes.
Lint ? Un outil (ex : ESLint pour JavaScript) qui analyse le code sans l'exécuter, pour repérer les erreurs de
style et les bugs évidents (variable jamais utilisée, point-virgule oublié). "Linter", c'est passer le code au
peigne fin.
Pourquoi cet ordre, et pas un autre ? On met le moins coûteux et le plus susceptible de casser en premier.
Linter prend 5 secondes. Si le code est mal formaté, inutile de gaspiller 3 minutes à builder une image Docker.
On échoue vite, on échoue pas cher. C'est le principe du fail fast.
Les environnements : dev, staging, prod
Avant de coder une pipeline, faut comprendre où on déploie. Quand on bosse sur un vrai projet avec plusieurs
"embouts" accessibles en ligne, on a en général trois environnements :
dev (développement) : votre machine, ou un environnement de test rapide. Ça casse souvent, c'est
normal, c'est fait pour ça.
staging (pré-production) : une copie aussi fidèle que possible de la prod. On y teste les nouvelles
features une fois fusionnées, avant de les pousser pour de vrai. C'est le filet de sécurité.
prod (production) : le vrai serveur, celui que vos utilisateurs touchent. Tout ce qui arrive ici doit être
propre et testé.
Staging (ou préprod) ? L'environnement miroir de la prod. Même base de données (en copie), même
config, mais sans vrais utilisateurs. Si ça pète en staging, personne ne le voit. Si ça pète en prod, tout le
monde le voit (et ça fait mal).
L'idée : votre pipeline déploie automatiquement en staging à chaque merge, mais le déploiement en prod
demande souvent une validation manuelle (Continuous Delivery, on l'a vu en section 2).
Les branches Git : les bonnes pratiques
La pipeline est intimement liée à votre stratégie de branches Git. Petit récap, parce que c'est ce qui décide
quand et où on déploie :
master / main : la branche à garder protégée. Tout ce qui arrive ici doit être totalement propre et
fonctionnel. C'est elle qui déclenche le déploiement.
staging (ou pre-production , ou development ) : idéalement on a une branche pour rassembler le
travail des développeurs de l'équipe. On vérifie que toutes les nouvelles fonctionnalités fonctionnent une
fois fusionnées.
autres branches ( feature/xxx , fix/yyy ) : c'est super important de bosser sur des branches à part,
pour ne pas polluer ce qui marche déjà. Une fois le travail satisfaisant, on push la branche et on ouvre
une merge request (ou pull request sur GitHub). Elle sera reviewed (revue) par un autre dev avant fusion.
Une vérification humaine en plus du robot.
Merge request (MR) ? Sur GitLab, une demande de fusion d'une branche vers une autre. C'est le
moment où un collègue relit votre code avant qu'il rejoigne main . Sur GitHub on dit "pull request" (PR).
Même chose.
On va exploiter ça concrètement : en section 5, on configurera la pipeline pour ne déployer que depuis main .
Une feature en cours sur une branche feature/xxx lance les tests, mais ne déploie rien. Logique : on ne met
pas du travail en chantier en prod.
Avant / Après : le déploiement manuel vs la pipeline
Pour bien sentir le gain, comparons ce que vous avez fait à la main en J1 avec ce qu'on va automatiser.
Avant (déploiement manuel) :
Sept commandes, dans le bon ordre, sans en oublier une, à chaque déploiement. Et si vous oubliez le npm
test ? Vous déployez peut-être du code cassé.
Après (pipeline) :
C'est tout. Le robot fait les sept étapes, dans le bon ordre, à tous les coups, et il refuse de déployer si les tests
cassent.
Verdict : on échange sept commandes fragiles contre un git push infaillible. C'est ça, la CI/CD.
# À chaque modif de la Todo API, vous tapiez à la main :
npm test # je teste (si j'y pense)
docker build -t monpseudo/todo-api:1.0 . # je build
docker push monpseudo/todo-api:1.0 # je pousse sur DockerHub
ssh user@serveur # je me connecte au serveur
docker pull monpseudo/todo-api:1.0 # je récupère l'image
docker stop todo-api && docker rm todo-api
docker run -d -p 3000:3000 monpseudo/todo-api:1.0 # je relance
git push origin main
Creusons : que se passe-t-il quand un stage échoue ?
Un point qui surprend souvent les débutants : que devient ma pipeline si un test casse ?
La règle d'or : un stage qui échoue arrête la pipeline. Les stages suivants ne tournent pas du tout. Si le stage
test est rouge, le stage build n'est jamais lancé. C'est voulu : on ne veut surtout pas builder et déployer une
image dont on sait qu'elle est cassée.
Quelques cas concrets de "ce qui casse et pourquoi" :
Un test unitaire échoue → stage test rouge → pas de build, pas de déploiement. Vous corrigez, vous
re-push, la pipeline repart de zéro.
Le Dockerfile a une erreur (typo dans FROM , fichier manquant) → stage build rouge → pas de push.
L'image cassée ne part jamais sur DockerHub.
Les identifiants DockerHub sont faux → stage push rouge → l'image est buildée mais reste sur le
runner. Vous corrigez vos secrets (section 5).
Le serveur de déploiement est injoignable → stage deploy rouge → l'app reste sur l'ancienne version.
La prod ne tombe pas, elle reste juste sur le code précédent.
Ce dernier point est crucial : une pipeline bien faite ne casse jamais la prod. Au pire, elle refuse de déployer la
nouvelle version, et l'ancienne continue de tourner. On reviendra là-dessus avec le rolling update de
Kubernetes en section 6, qui pousse cette idée encore plus loin.
On a la théorie : stages, environnements, branches. Assez parlé. On va écrire notre première vraie pipeline et
la voir passer au vert. Et on commence soft, avec un projet minuscule, pour franchir la barrière du premier
succès sans se prendre les pieds dans la Todo API.
4 - La CI au choix : GitHub Actions ET GitLab-CI
On va faire passer une première pipeline au vert. Pour ça, on ne prend pas tout de suite la Todo API (trop de
pièces mobiles : base de données, secrets...). On prend un projet ultra simple : ClickFast, un petit jeu de clics
en HTML/CSS/JS, servi par nginx. Le but, c'est juste de voir le voyant vert s'allumer pour la première fois. 😎
Le warm-up ClickFast : un site statique (HTML/CSS/JS), zéro base de données, zéro secret. La pipeline la
plus minimale possible. Une fois qu'on a vu passer celle-là au vert, on attaque la vraie Todo API en
section 5 avec confiance.
Le point clé de cette section : la CI, c'est au choix entre deux outils. GitLab-CI et GitHub Actions font
exactement la même chose, avec une syntaxe différente. Le syllabus du projet demande GitLab-CI (c'est le
requis), mais beaucoup d'entre vous connaissent déjà GitHub. Alors on montre les deux, côte à côte, pour que
vous voyiez que c'est le même principe.
L'essentiel
Le projet ClickFast dockerisé
ClickFast, c'est un site statique. Pour le servir, on le met dans un conteneur nginx, le serveur web le plus utilisé
pour servir des fichiers statiques. Le Dockerfile est minuscule :
Deux lignes. On part de l'image officielle nginx:alpine (légère), et on copie tout le contenu du dossier dans le
répertoire que nginx sert par défaut. Et voilà, le site est dockerisé.
nginx ? Prononcez "engine-X". Un serveur web ultra rapide, parfait pour servir des fichiers statiques
(HTML, CSS, JS, images). Son dossier par défaut, /usr/share/nginx/html , est ce qu'il expose sur le port
80.
On le lance comme on l'a appris en J1 :
Devrait afficher : le site sur http://localhost:8080 , prêt à cliquer.
Option A - GitHub Actions
GitHub Actions cherche ses pipelines dans le dossier .github/workflows/ . Chaque fichier .yml dedans est
un workflow (une pipeline). Le plus simple pour démarrer : aller dans l'onglet Actions de votre repo GitHub,
cliquer sur New Workflow, et GitHub vous propose des templates tout prêts. On en prend trois.
Workflow ? Le nom que GitHub Actions donne à une pipeline. Un fichier YAML dans
.github/workflows/ . Doc : GitHub Actions.
Workflow 1 - node.js.yml (Node.js CI) : build et teste l'app sur plusieurs versions de Node.
FROM nginx:alpine
COPY . /usr/share/nginx/html
docker build -t clickfast .
docker run -d -p 8080:80 clickfast
name: Node.js CI
on:
push:
branches: [ "main" ]
pull_request:
branches: [ "main" ]
jobs:
build:
runs-on: ubuntu-latest
strategy:
matrix:
node-version: [18.x, 20.x, 22.x]
# See supported Node.js release schedule at https://nodejs.org/en/about/releases/
steps:
- uses: actions/checkout@v4
- name: Use Node.js ${{ matrix.node-version }}
uses: actions/setup-node@v4
with:
node-version: ${{ matrix.node-version }}
Ce qui se passe ici :
on: déclenche le workflow sur chaque push ou pull request vers master .
strategy: matrix: : c'est la matrice. GitHub lance le job trois fois en parallèle, une fois par version de
Node (18, 20, 22). Vous testez que votre app marche sur les trois.
actions/checkout@v4 : récupère votre code dans le runner.
actions/setup-node@v4 avec cache: 'npm' : installe Node et met en cache les dépendances npm
(pour ne pas les re-télécharger à chaque fois).
npm ci : installe les dépendances de façon déterministe (on l'a vu en J2, c'est le npm install de la CI).
npm run build --if-present : lance le build s'il existe (le --if-present évite l'erreur si pas de script
build).
npm test : lance les tests.
Matrice (matrix) ? Une façon de lancer le même job plusieurs fois avec des paramètres différents. Ici,
trois versions de Node. Si l'app casse sur Node 22 mais marche sur Node 18, vous le voyez
immédiatement.
Runner ? La machine (virtuelle) qui exécute vos jobs. ubuntu-latest , c'est un runner Ubuntu fourni
gratuitement par GitHub. Sur GitLab, ce sont les "shared runners".
Workflow 2 - docker-image.yml (Docker Image CI) : build l'image Docker.
Une seule étape qui compte : docker build . Le --tag my-image-name:$(date +%s) tague l'image avec le
timestamp Unix courant ( date +%s ), pour avoir un tag unique à chaque build. Simple et efficace pour vérifier
que le Dockerfile build sans erreur.
cache: 'npm'
- run: npm ci
- run: npm run build --if-present
- run: npm test
name: Docker Image CI
on:
push:
branches: [ "main" ]
pull_request:
branches: [ "main" ]
jobs:
build:
runs-on: ubuntu-latest
steps:
- uses: actions/checkout@v4
- name: Build the Docker image
run: docker build . --file Dockerfile --tag my-image-name:$(date +%s)
Workflow 3 - run-tests.yml (Run Tests) : lance les fichiers de test à la main.
Ici, au lieu de passer par npm test , on boucle à la main sur tous les fichiers *.test.js et on les lance avec
node . Pratique quand on débute et qu'on veut comprendre ce qui se passe.
Une fois ces fichiers commités, allez dans l'onglet Actions de votre repo : vous voyez les pipelines tourner. Au
vert, c'est gagné.
Option B - GitLab-CI
GitLab-CI cherche un seul fichier à la racine du repo : .gitlab-ci.yml . Tout est dedans.
Le point important : c'est le même principe, juste une autre syntaxe. Voyons-le en before/after.
Avant (GitHub Actions) : trois fichiers séparés dans .github/workflows/ , déclenchés sur push , avec runson: , steps: , et des actions réutilisables ( uses: actions/checkout@v4 ).
name: Run Tests
on:
push:
branches:
- master
pull_request:
branches:
- master
jobs:
test:
runs-on: ubuntu-latest
steps:
- name: Checkout code
uses: actions/checkout@v2
- name: Set up Node.js
uses: actions/setup-node@v2
with:
node-version: '14'
- name: Install dependencies
run: npm install
- name: Run tests
run: |
for file in *.test.js; do
if [ -f "$file" ]; then
echo "Running $file"
node "$file"
fi
done
Après (GitLab-CI) : un seul fichier .gitlab-ci.yml , avec des stages: , une image: Docker pour chaque job,
et un script: (les commandes shell brutes).
Verdict : même boulot (cloner, builder), deux syntaxes. GitLab regroupe tout dans un fichier, GitHub
éclate en plusieurs.
Décortiquons ce .gitlab-ci.yml , parce que chaque mot compte :
stages: : la liste ordonnée des étapes. Ici juste build . Les jobs s'y rattachent.
build-image: : le nom du job (libre).
stage: build : ce job appartient au stage build .
image: docker:24 : le job tourne dans un conteneur basé sur l'image docker:24 , qui contient le client
Docker. Eh oui, votre job CI tourne lui-même dans un conteneur.
services: avec docker:24-dind : le fameux Docker-in-Docker. Pour builder une image Docker à
l'intérieur d'un job qui tourne déjà dans un conteneur, il faut un daemon Docker dispo. dind fournit ce
daemon.
script: : les commandes shell à exécuter. Ici, le docker build .
$CI_COMMIT_SHORT_SHA : une variable prédéfinie de GitLab, le hash court du commit. Pratique pour
taguer l'image de façon unique. GitLab en fournit des dizaines (liste complète).
Docker-in-Docker (dind) ? Faire tourner Docker à l'intérieur d'un conteneur Docker. Comme votre job CI
tourne déjà dans un conteneur, et que vous voulez y builder une image, il vous faut un Docker imbriqué.
Le service docker:dind fournit ce daemon. Doc : GitLab - Building Docker images.
Vous poussez ce fichier, vous allez dans CI/CD > Pipelines sur GitLab, et vous voyez la pipeline tourner sur les
shared runners de GitLab.com (des machines gratuites mises à dispo par GitLab). Au vert : votre première
pipeline GitLab est passée. 🔥
Shared runners ? Les machines gratuites fournies par GitLab.com pour exécuter vos pipelines. Vous
n'avez rien à installer, GitLab prête ses serveurs. Doc : GitLab Runners.
GitHub Actions vs GitLab-CI : le tableau de correspondance
Pour fixer les idées, voilà la traduction terme à terme :
# .gitlab-ci.yml - version ClickFast (warm-up)
stages:
- build
build-image:
stage: build
image: docker:24 # on a besoin du client Docker dans le job
services:
- docker:24-dind # "Docker in Docker" : un Docker qui tourne dans le job
script:
- docker build -t clickfast:$CI_COMMIT_SHORT_SHA .
Concept GitHub Actions GitLab-CI
Emplacement .github/workflows/*.yml .gitlab-ci.yml (racine)
Étapes ordonnées (implicite via needs: ) stages:
Une tâche job job
Déclencheur on: rules: / only: / workflow:
Machine d'exécution runs-on: image: + runner
Action réutilisable uses: actions/... (pas d'équivalent direct, on écrit le script )
Variable secrète repo Settings > Secrets Settings > CI/CD > Variables
Le mapping est presque un-pour-un. Si vous savez faire l'un, vous savez faire l'autre. Pour la suite du cours, on
reste sur GitLab-CI, puisque c'est le requis du projet.
Approfondissons : pourquoi la première pipeline rate (presque)
toujours
Vous avez poussé votre .gitlab-ci.yml et c'est rouge dès le premier coup ? C'est normal, ça arrive à tout le
monde. Voilà les trois ratés classiques, pour que vous sachiez les diagnostiquer :
YAML mal indenté : le YAML est ultra sensible à l'indentation (espaces, jamais de tabulations). Un job
décalé d'un espace, et GitLab refuse le fichier. Symptôme : "Invalid CI config". Solution : un linter YAML, ou
l'éditeur de pipeline intégré de GitLab (CI/CD > Editor) qui valide en direct.
Le docker:dind oublié : vous faites docker build sans le service dind . Symptôme : "Cannot connect
to the Docker daemon". Solution : ajoutez le service.
Le mauvais nom de branche : votre rules: cible main mais votre branche s'appelle master (ou
l'inverse). Symptôme : la pipeline ne se déclenche pas du tout. Solution : vérifiez le nom de votre branche
par défaut.
Testez vous-même : poussez un .gitlab-ci.yml avec une faute d'indentation volontaire, observez l'erreur,
puis corrigez. Hitter le mur une fois, ça vous fait gagner des heures plus tard.
On a notre premier vert. Mais ClickFast, c'est un jouet : pas de tests sérieux, pas de base de données. On passe
maintenant aux choses sérieuses avec la Todo API, et on construit les jobs qui comptent vraiment en
entreprise.
5 - Les jobs qui comptent (sur la Todo API)
ClickFast nous a donné le premier vert. Maintenant on attaque la vraie pipeline, celle du projet noté, sur la
Todo API. On va construire, job par job, une pipeline complète : lint, tests (avec ET sans base de données),
cache des dépendances, build, push sur DockerHub avec des secrets, et déploiement.
C'est le cœur de la journée. Chaque job ici, vous le retrouverez en entreprise.
L'essentiel
Les tests, version Jest
Avant de mettre les tests dans la pipeline, faut qu'ils existent. On utilise Jest, le framework de test JavaScript le
plus répandu.
Jest ? Le framework de tests le plus utilisé dans l'écosystème JavaScript. On écrit des tests qui disent
"quand X se passe, je m'attends à Y", et Jest les exécute et vous dit lesquels passent. Développé par Meta.
Le test le plus minimal possible, juste pour comprendre la mécanique. Une fonction multiply et son test :
On lance avec :
Devrait afficher :
Voilà le principe : un test décrit un comportement attendu, expect() vérifie. Pour la Todo API, vos tests
vérifieront que POST /tasks crée bien une tâche, que GET /tasks les liste, etc.
Pour ClickFast, comme c'est visuel (un bouton, un compteur), on teste le DOM avec jsdom, qui simule un
navigateur dans Node :
// multiply.js
function multiply(a, b) {
return a * b;
}
module.exports = multiply;
// multiply.test.js
const multiply = require('./multiply');
test('multiplie deux nombres', () => {
// expect(...).toBe(...) : "je m'attends à ce que le résultat soit exactement ça"
expect(multiply(3, 4)).toBe(12);
});
test('gère le zéro', () => {
expect(multiply(5, 0)).toBe(0);
});
npm test
PASS ./multiply.test.js
✓ multiplie deux nombres (2 ms)
✓ gère le zéro
Tests: 2 passed, 2 total
// script.test.js
describe("ClickFast - le compteur", () => {
beforeEach(() => {
jsdom ? Une implémentation du DOM (le document , les éléments HTML) en pur JavaScript, sans
navigateur. Ça permet à Jest de tester du code qui manipule la page, comme si un navigateur était là. On
l'active avec --env=jsdom ou jest-environment-jsdom .
beforeEach ? Une fonction Jest qui s'exécute avant chaque test . On y remet l'environnement à zéro (ici,
un DOM tout neuf), pour que les tests ne se polluent pas entre eux.
Job test SANS base de données + le cache des dépendances
On commence par le job de tests qui n'a pas besoin de base (tests unitaires purs, comme multiply ). Et on en
profite pour introduire le cache, parce que re-télécharger toutes les dépendances npm à chaque pipeline, c'est
lent et inutile.
// beforeEach : ce code tourne avant CHAQUE test, pour repartir d'un DOM propre
document.body.innerHTML = `
<div id="score">0</div>
<div id="timer">5</div>
<button id="button-clicker">Click me!</button>
<button id="button-reset">Reset</button>
`;
});
test("le score s'incrémente quand on clique", () => {
const button = document.getElementById("button-clicker");
button.click(); // on simule un clic
const score = document.getElementById("score").textContent;
expect(score).toBe("1"); // on s'attend à 1 après un clic
});
});
# .gitlab-ci.yml - Todo API (extrait : lint + test sans BDD)
stages:
- lint
- test
- build
- push
- deploy
# On factorise la config commune aux jobs Node dans un "template" caché (préfixe .)
.node-base:
image: node:18-alpine # tous les jobs Node tournent sur cette image légère
cache:
key:
files:
- package-lock.json # la clé du cache dépend du package-lock
paths:
- node_modules/ # on met node_modules en cache
before_script:
- npm ci # install déterministe avant chaque job
lint:
extends: .node-base
Le morceau qui mérite qu'on s'arrête, c'est le cache: :
key: files: [package-lock.json] : la clé du cache est calculée à partir du package-lock.json . Tant
que vos dépendances ne changent pas (le lock ne bouge pas), GitLab réutilise le node_modules/ mis en
cache. Si vous ajoutez une dépendance (le lock change), la clé change, et le cache est recalculé.
paths: [node_modules/] : on cache le dossier node_modules/ , celui qui pèse lourd et prend du temps
à installer.
Cache ? Un stockage temporaire que GitLab garde entre les pipelines. Au lieu de re-télécharger toutes
les dépendances npm à chaque fois (1-2 minutes), on les garde et on les réutilise (quelques secondes). La
clé décide quand le cache est encore valide.
Le .node-base avec le préfixe . est un job caché (un template) : GitLab ne l'exécute pas tel quel, mais les
autres jobs l'héritent avec extends: . Ça évite de répéter image: , cache: et before_script: dans chaque
job. DRY (Don't Repeat Yourself).
Job test AVEC base de données (services PostgreSQL)
Là, ça devient intéressant. La Todo API a besoin de PostgreSQL. Pour tester les routes qui touchent la base
(créer une tâche, la lire), il faut une vraie base disponible pendant le job. GitLab gère ça avec services: .
Ce qui se passe :
stage: lint
script:
- npm run lint # ESLint vérifie le style
test-unit:
extends: .node-base
stage: test
script:
- npm test # Jest lance les tests unitaires
# .gitlab-ci.yml - Todo API (extrait : test avec BDD)
test-integration:
extends: .node-base
stage: test
services:
- postgres:16 # GitLab lance un conteneur Postgres à côté du job
variables:
POSTGRES_DB: todo_test
POSTGRES_USER: todo_user
POSTGRES_PASSWORD: todo_pass
# L'app se connecte à la base via le hostname "postgres" (nom du service)
DB_HOST: postgres
DB_PORT: "5432"
DB_NAME: todo_test
DB_USER: todo_user
DB_PASSWORD: todo_pass
script:
- npm run test:integration # les tests qui touchent vraiment la base
services: [postgres:16] : GitLab démarre un conteneur PostgreSQL à côté de votre job, sur le même
réseau. Exactement comme un service dans docker-compose (qu'on a vu en J1).
variables: : les variables POSTGRES_* configurent la base (nom, user, mot de passe). Les variables
DB_* configurent votre app pour qu'elle se connecte à cette base.
Le hostname de la base, c'est postgres (le nom du service). Votre app se connecte à
DB_HOST=postgres , comme avec le DNS automatique de Docker qu'on a vu en J2.
Service (dans GitLab-CI) ? Un conteneur que GitLab lance en parallèle de votre job, sur le même réseau.
Typiquement une base de données ou un cache. Votre job peut s'y connecter par le nom du service. Doc
: GitLab - Services.
Pourquoi deux jobs de test (unit ET integration) ? Parce qu'ils testent des choses différentes : les tests unitaires
vérifient votre logique métier en isolation (rapides, pas de base), les tests d'intégration vérifient que tout
marche ensemble, base comprise (plus lents, mais plus réalistes). Les deux comptent.
Job build + push sur DockerHub (avec secrets)
Les tests passent. On build l'image et on la pousse sur DockerHub. Et c'est ici qu'on touche un sujet sensible :
les secrets. Pour pousser sur DockerHub, il faut s'authentifier. Et on ne met JAMAIS un mot de passe en clair
dans le .gitlab-ci.yml (qui est commité dans le repo).
Les points clés :
$DOCKERHUB_USER et $DOCKERHUB_TOKEN : ce sont des variables CI/CD que vous définissez dans GitLab
(pas dans le fichier !). On voit comment juste après.
--password-stdin : on passe le token par l'entrée standard, jamais en argument de commande (sinon il
apparaîtrait dans les logs).
Deux tags : $CI_COMMIT_SHORT_SHA (le hash du commit, pour tracer exactement quelle version) et
latest (le raccourci vers la dernière). C'est une convention pro.
# .gitlab-ci.yml - Todo API (extrait : build + push)
build-and-push:
stage: push
image: docker:24
services:
- docker:24-dind
variables:
IMAGE: $DOCKERHUB_USER/todo-api # ex: monpseudo/todo-api
script:
# On se logue sur DockerHub avec les secrets (jamais en clair !)
- echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USER" --password-stdin
# On build avec deux tags : le hash du commit ET "latest"
- docker build -t $IMAGE:$CI_COMMIT_SHORT_SHA -t $IMAGE:latest .
# On pousse les deux tags
- docker push $IMAGE:$CI_COMMIT_SHORT_SHA
- docker push $IMAGE:latest
rules:
- if: '$CI_COMMIT_BRANCH == "main"' # on ne pousse que depuis main
rules: if: '$CI_COMMIT_BRANCH == "main"' : ce job ne tourne que sur la branche main . Une
branche de feature lance les tests, mais ne pousse pas d'image. C'est ce qu'on a préparé en section 3.
Token (DockerHub) ? Un mot de passe à usage spécifique, qu'on génère dans les paramètres
DockerHub (Account Settings > Security > Access Tokens). On l'utilise à la place de votre vrai mot de
passe : si le token fuite, vous le révoquez sans changer votre mot de passe principal.
Configurer les secrets dans GitLab
Voilà comment on stocke un secret proprement. Dans votre projet GitLab : Settings > CI/CD > Variables > Add
variable.
Vous y ajoutez :
DOCKERHUB_USER : votre pseudo DockerHub
DOCKERHUB_TOKEN : le token généré sur DockerHub
Deux options importantes à cocher :
Masked : la valeur est masquée dans les logs de pipeline (elle apparaît comme [MASKED] ). Indispensable
pour un secret.
Protected : la variable n'est dispo que sur les branches protégées (genre main ). Ça évite qu'une branche
de feature pirate puisse lire vos secrets.
Variable CI/CD masquée ? Une variable dont GitLab cache la valeur dans tous les logs. Même si votre
script fait un echo $DOCKERHUB_TOKEN par erreur, le log affichera [MASKED] . Doc : GitLab - CI/CD
variables.
Avant (le piège, à ne JAMAIS faire) :
Ce mot de passe est maintenant dans votre repo, dans l'historique Git, visible par quiconque a accès. Et si le
repo est public...
Après (la bonne méthode) :
Le secret vit dans les variables GitLab, jamais dans le code. Le repo peut être public sans risque.
Verdict : les secrets vivent dans la config CI/CD de GitLab, jamais dans le fichier versionné. Un repo, ça
se lit ; une variable masquée, ça ne fuite pas.
Bonus perso : tous les ans, des milliers de tokens (AWS, DockerHub, clés API) se retrouvent dans des
repos publics parce que quelqu'un les a commités par erreur. Des bots scannent GitHub en continu pour
les trouver et les exploiter en minutes. On vient de voir exactement comment ne pas faire partie de ces
stats. 👉 Mini-challenge : cherchez "github secret leak" et trouvez un cas réel documenté publiquement
(il y en a des célèbres, avec des factures cloud à six chiffres).
script:
- docker login -u monpseudo -p MonVraiMotDePasse123 # CATASTROPHE
script:
- echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USER" --password-stdin
Job de déploiement : SSH (le concept du syllabus)
Le dernier job : le déploiement. Le syllabus enseigne le déploiement sur une VM via SSH. C'est la méthode
"classique" : on se connecte au serveur, on pull la nouvelle image, on relance le conteneur.
Ce qui se passe :
On installe le client SSH dans le runner.
On charge la clé privée SSH (stockée dans la variable SSH_PRIVATE_KEY , masquée) pour pouvoir se
connecter au serveur sans mot de passe.
On se connecte au serveur ( $DEPLOY_USER@$DEPLOY_HOST ) et on enchaîne : pull de la nouvelle image,
stop/rm de l'ancien conteneur, run du nouveau.
Le || true après docker stop / docker rm : si le conteneur n'existe pas encore (premier
déploiement), la commande échoue mais on l'ignore, pour ne pas casser la pipeline.
SSH (Secure Shell) ? Un protocole pour se connecter à distance à un serveur, de façon chiffrée. Avec une
clé (paire publique/privée), on se connecte sans taper de mot de passe. La clé publique est sur le
serveur, la clé privée reste secrète (ici, dans une variable GitLab masquée).
scp ? "Secure copy", le cousin de SSH pour copier des fichiers vers un serveur distant. On l'utilise par
exemple pour envoyer un docker-compose.yml sur la VM avant de lancer docker compose up .
C'est la méthode SSH. Elle marche, elle est simple à comprendre, et c'est ce que le syllabus demande de
connaître. Mais elle a des limites : si le serveur tombe, l'app tombe avec. Pas de redondance, pas de scaling
automatique, pas de redémarrage en cas de crash. C'est exactement le problème que Kubernetes résout, et
c'est notre prochaine grande section. Le déploiement réel de votre projet se fera sur K3S, pas en SSH.
# .gitlab-ci.yml - Todo API (extrait : deploy via SSH)
deploy-ssh:
stage: deploy
image: alpine:latest
before_script:
- apk add --no-cache openssh-client # on installe le client SSH
# On charge la clé privée SSH (stockée en variable CI/CD)
- eval $(ssh-agent -s)
- echo "$SSH_PRIVATE_KEY" | ssh-add -
- mkdir -p ~/.ssh && chmod 700 ~/.ssh
script:
# On se connecte au serveur et on relance le conteneur avec la nouvelle image
- ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
docker pull $DOCKERHUB_USER/todo-api:latest &&
docker stop todo-api || true &&
docker rm todo-api || true &&
docker run -d --name todo-api -p 3000:3000 $DOCKERHUB_USER/todo-api:latest
"
rules:
- if: '$CI_COMMIT_BRANCH == "main"'
Pour les curieux : rules: vs only:
Vous croiserez deux syntaxes pour conditionner un job à une branche. La vieille ( only: ) et la moderne
( rules: ).
Avant ( only: , l'ancienne syntaxe) :
Après ( rules: , la moderne, recommandée) :
rules: est plus puissant : on peut combiner des conditions (branche ET tag ET variable), définir when:
(manual, on_success, never...), et même rendre un déploiement manuel (un bouton "play" dans l'interface
GitLab, pour le fameux Continuous Delivery qu'on a vu en section 2).
Privilégiez rules: : only: est en voie de dépréciation. Doc : GitLab - rules.
On a une pipeline qui teste, build, push, et déploie. Mais on déploie où, exactement ? Le SSH, c'est bien pour
comprendre, mais en vrai, on veut un truc qui se répare tout seul, qui scale, qui ne tombe jamais. C'est tout
l'objet de Kubernetes, et c'est là qu'on passe le plus de temps aujourd'hui.
6 - Kubernetes / K3S : orchestrer pour de vrai
On y arrive : le K3S annoncé dès le planning du matin (et en fin de section 5, quand on a dit que le vrai
déploiement du projet se ferait là-dessus, pas en SSH). C'est le gros morceau de la journée.
Bon, on a notre image sur DockerHub, on sait la déployer en SSH. Pourquoi on s'embête avec Kubernetes ?
Scénario concret. Votre Todo API tourne sur un serveur, déployée en SSH. Un soir, le conteneur crash (fuite
mémoire, bug). Personne ne le voit. L'app est down toute la nuit. Le matin, des utilisateurs furieux. Vous vous
connectez en SSH, vous relancez à la main. Ça remarche... jusqu'au prochain crash.
deploy:
only:
- main
deploy:
rules:
- if: '$CI_COMMIT_BRANCH == "main"'
when: on_success
- when: never
deploy-prod:
stage: deploy
rules:
- if: '$CI_COMMIT_BRANCH == "main"'
when: manual # un humain clique sur "play" pour déployer en prod
script:
- echo "Déploiement en production..."
Maintenant imaginez : votre app a du succès, le trafic explose. Un seul conteneur ne tient plus la charge. Vous
devez en lancer cinq, répartir le trafic entre eux, et si l'un tombe, en relancer un automatiquement. À la main,
en SSH, c'est l'enfer.
Kubernetes résout exactement ça. C'est un orchestrateur : il s'assure que votre app tourne toujours, dans le
bon nombre d'exemplaires, et il répare tout seul ce qui casse.
L'essentiel
Kubernetes, le chef d'orchestre
Imaginez Kubernetes comme un chef d'orchestre pour vos applications. Vous avez plusieurs applications
emballées dans des conteneurs, et Kubernetes s'occupe de les déployer, de les mettre à l'échelle (ajuster
automatiquement le nombre de copies en fonction de la demande), et de s'assurer qu'elles fonctionnent
correctement. Il gère aussi la répartition du trafic entre les différentes parties de votre application,
garantissant une disponibilité continue.
Kubernetes (K8s) ? L'orchestrateur de conteneurs standard de l'industrie, open-source, né chez Google.
"K8s" parce qu'il y a 8 lettres entre le K et le s. Il automatise le déploiement, le scaling et la réparation des
applications conteneurisées. Site officiel : kubernetes.io.
Le chef d'orchestre ne joue d'aucun instrument. Mais il connaît la partition (l'état désiré : "je veux 3 copies de la
Todo API qui tournent"), et il s'assure que chaque musicien (chaque conteneur) joue au bon moment. Si un
violoniste s'arrête (un conteneur crash), le chef le remplace immédiatement. C'est le concept central de
Kubernetes : l'état désiré. Vous décrivez ce que vous voulez, et Kubernetes fait le nécessaire pour que la
réalité corresponde, en permanence.
K3S : Kubernetes, version légère
Kubernetes "complet", c'est lourd à installer (plusieurs composants, plusieurs machines). Pour apprendre et
pour des petits déploiements, on utilise K3S.
K3S ? Une distribution Kubernetes ultra-légère, certifiée conforme, qui tient en un seul binaire de moins
de 100 Mo. Conçue par Rancher pour l'edge, l'IoT, et... l'apprentissage. Tout Kubernetes, en une
commande d'installation. Site : k3s.io.
C'est notre cible principale aujourd'hui : on installe K3S localement, et on y déploie la Todo API. Mêmes
concepts que le "vrai" Kubernetes, mais sans la galère d'installation.
Les 4 objets Kubernetes à connaître
Kubernetes manipule des objets qu'on décrit dans des fichiers YAML (les manifestes). Quatre suffisent pour
démarrer. On les voit un par un, parce que c'est le vocabulaire de toute la section.
1. Le Pod : la plus petite unité déployable. Un pod, c'est un ou plusieurs conteneurs qui tournent ensemble,
partageant le même réseau. La plupart du temps : un pod = un conteneur (votre Todo API).
Pod ? L'enveloppe minimale autour d'un conteneur dans Kubernetes. On ne lance jamais un conteneur
"nu" dans K8s, on le met dans un pod. Pensez "un pod = une instance de votre app qui tourne".
2. Le Deployment : il gère les pods pour vous. Vous lui dites "je veux 3 copies de la Todo API", et il maintient 3
pods en permanence. Un pod crash ? Le Deployment en recrée un. C'est lui qui incarne "l'état désiré".
Deployment ? L'objet qui garde le bon nombre de pods en vie. Vous déclarez replicas: 3 , il s'assure
qu'il y a toujours 3 pods. C'est aussi lui qui gère les mises à jour (rolling update, on y vient).
3. Le Service : il donne une adresse stable à vos pods. Les pods vont et viennent (ils ont des IP qui changent).
Le Service, lui, a une adresse fixe et répartit le trafic entre les pods vivants.
Service (Kubernetes) ? Le point d'entrée réseau stable vers vos pods. Comme les pods changent d'IP en
permanence, le Service offre une adresse fixe et fait le load-balancing entre eux. Ne pas confondre avec
le services: de GitLab-CI (vu en section 5) : rien à voir.
4. Le Namespace : un espace de cloisonnement logique. Il permet de séparer des groupes d'objets (par
exemple : un namespace dev , un namespace prod ) dans le même cluster.
Namespace ? Un "dossier" virtuel dans le cluster, pour ranger et isoler vos objets. Par défaut tout va
dans le namespace default . En entreprise, on sépare souvent par équipe ou par environnement.
Le schéma mental : un Deployment maintient N Pods (vos copies de l'app), un Service leur donne une
adresse stable et répartit le trafic, le tout rangé dans un Namespace.
Installer K3S
On installe K3S localement (sur Linux ou une VM Linux). Une seule commande :
Décortiquons :
curl -sfL https://get.k3s.io : on récupère le script d'installation officiel. Le -s (silencieux), -f
(échoue proprement si erreur HTTP), -L (suit les redirections).
| sh - : on passe le script à sh pour l'exécuter.
Le script installe K3S et démarre un service. Pour vérifier que ça tourne :
Devrait afficher :
Un nœud en Ready : votre cluster (mono-nœud) est prêt.
Node (nœud) ? Une machine (physique ou virtuelle) qui fait tourner vos pods. En local avec K3S, vous
avez un seul nœud : votre machine. En prod, un cluster a plusieurs nœuds pour la redondance.
control-plane / master ? Le "cerveau" du cluster, qui prend les décisions (où placer les pods, quand en
recréer). En K3S local, votre unique nœud est à la fois le cerveau et le muscle.
curl -sfL https://get.k3s.io | sh -
sudo k3s kubectl get nodes
NAME STATUS ROLES AGE VERSION
mon-pc Ready control-plane,master 1m v1.30.x+k3s1
kubectl : parler au cluster
L'outil pour piloter Kubernetes, c'est kubectl (prononcez "cube-control" ou "cube-cuttle", ça se discute).
kubectl ? Le client en ligne de commande de Kubernetes. Toutes vos interactions avec le cluster passent
par lui : déployer, lister, inspecter, supprimer. Doc : kubectl reference.
K3S embarque son propre kubectl ( k3s kubectl ), mais on peut configurer le kubectl standard pour pointer
vers le cluster K3S (via le fichier /etc/rancher/k3s/k3s.yaml ). Pour la suite, je note kubectl directement.
Les commandes que vous taperez tout le temps :
Un manifeste décortiqué, champ par champ
Voilà le manifeste qui déploie la Todo API. On le lit ligne par ligne, parce que c'est le cœur du déploiement
Kubernetes. C'est dense, mais une fois compris, c'est le même schéma partout.
kubectl get pods # lister les pods
kubectl get deployments # lister les deployments
kubectl get services # lister les services
kubectl apply -f fichier.yaml # créer/mettre à jour depuis un manifeste
kubectl delete -f fichier.yaml # supprimer
kubectl logs nom-du-pod # voir les logs d'un pod
kubectl describe pod nom-du-pod # tout savoir sur un pod (events compris)
# todo-deployment.yaml
apiVersion: apps/v1 # la version de l'API K8s pour ce type d'objet
kind: Deployment # le type d'objet : un Deployment
metadata:
name: todo-api # le nom de notre Deployment
labels:
app: todo-api # une étiquette pour le retrouver
spec:
replicas: 3 # JE VEUX 3 copies (pods) qui tournent en permanence
selector:
matchLabels:
app: todo-api # ce Deployment gère les pods étiquetés app=todo-api
template: # le "moule" de chaque pod
metadata:
labels:
app: todo-api # chaque pod créé porte cette étiquette
spec:
containers:
- name: todo-api
image: monpseudo/todo-api:latest # l'image qu'on a poussée sur DockerHub
ports:
- containerPort: 3000 # le port que l'app écoute dans le conteneur
env:
- name: DB_HOST
value: "postgres-service" # l'app se connecte à la base via ce nom
- name: NODE_ENV
value: "production"
Les champs qui comptent :
apiVersion + kind : ils disent à Kubernetes "ceci est un objet de type Deployment, version apps/v1".
Chaque type d'objet a son apiVersion .
metadata.name : le nom de l'objet, pour le retrouver avec kubectl get .
spec.replicas: 3 : l'état désiré. Trois pods, toujours. C'est LA ligne magique de Kubernetes.
selector.matchLabels : comment le Deployment reconnaît "ses" pods (par l'étiquette app: todo-api ).
template: : le moule. Chaque pod sera fabriqué selon ce modèle.
containers.image : votre image DockerHub. C'est le lien direct avec la pipeline : ce que la CI a poussé,
K8s le déploie.
env: : les variables d'environnement, comme avec Docker (vu en J2).
Manifeste ? Un fichier YAML qui décrit un objet Kubernetes (son état désiré). On l'applique avec
kubectl apply -f . C'est de l'Infrastructure as Code : votre infra est décrite dans des fichiers
versionnés, pas configurée à la main.
Et le Service qui va avec, pour exposer l'app :
selector: app: todo-api : le Service envoie le trafic vers tous les pods portant cette étiquette. Si vous
avez 3 pods, il répartit entre les 3.
port vs targetPort : port c'est ce que le Service expose, targetPort c'est le port de l'app dans le
pod. Le Service fait le pont.
type: NodePort : rend le service accessible depuis l'extérieur du cluster, sur un port du nœud. (Les
autres types : ClusterIP pour de l'interne uniquement, LoadBalancer pour un vrai load-balancer
cloud.)
Déployer la Todo API
On applique les deux manifestes :
# todo-service.yaml
apiVersion: v1
kind: Service
metadata:
name: todo-api-service
spec:
selector:
app: todo-api # ce Service cible les pods étiquetés app=todo-api
ports:
- protocol: TCP
port: 80 # le port exposé par le Service
targetPort: 3000 # le port de l'app dans le pod
type: NodePort # expose le service sur un port du nœud (accessible de
l'extérieur)
kubectl apply -f todo-deployment.yaml
kubectl apply -f todo-service.yaml
Devrait afficher :
On vérifie que les pods tournent :
Devrait afficher (trois pods, parce que replicas: 3 ) :
Trois pods Running . Kubernetes maintient votre état désiré. 🔥
Le scaling : ajuster le nombre de replicas
Votre app a du succès, le trafic monte. On passe de 3 à 5 copies, en une commande :
Devrait afficher :
Re-vérifiez avec kubectl get pods : maintenant 5 pods. Kubernetes a lancé deux pods de plus, tout seul.
C'est ça, le scaling horizontal : on ne grossit pas une machine, on multiplie les copies.
Scaling horizontal ? Ajouter des copies (des pods) pour absorber plus de charge, plutôt que de muscler
une seule machine (scaling vertical). C'est la force de Kubernetes : multiplier les instances et répartir le
trafic entre elles.
Testez le côté "auto-réparation" : tuez un pod à la main.
Re-listez les pods : il y en a toujours 5. Kubernetes a immédiatement recréé celui que vous avez supprimé,
pour respecter replicas: 5 . Vous ne pouvez pas casser l'état désiré : c'est tout l'intérêt.
Le rolling update : déployer sans coupure
Comment je déploie une nouvelle version sans que l'app tombe pendant la mise à jour ?
Avec le SSH, on faisait stop puis run : l'app était down quelques secondes. Kubernetes fait mieux avec le
rolling update : il remplace les pods un par un, en gardant toujours des pods vivants pour servir le trafic.
Vous changez l'image (nouvelle version poussée par la pipeline) :
deployment.apps/todo-api created
service/todo-api-service created
kubectl get pods
NAME READY STATUS RESTARTS AGE
todo-api-7d4b9c8f5-2xk9p 1/1 Running 0 30s
todo-api-7d4b9c8f5-8vn2m 1/1 Running 0 30s
todo-api-7d4b9c8f5-q5w7r 1/1 Running 0 30s
kubectl scale deployment todo-api --replicas=5
deployment.apps/todo-api scaled
kubectl delete pod todo-api-7d4b9c8f5-2xk9p
STATUS Ce que ça veut dire Quoi vérifier
ImagePullBackOff
K8s n'arrive pas à
récupérer l'image
nom de l'image, image publique sur DockerHub ?
CrashLoopBackOff
le conteneur démarre et
crash en boucle
kubectl logs : souvent une variable d'env
manquante ou une base injoignable
Pending
aucun nœud ne peut
accueillir le pod
ressources insuffisantes, ou nœud pas prêt
ContainerCreating en cours de création
normal au début ; si ça bloque, kubectl
describe
Kubernetes lance un nouveau pod (v2), attend qu'il soit prêt, bascule du trafic dessus, puis supprime un ancien
pod (v1). Et il recommence, pod par pod, jusqu'à ce que tout soit en v2. À aucun moment l'app n'est down.
Zéro coupure.
Rolling update ? Une mise à jour progressive : on remplace les pods un par un, en gardant toujours des
pods de l'ancienne version vivants tant que la nouvelle n'est pas prête. Résultat : pas de coupure de
service. Et si la nouvelle version casse, Kubernetes peut faire un rollback automatique.
Vous suivez la progression :
Et si la v2 est cassée, on revient en arrière instantanément :
Surveillance et dépannage
Quand un pod ne va pas bien ( STATUS qui n'est pas Running ), trois commandes pour diagnostiquer :
Les statuts d'erreur que vous croiserez et "ce qui casse et pourquoi" :
Le réflexe : kubectl describe pod d'abord (la section Events en bas raconte ce qui s'est passé), puis
kubectl logs pour voir ce que l'app a craché.
kubectl set image deployment/todo-api todo-api=monpseudo/todo-api:v2
kubectl rollout status deployment/todo-api
kubectl rollout undo deployment/todo-api
# 1. Vue d'ensemble : quel pod pose problème ?
kubectl get pods
# 2. Le détail d'un pod : les events en bas révèlent souvent le souci
kubectl describe pod nom-du-pod
# 3. Les logs de l'app dans le pod
kubectl logs nom-du-pod
On va plus loin : le déploiement K3S depuis la pipeline
On a déployé à la main avec kubectl apply . Mais le but du jour, c'est l'automatisation. On branche donc ce
déploiement dans la pipeline GitLab, en remplacement (ou en complément) du job SSH de la section 5.
Ce qui se passe :
image: [bitnami/kubectl](https://hub.docker.com/r/bitnami/kubectl) : une image Docker qui
embarque le binaire kubectl, maintenue par Bitnami (VMware). Le job tourne dans ce conteneur, donc
kubectl est dispo sans rien installer.
$KUBE_CONFIG : le fichier de config du cluster (le kubeconfig), stocké en variable CI/CD encodé en
base64. C'est lui qui dit à kubectl à quel cluster parler et avec quelles permissions.
kubectl set image : on pointe le Deployment vers la nouvelle image (taggée avec le hash du commit).
Kubernetes déclenche le rolling update tout seul.
kubectl rollout status : on attend que le déploiement soit terminé, pour que la pipeline reflète le
vrai état.
kubeconfig ? Le fichier (souvent dans ~/.kube/config ) qui contient les coordonnées du cluster et vos
identifiants. Quiconque l'a peut piloter le cluster : c'est un secret, on le stocke en variable masquée.
Et voilà : un git push sur main lance les tests, build l'image, la pousse sur DockerHub, et déclenche un
rolling update sur K3S. Le chemin complet du code source à la prod, sans toucher à rien. C'est l'objectif du fil
rouge. 💥
Bonus perso : Kubernetes tourne derrière Spotify, Airbnb, et probablement votre prochaine boîte. C'est
le standard de facto de l'orchestration. 👉 Mini-challenge : trouvez un article de blog engineering d'une
grande boîte qui dit combien de pods (ou de nœuds) tourne leur cluster K8s. Les chiffres donnent le
vertige.
On a une app qui tourne, qui scale, qui se répare. Mais comment on SAIT qu'elle va bien ? Combien de
requêtes, quelle latence, est-ce qu'un pod consomme trop ? C'est le troisième pilier du DevOps, le
Measurement, et c'est ce qu'on regarde maintenant.
# .gitlab-ci.yml - Todo API (extrait : deploy K3S)
deploy-k3s:
stage: deploy
image: bitnami/kubectl:latest # une image Docker qui embarque le binaire kubectl
variables:
KUBECONFIG: /tmp/kubeconfig
before_script:
# On charge la config du cluster K3S depuis une variable CI/CD (fichier kubeconfig)
- echo "$KUBE_CONFIG" | base64 -d > /tmp/kubeconfig
script:
# On met à jour l'image du deployment avec la version qu'on vient de pousser
- kubectl set image deployment/todo-api todo-api=$DOCKERHUB_USER/todoapi:$CI_COMMIT_SHORT_SHA
- kubectl rollout status deployment/todo-api # on attend que le rolling update
finisse
rules:
- if: '$CI_COMMIT_BRANCH == "main"'
7 - Monitoring : Prometheus + Grafana
Votre app tourne sur K3S. Tout a l'air vert. Mais est-ce qu'elle répond vite ? Combien de requêtes par seconde ? Est-ce
qu'un pod sature ? Sans monitoring, vous êtes aveugle. Vous découvrez les problèmes quand les utilisateurs
râlent, pas avant.
Le monitoring, c'est le pilier Measurement du DevOps. On va voir le duo standard : Prometheus collecte les
métriques, Grafana les affiche. Niveau présentation ici, vous le brancherez dans le projet de l'après-midi.
L'essentiel
Le duo Prometheus + Grafana
Prometheus ? Un système de collecte de métriques open-source, né chez SoundCloud, aujourd'hui
standard de l'industrie. Il va "scraper" (interroger régulièrement) vos applications pour récupérer leurs
métriques et les stocker dans le temps. Site : prometheus.io.
Grafana ? L'outil de visualisation. Il se branche sur Prometheus (et plein d'autres sources) et affiche de
jolis dashboards : courbes de latence, nombre de requêtes, usage CPU/mémoire. Site : grafana.com.
Le partage des rôles est net :
Prometheus = le collecteur. Il va chercher les chiffres et les stocke.
Grafana = l'afficheur. Il transforme les chiffres en graphiques lisibles.
On les utilise quasiment toujours ensemble : Prometheus seul, c'est des chiffres bruts ; Grafana sans source,
c'est un écran vide.
L'endpoint /metrics
Pour que Prometheus puisse collecter, votre app doit exposer ses métriques. La convention : un endpoint
HTTP /metrics qui renvoie les chiffres dans un format texte que Prometheus comprend.
En Node.js, on utilise la librairie prom-client :
Et on expose l'endpoint dans l'app Express :
// monitoring.js
const client = require('prom-client');
// Collecte automatique des métriques par défaut (CPU, mémoire, event loop...)
client.collectDefaultMetrics();
// Un compteur custom : le nombre total de requêtes HTTP
const httpRequests = new client.Counter({
name: 'http_requests_total',
help: 'Nombre total de requêtes HTTP reçues',
labelNames: ['method', 'route', 'status'],
});
module.exports = { client, httpRequests };
// app.js (extrait)
Testez en local :
Devrait afficher (entre autres) :
Voilà vos métriques, exposées en texte brut. Pas joli, mais c'est exactement ce que Prometheus sait lire.
Pour bien voir ce que prom-client apporte, comparez l'app avant et après l'avoir branché.
Avant (sans prom-client) : l'endpoint n'existe pas, votre app est muette.
Un 404. Prometheus n'a rien à scraper, il vous affichera la cible en DOWN .
Après (avec prom-client) : l'endpoint répond avec vos métriques au format texte (le bloc juste au-dessus).
Verdict : trois lignes de code ( collectDefaultMetrics + l'endpoint) et votre app devient observable. C'est le
minimum vital avant de penser "prod".
Endpoint /metrics ? Une URL standardisée que votre app expose pour livrer ses métriques au format
Prometheus. Prometheus vient l'interroger toutes les X secondes (le "scrape") et stocke l'évolution dans
le temps.
const { client, httpRequests } = require('./monitoring');
// Middleware : on incrémente le compteur à chaque requête
app.use((req, res, next) => {
res.on('finish', () => {
httpRequests.inc({ method: req.method, route: req.path, status: res.statusCode });
});
next();
});
// L'endpoint que Prometheus va scraper
app.get('/metrics', async (req, res) => {
res.set('Content-Type', client.register.contentType);
res.end(await client.register.metrics());
});
curl http://localhost:3000/metrics
# HELP http_requests_total Nombre total de requêtes HTTP reçues
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/api/tasks",status="200"} 42
# HELP process_cpu_user_seconds_total ...
process_cpu_user_seconds_total 0.12
...
$ curl http://localhost:3000/metrics
Cannot GET /metrics
Prometheus vient scraper
Prometheus se configure avec un fichier prometheus.yml qui liste les cibles à scraper :
scrape_interval: 15s : toutes les 15 secondes, Prometheus va taper /metrics sur chaque cible.
targets: : la liste des apps à surveiller. Ici, notre Service Kubernetes.
Scrape ? L'action de Prometheus d'aller interroger l'endpoint /metrics d'une cible à intervalle régulier.
"Scraper", c'est récolter les chiffres. Doc : Prometheus - Getting started.
Grafana affiche
Une fois Prometheus branché comme source de données dans Grafana, on construit un dashboard : on choisit
une métrique ( http_requests_total ), un type de graphe (courbe, jauge), et Grafana affiche l'évolution en
temps réel.
Un dashboard Todo API typique montrerait :
le nombre de requêtes par seconde (la charge)
la latence moyenne et p95 (la réactivité)
l'usage CPU et mémoire des pods (la santé)
le taux d'erreurs (les requêtes en status 5xx)
p95 ? Le 95e percentile. Si la latence p95 est de 200 ms, ça veut dire que 95% des requêtes répondent en
moins de 200 ms. Bien plus parlant que la moyenne, qui cache les requêtes lentes.
Lancer la stack en local avec docker-compose
Avant de brancher tout ça sur Kubernetes, le plus simple pour voir le duo en action, c'est de tout lancer en
local avec Docker Compose : votre Todo API, sa base, Prometheus, et Grafana, dans un seul fichier. Comme ça
vous testez la chaîne complète sur votre machine avant de la porter sur K3S.
# prometheus.yml
global:
scrape_interval: 15s # Prometheus interroge les cibles toutes les 15s
scrape_configs:
- job_name: 'todo-api'
static_configs:
- targets: ['todo-api-service:80'] # l'adresse de notre Service K8s
# docker-compose.yml (stack monitoring locale)
services:
todo-api:
build: .
ports:
- "3000:3000"
environment:
DB_HOST: postgres
DB_USER: todo_user
DB_PASSWORD: todo_pass
Petit piège : Grafana écoute sur le port 3000, comme la Todo API. Si les deux tournent en local, mappez
Grafana ailleurs ( "3001:3000" ) pour éviter le conflit de port.
On lance tout :
Et on vérifie que chaque brique répond :
Devrait afficher :
Puis on ouvre les interfaces dans le navigateur :
Prometheus : http://localhost:9090 (onglet Status > Targets pour voir si la Todo API est scrapée)
Grafana : http://localhost:3000 (login par défaut admin / admin , à changer au premier login)
Une fois dedans, vous ajoutez Prometheus comme source de données dans Grafana (URL
http://prometheus:9090 , le nom du service docker-compose), et vous construisez votre premier panel sur
http_requests_total .
DB_NAME: todo
postgres:
image: postgres:16
environment:
POSTGRES_USER: todo_user
POSTGRES_PASSWORD: todo_pass
POSTGRES_DB: todo
prometheus:
image: prom/prometheus:latest
ports:
- "9090:9090"
volumes:
# On monte notre fichier de config dans le conteneur
- ./prometheus.yml:/etc/prometheus/prometheus.yml
grafana:
image: grafana/grafana:latest
ports:
- "3000:3000" # attention : si todo-api est déjà sur 3000, mappez Grafana sur 3001
depends_on:
- prometheus
docker compose up -d
curl http://localhost:9090/-/healthy # Prometheus en bonne santé
Prometheus Server is Healthy.
Ce qui casse : Prometheus ne scrape pas
Le bug classique de monitoring : vous avez tout branché, mais le dashboard reste vide. Prometheus a un outil
pour diagnostiquer ça en deux secondes : la page Targets, sur http://localhost:9090/targets. Chaque cible y est
listée avec un état UP ou DOWN .
Vous tombez sur un UP = 0 (cible DOWN ). Qu'est-ce que vous regardez en premier ?
Les causes classiques, dans l'ordre où on les vérifie :
Mauvais port ou mauvaise adresse dans prometheus.yml (vous scrapez :80 alors que l'app écoute
sur :3000 ). La page Targets affiche l'URL exacte tapée : comparez-la à la réalité.
/metrics pas exposé : l'endpoint n'existe pas (vous avez oublié de le brancher dans Express). Testez à la
main avec curl , vous verrez le 404.
Cible injoignable : dans docker-compose, on parle aux autres services par leur nom ( todo-api:3000 ),
pas par localhost . localhost dans un conteneur, c'est le conteneur lui-même, pas votre machine.
Format invalide : votre endpoint renvoie du JSON au lieu du format texte Prometheus. La page Targets
montre alors une erreur de parsing.
Le réflexe à retenir : devant un dashboard vide, on ne touche pas à Grafana. On va d'abord sur /targets côté
Prometheus. Si la cible est DOWN , le problème est entre Prometheus et l'app, pas dans l'affichage.
Scénario : tracer un pic de latence jusqu'au pod
Le monitoring, c'est pas juste de jolies courbes. C'est un outil d'enquête. Mise en situation.
Sur Grafana, vous voyez un pic : la latence p95 grimpe à 500 ms pendant deux minutes, puis redescend. Comment
vous remontez jusqu'à la cause ?
Le raisonnement, étape par étape :
Vous notez le timestamp exact du pic sur Grafana (survolez la courbe, l'heure s'affiche). Disons 14h32.
Vous corrélez avec les pods : kubectl get pods pour voir s'il y a eu un redémarrage à ce moment-là
(regardez la colonne RESTARTS et l'âge des pods).
Vous plongez dans les logs autour de cette heure : kubectl logs <pod> --since-time='2024-01-
01T14:31:00Z' (ou --since=10m ). Vous cherchez ce qui s'est passé pile à 14h32 : une requête lourde,
une erreur base, un GC qui a gelé l'app.
Si plusieurs pods, vous regardez lequel a servi le trafic lent (les labels route / status de vos métriques
aident à cibler l'endpoint coupable).
L'idée à faire passer : la métrique vous dit quand et où ça a fait mal, les logs vous disent pourquoi. Les deux
ensemble, c'est ça le debug en prod. Une courbe sans logs, c'est une alarme sans explication.
Dans le projet de cet après-midi, vous brancherez ce duo et vous fournirez un screenshot de votre dashboard
Grafana. C'est la preuve visible que votre app est observée, pas juste lancée.
Pour aller plus loin : l'alerting
Mesurer, c'est bien. Être prévenu quand ça dérape, c'est mieux. Prometheus a un composant Alertmanager :
on définit des règles (ex : "si la latence p95 dépasse 1 seconde pendant 5 minutes, alerte"), et il envoie une
notification (Slack, email, PagerDuty).
C'est ça, le pilier Measurement complet : on mesure (Prometheus), on visualise (Grafana), et on alerte
(Alertmanager) pour réagir avant que les utilisateurs ne s'en rendent compte. On ne le configurera pas
aujourd'hui, mais sachez que ça existe : en entreprise, c'est ce qui réveille l'astreinte à 3h du matin.
On sait déployer et surveiller. Reste un dernier truc, moins technique mais tout aussi pro : écrire la doc pour
que n'importe qui puisse déployer (ou réparer) votre app, même vous dans six mois. C'est la procédure de
déploiement.
8 - Rédiger une procédure de déploiement
Scénario : il est 23h, la prod est down, et la seule personne qui sait comment déployer est en vacances, injoignable.
C'est exactement ce qu'une procédure de déploiement évite. C'est le document qui permet à n'importe qui de
l'équipe de déployer (ou de réparer) sans avoir le savoir dans la tête.
C'est aussi un livrable noté de votre projet. Alors on prend ça au sérieux.
L'essentiel
Pourquoi écrire une procédure ?
Une pipeline automatise le déploiement, oui. Mais il reste toujours des choses qu'un humain doit savoir :
comment configurer les secrets la première fois, quoi faire si la pipeline casse, comment revenir en arrière en
urgence, qui appeler. La procédure capture ce savoir.
Les raisons concrètes :
Le bus factor : si la seule personne qui sait déployer se fait renverser par un bus (d'où le nom), l'équipe
est bloquée. La procédure répartit le savoir.
L'urgence : à 3h du matin, stressé, on oublie des étapes. Une checklist écrite sauve la situation.
L'onboarding : un nouveau dev peut déployer dès le premier jour, sans déranger personne.
La reproductibilité : tout le monde déploie pareil, pas chacun sa méthode.
# règle d'alerte (extrait)
groups:
- name: todo-api-alerts
rules:
- alert: LatenceElevee
expr: http_request_duration_p95 > 1
for: 5m
annotations:
summary: "La Todo API répond lentement (p95 > 1s)"
Bus factor ? Le nombre de personnes qui peuvent disparaître avant que le projet soit bloqué. Un bus
factor de 1 = une seule personne détient le savoir critique = danger. Documenter, c'est augmenter le bus
factor.
Les points clés d'une bonne procédure
Une procédure de déploiement complète couvre :
Prérequis : ce qu'il faut avant de commencer (accès au cluster, kubeconfig, comptes, variables CI/CD
configurées).
Étapes de déploiement : la séquence exacte, dans l'ordre, sans rien supposer connu.
Vérification : comment confirmer que le déploiement a marché (l'app répond ? les métriques sont
normales ?).
Rollback : comment revenir à la version précédente si ça casse. C'est LA section qu'on oublie et qu'on
regrette.
Contacts : qui prévenir, qui peut débloquer, en cas de problème.
La section rollback est non négociable. Un déploiement qui ne sait pas revenir en arrière, c'est un
déploiement qui vous tient en otage.
Un template prêt à l'emploi
Voilà un squelette que vous pouvez reprendre tel quel pour votre projet (à adapter) :
# Procédure de déploiement - Todo API
## 1. Prérequis
- Accès au cluster K3S (fichier kubeconfig dans ~/.kube/config)
- Variables CI/CD configurées dans GitLab : DOCKERHUB_USER, DOCKERHUB_TOKEN, KUBE_CONFIG
- Branche `main` à jour et tests verts en local
## 2. Déploiement (nominal)
1. Merger la branche de feature dans `main` via merge request (après review)
2. Le merge déclenche la pipeline automatiquement
3. Suivre la pipeline : GitLab > CI/CD > Pipelines
4. Stages attendus : lint > test > build > push > deploy, tous verts
## 3. Vérification
- `kubectl get pods` : tous les pods en Running
- `kubectl rollout status deployment/todo-api` : rollout complete
- `curl http://<adresse>/health` : doit répondre {"status":"ok"}
- Dashboard Grafana : pas de pic d'erreurs
## 4. Rollback (si le déploiement casse)
- `kubectl rollout undo deployment/todo-api` : revient à la version précédente
- Vérifier à nouveau avec `kubectl get pods` et le endpoint /health
- Prévenir l'équipe sur le canal #incidents
## 5. Contacts
- Responsable déploiement : [nom] - [contact]
- Astreinte : [nom] - [contact]
Ce template coche tous les points clés. Pour votre projet, remplissez-le avec vos vraies infos (adresses, noms,
commandes spécifiques). Un correcteur (ou un futur collègue) doit pouvoir déployer rien qu'en suivant votre
doc.
Le test ultime : le rollback à 23h
Une procédure, ça ne sert à rien le jour où on l'écrit. Ça sert le jour de l'incident. Alors mettons-nous dans la
situation pour de vrai.
Il est 23h. La prod est down. Le collègue qui gère le déploiement est en vacances, téléphone éteint. Vous avez
DEPLOYMENT.md sous les yeux, ouvert à la section Rollback. Vous tapez la commande :
La commande répond deployment.apps/todo-api rolled back . Et maintenant ? Qu'est-ce que vous vérifiez
avant de souffler ?
Le déroulé, dans l'ordre, et c'est exactement ça que votre procédure doit lister :
D'abord, est-ce que le rollback est vraiment terminé : kubectl rollout status deployment/todo-api .
Tant que ça n'affiche pas successfully rolled out , ce n'est pas fini, on attend.
Ensuite, les pods : kubectl get pods . Tous en Running , et ce sont bien les nouveaux (regardez l'âge, ils
viennent de redémarrer). Pas un seul en CrashLoopBackOff .
Puis le test fonctionnel : curl http://<adresse>/health doit répondre {"status":"ok"} . Tant que le
health check ne passe pas, la prod n'est pas remontée, peu importe ce que disent les pods.
Enfin Grafana : le taux d'erreurs 5xx redescend, la latence revient à la normale. C'est la preuve côté
utilisateur, pas juste côté infra.
Et seulement là, vous prévenez l'équipe sur #incidents : "prod remontée sur la version N-1, rollback fait
à 23h05, on regarde la cause demain."
Le point clé : un rollback ne s'arrête pas à la commande. Il s'arrête quand vous avez vérifié que la prod est
revenue. Une procédure qui dit juste "tape rollout undo " sans la liste de vérifs, c'est la moitié du boulot.
Bonne vs mauvaise procédure
Le même rollback, écrit par deux personnes. Sentez la différence.
Avant (mauvaise procédure) :
Vague ("la version d'avant", c'est quoi la commande ?), suppose qu'on connaît déjà les accès, aucune
vérification, "relancer l'app" ne veut rien dire à 23h sous stress.
Après (bonne procédure) :
- Accès cluster : [qui peut donner les droits]
kubectl rollout undo deployment/todo-api
## En cas de problème
Revenir à la version d'avant. Demander les accès à quelqu'un si besoin.
Relancer l'app.
Verdict : la bonne procédure respecte les 5 points clés (prérequis, séquence exacte numérotée, vérification,
sans rien supposer connu, contacts). On peut la suivre stressé, à moitié endormi, sans réfléchir. C'est tout
l'objectif.
Les erreurs classiques
Ce qui plombe une procédure, ce n'est presque jamais la technique. C'est l'angle mort :
Supposer les credentials connus : "se connecter au cluster" sans dire où est le kubeconfig ni qui peut le
fournir. Le jour J, la personne qui exécute ne les a peut-être jamais eus.
Oublier l'ordre exact des commandes : à 3h du matin, on ne devine pas qu'il fallait rollout status
avant de tester /health . La séquence doit être numérotée, pas implicite.
Ne pas tester la procédure avant l'incident : c'est le piège mortel. Une procédure non testée ne
marche qu'en théorie. La seule façon de savoir si elle tient, c'est de la dérouler à froid, quand tout va bien,
avec quelqu'un qui ne connaît pas l'app.
À vous : écrivez votre section Rollback
Prenez 5 minutes, maintenant. Créez DEPLOYMENT.md et écrivez uniquement la section Rollback de votre
procédure (pas le reste, juste le rollback). Commandes exactes, vérifications, contact. On partage dans 5 min et
on compare : qui a pensé au rollout status ? Qui a oublié le health check ?
Pour les curieux : le runbook et le post-mortem
Deux documents cousins, courants en entreprise, qui complètent la procédure :
Le runbook : un recueil de procédures pour les incidents fréquents. "L'app ne répond plus → vérifier X,
redémarrer Y". C'est le manuel de l'astreinte.
Le post-mortem : après un incident, on écrit ce qui s'est passé, pourquoi, et comment l'éviter. Sans
chercher de coupable (culture "blameless") : on cherche à corriger le système, pas à punir une personne.
Post-mortem blameless ? Une analyse d'incident qui se concentre sur les causes systémiques, jamais
sur la faute d'un individu. L'idée : si une personne a pu casser la prod, c'est que le système le permettait.
On corrige le système. C'est un marqueur de maturité DevOps.
Ces documents ne sont pas demandés pour le projet, mais les connaître, c'est parler le langage des équipes
ops. Ça fait la différence en entretien.
On a tout vu : la théorie CI/CD, les pipelines GitLab, le déploiement Kubernetes, le monitoring, et la doc. Place à
la pratique. Cet après-midi, vous construisez tout ça vous-mêmes, en groupe, sur la Todo API. Let's go. 🔥
## 4. Rollback
Prérequis : kubeconfig dans ~/.kube/config (sinon : demander à [contact]).
1. kubectl rollout undo deployment/todo-api
2. kubectl rollout status deployment/todo-api → attendre "successfully rolled out"
3. kubectl get pods → tous Running
4. curl http://<adresse>/health → {"status":"ok"}
5. Prévenir #incidents
Critère Poids
Pipeline verte de bout en bout (test → build → push → deploy) 50%
Gestion propre des secrets (variables masquées, rien en clair) 15%
Procédure DEPLOYMENT.md avec rollback 20%
Monitoring + tableau de métriques agrégées 10%
Commits atomiques par membre du groupe 5%
Phase Profil avancé Profil médian
0 - Setup 10 min 10 min
1 - Première pipeline verte 15 min 20 min
2 - Tests avec service PostgreSQL 30 min 35 min
9 - Après-midi : Projet de groupe "Le Pipeline qui tourne en
prod"
Le projet
Vous reprenez la Todo API dockerisée de J1, et en groupe, vous construisez la pipeline CI/CD complète autour
d'elle. À la fin, un git push sur main doit : lancer les tests (avec et sans base PostgreSQL), builder l'image, la
pousser sur DockerHub avec des secrets gérés proprement, et déployer sur votre cluster K3S local. En bonus,
l'app expose ses métriques et vous les visualisez dans Grafana.
Le livrable : un repo GitLab avec une pipeline verte de bout en bout, plus une procédure de déploiement
rédigée. La démo finale : vous poussez un commit en live, et toute la salle voit la pipeline s'enchaîner jusqu'au
déploiement K3S. 💥
La correction automatique passe par le script eval/grade_group.sh (fourni par l'instructeur) : il vérifie la
présence et la validité de votre .gitlab-ci.yml , des manifestes Kubernetes, des tests, de la gestion des
secrets, et de la procédure de déploiement. Calez votre structure de repo sur ces attendus.
Le barème (vous le voyez, donc vous savez où mettre l'effort) :
La correction s'appuie sur eval/grade_group.sh (la partie auto : config CI, statut pipeline, image DockerHub,
manifestes K8s, README) complété par la démo live (l'app qui tourne vraiment sur K3S, le dashboard Grafana
affiché). Le gros du score, c'est la pipeline qui va au bout. Le reste se gagne sur la rigueur : secrets propres,
procédure de rollback testée, métriques agrégées.
Organisation
Groupes obligatoires. Un repo GitLab par groupe.
README avec le nom de chaque membre.
Commits de chaque membre obligatoires : pas de commit = pas de trace = pas de note.
Estimation de charge (pour situer l'effort, pas un quota) :
Phase Profil avancé Profil médian
3 - Build + push DockerHub (secrets) 30 min 35 min
4 - Déploiement K3S 40 min 50 min
5 - Monitoring + agrégation métriques 35 min (entamée)
6 - Optimisation (ouverte) 60 min minimum (non atteinte)
Sous-total cœur (0-3) ~85 min ~100 min
Total (0-6) ~220 min (ne va pas au bout)
Le squelette de chaque phase 0-3 est largement pré-fourni dans le texte ci-dessous (structure de repo,
README de démarrage, jobs CI quasi complets) : c'est ce qui permet au profil médian de boucler les phases 0 à
3 (la moitié qui compte, ~100 min) sans se noyer, puis d'entamer la phase 4. Le profil avancé, lui, va plus vite
sur 0-3 et creuse 4 à 6, avec une phase 6 sans plafond (60 min minimum, mais on peut y passer tout le reste de
l'après-midi). Personne ne plafonne, personne ne s'ennuie.
Phase 0 - Setup et structure
Avant de coder : vérifiez que chaque membre a un compte GitLab.com et DockerHub. Créez le repo de
groupe, ajoutez tout le monde en membre, mettez le README avec vos noms.
Récupérez la Todo API de J1 dans le repo. Voilà la structure exacte à reproduire, ne réinventez rien, calez-vous
dessus (c'est aussi ce que grade_group.sh cherche) :
Pour gagner du temps, voilà le README.md de démarrage à copier-coller tel quel et compléter (juste les noms
et le pseudo DockerHub) :
todo-api/
├── src/ # le code Express
├── tests/ # tests unitaires + intégration
├── k8s/ # vos manifestes Kubernetes
│ ├── deployment.yaml
│ └── service.yaml
├── Dockerfile
├── .gitlab-ci.yml
├── DEPLOYMENT.md # la procédure de déploiement
└── package.json
# Todo API - Pipeline CI/CD (projet groupe)
## Membres
- Prénom Nom (@pseudo-gitlab)
- ...
## Image DockerHub
`<pseudo-dockerhub>/todo-api`
## Déploiement
Installez K3S sur au moins une machine du groupe ( curl -sfL https://get.k3s.io | sh - ), et vérifiez
avec kubectl get nodes .
On vérifie quoi : le repo existe, le README liste les membres, kubectl get nodes renvoie un nœud Ready .
Cas qui doit échouer proprement : si un membre n'a pas accès au repo, il ne peut pas commit (testez : chaque
membre fait un commit de setup). Pas de commit d'un membre = problème à régler maintenant, pas en fin de
projet.
Scénario adverse : K3S refuse de s'installer (le curl | sh échoue, ou le service ne démarre pas et kubectl
get nodes reste muet). On lit les logs avec journalctl -u k3s -e . Cause fréquente : le port 6443 déjà pris
par un autre process. Pour voir l'erreur en live, on coupe le service et on relance le serveur à la main : sudo
systemctl stop k3s && sudo k3s server (l'erreur s'affiche directement dans le terminal).
Phase 1 - La première pipeline verte
Rappel notation : commitez après chaque job qui passe au vert. Un commit = un job qui marche. Staging par
fichier ( git add .gitlab-ci.yml ), jamais git add . .
Écrivez un .gitlab-ci.yml minimal avec un stage test qui lance vos tests unitaires (les tests sans base, type
multiply ). Objectif : voir la pipeline passer au vert dans GitLab > CI/CD > Pipelines.
Le squelette est quasi complet, il ne reste qu'à déclarer les stages que vous utiliserez sur tout le projet (vous en
aurez besoin dès la phase 2) :
Checkpoint qualité (testez les trois) :
Happy path : un test qui passe → pipeline verte.
Edge case : un test qui échoue volontairement → la pipeline doit devenir rouge (vérifiez que l'échec
bloque bien). Puis corrigez.
Scénario adverse : une faute d'indentation dans le YAML → GitLab refuse le fichier ("Invalid CI config").
Apprenez à lire l'erreur, puis corrigez.
Voir DEPLOYMENT.md
## Dashboard Grafana
<!-- coller le screenshot ici en phase 5 -->
# .gitlab-ci.yml
stages:
# TODO : lister les stages du projet, dans l'ordre (test, build, deploy)
test-unit:
image: node:18-alpine
stage: test
script:
- npm ci
- npm test
Phase 2 - Tests avec une vraie base PostgreSQL
Avant de lancer : cette phase introduit le services: de GitLab-CI. Nouvelle notion par rapport à la phase 1 :
un conteneur PostgreSQL démarré à côté du job, pour tester les routes qui touchent la base.
Ajoutez un job test-integration qui lance un service postgres:16 et configure les variables de connexion.
Vos tests d'intégration doivent créer une tâche en base, la lire, et vérifier.
Le squelette est presque entier : il ne vous reste qu'à remplir les variables DB_* (celles que votre app lit pour
se connecter) en les faisant pointer vers le service postgres . Souvenez-vous qu'en GitLab-CI, le service est
joignable par son nom d'image ( postgres ), pas par localhost .
Trois cas à couvrir :
Happy path : POST /tasks crée une tâche, GET /tasks la retrouve → test vert.
Edge case : GET /tasks/:id avec un id qui n'existe pas → l'app doit répondre 404, pas crasher.
Scénario adverse : POST /tasks avec un body vide ou malformé ( {} ) → l'app doit répondre 400, et le
test le vérifie. Une app qui crash sur un body vide, c'est une faille.
Phase 3 - Build et push sur DockerHub avec secrets
Rappel sécurité : aucun mot de passe en clair dans le repo. Cette phase introduit Docker-in-Docker et les
variables CI/CD masquées, deux notions neuves.
Générez un token DockerHub (Account Settings > Security). Ajoutez DOCKERHUB_USER et DOCKERHUB_TOKEN
dans GitLab (Settings > CI/CD > Variables, cochez Masked). Écrivez le job build-and-push .
Toute la plomberie Docker-in-Docker (image docker:24 , service dind , variable DOCKER_TLS_CERTDIR ) est
déjà donnée. Ce qui reste à vous, c'est les trois commandes Docker du script : login (avec --passwordstdin , jamais -p en clair), build avec deux tags, push.
test-integration:
image: node:18-alpine
stage: test
services:
- postgres:16
variables:
POSTGRES_DB: todo_test
POSTGRES_USER: todo_user
POSTGRES_PASSWORD: todo_pass
# TODO : DB_HOST (= le nom du service postgres), DB_PORT, DB_NAME, DB_USER,
DB_PASSWORD
# → ils doivent correspondre aux POSTGRES_* ci-dessus
script:
- npm ci
- npm run test:integration # adaptez au nom de votre script de tests d'intégration
Docker-in-Docker (dind) ? Un conteneur qui fait tourner son propre démon Docker, pour pouvoir
builder une image à l'intérieur d'un job CI (qui est déjà un conteneur). Le service docker:24-dind fournit
ce démon, l'image docker:24 fournit le client qui lui parle. Doc : GitLab - Use Docker to build Docker
images.
Vérifiez ces situations :
Happy path : la pipeline push l'image, vous la voyez apparaître sur votre DockerHub.
Edge case : poussez depuis une branche feature/xxx → le job build-and-push ne doit pas tourner
(grâce au rules: ). Vérifiez qu'il est bien sauté.
Scénario adverse : mettez volontairement un mauvais token, observez le job échouer sur le docker
login . Puis vérifiez dans les logs que le token n'apparaît jamais en clair (il doit être [MASKED] ). Si vous le
voyez en clair, votre variable n'est pas masquée : corrigez.
Phase 4 - Déploiement sur K3S
Phase clé : le cœur du fil rouge. Nouvelle notion : les manifestes Kubernetes et le déploiement depuis la
pipeline. C'est ici que l'app arrive vraiment "en prod".
Écrivez vos manifestes k8s/deployment.yaml (avec replicas: 2 minimum) et k8s/service.yaml .
Déployez d'abord à la main ( kubectl apply -f k8s/ ), vérifiez que les pods tournent et que l'app répond.
Puis ajoutez le job deploy-k3s qui met à jour l'image via kubectl set image .
build-and-push:
stage: build
image: docker:24
services:
- docker:24-dind
variables:
DOCKER_TLS_CERTDIR: "/certs" # active TLS entre le client docker et le démon dind
script:
# TODO : docker login -u "$DOCKERHUB_USER" --password-stdin (le token vient de stdin,
jamais en clair)
# TODO : docker build -t $DOCKERHUB_USER/todo-api:$CI_COMMIT_SHORT_SHA -t
$DOCKERHUB_USER/todo-api:latest .
# TODO : docker push des deux tags
rules:
- if: '$CI_COMMIT_BRANCH == "main"' # ne push que sur main
deploy-k3s:
stage: deploy
image: bitnami/kubectl:latest
before_script:
# TODO : charger le kubeconfig depuis la variable KUBE_CONFIG
script:
# TODO : kubectl set image deployment/todo-api ... avec le tag du commit
# TODO : kubectl rollout status pour attendre la fin du déploiement
rules:
- if: '$CI_COMMIT_BRANCH == "main"'
Métrique Valeur mesurée
Durée totale de la pipeline (lint→deploy) ?
Taille de l'image Docker (avant/après optimisation) ?
Temps du rolling update (rollout status) ?
Nombre de pods en charge ?
Latence p95 de l'API (depuis Grafana) ?
Ce qui doit casser (et bien réagir) :
Happy path : un push sur main déclenche le rolling update, kubectl get pods montre les nouveaux
pods en Running.
Edge case : mettez une image qui n'existe pas ( todo-api:nexistepas ) → le pod passe en
ImagePullBackOff . Diagnostiquez avec kubectl describe pod , puis corrigez. L'ancienne version doit
continuer de tourner (le rolling update ne bascule pas sur des pods cassés).
Scénario adverse : tuez un pod à la main ( kubectl delete pod xxx ) pendant que l'app sert du trafic →
Kubernetes en recrée un, l'app ne tombe pas. Vérifiez avec kubectl get pods que le compte est
maintenu.
Phase 5 - Monitoring et agrégation des métriques
Rappel rendu : cette phase produit une preuve visible. Nouvelle notion : exposer et collecter des métriques.
Ajoutez l'endpoint /metrics à votre app (via prom-client ). Branchez Prometheus pour scraper votre
Service, et Grafana pour afficher un dashboard.
Puis agrégez les métriques de votre projet dans un tableau récapitulatif (dans le README ou un fichier
METRICS.md ). Pas juste un console.log par-ci par-là : une vue d'ensemble.
À fournir :
Happy path : un screenshot du dashboard Grafana montrant http_requests_total qui monte quand
vous tapez l'API.
Edge case : générez des requêtes en erreur (appelez une route inexistante en boucle) → le taux d'erreurs
doit apparaître dans le dashboard.
Scénario adverse : coupez un pod et observez l'impact sur les métriques (latence, requêtes échouées)
pendant que Kubernetes le remplace. Documentez ce que vous voyez.
Phase 6 - Optimisation (phase ouverte)
Cette phase n'a pas de "fini". C'est de l'amélioration continue, et c'est là que les groupes les plus rapides
creusent. Choisissez un ou plusieurs axes et mesurez le gain (chiffres avant/après obligatoires) :
Vitesse de pipeline : optimisez le cache des dépendances, parallélisez des jobs, utilisez une image plus
légère. Mesurez la durée avant/après. Qui a la pipeline la plus rapide de la salle ?
Taille d'image : appliquez le multi-stage build de J2, comparez la taille avant/après. Visez sous 150 Mo.
Robustesse du déploiement : ajoutez des readinessProbe et livenessProbe à vos pods (Kubernetes
ne route le trafic que vers les pods vraiment prêts, et redémarre ceux qui ne répondent plus). Testez en
cassant volontairement l'app.
Déploiement manuel en "prod" : ajoutez un job deploy-prod en when: manual (un bouton play), pour
simuler la séparation staging/prod vue en section 3.
DevSecOps : ajoutez un job npm audit qui échoue si une dépendance a une faille critique. Premier pas
vers le shift-left security de la section 2.
readinessProbe / livenessProbe ? Deux sondes Kubernetes. La readiness dit "ce pod est-il prêt à
recevoir du trafic ?" (sinon le Service ne lui en envoie pas). La liveness dit "ce pod est-il toujours vivant ?"
(sinon Kubernetes le redémarre). Doc : Kubernetes - Probes.
Il n'y a pas de plafond ici : une pipeline est toujours optimisable, un déploiement toujours plus robuste. Notez
vos gains chiffrés, c'est ça qui compte.
Recapitulatif Jour 3
Énorme journée. Vous êtes partis d'une app qu'on déployait à la main, et vous repartez avec une pipeline qui
fait tout toute seule, jusqu'à Kubernetes. C'est exactement ce qu'on attend d'un profil DevOps junior en
entreprise. Bravo. 🔥
Ce qu'on a appris aujourd'hui
1. DevOps & CI/CD : les définitions (CI = intégration continue, CD = livraison/déploiement continu), les 3
piliers (Culture, Automation, Measurement), l'histoire des outils (Jenkins → Travis → GitLab/GitHub), et
l'ouverture DevSecOps.
2. Anatomie d'une pipeline : les stages (lint → test → build → push → deploy), les environnements
(dev/staging/prod), les branches Git, et le "fail fast".
3. La CI au choix : GitHub Actions (workflows verbatim) ET GitLab-CI (le requis du projet). Même principe,
deux syntaxes. Première pipeline verte sur ClickFast.
4. Les jobs qui comptent : tests avec et sans base PostgreSQL ( services: ), cache des dépendances, build
+ push DockerHub avec secrets masqués, déploiement SSH.
5. Kubernetes / K3S : le chef d'orchestre, les 4 objets (pod, deployment, service, namespace), l'installation
K3S, le manifeste décortiqué, le scaling, le rolling update, le dépannage ( kubectl get/describe/logs ).
6. Monitoring : Prometheus collecte, Grafana affiche, l'endpoint /metrics .
7. Procédure de déploiement : prérequis, étapes, vérification, rollback, contacts.
Points d'attention pour le projet
Finir la pipeline : si votre groupe n'a pas bouclé les phases 0-4, c'est la priorité absolue. Le cœur noté,
c'est la pipeline verte de bout en bout.
Commiter régulièrement et par membre : pas de commit = pas de trace = pas de note. Chaque
membre doit avoir des commits visibles.
Soigner la gestion des secrets : aucun mot de passe en clair, variables masquées dans GitLab. C'est un
point de notation et un réflexe pro.
La procédure de déploiement ( DEPLOYMENT.md ) : c'est un livrable noté à part entière. La section rollback
n'est pas optionnelle.
Préparer la démo : vous devrez pousser un commit en live et montrer la pipeline qui s'enchaîne jusqu'à
K3S. Testez-la avant.