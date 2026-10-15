# Simulation MAR — bloc, réanimation, gardes

Organisation des médecins anesthésistes-réanimateurs (MAR) à partir du programme des salles 2027 :
tableau de service annuel, compteurs par MAR, temps de travail avec et sans garde, et **simulations**
(équipe, quotités, règles de garde, effectif).

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
- **👨‍⚕️ Équipe** : importer le fichier Excel de l'équipe (A = médecin, B = temps de travail, E = quotité de garde,
  F = particularité : « pas de garde de WE », « demi-garde de WE »), ou modifier les lignes à la main.
  L'équipe reste dans le navigateur (localStorage) ; le dépôt ne contient qu'une équipe anonymisée (MAR 01…).
- **⚙️ Règles** : gardes par jour, horaires, réa, congés, formation, récupérations, plafond, postes, fériés.
- **📅 Tableau de service** : par mois, par poste ou par MAR.
- **🧪 Simulations** : enregistrer des scénarios et les comparer ; tableau rapide selon le nombre d'ETP.
- **⬇ Excel** : synthèse, compteurs, tableau de service, vue par MAR et scénarios.
- **⬇ Configuration / ⬆ Importer config** : partager équipe et règles entre postes (fichier JSON).

## Moteur
```js
const E = require('./bloc-mar-engine.js');
const r = E.generate(config);   // config facultative : E.DEFAULT_CONFIG par défaut
E.verify(r);                    // [] si toutes les règles dures sont respectées
r.stats.synthese; r.stats.parMar;
E.simulateETP(r, [18, 20, 22, 24]);
```
