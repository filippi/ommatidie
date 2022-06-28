# Omatidie - Challenge Dataviz 2021 - L'Observateur Observé, Immobilier mais Mobile, suivant le point de vue.

> Valeurs immobilières sur zones en Corse depuis 2017
> Base de données DVF depuis OpenData.corsica

## L'idée
La plateforme présente les valeur immobilières issues de la base DVF (Demandes de valeurs foncières). L'idée ici est de proposer un autre regard, mobile, sur l'immobilier, prendre de la hauteur pour constater répartition des richesses et comparer les régions. 
L'interactivité proposée se veut à la fois intuitive, amusante et espère susciter l'étonnement, c’est donc à la fois un peu « artistique », un peu « technique » et un peu « géomatique/cartographique ».
Un bonhomme apparait, c’est vous, devant le miroir de votre écran, après avoir pris conscience que ce mime vous singe, vous pouvez prendre le contrôle de votre dataviz, plus interactive que jamais.
Cet avatar va alors vous permettre de choisir des zones avec les mains, et de changer de point de vue en regardant votre écran plus près, plus à gauche, plus bas… en changeant de point de vue.
L'ensemble des transactions est elle évaluée en quantité de paquebots tout neufs qui auraient pu être achetés.
Ce mime singe avatar n’est autre que vous, l’observateur humain, désormais projeté au milieu de la donnée. Imaginez maintenant que finalement, c’est lui qui vous regarde, tout comme ces valeurs immobilières vous commandent, que vous subissez.

## Utilisation
Cloner le dépôt et ouvrir index.html avec Google Chrome. Marche préférablement avec un ordinateur équipé de webcam située juste au-dessus de l'écran.

## Technos
>Mapbox.gl -> Fond de carte 3D
>Deck.gl -> Surcouche à Mapbox pour des sources supplémentaires
>Tensorflow.js -> Pour activer des réseaux 
>Bodypix -> Réseau pré-entrainé de détection d'articulations par webcam

Bodypix permet de trouver la position des articulations, en posant l'hypothèse d'une distance standard entre les yeux on retrouve la distance à l'écran, la position de la tête servant à aluster la perspective, celle des mains, le changement de zones. 

## La ou on a pompé les morceaux de code
Merci à vous :
>https://facetouchmonitor.com
>https://sites-formations.univ-rennes2.fr/mastersigat/WebMaps/DeckGL_DVF.html
 
## L'équipe
> **Roberta Baggio**, Oletta, Chercheur(e) de Padoue, il suffit de la prier de trouver, aidée par son Saint-Panda Antoine
> **Damien Grandi**, voit loin mais mieux de près, intègre mieux que Runge-Kutta
> **Jean-Baptiste Filippi**, voit près mais mieux de loin, décadrage d'équipe, sans limites pas de trépas

## fichiers
>omatidie.py : téléchargement depuis opendata.corsica et formatage des données
>mapprice.js: affichage de carte
>detect.js : détection des mouvement et passages d'évènements UI
