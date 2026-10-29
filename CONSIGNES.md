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
- **Demi-garde de WE** (case par MAR dans l'équipe, **décochée par défaut**, y compris pour MAR 05) : le MAR concerné assure le jour (8h-20h) le samedi **et** le dimanche d'un même
  week-end ; l'un des deux MAR de garde ne fait alors que la nuit (20h-8h, avec repos le lendemain).
  Nombre de week-ends : automatique (autant de journées de week-end qu'un temps plein en garde) ou fixé.

## Temps partiel, congés, récupérations
- Jours de **temps partiel** = (1 − quotité) × jours ouvrés, posés hors réa, garde et repos.
- **Jours fixes** : le MAR à **0,6 ETP travaille le lundi, le mardi et le mercredi** ; jeudi et vendredi sont ses jours de
  temps partiel (pas de poste ni de garde). Il ne fait pas de réa (semaine entière). Les jours de temps partiel des
  autres MAR sont posés de préférence les jours où le moins de MAR sont déjà absents.
- **Congés 32 jours**, **formation 10 jours**, **pas de RTT** — par ETP, proratisés à la quotité,
  posés sur des jours hors bloc.
- **Récupération pour les gardes au-delà d'un seuil** (option, désactivée par défaut) : par exemple 1 jour par garde au-delà de
  40 gardes par an (seuil au prorata de la quotité de garde ; demi-garde ½) ; jours pris hors poste, comptés 0 h.
- **Récupération** : 1 jour par **samedi de garde**, **½ jour par demi-garde** du samedi (jour 8h-20h ou nuit seule) ; **1 jour pour 4 jours finis à 18h** (bloc long). Option : 1 jour par **dimanche de garde** (½ pour une demi-garde), désactivée par défaut (onglet Équipe et règles, « Récupération par dimanche de garde »).
- Option « récupération posée dans la semaine de bloc » : ce jour est placé dans le tableau dès que les 4 jours
  sont atteints (premier jour libre hors garde, dans la même semaine si possible) ; un collègue couvre le poste.
  Moyennes inchangées, mais semaines de bloc long allégées (≈ 46 h au lieu de 51 h gardes comprises).

## Temps de travail
- Garde sur place comptée en temps de travail effectif.
- **Fréquence des gardes** : **une garde tous les x jours** de présence (365 jours × part de l'année hors congés et
  formation ÷ gardes ; une demi-garde compte ½) et **un week-end de garde tous les x week-ends** (52 week-ends × la même
  part ÷ week-ends avec une garde ou une demi-garde) ; gardes du samedi et du dimanche par an (« dont WE »).
- h/sem = heures de l'année ÷ semaines de l'année hors fériés et jours de temps partiel ; congés et formation comptés 8 h, jours de récupération (samedis et dimanches de garde, 18h, Réa 1 17h) comptés 0 h : une récupération baisse le temps de travail.
- Temps de travail : **congés et formation comptés 8 h, jours de récupération 0 h** ; les jours libérables (jours sans poste
  restant libres) sont comptés travaillés (8 h).
- Effectif pour 48 h (temps plein, gardes comprises) : environ **22 ETP** avec les règles par défaut.
- Repère : **48 h par semaine en moyenne**, gardes comprises (directive 2003/88/CE — à vérifier avec la
  réglementation applicable).

## Consultations
- **25 consultations par MAR** et par jour (journée de 8 h), **13 000 par an** → 520 journées de MAR.
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

## Projection dans le temps (onglet Projection)
- Chaque MAR vieillit d'après son **année de naissance** ; à l'**âge de départ en retraite** (65, 66 ou 67 ans, 67 par
  défaut) il est **remplacé** par un MAR de 35 ans, qui arrive **dès le lendemain du départ** (sans délai) (temps plein, ou quotité du poste pour un poste à jours fixes) :
  effectif constant. Option : départs non remplacés.
- À partir de **60 ans** (réglable) : plus de garde, ou option **continuer les gardes** (25, 50, 75 ou 100 % de sa quotité de garde). Ce réglage peut être **forcé pour un praticien** (onglet Projection, « Gardes après 60 ans, par praticien »). **Un MAR qui continue les gardes ne fait pas de demi-garde.** Demi-gardes des 60 ans et plus : **un seul jour par week-end** (samedi ou dimanche, en alternance) ou **groupées sur le week-end** (samedi + dimanche, avec l'option nuits enchaînées pour le jeune). Options : **plafond de week-ends travaillés par an** et **plafond de jours de week-end travaillés par an** pour les 60 ans et plus (par exemple 12 jours : samedis et dimanches de garde ou de demi-garde, fêtes comprises). Case en haut de l'onglet : **demi-gardes des plus de 60 ans (règle générale)**, suivie par les indicateurs, l'équipe de l'année et les fêtes. Deux calculs comparés dans les graphiques : **sans demi-garde**, ou **avec demi-gardes de
  jour le week-end** (8h-20h samedi et dimanche, le collègue de garde ne fait que la nuit).
- **Ajouts / retraits** possibles à partir d'une année donnée.
- Le planning complet est recalculé pour chaque année avec les règles courantes (calendrier de l'année de référence).
- **Gardes de Noël** (24 et 25 décembre) **et du Nouvel An** (31 décembre et 1er janvier suivant) : rotation sur les
  années entre les MAR qui gardent le week-end, au prorata de la quotité de garde et des années de présence (priorité à
  ceux qui en ont fait le moins, puis à la plus ancienne). **Un MAR ne fait pas Noël et Nouvel An la même saison**, ni
  deux de ces jours à la suite.
- **Demi-gardes des fêtes** : les jours de fête fériés ou de week-end (25 décembre, 1er janvier…), un MAR en demi-gardes de
  week-end (60 ans et plus, ou demi-gardes uniquement) assure le jour (8h-20h), le collègue de garde ne fait que la nuit ;
  même rotation sur les années, pas Noël et Nouvel An la même saison.
- **Graphiques** : couleur = groupe d'âge (moins de 60 ans à temps plein, 60 ans et plus), trait plein = sans demi-garde
  des 60 ans et plus, pointillés = avec demi-gardes ; gardes par an, temps de travail, journées travaillées le week-end et
  les jours fériés, week-ends de garde, heures de week-end et jours fériés, effectif.
- **Nuits enchaînées** (option) : quand un MAR fait la demi-garde de jour le samedi et le dimanche, le même jeune MAR fait
  les deux nuits (20h-8h), repos le lundi : un seul week-end entamé au lieu de deux.
- **Comparatif moins de 60 ans / 60 ans et plus** : pour l'année choisie, valeurs par ETP et par an (bloc, réa,
  consultation, gardes, demi-gardes, week-ends, heures, récupérations, jours libérables, temps de travail) et évolution
  année par année de l'indicateur choisi.
- Réglages regroupés : effectif et départs ; 60 ans et plus (fin des gardes, gardes conservées, demi-gardes, plafond,
  réglage par praticien) ; week-ends des plus jeunes (nuits enchaînées) ; bouton « Réglages par défaut ».
- **Leviers pour soulager les gardes** (onglet Projection) :
  - **réduire le temps de travail des 60 ans et plus** (−10 à −50 %, hors postes à jours fixes) ; les **ETP libérés**
    servent à recruter des jeunes qui gardent (recrues à temps plein, la dernière au reliquat) ;
  - **temps partiels de moins de 60 ans : quotité de garde = temps de travail + 5 à 20 %** (par exemple 80 % de temps
    de travail → 85 % de garde ; 100 % au plus) ;
  - **journées finies à 18h (bloc long) des 60 ans et plus à la hausse** (×1,25 à ×3) : ils ne gardent plus et peuvent
    rester jusqu'à 18h ; les plus jeunes en font moins (et ont moins de récupérations 18h) ;
    **ratio de récupération propre aux 60 ans et plus** (1 jour pour 2 à 12 journées à 18h, ou aucune ; règle générale :
    1 pour 4) ;
  - **temps de travail cible des 60 ans et plus** (33 à 48 h / semaine pour un temps plein, au prorata pour un temps
    partiel) : en dessous, demi-gardes de jour le week-end (12 h, sans repos) ; au-dessus, moins de demi-gardes puis
    quotité de travail réduite (ETP libérés : recrues qui gardent) ; postes à jours fixes non modifiés ;
  - **médecin extérieur** pour les gardes : nombre de gardes par an en semaine et / ou le week-end et les jours fériés,
    réparties régulièrement sur l'année (gardes seules, pas de journée au bloc, hors rotation des fêtes).
- **Impact des leviers** (onglet Projection) : chaque levier part des réglages actuels et recalcule les plannings ; tableau
  des gardes par an d'un temps plein de moins de 60 ans (pic, moyenne), des week-ends et journées de week-end, du temps
  de travail des deux groupes, avec l'écart aux réglages actuels et un bouton « Appliquer ».

