# ScoreX — prototype avec données sportives

Prototype PWA de ScoreX : scores sportifs, matchs en direct, pronostics à points, classements et profil.

## Données en direct
Le prototype tente maintenant de récupérer les matchs depuis **SportScore** pour Football, Basket, Tennis et Cricket. Leur documentation indique une API REST JSON, CORS ouverte et sans clé API pour leur niveau open-source, avec un endpoint de matchs live/récents. Les autres sports restent en mode démonstration jusqu'à l'ajout d'un fournisseur multisports adapté.

Source : https://sportscore.com/developers/

## Lancer
Ouvrir `index.html` dans un navigateur ou publier le dossier sur GitHub Pages.

## Prochaine étape
Pour couvrir réellement tous les sports (F1, MMA, boxe, hockey, volley, handball, baseball, golf, cyclisme, eSports, etc.), remplacer/compléter `api.js` avec un fournisseur multisports couvrant ces disciplines et déplacer la clé API côté serveur si elle est requise.
