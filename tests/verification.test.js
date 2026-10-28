// Vérification indépendante : temps de travail recalculé depuis le planning jour par jour, et projection
const test = require('node:test'), assert = require('node:assert');
const E = require('../bloc-mar-engine.js');
let ok = 0, ko = [];
const chk = (lab, cond, info = '') => { if (cond) ok++; else ko.push(lab + (info ? ' : ' + info : '')); };
const near = (a, b, e = 0.05) => Math.abs(a - b) <= e;

function verifTemps(cfg, lab) {
  const r = E.generate(cfg), c = r.cfg, G = c.gardes, PR = c.params, S = r.stats;
  const open = r.jours.filter(j => j.statut === 'Ouvert').length;
  r.equipe.forEach((m, i) => {
    let hj = 0, hg = 0, fin18 = 0, sam = 0, samD = 0, dim = 0, dimD = 0, tp = 0, rc = 0;
    r.jours.forEach(j => {
      const a = E.activite(r, j, i), d = E.dow(j.date);
      if (a.act[0] === 'P') { const p = r.postes[+a.act.slice(1)]; hj += p.heures[d] - (a.garde === 'G16' ? p.apres16 || 0 : 0); if (p.fin18) fin18++; }
      else if (a.act === 'REA') { const R1 = c.rea.reaUn && c.rea.reaUn.actif && r.equipe.some(x => x.rea1) && j.rea[0] === i; hj += R1 ? c.rea.reaUn.heures - (a.garde === 'G16' ? c.rea.reaUn.apres16 : 0) : c.rea.heures - (a.garde === 'G16' ? c.rea.apres16 : 0); }
      else if (a.act === 'CS') hj += c.consultations.heuresJour;
      else if (a.act === 'MAT') hj += c.maternite.heures - (a.garde === 'G16' ? c.maternite.apres16 || 0 : 0);
      else if (a.act === 'HB') hj += c.hb.heures;
      else if (a.act === 'TP') tp++;
      else if (a.act === 'RC') rc++;
      if (a.garde === 'DJ') { hg += G.heuresDemiJour; if (d === 5) samD++; if (d === 6) dimD++; }
      else if (a.garde) { hg += { G16: G.heuresSemaine, G24: G.heuresWE, GN: G.heuresNuit }[a.garde]; if (d === 5) (a.garde === 'GN' ? samD++ : sam++); if (d === 6) (a.garde === 'GN' ? dimD++ : dim++); }
    });
    const s = S.parMar[i], q = m.q;
    chk(`${lab} ${m.code} heures de journée`, near(hj, s.heuresJour, 1e-6), hj + ' / ' + s.heuresJour);
    chk(`${lab} ${m.code} heures de garde`, near(hg, s.heuresGarde, 1e-6), hg + ' / ' + s.heuresGarde);
    chk(`${lab} ${m.code} jours finis à 18h`, fin18 === s.fin18);
    // récupérations : samedis (½ demi), dimanches, 18h, réa 1
    const n18 = m.joursFin18ParRecup != null ? +m.joursFin18ParRecup : PR.joursFin18ParRecup;
    const rs = (sam + samD / 2) * PR.recupSamedi, rd = (dim + dimD / 2) * (PR.recupDimanche || 0), r18 = n18 > 0 ? fin18 / n18 : 0;
    chk(`${lab} ${m.code} récupérations`, near(rs + rd + r18 + s.recupRea + s.recupReaUn, s.recup, 1e-6), (rs + rd + r18) + ' / ' + s.recup);
    if (!(q > 0)) return;
    // temps de travail : journées − récupérations × 8 h
    const recupHB = rs + rd + s.recupReaUn + Math.max(r18 - rc, 0);
    const hSans = hj - recupHB * c.hb.heures;                          // congés et formation : 8 h (jour sans poste conservé) ; récupérations : 0 h
    const sem = (open - tp) / (5 * q);                                 // semaines de l'année hors fériés et jours de TP
    chk(`${lab} ${m.code} heures hors garde`, near(hSans, s.heuresSansGarde, 1e-6), hSans + ' / ' + s.heuresSansGarde);
    chk(`${lab} ${m.code} semaines`, near(sem, s.semainesPresence, 1e-6));
    chk(`${lab} ${m.code} h/sem avec garde`, near((hSans + hg) / sem, s.hSemAvecGarde, 1e-6));
    // jours : bloc + réa + cs + mat + repos + HB + TP + RC (+ RR) = jours ouvrés
    const tot = s.bloc + s.rea + s.consult + s.mater + s.repos + s.hb + s.tp + s.rc + s.recupRea;
    chk(`${lab} ${m.code} jours ouvrés`, tot === open, tot + ' / ' + open);
    chk(`${lab} ${m.code} libérables ≥ 0`, s.hbDisponible > -1, String(s.hbDisponible));
  });
  chk(`${lab} vérification du planning`, E.verify(r).length === 0, E.verify(r).slice(0, 3).join(' ; '));
  return r;
}

const base = E.mergeConfig();
verifTemps(base, 'défaut');
const v2 = E.mergeConfig(); v2.params.recupDimanche = 1; v2.consultations.suivi.actif = true; v2.gardes.nuitsEnchainees = true; verifTemps(v2, 'options');

