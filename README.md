# Simulation MAR — bloc, réanimation, gardes

Organisation des médecins anesthésistes-réanimateurs (MAR) à partir du programme des salles 2027 :
tableau de service annuel, compteurs par MAR, temps de travail avec et sans garde, consultations, part financière, et **simulations**
(équipe, quotités, règles de garde, effectif, chiffre d'affaires et nombre de parts).

Ouvrir `index.html` dans un navigateur (ou via GitHub Pages). Code d'accès : **C2026** (simple barrière
côté navigateur : ne pas mettre de données sensibles dans le dépôt).

| Fichier | Rôle |
|---|---|
| `index.html` | Page : synthèse, équipe, règles, tableau de service, simulations, consignes, export Excel |
| `bloc-mar-engine.js` | Moteur : génération du tableau de service, contrôle des règles, compteurs, heures, simulation par ETP |
| `CONSIGNES.md` | Règles appliquées |
| `lib/xlsx.full.min.js` | SheetJS 0.18.5 (licence Apache-2.0), import et export Excel sans CDN |
| `tests/engine.test.js` | Vérification automatique des règles (`node --test tests/*.test.js`) |

## Utilisation
4 onglets :
- **📊 Synthèse** : indicateurs clés et alertes, synthèse imprimable de toute l'organisation, récapitulatif du groupe Réa 1,
  consignes (règles appliquées, à déplier).
- **⚙️ Équipe et règles** : importer le fichier Excel de l'équipe (A = médecin, B = temps de travail, E = quotité de garde,
  F = particularité : « pas de garde de WE », « demi-garde de WE », « réa 1 », jours fixes « lundi mardi mercredi »), ou modifier les lignes à la main.
  L'équipe reste dans le navigateur (localStorage) ; le dépôt ne contient qu'une équipe anonymisée (MAR 01…).
  Règles : gardes, réa, maternité, congés, formation, récupérations, plafond, consultations, postes de bloc, fériés.
- **📅 Tableau de service** : par mois, par poste ou par MAR ; MAR par jour de la semaine ; compteurs et temps de travail par MAR.
- **📈 Projection** : évolution année par année (jusqu'en 2050) à effectif constant à partir des années de naissance
  (colonne « Naissance » de l'équipe, colonne G du fichier Excel, ou collées « code année ») : retraite à 65, 66 ou 67 ans
  avec remplacement, fin des gardes à 60 ans (ou gardes continuées, en partie ou en totalité), ajouts / retraits ; rotation des gardes de Noël et du Nouvel An ; graphiques des gardes
  par temps plein, de l'effectif et du temps de travail des moins de 60 ans et des 60 ans et plus, sans ou avec demi-gardes de
  week-end pour les 60 ans et plus.
  Les années de naissance restent dans le navigateur (le dépôt n'en contient aucune).
- **🧪 Simulations et finance** : scénarios comparés, leviers pour libérer des jours de récupération, effectif selon le nombre d'ETP ;
  chiffre d'affaires, parts et revenus par MAR, €/h, grille CA × nombre de parts.
- **⬇ Excel** : synthèse, compteurs, tableau de service, vue par MAR et scénarios.
- **⬇ Configuration / ⬆ Importer config** : partager équipe et règles entre postes (fichier JSON).

## Moteur
```js
const E = require('./bloc-mar-engine.js');
const r = E.generate(config);   // config facultative : E.DEFAULT_CONFIG par défaut
E.verify(r);                    // [] si toutes les règles dures sont respectées
r.stats.synthese; r.stats.parMar;
E.simulateETP(r, [18, 20, 22, 24]);
E.simulateFinance([1200000, 1300000], [14, 15, 16], 2000);   // valeur de la part, €/h
```
