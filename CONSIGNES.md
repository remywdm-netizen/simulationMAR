# Consignes — organisation des MAR au bloc, en réanimation et en garde

Règles appliquées par le moteur (`bloc-mar-engine.js`). Les valeurs entre parenthèses sont les valeurs par défaut,
modifiables dans l'onglet **⚙️ Règles** de la page.

## Bloc opératoire
- **1 MAR pour 2 salles** ; si le nombre de salles d'un bloc est impair, la dernière salle a son propre MAR.
- Option **1 MAR par salle** sur les salles de 8h (postes A à E, hors bloc long) : onglet Équipe et règles, colonne « 1 MAR / salle » ; le poste est dédoublé (B → B1, B2).
  La règle s'applique par étage (un MAR ne supervise pas deux étages).
- 15 salles avec MAR → **8 postes par jour ouvré** :

| Poste | Bloc | Salles | Horaires |
|---|---|---|---|
| A | court (4ᵉ) | Endo 6 + Endo 5 | lun-mar 8h-16h ; mer-ven 8h-13h (Endo Pneumo sans MAR l'après-midi) |
| B | court | Endo Inter 2 + Scanner 8 Inter | 8h-16h |
| C | court | Cardio 9 Rythmo + Cardio/Chir 10 | 8h-16h |
| D | court | Chir 3 + Chir 4 | 8h-16h |
| E | court | Chir 1 + Chir 7 | 8h-16h |
| F | long (3ᵉ) | Ch 11 Robot + Ch 12 Robot | 8h-18h |
| G | long | Ch 13 + Ch 14 (Risque 4) | 8h-18h |
| H | long | Ch 15 seule (5 salles : nombre impair) | 8h-18h |

- Au plus 3 jours de bloc par semaine et par MAR ; 2 jours consécutifs sur le même poste privilégiés ;
  postes répartis équitablement.
- SSPI et relais repas : postes IDE, sous la responsabilité des MAR du bloc.

## Réanimation
- **3 MAR par jour ouvré, 8h-16h**, par **semaines entières** (lundi-vendredi).
- Une semaine de réa n'est jamais coupée par un repos de sécurité ni un jour de temps partiel : garde possible le vendredi seulement.
- **Groupe Réa 1 (5 MAR)** : chaque MAR fait une **semaine entière en Réa 1, sans absence** (ni repos, ni temps partiel,
  ni congés), puis **la semaine suivante il est prioritaire sur la Réa 2**, sans obligation de faire toute la semaine :
  garde, repos, temps partiel ou absence possibles, un autre MAR reprend alors la Réa 2. Rotation au prorata de la quotité.
  Pas de jour de récupération propre au groupe. Le groupe ne prend pas la Réa 3.
- **Charge équilibrée** : bloc + réa + consultations au prorata de la quotité pour tous les MAR (le groupe Réa 1 fait
  moins de bloc).
- **Consultations du groupe Réa 1 proportionnelles à son temps au bloc** : même nombre de consultations par jour de bloc
  que les autres MAR (≈ 13 consultations par ETP pour le groupe, ≈ 28 pour les autres).
- **Option Réa 1 jusqu'à 17h** (désactivée par défaut) : la Réa 1 dure 9 h (8h-17h) et donne **1 jour de récupération
  pour 8 jours de Réa 1** (≈ 6 jours par an et par membre du groupe) ; heures annuelles quasi inchangées.
- **Réa 3** : répartie entre les autres MAR, au prorata de la quotité.
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
- **Jours fixes** : le MAR à **0,6 ETP travaille le lundi, le mardi et le mercredi** ; jeudi et vendredi sont ses jours de
  temps partiel (pas de poste ni de garde). Il ne fait pas de réa (semaine entière). Les jours de temps partiel des
  autres MAR sont posés de préférence les jours où le moins de MAR sont déjà absents.
- **Congés 32 jours**, **formation 10 jours**, **pas de RTT** — par ETP, proratisés à la quotité,
  posés sur des jours hors bloc.
- **Récupération** : 1 jour par **samedi de garde**, **½ jour par demi-garde** du samedi (jour 8h-20h ou nuit seule) ; **1 jour pour 4 jours finis à 18h** (bloc long). Option : 1 jour par **dimanche de garde** (½ pour une demi-garde), désactivée par défaut (onglet Équipe et règles, « Récupération par dimanche de garde »).
- Option « récupération posée dans la semaine de bloc » : ce jour est placé dans le tableau dès que les 4 jours
  sont atteints (premier jour libre hors garde, dans la même semaine si possible) ; un collègue couvre le poste.
  Moyennes inchangées, mais semaines de bloc long allégées (≈ 46 h au lieu de 51 h gardes comprises).

## Temps de travail
- Garde sur place comptée en temps de travail effectif.
- h/sem = moyenne hors vacances : heures travaillées ÷ semaines de l'année hors fériés, congés et jours de temps partiel ; formation comptée 8 h, jours de récupération (samedis et dimanches de garde, 18h, Réa 1 17h) comptés 0 h : une récupération baisse le temps de travail.
- Effectif pour 48 h (temps plein, gardes comprises, charge actuelle répartie) : environ **21,5 ETP** avec les règles par défaut.
- Repère : **48 h par semaine en moyenne**, gardes comprises (directive 2003/88/CE — à vérifier avec la
  réglementation applicable).

## Consultations
- **25 consultations par MAR** et par jour (journée de 7 h), **13 000 par an** → 520 journées de MAR.
- **Mercredi : 2 MAR en consultation** (jamais de 3ᵉ ce jour-là).
- Autres jours : **2 MAR**, et un **3ᵉ MAR** juste le nombre de jours nécessaire pour atteindre le volume
  (jours à 3 MAR répartis du lundi au vendredi hors mercredi), répartis régulièrement.
- Réparti au prorata de la quotité entre les MAR qui consultent ; le MAR de consultation peut prendre la garde à 16h.
- **Option roulement consultation → bloc** (désactivée par défaut) : le MAR qui consulte un jour J voit les patients
  qu'il endormira à partir de **J+7**, sur **2 jours ouvrés consécutifs au même poste** (délai et nombre de jours
  réglables). Le MAR de consultation est choisi parmi ceux qui sont libres ces jours-là (ni réa, ni repos de sécurité,
  ni temps partiel) ; ces jours de bloc lui sont réservés. Tenu pour ≈ 98 % des consultations, sans changer la charge.

