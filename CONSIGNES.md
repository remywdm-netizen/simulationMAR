# Consignes — organisation des MAR au bloc, en réanimation et en garde

Règles appliquées par le moteur (`bloc-mar-engine.js`). Les valeurs entre parenthèses sont les valeurs par défaut,
modifiables dans l'onglet **⚙️ Règles** de la page.

## Bloc opératoire
- **1 MAR pour 2 salles** ; si le nombre de salles d'un bloc est impair, la dernière salle a son propre MAR.
  La règle s'applique par étage (un MAR ne supervise pas deux étages).
- 15 salles avec MAR → **8 postes par jour ouvré** :

| Poste | Bloc | Salles | Horaires |
|---|---|---|---|
| A | court (4ᵉ) | Endo 6 + Endo 5 | lun-mar 8h-16h ; mer-ven 8h-13h (Endo Pneumo sans MAR l'après-midi) |
| B | court | Endo Inter 2 + Scanner 8 Inter | 8h-16h |
| C | court | Cardio 9 Rythmo + Cardio/Chir 10 | 8h30-16h30 |
| D | court | Chir 3 + Chir 4 | 8h-16h30 |
| E | court | Chir 1 + Chir 7 | 8h-16h30 |
| F | long (3ᵉ) | Ch 11 Robot + Ch 12 Robot | 8h-18h |
| G | long | Ch 13 + Ch 14 (Risque 4) | 8h-18h |
| H | long | Ch 15 seule (5 salles : nombre impair) | 8h-18h |

- Au plus 3 jours de bloc par semaine et par MAR ; 2 jours consécutifs sur le même poste privilégiés ;
  postes répartis équitablement.
- SSPI et relais repas : postes IDE, sous la responsabilité des MAR du bloc.

## Réanimation
- **3 MAR par jour ouvré, 8h-16h**, par **semaines entières** (lundi-vendredi).
- Une semaine de réa n'est jamais coupée par un repos de sécurité ni un jour de temps partiel : garde possible le vendredi seulement.
- **Réa 1** : poste tenu par un **groupe dédié de 5 MAR**, en rotation par semaines entières (≈ 10 semaines par an
  chacun), **sans absence** pendant la semaine (ni repos, ni temps partiel, ni congés). Ils ne prennent pas les
  autres postes de réa et font moins de bloc : la charge bloc + réa est équilibrée entre tous les MAR.
- Les 2 autres postes de réa sont répartis entre les autres MAR, au prorata de la quotité.
- Week-ends et fériés : réa couverte par les MAR de garde.

## Maternité (option)
- Possibilité de **détacher un MAR à la maternité en journée** (8h-16h par défaut), les jours choisis.
- Ce jour-là, il n'est ni au bloc ni en réa ; il peut prendre la garde à 16h.
- Répartition au prorata de la quotité entre les MAR désignés (case « Maternité » de l'équipe).
- Option désactivée par défaut ; activée du lundi au vendredi avec 1 MAR : 251 journées par an,
  environ 12 par temps plein, et 1 MAR de moins disponible chaque jour pour les consultations.

## Gardes
- **2 MAR de garde par jour**, répartis au prorata de la **quotité de garde**.
- En semaine : garde **de 16h à 8h** après la journée (16 h). Le MAR de garde n'est jamais au bloc long (fin 18h).
- Week-end et fériés : garde de 24 h, répartie entre les MAR éligibles au prorata.
- **Repos de sécurité** le lendemain de chaque garde, pour les 2 MAR.
- Au moins 5 jours entre deux gardes d'un même MAR.
- Quotité de garde 0 : pas de garde. « Pas de garde de WE » : gardes de semaine uniquement.
- **Demi-garde de WE** : le MAR concerné assure le jour (8h-20h) le samedi **et** le dimanche d'un même
  week-end ; l'un des deux MAR de garde ne fait alors que la nuit (20h-8h, avec repos le lendemain).
  Nombre de week-ends : automatique (autant de journées de week-end qu'un temps plein en garde) ou fixé.

## Temps partiel, congés, récupérations
- Jours de **temps partiel** = (1 − quotité) × jours ouvrés, posés hors réa, garde et repos.
- **Congés 32 jours**, **formation 10 jours**, **pas de RTT** — par ETP, proratisés à la quotité,
  posés sur des jours hors bloc.
- **Récupération** : 1 jour par **samedi de garde**, **½ jour par demi-garde** du samedi (jour 8h-20h ou nuit seule) ; **1 jour pour 4 jours finis à 18h** (bloc long).
- Option « récupération posée dans la semaine de bloc » : ce jour est placé dans le tableau dès que les 4 jours
  sont atteints (premier jour libre hors garde, dans la même semaine si possible) ; un collègue couvre le poste.
  Moyennes inchangées, mais semaines de bloc long allégées (≈ 46 h au lieu de 51 h gardes comprises).

## Temps de travail
- Garde sur place comptée en temps de travail effectif.
- h/sem = heures de l'année ÷ semaines de présence (hors congés, récupérations et jours de temps partiel).
- Effectif pour 48 h (temps plein, gardes comprises, charge actuelle répartie) : environ **21,5 ETP** avec les règles par défaut.
- Repère : **48 h par semaine en moyenne**, gardes comprises (directive 2003/88/CE — à vérifier avec la
  réglementation applicable).

## Consultations
- **25 consultations par MAR** et par jour (journée de 7 h), **13 000 par an** → 520 journées de MAR.
- **Mercredi : 1 seul MAR en consultation**, pour libérer un MAR de plus ce jour-là (absences, récupérations).
- Autres jours : **2 MAR**, et un **3ᵉ MAR** juste le nombre de jours nécessaire pour atteindre le volume
  (68 jours en 2027), répartis régulièrement.
- Réparti au prorata de la quotité entre les MAR qui consultent ; le MAR de consultation peut prendre la garde à 16h.

## Récupération (objectif)
- Objectif de l'organisation : **libérer le plus de jours de récupération possible**.
- Jours libérables = jours sans poste restant libres après congés, formation et récupérations, moins une **réserve de
  0,5 MAR par jour** pour les imprévus ; répartis au prorata de la quotité.
- Organisation par défaut : ≈ 24 jours de récupération par temps plein et par an (13,7 réglementaires + 10 libérables).
- Leviers comparés automatiquement dans l'onglet Simulations (consultations, réa, postes de bloc, gardes, maternité, effectif).

## Part financière
- **Chiffre d'affaires 1 200 000 €**, réparti en **15 parts égales** : 80 000 € la part.
- Parts de chaque MAR : saisies dans l'équipe ; à défaut, au prorata de la quotité de travail.
- Revenu d'un MAR = parts × valeur de la part ; revenu horaire = revenu ÷ heures de l'année, gardes comprises.
- CA et nombre de parts modifiables (onglet Règles) ; grille CA × nombre de parts dans l'onglet Simulations.

## Jours fériés 2027 (Monaco)
1ᵉʳ janvier, 27 janvier (Sainte-Dévote), 29 mars (lundi de Pâques), 1ᵉʳ mai, 6 mai (Ascension),
17 mai (lundi de Pentecôte), 27 mai (Fête-Dieu), 15 et 16 août (Assomption, reportée), 1ᵉʳ novembre,
19 novembre (Fête du Prince), 8 décembre, 25 décembre. Bloc, réa de jour et consultations fermés ;
gardes assurées.
