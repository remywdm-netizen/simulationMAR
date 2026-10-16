// ============================================================
// ORGANISATION DES MAR AU BLOC — MOTEUR DE GÉNÉRATION ET DE SIMULATION
// Utilisable dans le navigateur (window.BlocMarEngine) et dans Node
// (require('./bloc-mar-engine.js')). Règles : voir CONSIGNES.md.
// ============================================================
(function (root) {
  'use strict';

  const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  // ── Configuration par défaut ───────────────────────────────
  // Équipe : quotités du fichier « personnels » (initiales remplacées par MAR 01…).
  // Importer le fichier Excel de l'équipe dans la page pour retrouver les noms.
  const EQUIPE_DEFAUT = [
    [1, 1, false], [1, 1], [1, 1], [0.6, 0], [1, 0, true, true], [0.8, 1], [1, 1], [0.5, 0.5], [0.9, 0.9], [1, 1],
    [0.9, 0.9], [0.9, 0.9], [0.9, 0.9], [1, 1], [1, 1], [1, 1], [1, 1], [0.8, 0.8], [1, 1], [1, 1],
    [0.9, 0.9], [0.9, 1], [1, 1],
  ].map(([q, qg, we, demi], i) => ({
    code: 'MAR ' + String(i + 1).padStart(2, '0'), q, qg,
    we: we === undefined ? true : we,          // gardes de week-end / férié
    demiWE: !!demi,                            // demi-gardes de jour le week-end (samedi et dimanche 8h-20h)
    rea: true,                                 // participe à la réanimation
    rea1: [1, 2, 6, 9, 13].includes(i),         // groupe dédié au poste « Réa 1 » (5 MAR, semaines entières)
    joursFixes: i === 3 ? [true, true, true, false, false] : null,   // jours travaillés fixes (lun..ven), null = jours de TP variables
    note: we === false ? 'pas de garde de WE' : demi ? 'demi-gardes de WE uniquement' : '',
  }));

  const DEFAULT_CONFIG = {
    annee: 2027,
    feries: {
      '2027-01-01': "Jour de l'An", '2027-01-27': 'Sainte-Dévote', '2027-03-29': 'Lundi de Pâques',
      '2027-05-01': 'Fête du Travail', '2027-05-06': 'Ascension', '2027-05-17': 'Lundi de Pentecôte',
      '2027-05-27': 'Fête-Dieu', '2027-08-15': 'Assomption', '2027-08-16': 'Assomption (reportée)',
      '2027-11-01': 'Toussaint', '2027-11-19': 'Fête du Prince', '2027-12-08': 'Immaculée Conception',
      '2027-12-25': 'Noël',
    },
    // Postes de bloc : 1 MAR pour 2 salles (nombre impair : la dernière salle a son MAR).
    // heures = lun..ven ; apres16 = heures au-delà de 16h (retirées un jour de garde) ; fin18 = finit à 18h.
    postes: [
      { code: 'A', bloc: 'Bloc court (4ᵉ)', salles: 'Endo 6 + Endo 5', heures: [8, 8, 5, 5, 5], apres16: 0, fin18: false, actif: true },
      { code: 'B', bloc: 'Bloc court (4ᵉ)', salles: 'Endo Inter 2 + Scanner 8 Inter', heures: [8, 8, 8, 8, 8], apres16: 0, fin18: false, actif: true },
      { code: 'C', bloc: 'Bloc court (4ᵉ)', salles: 'Cardio 9 Rythmo + Cardio/Chir 10', heures: [8, 8, 8, 8, 8], apres16: 0.5, fin18: false, actif: true },
      { code: 'D', bloc: 'Bloc court (4ᵉ)', salles: 'Chir 3 + Chir 4', heures: [8.5, 8.5, 8.5, 8.5, 8.5], apres16: 0.5, fin18: false, actif: true },
      { code: 'E', bloc: 'Bloc court (4ᵉ)', salles: 'Chir 1 + Chir 7', heures: [8.5, 8.5, 8.5, 8.5, 8.5], apres16: 0.5, fin18: false, actif: true },
      { code: 'F', bloc: 'Bloc long (3ᵉ)', salles: 'Ch 11 Robot + Ch 12 Robot', heures: [10, 10, 10, 10, 10], apres16: 2, fin18: true, actif: true },
      { code: 'G', bloc: 'Bloc long (3ᵉ)', salles: 'Ch 13 + Ch 14 (Risque 4)', heures: [10, 10, 10, 10, 10], apres16: 2, fin18: true, actif: true },
      { code: 'H', bloc: 'Bloc long (3ᵉ)', salles: 'Ch 15 (seule)', heures: [10, 10, 10, 10, 10], apres16: 2, fin18: true, actif: true },
    ],
    rea: { nombre: 3, heures: 8, apres16: 0, quotiteMin: 0.5, recupSemaine2: 0,
      reaUn: { actif: false, heures: 9, apres16: 1, joursParRecup: 8 } },   // option : Réa 1 jusqu'à 17h (9 h), 1 jour de récupération pour 8 jours de Réa 1   // 8h-16h, par semaines entières ; recupSemaine2 : jours de récupération du groupe Réa 1 pendant sa semaine en Réa 2
    hb: { heures: 8 },                                                    // jour sans poste (hors bloc, administratif)
    // Détachement à la maternité en journée (option) : MAR par jour, jours (lun..ven), horaires 8h-16h par défaut.
    maternite: { actif: false, nombre: 1, jours: [true, true, true, true, true], heures: 8, apres16: 0 },
    gardes: {
      parJour: 2, ecartMin: 5,
      heuresSemaine: 16,       // 16h -> 8h, après la journée
      heuresWE: 24,            // week-end et fériés 8h -> 8h
      heuresNuit: 12,          // nuit seule 20h -> 8h (quand un MAR fait la demi-garde de jour)
      heuresDemiJour: 12,      // demi-garde de jour 8h -> 20h (sans repos)
      demiWeekends: 'auto',    // week-ends de demi-gardes par MAR concerné : 'auto' ou un nombre
    },
    params: {
      conges: 32, rtt: 0, formation: 10,         // jours ouvrés par ETP (proratisés à la quotité)
      recupSamedi: 1,                            // jours de récupération par samedi de garde (demi-garde : la moitié)
      joursFin18ParRecup: 4,                     // 1 jour de récupération pour N jours finis à 18h
      recupDansSemaineBloc: false,               // poser cette récupération dans le tableau, juste après les jours finis à 18h
      plafond: 48,                               // h / semaine en moyenne, gardes comprises
      blocMaxSemaine: 3, tpMaxParJour: 5,
      reserveImprevus: 0.5,                      // MAR libres gardés chaque jour pour les imprévus (non convertis en récupération)
    },
    // Part financière : le chiffre d'affaires est réparti en parts égales entre les MAR qui en détiennent.
    // Parts d'un MAR : valeur saisie dans l'équipe, sinon au prorata de la quotité de travail.
    finance: { ca: 1200000, parts: 15 },
    // Consultations d'anesthésie : entre marMin et marMax MAR chaque jour ouvré, ajusté au volume annuel
    // (jours à marMax répartis régulièrement) ; chaque MAR assure parMarJour consultations.
    // parJourSemaine : nombre imposé de MAR un jour de la semaine (lun..ven), null = ajusté entre marMin et marMax.
    consultations: { parAn: 13000, marMin: 2, marMax: 3, parMarJour: 25, heuresJour: 7, parJourSemaine: [null, null, 2, null, null] },
    equipe: EQUIPE_DEFAUT,
  };

  // ── Dates (chaînes AAAA-MM-JJ, calcul en UTC) ───────────────
  const toD = s => new Date(s + 'T00:00:00Z');
  const toS = d => d.toISOString().slice(0, 10);
  const addDays = (s, n) => { const d = toD(s); d.setUTCDate(d.getUTCDate() + n); return toS(d); };
  const dow = s => (toD(s).getUTCDay() + 6) % 7;                   // 0 = lundi
  const monday = s => addDays(s, -dow(s));
  function isoWeek(s) {
    const d = toD(s); d.setUTCDate(d.getUTCDate() + 3 - dow(s));
    const y = d.getUTCFullYear(), jan4 = new Date(Date.UTC(y, 0, 4));
    return 1 + Math.round(((d - jan4) / 864e5 - 3 + ((jan4.getUTCDay() + 6) % 7)) / 7);
  }
  const labelFR = s => s.slice(8, 10) + '/' + s.slice(5, 7) + '/' + s.slice(0, 4);

  const clone = o => JSON.parse(JSON.stringify(o));
  function mergeConfig(cfg) {
    const base = clone(DEFAULT_CONFIG);
    if (!cfg) return base;
    const out = Object.assign(base, clone(cfg));
    ['rea', 'hb', 'maternite', 'gardes', 'params', 'finance', 'consultations'].forEach(k => { out[k] = Object.assign(clone(DEFAULT_CONFIG[k]), clone((cfg || {})[k] || {})); });
    out.rea.reaUn = Object.assign(clone(DEFAULT_CONFIG.rea.reaUn), clone(((cfg || {}).rea || {}).reaUn || {}));
    return out;
  }

  // ── Génération du tableau de service ───────────────────────
  function generate(userCfg) {
    const cfg = mergeConfig(userCfg);
    const P = cfg.equipe.map(m => Object.assign({ we: true, demiWE: false, rea: true, rea1: false, mater: true, consult: true, joursFixes: null }, m, { q: +m.q || 0, qg: +m.qg || 0 }));
    const n = P.length;
    const postes = cfg.postes.filter(p => p.actif !== false);
    const NP = postes.length;
    const LONG = new Set(postes.map((p, i) => (p.fin18 ? i : -1)).filter(i => i >= 0));
    const G = cfg.gardes, PR = cfg.params;
    const days = [];
    for (let s = cfg.annee + '-01-01'; s.startsWith(String(cfg.annee)); s = addDays(s, 1)) days.push(s);
    const statut = s => (dow(s) >= 5 ? 'Week-end' : cfg.feries[s] ? 'Férié' : 'Ouvert');
    const isOpen = days.map(s => statut(s) === 'Ouvert');
    const idx = Object.fromEntries(days.map((s, k) => [s, k]));
    const Q = P.map(p => p.q), QG = P.map(p => p.qg);
    // Jours fixes : un MAR qui ne travaille que certains jours de la semaine
    const fixe = P.map(p => Array.isArray(p.joursFixes) && p.joursFixes.some(x => !x) ? p.joursFixes.map(Boolean) : null);
    const off = (i, s) => fixe[i] && dow(s) < 5 && !fixe[i][dow(s)];
    const warnings = [];

    // 1. Réanimation par semaines entières
    const weeks = [...new Set(days.filter((s, k) => isOpen[k]).map(monday))];
    const reaCands = P.map((p, i) => i).filter(i => P[i].rea !== false && Q[i] >= cfg.rea.quotiteMin && !fixe[i]);   // la réa demande la semaine entière
    const sqRea = reaCands.reduce((a, i) => a + Q[i], 0);
    const reaDone = Array(n).fill(0), lastRea = Array(n).fill(-9);
    const reaDay = days.map(() => new Set()), reaOrdre = days.map(() => []), rrDay = days.map(() => []), r2Pref = days.map(() => null);
    // Groupe Réa 1 (case Réa 1 de l'équipe) : chaque MAR fait une semaine en Réa 1 puis enchaîne la semaine suivante
    // en Réa 2, avec des jours de récupération en fin de semaine (poste repris ce jour-là par un autre MAR).
    // Ces MAR ne prennent pas les autres postes de réa. Les autres postes : tous les autres MAR de réa.
    const groupe1 = cfg.rea.nombre > 0 ? reaCands.filter(i => P[i].rea1) : [];
    const deux = groupe1.length >= 2 && cfg.rea.nombre >= 2;
    const autres = groupe1.length ? reaCands.filter(i => !P[i].rea1) : reaCands;
    const nGroupe = groupe1.length ? (deux ? 2 : 1) : 0;
    const sqAutres = autres.reduce((a, i) => a + Q[i], 0), nAutres = cfg.rea.nombre - nGroupe;
    let prevR1 = null;
    weeks.forEach((mon, wi) => {
      const key = i => [wi - lastRea[i] < 4 ? 1 : 0, -(Q[i] / sqAutres * nAutres * (wi + 1) - reaDone[i]), -(wi - lastRea[i]), i];
      const key1 = i => [wi - lastRea[i] < 2 ? 1 : 0, reaDone[i] / Q[i], -(wi - lastRea[i]), i];
      let g = [];
      if (groupe1.length) {
        const r1 = groupe1.filter(i => i !== prevR1).sort((a, b) => cmp(key1(a), key1(b)))[0];
        g = [r1];
        if (deux) g.push(prevR1 !== null && prevR1 !== r1 ? prevR1 : groupe1.filter(i => i !== r1).sort((a, b) => cmp(key1(a), key1(b)))[0]);
        prevR1 = r1;
      }
      const chosen = g.concat(autres.slice().sort((a, b) => cmp(key(a), key(b))).slice(0, nAutres));
      if (chosen.length < cfg.rea.nombre) warnings.push(`Semaine du ${labelFR(mon)} : pas assez de MAR pour la réa`);
      chosen.forEach(i => { reaDone[i]++; lastRea[i] = wi; });
      const ks = [0, 1, 2, 3, 4].map(j => idx[addDays(mon, j)]).filter(k => k !== undefined && isOpen[k]);
      const nRr = deux ? Math.max(0, Math.min(Math.round(cfg.rea.recupSemaine2 || 0), ks.length)) : 0;
      const rr = nRr ? ks.slice(-nRr) : [];   // derniers jours ouvrés de la semaine en Réa 2
      ks.forEach(k => {
        chosen.forEach((i, pos) => {
          if (deux && pos === 1 && rr.includes(k)) { rrDay[k].push(i); reaOrdre[k].push(null); return; }   // récupération : poste à reprendre
          if (deux && pos === 1) { r2Pref[k] = i; reaOrdre[k].push(null); return; }   // Réa 2 : semaine non obligatoire, MAR prioritaire s'il est disponible
          reaDay[k].add(i); reaOrdre[k].push(i);
        });
      });
    });

    // 2. Gardes
    const sqg = QG.reduce((a, b) => a + b, 0);
    const sqgWE = P.reduce((a, p, i) => a + (p.we ? QG[i] : 0), 0);
    const gDone = Array(n).fill(0), gsDone = Array(n).fill(0), lastG = Array(n).fill(-99);
    let nSpec = 0;
    const garde = [];
    days.forEach((s, k) => {
      const spec = !isOpen[k];
      if (spec) nSpec++;
      const ok = i => QG[i] > 0 && !(spec && !P[i].we) && !off(i, s) && k - lastG[i] >= G.ecartMin && !rrDay[k].includes(i) && !(k + 1 < days.length && rrDay[k + 1].includes(i))
        && !(k + 1 < days.length && reaDay[k + 1].has(i))              // le repos ne coupe pas une semaine de réa
        && !(reaDay[k].has(i) && dow(s) !== 4);                         // garde en semaine de réa : le vendredi
      const key = i => {
        const expTot = QG[i] / sqg * G.parJour * (k + 1);
        const gapIdeal = days.length / Math.max(QG[i] / sqg * G.parJour * days.length, 1);
        const penGap = Math.max(0, 0.8 * gapIdeal - (k - lastG[i]));
        if (spec) return [-(QG[i] / sqgWE * G.parJour * nSpec - gsDone[i]) + 0.3 * penGap, -(expTot - gDone[i]), i];
        return [-(expTot - gDone[i]) + 0.3 * penGap, i];
      };
      let cands = P.map((p, i) => i).filter(ok);
      if (cands.length < G.parJour) {   // assouplissement : écart minimal réduit
        cands = P.map((p, i) => i).filter(i => QG[i] > 0 && !(spec && !P[i].we) && k - lastG[i] >= 2 && !(k + 1 < days.length && reaDay[k + 1].has(i)));
        warnings.push(`${labelFR(s)} : écart minimal entre gardes non tenu`);
      }
      const pair = cands.sort((a, b) => cmp(key(a), key(b))).slice(0, G.parJour);
      if (pair.length < G.parJour) warnings.push(`${labelFR(s)} : ${pair.length} MAR de garde seulement`);
      pair.forEach(i => { gDone[i]++; lastG[i] = k; if (spec) gsDone[i]++; });
      garde.push(pair);
    });
    const repos = days.map((s, k) => new Set(k ? garde[k - 1] : []));

    // 2b. Demi-gardes de jour du week-end (8h-20h) : le MAR de garde concerné ne fait que la nuit (20h-8h)
    const demi = days.map(() => []), nuit = days.map(() => []);
    const demiMembers = P.map((p, i) => i).filter(i => P[i].demiWE);
    let demiWeekends = 0;
    if (demiMembers.length) {
      const full = P.map((p, i) => i).filter(i => Q[i] === 1 && QG[i] === 1 && P[i].we);
      const avgWE = full.length ? full.reduce((a, i) => a + gsDone[i], 0) / full.length : 10;
      const sats = days.map((s, k) => k).filter(k => dow(days[k]) === 5 && k + 1 < days.length);
      demiMembers.forEach((i, r) => {
        const nb = G.demiWeekends === 'auto' || G.demiWeekends === '' || G.demiWeekends == null
          ? Math.max(1, Math.round(avgWE / 2 * Q[i])) : Math.max(0, +G.demiWeekends);
        demiWeekends += nb;
        const step = sats.length / Math.max(nb, 1);
        for (let m = 0; m < nb; m++) {
          let pos = Math.floor(step * m + step / 2 + r * step / (demiMembers.length + 1)) % sats.length;
          for (let t = 0; t < sats.length; t++, pos = (pos + 1) % sats.length) {
            const k0 = sats[pos];
            if ([k0, k0 + 1].every(k => !garde[k].includes(i) && !repos[k].has(i) && demi[k].length < garde[k].length)) {
              [k0, k0 + 1].forEach(k => {
                const night = garde[k].slice().reverse().find(g => !nuit[k].includes(g));
                demi[k].push(i); nuit[k].push(night);
              });
              break;
            }
          }
        }
      });
    }

    // 3. Temps partiel : jours non travaillés (TP)
    const tp = days.map(() => new Set());
    const owed = Array(n).fill(0);
    const pt = P.map((p, i) => i).filter(i => Q[i] < 1 && !fixe[i]);
    P.forEach((p, i) => {   // jours fixes : les autres jours ouvrés sont des jours de TP
      if (!fixe[i]) return;
      days.forEach((s, k) => { if (isOpen[k] && off(i, s)) tp[k].add(i); });
      const nb = fixe[i].filter(Boolean).length / 5;
      if (Math.abs(nb - Q[i]) > 0.01) warnings.push(`${p.code} : ${fixe[i].filter(Boolean).length} jours fixes pour une quotité de ${Q[i]}`);
    });
    const pref = {}; pt.forEach((i, r) => { pref[i] = [0, 1, 2, 3, 4].map(s => (r + s) % 5); });
    weeks.forEach(mon => {
      const wk = [0, 1, 2, 3, 4].map(j => idx[addDays(mon, j)]).filter(k => k !== undefined && isOpen[k]);
      pt.forEach(i => { owed[i] += (1 - Q[i]) * wk.length; });
      pt.slice().sort((a, b) => owed[b] - owed[a]).forEach(i => {
        const need = Math.floor(owed[i] + 1e-9);
        if (need <= 0) return;
        const free = wk.filter(k => !reaDay[k].has(i) && !rrDay[k].includes(i) && !repos[k].has(i) && !garde[k].includes(i) && tp[k].size < PR.tpMaxParJour)
          .sort((a, b) => cmp([tp[a].size, pref[i].indexOf(dow(days[a]))], [tp[b].size, pref[i].indexOf(dow(days[b]))]));   // jours les moins chargés en TP d'abord
        free.slice(0, need).forEach(k => { tp[k].add(i); owed[i]--; });
      });
    });

    // 4. Maternité (jour) puis bloc
    const MAT = cfg.maternite;
    const matDay = days.map(() => []), mDone = Array(n).fill(0);
    const CS = cfg.consultations, csDay = days.map(() => []), csNb = days.map(() => 0), cDone = Array(n).fill(0);
    const openIdx = {}; days.forEach((s, k) => { if (isOpen[k]) openIdx[k] = Object.keys(openIdx).length; });
    const csPlan = consultPlan(CS, days.filter((s, k) => isOpen[k]).map(dow));
    const bDone = Array(n).fill(0), pc = P.map(() => Array(NP).fill(0));
    const wkBloc = {};
    const RECUP_BLOC = !!PR.recupDansSemaineBloc && PR.joursFin18ParRecup > 0;
    const credit = Array(n).fill(0), rcDay = days.map(() => []);
    const rDays = Array(n).fill(0);   // jours de réa déjà faits : la charge bloc + réa est équilibrée
    let prev = {}, run = {};
    const postesJour = days.map((s, k) => {
      if (!isOpen[k]) { prev = {}; run = {}; return null; }
      const wkey = monday(s);
      let avail = P.map((p, i) => i).filter(i => Q[i] > 0 && !reaDay[k].has(i) && !rrDay[k].includes(i) && !repos[k].has(i) && !tp[k].has(i));
      reaOrdre[k].forEach((x, pos) => {   // poste de réa libre (Réa 2 du groupe, récupération) : MAR prioritaire, sinon un autre MAR de réa
        if (x !== null) return;
        if (r2Pref[k] !== null && avail.includes(r2Pref[k])) { const i = r2Pref[k]; reaOrdre[k][pos] = i; reaDay[k].add(i); avail = avail.filter(a => a !== i); return; }
        const rp = avail.filter(i => reaCands.includes(i) && !P[i].rea1 && !garde[k].includes(i))
          .sort((a, b) => cmp([rDays[a] / Q[a], a], [rDays[b] / Q[b], b]))[0];
        if (rp === undefined) { warnings.push(`${labelFR(s)} : réa sans remplaçant`); return; }
        reaOrdre[k][pos] = rp; reaDay[k].add(rp); avail = avail.filter(i => i !== rp);
      });
      reaDay[k].forEach(i => { rDays[i]++; });
      if (RECUP_BLOC) {   // récupération des jours finis à 18h : premier jour libre (hors garde) après les avoir accumulés
        const rc = avail.filter(i => credit[i] >= 1 - 1e-9 && !garde[k].includes(i));
        rc.forEach(i => { credit[i] -= 1; rcDay[k].push(i); });
        avail = avail.filter(i => !rc.includes(i));
      }
      if (MAT.actif && MAT.jours[dow(s)]) {
        const elig = avail.filter(i => P[i].mater !== false)
          .sort((a, b) => cmp([mDone[a] / Q[a], bDone[a] / Q[a], a], [mDone[b] / Q[b], bDone[b] / Q[b], b])).slice(0, MAT.nombre);
        if (elig.length < MAT.nombre) warnings.push(`${labelFR(s)} : maternité sans MAR`);
        elig.forEach(i => { mDone[i]++; matDay[k].push(i); });
        avail = avail.filter(i => !elig.includes(i));
      }
      const nbCs = csPlan.parJour(openIdx[k]);
      csNb[k] = nbCs;
      if (nbCs > 0) {   // consultations : au prorata de la quotité
        const elig = avail.filter(i => P[i].consult !== false)
          .sort((a, b) => cmp([cDone[a] / Q[a], bDone[a] / Q[a], a], [cDone[b] / Q[b], bDone[b] / Q[b], b])).slice(0, nbCs);
        if (elig.length < nbCs) warnings.push(`${labelFR(s)} : ${nbCs - elig.length} MAR de consultation manquant(s)`);
        elig.forEach(i => { cDone[i]++; csDay[k].push(i); });
        avail = avail.filter(i => !elig.includes(i));
      }
      const key = i => [(wkBloc[i + wkey] || 0) >= PR.blocMaxSemaine ? 1 : 0, (bDone[i] + rDays[i]) / Q[i] + (i in prev && run[i] === 1 ? -0.6 : 0), i];
      const chosen = avail.sort((a, b) => cmp(key(a), key(b))).slice(0, NP);
      if (chosen.length < NP) warnings.push(`${labelFR(s)} : ${NP - chosen.length} poste(s) de bloc sans MAR`);
      const gard = new Set(garde[k]);
      const cost = [];
      chosen.forEach(i => { for (let p = 0; p < NP; p++) {
        if (gard.has(i) && LONG.has(p)) continue;
        let c = pc[i][p] / Q[i];
        if (prev[i] === p) c += run[i] === 1 ? -3 : 2;
        cost.push([gard.has(i) ? 0 : 1, c, i, p]);
      } });
      cost.sort(cmp);
      const posts = Array(NP).fill(null), used = new Set();
      cost.forEach(([, , i, p]) => { if (!used.has(i) && posts[p] === null) { posts[p] = i; used.add(i); } });
      const rest = chosen.filter(i => !used.has(i));
      for (let p = 0; p < NP; p++) if (posts[p] === null) {
        const j = rest.findIndex(i => !(gard.has(i) && LONG.has(p)));
        if (j >= 0) posts[p] = rest.splice(j, 1)[0];
      }
      const np = {}, nr = {};
      posts.forEach((i, p) => {
        if (i === null) return;
        bDone[i]++; pc[i][p]++; wkBloc[i + wkey] = (wkBloc[i + wkey] || 0) + 1;
        if (RECUP_BLOC && LONG.has(p)) credit[i] += 1 / PR.joursFin18ParRecup;
        nr[i] = prev[i] === p ? (run[i] || 0) + 1 : 1; np[i] = p;
      });
      prev = np; run = nr;
      return posts;
    });

    const jours = days.map((s, k) => ({
      date: s, jour: JOURS[dow(s)], semaine: isoWeek(s), statut: statut(s), ferie: cfg.feries[s] || '',
      postes: postesJour[k], rea: reaOrdre[k].filter(x => x !== null), garde: garde[k], repos: [...repos[k]], tp: [...tp[k]],
      demi: demi[k], nuit: nuit[k], reaPrioritaire: r2Pref[k], maternite: matDay[k], consultation: csDay[k], recupRea: rrDay[k], consultNb: csNb[k], recup: rcDay[k],
    }));
    const result = { cfg, equipe: P, postes, jours, demiWeekends, warnings };
    result.stats = stats(result);
    const ep = etpPourPlafond(result);
    result.stats.synthese.etpPlafondCharge = ep.charge;
    result.stats.synthese.etpPlafondConsult = ep.consultations;
    return result;
  }

  function cmp(a, b) {
    for (let i = 0; i < a.length; i++) { if (a[i] < b[i]) return -1; if (a[i] > b[i]) return 1; }
    return 0;
  }

  // Activité d'un MAR un jour donné : { act: 'P0'..|'REA'|'HB'|'REPOS'|'TP'|'', garde: ''|'G16'|'G24'|'GN'|'DJ' }
  function activite(result, j, i) {
    const open = j.statut === 'Ouvert';
    let act = '';
    if (j.repos.includes(i)) act = 'REPOS';
    else if (open) {
      const p = j.postes.indexOf(i);
      act = p >= 0 ? 'P' + p : j.rea.includes(i) ? 'REA' : (j.maternite || []).includes(i) ? 'MAT' : (j.consultation || []).includes(i) ? 'CS' : (j.recupRea || []).includes(i) ? 'RR' : (j.recup || []).includes(i) ? 'RC' : j.tp.includes(i) ? 'TP' : 'HB';
    }
    let g = '';
    if (j.demi.includes(i)) g = 'DJ';
    else if (j.garde.includes(i)) g = j.nuit.includes(i) ? 'GN' : open ? 'G16' : 'G24';
    return { act, garde: g };
  }

  function codeActivite(result, a) {
    const base = a.act[0] === 'P' ? result.postes[+a.act.slice(1)].code
      : { REA: 'Réa', MAT: 'Mat', CS: 'Consult', RC: 'Récup', RR: 'Récup réa', HB: 'HB', REPOS: 'Repos', TP: 'TP', '': '' }[a.act];
    const g = { G16: 'G16h', G24: 'G24h', GN: 'G nuit', DJ: 'Demi-garde', '': '' }[a.garde];
    return base && g ? base + ' + ' + g : base || g;
  }

  // ── Compteurs, heures et synthèse ──────────────────────────
  function stats(result) {
    const { cfg, equipe: P, postes, jours } = result;
    const G = cfg.gardes, PR = cfg.params;
    const open = jours.filter(j => j.statut === 'Ouvert');
    const nOpen = open.length, nOuvres = jours.filter(j => dow(j.date) < 5).length;
    const R1 = cfg.rea.reaUn && cfg.rea.reaUn.actif && P.some(m => m.rea1) ? cfg.rea.reaUn : null;   // option Réa 1 jusqu'à 17h
    const per = P.map((m, i) => {
      const s = { code: m.code, q: m.q, qg: m.qg, bloc: 0, rea: 0, mater: 0, consult: 0, rc: 0, recupRea: 0, reaUn: 0, gardes: 0, gardesWE: 0, nuits: 0, demi: 0, repos: 0, tp: 0, hb: 0,
        postes: postes.map(() => 0), samedis: 0, samedisDemi: 0, fin18: 0, heuresJour: 0, heuresGarde: 0, semaines: {} };
      jours.forEach(j => {
        const a = activite(result, j, i), d = dow(j.date);
        let hj = 0, hg = 0;
        if (a.act[0] === 'P') { const p = +a.act.slice(1); s.bloc++; s.postes[p]++; hj = postes[p].heures[d]; if (postes[p].fin18) s.fin18++; if (a.garde === 'G16') hj -= postes[p].apres16 || 0; }
        else if (a.act === 'REA') {
          s.rea++;
          const un = R1 && j.rea[0] === i;   // poste Réa 1 du groupe
          if (un) s.reaUn++;
          hj = un ? R1.heures - (a.garde === 'G16' ? R1.apres16 || 0 : 0) : cfg.rea.heures - (a.garde === 'G16' ? cfg.rea.apres16 || 0 : 0);
        }
        else if (a.act === 'CS') { s.consult++; hj = cfg.consultations.heuresJour; }
        else if (a.act === 'MAT') { s.mater++; hj = cfg.maternite.heures - (a.garde === 'G16' ? cfg.maternite.apres16 || 0 : 0); }
        else if (a.act === 'HB') { s.hb++; hj = cfg.hb.heures; }
        else if (a.act === 'TP') s.tp++;
        else if (a.act === 'RC') s.rc++;
        else if (a.act === 'RR') s.recupRea++;
        else if (a.act === 'REPOS' && j.statut === 'Ouvert') s.repos++;
        if (a.garde) {
          if (a.garde === 'DJ') { s.demi++; hg = G.heuresDemiJour; }
          else { s.gardes++; if (j.statut !== 'Ouvert') s.gardesWE++; if (a.garde === 'GN') s.nuits++; hg = { G16: G.heuresSemaine, G24: G.heuresWE, GN: G.heuresNuit }[a.garde]; }
          if (d === 5) { if (a.garde === 'DJ' || a.garde === 'GN') s.samedisDemi++; else s.samedis++; }   // demi-garde : demi-récupération
        }
        s.heuresJour += hj; s.heuresGarde += hg;
        const w = j.semaine; s.semaines[w] = (s.semaines[w] || 0) + hj + hg;
      });
      s.conges = PR.conges * m.q; s.formation = PR.formation * m.q; s.rtt = PR.rtt * m.q;
      s.recupSamedis = (s.samedis + s.samedisDemi / 2) * PR.recupSamedi;
      s.recupFin18 = PR.joursFin18ParRecup > 0 ? s.fin18 / PR.joursFin18ParRecup : 0;
      s.recupReaUn = R1 && R1.joursParRecup > 0 ? s.reaUn / R1.joursParRecup : 0;
      s.recup = s.recupSamedis + s.recupFin18 + s.recupRea + s.recupReaUn;
      s.absences = s.conges + s.rtt + s.formation + s.recup + s.tp;   // jours ouvrés hors service (repos de sécurité à part)
      const absHB = s.conges + s.rtt + s.recupSamedis + s.recupReaUn + Math.max(s.recupFin18 - s.rc, 0);   // pris sur des jours HB (formation = jour travaillé ; récup. posées à part)
      s.heuresSansGarde = s.heuresJour - absHB * cfg.hb.heures;
      s.semainesPresence = m.q > 0 ? (nOpen - s.tp - absHB - s.rc - s.recupRea) / (5 * m.q) : 0;   // semaines calendaires de présence
      s.hSemSansGarde = s.semainesPresence ? s.heuresSansGarde / s.semainesPresence : 0;
      s.hSemAvecGarde = s.semainesPresence ? (s.heuresSansGarde + s.heuresGarde) / s.semainesPresence : 0;
      s.hSem52 = (s.heuresSansGarde + s.heuresGarde) / 52;
      s.semaineMax = Math.max(0, ...Object.values(s.semaines));
      s.ecartPlafond = s.hSemAvecGarde - PR.plafond;
      s.hbDisponible = s.hb - absHB - s.formation;                      // jours sans poste restant libres après les absences
      delete s.semaines;
      return s;
    });
    const sum = f => per.reduce((a, s) => a + f(s), 0);
    const etp = sum(s => s.q), etpGarde = sum(s => s.qg);
    const pleins = per.filter(s => s.q === 1 && s.qg > 0);
    const avg = (arr, f) => (arr.length ? arr.reduce((a, s) => a + f(s), 0) / arr.length : 0);
    const synthese = {
      nMar: P.length, etp, etpGarde, joursOuvres: nOuvres, joursBloc: nOpen, postesParJour: postes.length,
      gardesParAn: sum(s => s.gardes), demiGardes: sum(s => s.demi), demiWeekends: result.demiWeekends,
      gardesParEtpGarde: sum(s => s.gardes) / (etpGarde || 1),
      marDisponiblesParJour: sum(s => s.hbDisponible) / nOpen,
      hSemSansGarde: avg(pleins, s => s.hSemSansGarde), hSemAvecGarde: avg(pleins, s => s.hSemAvecGarde),
      hSem52: avg(pleins, s => s.hSem52), semaineMax: Math.max(...per.map(s => s.semaineMax)),
      marAuDessusPlafond: per.filter(s => s.ecartPlafond > 0).length, plafond: PR.plafond,
      materniteTotal: sum(s => s.mater),
      congesTotal: sum(s => s.conges), rttTotal: sum(s => s.rtt), formationTotal: sum(s => s.formation),
      recupSamedisTotal: sum(s => s.recupSamedis), recupFin18Total: sum(s => s.recupFin18), recupReaTotal: sum(s => s.recupRea), recupReaUnTotal: sum(s => s.recupReaUn), tpTotal: sum(s => s.tp),
      absencesTotal: sum(s => s.absences), absentsParJour: sum(s => s.absences) / nOpen,
      congesTempsPlein: PR.conges, recupTempsPlein: avg(pleins, s => s.recup),
    };
    synthese.appreciation = appreciation(synthese.marDisponiblesParJour);

    // Part financière
    const F = cfg.finance, valeurPart = F.parts > 0 ? F.ca / F.parts : 0;
    const auto = P.some(m => m.parts === undefined || m.parts === null || m.parts === '');
    const fixes = P.reduce((a, m) => a + (auto && (m.parts === undefined || m.parts === null || m.parts === '') ? 0 : +m.parts || 0), 0);
    const qAuto = P.reduce((a, m) => a + (m.parts === undefined || m.parts === null || m.parts === '' ? m.q : 0), 0);
    per.forEach((s, i) => {
      const m = P[i], isAuto = m.parts === undefined || m.parts === null || m.parts === '';
      s.parts = isAuto ? (qAuto ? Math.max(F.parts - fixes, 0) * m.q / qAuto : 0) : +m.parts || 0;
      s.partsAuto = isAuto;
      s.revenu = s.parts * valeurPart;
      const h = s.heuresSansGarde + s.heuresGarde;
      s.euroHeure = h > 0 ? s.revenu / h : 0;
      s.euroHeureHorsGarde = s.heuresSansGarde > 0 ? s.revenu / s.heuresSansGarde : 0;
      s.euroGarde = s.gardes + s.demi / 2 > 0 ? s.revenu / (s.gardes + s.demi / 2) : 0;
    });
    const partsAttribuees = per.reduce((a, s) => a + s.parts, 0);
    const pleinsFin = per.filter(s => s.q === 1 && s.qg > 0 && s.parts > 0);
    Object.assign(synthese, {
      ca: F.ca, nombreParts: F.parts, valeurPart, partsAttribuees,
      caParEtp: etp ? F.ca / etp : 0,
      revenuTempsPlein: avg(pleinsFin, s => s.revenu),
      euroHeure: avg(pleinsFin, s => s.euroHeure), euroHeureHorsGarde: avg(pleinsFin, s => s.euroHeureHorsGarde),
      caParHeureEquipe: F.ca / (sum(s => s.heuresSansGarde + s.heuresGarde) || 1),
    });
    Object.assign(synthese, consultIndic(cfg.consultations, open.map(j => dow(j.date)), F.ca),
      { consultationsAssurees: sum(s => s.consult) * cfg.consultations.parMarJour });

    // Jour par jour : MAR sans poste (ni bloc, réa, consultation, maternité, repos, TP, récupération posée),
    // moins les absences moyennes (congés, formation, récupérations) = MAR libres ; < 0 : absences impossibles à poser.
    const absMoy = (sum(s => s.hb) - sum(s => s.hbDisponible)) / nOpen;
    const parJour = {};
    jours.forEach(j => {
      if (j.statut !== 'Ouvert') return;
      const hb = P.reduce((a, m, i) => a + (activite(result, j, i).act === 'HB' ? 1 : 0), 0);
      parJour[j.date] = { hb, libres: hb - absMoy, consultations: (j.consultation || []).length * cfg.consultations.parMarJour };
    });
    const semaine = [0, 1, 2, 3, 4].map(d => {
      const l = jours.filter(j => parJour[j.date] && dow(j.date) === d).map(j => parJour[j.date]);
      const m = f => (l.length ? l.reduce((a, x) => a + f(x), 0) / l.length : 0);
      return { jour: JOURS[d], jours: l.length, hb: m(x => x.hb), libres: m(x => x.libres), consultations: m(x => x.consultations),
        joursNegatifs: l.filter(x => x.libres < 0).length };
    });
    // Récupération libérable : jours sans poste restant libres après absences, moins la réserve pour imprévus,
    // convertibles en jours de récupération supplémentaires (répartis au prorata de la quotité).
    const libresAn = sum(s => s.hbDisponible), reserve = (PR.reserveImprevus || 0) * nOpen;
    const liberable = Math.max(libresAn - reserve, 0);
    Object.assign(synthese, {
      joursLibresAn: libresAn, recupLiberableAn: liberable, recupLiberableParEtp: etp ? liberable / etp : 0,
      recupReglementaireTempsPlein: avg(pleins, s => s.recup),
      recupTotaleTempsPlein: avg(pleins, s => s.recup) + (etp ? liberable / etp : 0),
      recupReglementaireService: sum(s => s.recup), recupTotaleService: sum(s => s.recup) + liberable,   // jours / an, toute l'équipe
    });
    Object.assign(synthese, { absentsMoyensParJour: absMoy, parJourSemaine: semaine,
      joursNegatifs: Object.values(parJour).filter(x => x.libres < 0).length });
    return { parMar: per, synthese, parJour };
  }

  // Consultations : marMin MAR chaque jour ouvré, plus des jours à marMax pour couvrir le volume annuel,
  // répartis régulièrement sur l'année.
  function consultPlan(C, openDows) {
    const nOpen = openDows.length;
    const min = Math.max(0, Math.round(C.marMin)), max = Math.max(min, Math.round(C.marMax));
    const fixe = d => { const v = (C.parJourSemaine || [])[d]; return v === null || v === undefined || v === '' ? null : Math.max(0, Math.round(+v)); };
    const libres = openDows.map((d, t) => (fixe(d) === null ? t : -1)).filter(t => t >= 0);   // jours ajustables
    const fixes = openDows.reduce((a, d) => a + (fixe(d) === null ? 0 : fixe(d)), 0);
    const besoin = C.parMarJour > 0 ? Math.ceil(C.parAn / C.parMarJour) : 0;          // journées de MAR nécessaires
    const nL = libres.length;
    const extra = Math.min(Math.max(besoin - fixes - min * nL, 0), (max - min) * nL);
    const rang = {}; libres.forEach((t, r) => { rang[t] = r; });
    return {
      min, max, extra, joursMar: fixes + min * nL + extra,
      parJour: t => (fixe(openDows[t]) !== null ? fixe(openDows[t])
        : min + Math.floor((rang[t] + 1) * extra / nL) - Math.floor(rang[t] * extra / nL)),
    };
  }
  function consultIndic(C, openDows, ca) {
    const nOpen = openDows.length, plan = consultPlan(C, openDows), besoinJour = nOpen ? C.parAn / nOpen : 0;
    const marNec = C.parMarJour > 0 ? besoinJour / C.parMarJour : 0, marMoy = nOpen ? plan.joursMar / nOpen : 0;
    const cap = plan.joursMar * C.parMarJour;
    return {
      consultationsParAn: C.parAn, consultationsParJour: besoinJour,
      capaciteConsultJour: nOpen ? cap / nOpen : 0, capaciteConsultAn: cap, couvertureConsult: C.parAn ? cap / C.parAn : 0,
      marConsultMoyen: marMoy, joursConsultMax: plan.max > plan.min ? Math.round(plan.extra / (plan.max - plan.min)) : 0,
      marConsultNecessaires: marNec, margeConsult: marMoy - marNec,                     // en MAR par jour
      joursMarConsultation: plan.joursMar, heuresConsultation: plan.joursMar * C.heuresJour,
      caParConsultation: C.parAn ? ca / C.parAn : 0,
    };
  }

  // MAR libres par jour après bloc, réa, consultations, maternité, repos et absences moyennes
  const appreciation = x => (x < 0 ? 'Insuffisant' : x < 0.5 ? 'Tendu' : x < 1.5 ? 'Juste' : 'Confortable');

  // ── Contrôle des règles dures ──────────────────────────────
  function verify(result) {
    const { cfg, jours, postes, equipe: P } = result;
    const issues = [];
    const LONG = new Set(postes.map((p, i) => (p.fin18 ? i : -1)).filter(i => i >= 0));
    jours.forEach((j, k) => {
      const d = labelFR(j.date);
      if (j.garde.length !== cfg.gardes.parJour) issues.push(`${d} : ${j.garde.length} gardes`);
      if (new Set(j.garde).size !== j.garde.length) issues.push(`${d} : même MAR deux fois de garde`);
      if (j.statut === 'Ouvert') {
        const all = j.postes.concat(j.rea, j.maternite || [], j.consultation || [], j.recupRea || []).filter(x => x !== null);
        if (new Set(all).size !== all.length) issues.push(`${d} : un MAR a deux postes`);
        if (j.postes.includes(null)) issues.push(`${d} : poste de bloc sans MAR`);
        if (j.rea.length !== cfg.rea.nombre) issues.push(`${d} : ${j.rea.length} MAR en réa`);
        if (P.some(m => m.rea1) && j.rea.length && !P[j.rea[0]].rea1) issues.push(`${d} : Réa 1 hors du groupe dédié`);
        if ((j.consultation || []).length !== j.consultNb) issues.push(`${d} : ${(j.consultation || []).length} MAR en consultation`);
        const mat = cfg.maternite.actif && cfg.maternite.jours[dow(j.date)] ? cfg.maternite.nombre : 0;
        if ((j.maternite || []).length !== mat) issues.push(`${d} : ${(j.maternite || []).length} MAR à la maternité`);
        j.repos.forEach(i => { if (all.includes(i) || j.garde.includes(i)) issues.push(`${d} : repos de sécurité non respecté (${P[i].code})`); });
        j.tp.forEach(i => { if (all.includes(i) || j.garde.includes(i)) issues.push(`${d} : ${P[i].code} travaille un jour de temps partiel`); });
        P.forEach((m, i) => { const f = Array.isArray(m.joursFixes) && m.joursFixes.some(x => !x) ? m.joursFixes : null;
          if (f && !f[dow(j.date)] && (all.includes(i) || j.garde.includes(i))) issues.push(`${d} : ${m.code} travaille en dehors de ses jours fixes`); });
        (j.recup || []).forEach(i => { if (all.includes(i) || j.garde.includes(i) || j.tp.includes(i)) issues.push(`${d} : ${P[i].code} travaille un jour de récupération`); });
        j.postes.forEach((i, p) => { if (LONG.has(p) && j.garde.includes(i)) issues.push(`${d} : ${P[i].code} de garde au bloc long`); });
      }
      j.garde.forEach(i => {
        if (j.statut !== 'Ouvert' && !P[i].we) issues.push(`${d} : ${P[i].code} de garde un week-end / férié`);
        if (!(P[i].qg > 0)) issues.push(`${d} : ${P[i].code} de garde sans quotité de garde`);
        if (k && jours[k - 1].garde.includes(i)) issues.push(`${d} : ${P[i].code} de garde deux jours de suite`);
      });
    });
    return issues;
  }

  // ── Simulation analytique selon l'effectif (ETP) ───────────
  function simulateETP(result, etps) {
    const { cfg, jours, postes } = result;
    const G = cfg.gardes, PR = cfg.params;
    const open = jours.filter(j => j.statut === 'Ouvert');
    const nOpen = open.length, nOuvres = jours.filter(j => dow(j.date) < 5).length, nFeries = nOuvres - nOpen;
    const bloc = postes.length * nOpen, rea = cfg.rea.nombre * nOpen, repos = G.parJour * nOpen;
    const MAT = cfg.maternite;
    const mat = MAT.actif ? MAT.nombre * open.filter(j => MAT.jours[dow(j.date)]).length : 0;
    const gSem = G.parJour * nOpen, gWE = G.parJour * (jours.length - nOpen);
    const samedis = G.parJour * jours.filter(j => dow(j.date) === 5).length;
    const fin18 = postes.filter(p => p.fin18).length * nOpen;
    const recupRea = result.equipe.filter(m => m.rea1).length >= 2 && cfg.rea.nombre >= 2
      ? jours.reduce((a, j) => a + (j.recupRea || []).length, 0) : 0;   // récupérations du groupe Réa 1 (semaine en Réa 2)
    const hBloc = open.reduce((a, j) => a + postes.reduce((b, p) => b + p.heures[dow(j.date)], 0), 0);
    const CS = cfg.consultations, openDows = open.map(j => dow(j.date)), cons = consultPlan(CS, openDows).joursMar;
    const R1 = cfg.rea.reaUn && cfg.rea.reaUn.actif && result.equipe.some(m => m.rea1) ? cfg.rea.reaUn : null;
    const reaUn = R1 ? open.length : 0, recupReaUn = R1 && R1.joursParRecup > 0 ? reaUn / R1.joursParRecup : 0;
    const hRea = rea * cfg.rea.heures + reaUn * (R1 ? R1.heures - cfg.rea.heures : 0) + mat * MAT.heures + cons * CS.heuresJour, hGarde = gSem * G.heuresSemaine + gWE * G.heuresWE;
    return etps.map(N => {
      const recup = (samedis * PR.recupSamedi + fin18 / PR.joursFin18ParRecup + recupRea + recupReaUn) / N;
      const jt = nOuvres - nFeries - PR.conges - PR.rtt - PR.formation - recup;
      const reste = N * jt - (bloc + rea + mat + cons + repos);
      const hSans = (hBloc + hRea + (Math.max(reste, 0) + N * PR.formation) * cfg.hb.heures) / N;
      const sem = (jt + PR.formation) / 5;
      const r = {
        etp: N, recup, joursTravailles: jt, reste, marDisponiblesParJour: reste / nOpen,
        gardesParMar: (gSem + gWE) / N, gardeTousLes: jours.length / ((gSem + gWE) / N),
        hSemSansGarde: hSans / sem, hSemAvecGarde: (hSans + hGarde / N) / sem, hSem52: (hSans + hGarde / N) / 52,
      };
      r.ecartPlafond = r.hSemAvecGarde - PR.plafond;
      Object.assign(r, consultIndic(CS, openDows, cfg.finance.ca));
      // Charge réelle répartie : bloc, réa, consultations, maternité, formation et gardes
      // (les jours sans poste ne sont pas comptés comme travaillés).
      const hCharge = (hBloc + hRea + N * PR.formation * cfg.hb.heures) / N;
      r.hSemSansGardeCharge = hCharge / sem;
      r.hSemAvecGardeCharge = (hCharge + hGarde / N) / sem;
      r.ecartPlafondCharge = r.hSemAvecGardeCharge - PR.plafond;
      r.appreciation = appreciation(r.marDisponiblesParJour);
      return r;
    });
  }

  // ── Effectif nécessaire pour rester sous le plafond hebdomadaire (temps plein, gardes comprises) ──
  // charge : charge réelle répartie ; consultations : jours sans poste comptés comme travaillés.
  function etpPourPlafond(result) {
    const Ns = []; for (let n = 5; n <= 80.001; n += 0.1) Ns.push(Math.round(n * 10) / 10);
    const sim = simulateETP(result, Ns);
    const first = k => { const x = sim.find(r => r[k] <= result.cfg.params.plafond); return x ? x.etp : null; };
    return { charge: first('hSemAvecGardeCharge'), consultations: first('hSemAvecGarde') };
  }

  // ── Simulation financière : valeur de la part et revenu selon le CA et le nombre de parts ──
  // heures = heures annuelles d'un MAR temps plein (avec garde), pour le revenu horaire.
  function simulateFinance(caList, partsList, heures) {
    return caList.map(ca => partsList.map(n => {
      const part = n > 0 ? ca / n : 0;
      return { ca, parts: n, valeurPart: part, euroHeure: heures ? part / heures : 0 };
    }));
  }

  const api = { DEFAULT_CONFIG, JOURS, generate, verify, stats, simulateETP, simulateFinance, etpPourPlafond, activite, codeActivite, mergeConfig, addDays, dow, isoWeek, labelFR };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BlocMarEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