## Récupération (objectif)
- Objectif de l'organisation : **libérer le plus de jours de récupération possible**.
- Jours libérables = jours sans poste restant libres après congés, formation et récupérations, moins une **réserve de
  0,5 MAR par jour** pour les imprévus ; répartis au prorata de la quotité.
- Organisation par défaut : ≈ 24 jours de récupération par temps plein et par an (13,7 réglementaires + 10 libérables).
- Leviers comparés automatiquement dans l'onglet Simulations et finance (consultations, réa, postes de bloc, gardes, maternité, effectif).

## Part financière
- **Chiffre d'affaires 1 200 000 €**, réparti en **15 parts égales** : 80 000 € la part.
- Parts de chaque MAR : saisies dans l'onglet Simulations et finance ; à défaut, au prorata de la quotité de travail.
- Revenu d'un MAR = parts × valeur de la part ; revenu horaire = revenu ÷ heures de l'année, gardes comprises.
- Tout le volet financier est dans l'onglet **💶 Finance** : CA et nombre de parts, parts de chaque MAR, revenus,
  €/h, grille CA × nombre de parts.

## Jours fériés 2027 (Monaco)
1ᵉʳ janvier, 27 janvier (Sainte-Dévote), 29 mars (lundi de Pâques), 1ᵉʳ mai, 6 mai (Ascension),
17 mai (lundi de Pentecôte), 27 mai (Fête-Dieu), 15 et 16 août (Assomption, reportée), 1ᵉʳ novembre,
19 novembre (Fête du Prince), 8 décembre, 25 décembre. Bloc, réa de jour et consultations fermés ;
gardes assurées.
