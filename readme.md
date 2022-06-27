# Omatidie - Challenge Dataviz 2021 - L'Observateur Observé, Immobilier mais Mobile, suivant le point de vue.

> Valeurs immobilières dans des zones en Corse entre 2017 et 2021



## L'idée

| Variable | Format | Définition | Exemple |
| :-- | :--: | :-- | --: |
| date | année-mois-jour | Date du comptage | 2018-01-01 |
| dpt_09 | entier | Nuitées dans le 09 | 36427 |
| dpt_11 | entier | Nuitées dans le 11 | 120186 |
| dpt_xx | entier | Nuitées dans le xx | 567 |

**Attention** : pour les 2018-12-03 et le 2018-08-29, le nombre de nuitées est égal à zéro à cause d’un problème de récupération de données pour ces jours-là.

Le fichier compléments.xlsx contient des informations supplémentaires : codage des départements, codage des pays et liste des évenements.

## Technos

| Variable | Format | Définition | Exemple | 
| :-- | :--: | :-- | --: |
| date | année-mois-jour | Date du comptage | 2018-01-01 |
| org | caractères | Département ou pays d’origine des touristes. **Attention** : certains pays peuvent être regroupés. | 01 ou DK+SE+NO |
| dest | caractères | Département de destination en Occitanie. **Attention** : doit être importé en caractères sinon le département 09 est importé comme 9 | 09 |
| volume | entier | Nuitées dans le département de destination | 459 |
| vacances_org | entier | Statut des vacances du département d’origine. 0: pas en vacances, 1: en vacances, 2: non renseigné | 1 |
| T_midi | entier |  Température °C à midi (solaire) dans la préfecture du département | 25 |
| meteo | entier | Statut qualificatif de la météo du département de destination : 0: météo très défavorable, 1: météo défavorable, 2: météo correcte, 3: météo favorable, 4: météo idéale | 0 |
| nb_evt | entier| Nombre d’événements majeurs dans le département de destination | 2 |


## La ou on a pompé le code

| Variable | Format | Définition | Exemple |
| :-- | :--: | :-- | --: |
| dpt | caractère| Département de destination en Occitanie. **Attention** : doit être importé en caractères sinon le département 09 est importé comme 9 | 09 |
| nom_dpt | caractère | Nom du département| Ariège|
| pop_dpt | entier| Population du département| 1376737 |
| Hbgt_collectif | entier | Places (personnes) en hébergement collectif (par jour) | 16248|
| Hbgt_locatif | entier| Places (personnes) en hébergement locatif (par jour) | 10569 |
| Hbgt_plein_air |entier| Places (personnes) en hébergement de plein air (par jour) | 11284 |
| Hbgt_hotel | entier | Places (personnes) en hébergement hôtelier (par jour) | 10231 |
| Hbgt_total | entier | Places (personnes) total (par jour) | 48332 |

**Attention**:  le nombre de places en hébergement collectif est nul pour le Tarn et Garonne par absence de données.

# L'équipe

Roberta Baggio, Oletta, Chercheur et gère le Panda
Damien Grandi, fait du Code
Jean-Baptiste Filippi, 