// Projection
const pj = (f, ys = [2027, 2032, 2038, 2045, 2050]) => {
  const c = E.mergeConfig(); f && f(c); const out = [];
  for (const demi of [false, true]) { const h = null;   // sans rotation des fêtes : même planning que la régénération ci-dessous
    for (let y = c.annee; y <= c.projection.fin; y++) { const p = E.projectionAnnee(c, y, demi, h, true); if (ys.includes(y)) out.push([c, y, demi, p]); } }
  return out;
};
const scen = { défaut: null, demiGroupees: c => { c.projection.demiUnJour = false; c.gardes.nuitsEnchainees = true; },
  gardes50: c => { c.projection.gardesApresPct = 50; c.projection.plafondWE60 = 6; },
  leviers: c => { Object.assign(c.projection, { reductionQ60: 20, surplusGardeJeunes: 10, exterieurSemaine: 60, exterieurWE: 30, quotite18h60: 200, recup18h60: 8, plafondJoursWE60: 12 }); } };
for (const [nom, f] of Object.entries(scen)) {
  for (const [c, y, demi, p] of pj(f)) {
    const lab = `projection ${nom} ${y}${demi ? ' ½' : ''}`;
    const eq = E.equipeAnnee(c, y, demi), r = E.generate(Object.assign({}, c, { equipe: eq }), true);
    chk(lab + ' planning valide', E.verify(r).length === 0 && p.alertes === 0, E.verify(r).slice(0, 2).join(';') + ' alertes ' + p.alertes);
    // vieillissement, retraite, fin des gardes
    eq.forEach(m => {
      if (m.naissance && !m.exterieur && !m.recrue) {
        chk(lab + ' âge', m.age === y - m.naissance);
        chk(lab + ' retraite', m.age < c.projection.ageRetraite, m.code);
        if (m.plus60 !== undefined) chk(lab + ' 60 ans', !!m.plus60 === (m.age >= c.projection.ageFinGardes), m.code);
        if (m.plus60 && m.demiWE && !m.qg) {} else if (m.plus60) chk(lab + ' pas de demi si gardes', !(m.qg > 0 && m.demiWE), m.code);
      }
    });
    chk(lab + ' effectif constant', p.effectif === base.equipe.length + eq.filter(m => m.recrue).length, String(p.effectif));
    // gardes : total 730, extérieurs au quota
    const totG = r.stats.parMar.reduce((a, m) => a + m.gardes, 0);
    chk(lab + ' 730 gardes', totG === 730, String(totG));
    if (c.projection.exterieurSemaine) chk(lab + ' quota extérieurs', p.gardesExterieures === c.projection.exterieurSemaine + c.projection.exterieurWE && p.gardesExterieuresWE === c.projection.exterieurWE, p.gardesExterieures + '/' + p.gardesExterieuresWE);
    // indicateurs de groupe recalculés depuis les membres
    const M = r.stats.parMar.map((m, i) => ({ m, e: eq[i] })).filter(x => x.m.q > 0 && !x.e.exterieur);
    for (const [g, L] of [['moins', M.filter(x => !x.e.plus60)], ['plus', M.filter(x => x.e.plus60)]]) {
      const q = L.reduce((a, x) => a + x.m.q, 0); if (!q) continue;
      const G = p.groupes[g];
      chk(`${lab} ${g} gardes / ETP`, near(L.reduce((a, x) => a + x.m.gardes, 0) / q, G.gardes, 1e-9));
      chk(`${lab} ${g} h/sem ETP`, near(L.reduce((a, x) => a + x.m.hSemAvecGarde, 0) / q, G.hAvec, 1e-9));
      chk(`${lab} ${g} n`, G.n === L.length);
    }
    // plafonds des 60 ans et plus
    eq.forEach((m, i) => { if (!m.plus60) return;
      const we = r.jours.filter(j => E.dow(j.date) >= 5 && (j.garde.includes(i) || j.demi.includes(i)));
      if (m.maxWE) chk(lab + ' plafond WE', new Set(we.map(j => E.addDays(j.date, -E.dow(j.date)))).size <= m.maxWE, m.code);
      if (m.maxJoursWE) chk(lab + ' plafond jours WE', we.length <= m.maxJoursWE, m.code + ' ' + we.length);
      if (m.demiUnJour) { const d = r.jours.filter(j => E.dow(j.date) >= 5 && j.demi.includes(i)); chk(lab + ' un jour par WE', new Set(d.map(j => E.addDays(j.date, -E.dow(j.date)))).size === d.length, m.code); }
    });
    // temps plein < 60 : moyenne des gardes
    const tp = M.filter(x => !x.e.plus60 && x.m.q === 1 && x.m.qg >= 1);
    chk(lab + ' gardes temps plein', near(tp.reduce((a, x) => a + x.m.gardes, 0) / tp.length, p.gardesTempsPlein, 1e-9));
  }
}
// fêtes : règle de saison sur 2027-2050
{ const c = E.mergeConfig(); c.projection.demi60 = true; const h = {}; let prev = null;
  for (let y = 2027; y <= 2050; y++) { const p = E.projectionAnnee(c, y, true, h, true);
    const noel = Object.values(p.noel).flat().concat(Object.values(p.noelDemi).flat()), na31 = p.nouvelAn['2027-12-31'].concat(p.nouvelAnDemi['2027-12-31']);
    chk('fêtes ' + y + ' Noël ≠ 31', !noel.some(x => na31.includes(x)));
    const j1 = p.nouvelAn['2027-01-01'].concat(p.nouvelAnDemi['2027-01-01']);
    if (prev) chk('fêtes ' + y + ' 1er janv. ≠ Noël précédent', !j1.some(x => prev.includes(x)), j1 + ' / ' + prev);
    chk('fêtes ' + y + ' 4 jours × 2 gardes', Object.values(p.noel).every(l => l.length === 2) && Object.values(p.nouvelAn).every(l => l.length === 2));
    prev = noel; } }
test('vérification indépendante du temps de travail et de la projection', () => { assert.deepEqual(ko, []); assert.ok(ok > 3000, String(ok)); });
