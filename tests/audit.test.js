// Audit des données : chaque chiffre recalculé indépendamment à partir du tableau de service.
// Lancer : node --test tests/*.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../bloc-mar-engine.js');
test('audit complet des données (organisation par défaut)', () => {
const r = E.generate(), c = r.cfg, S = r.stats, s = S.synthese, P = r.equipe, PM = S.parMar;
const out = []; let ko = 0;
const chk = (lab, ok, det = '') => { out.push(`${ok ? 'OK ' : 'KO '} ${lab}${det ? ' — ' + det : ''}`); if (!ok) ko++; };
const near = (a, b, t = 1e-6) => Math.abs(a - b) <= t;
const open = r.jours.filter(j => j.statut === 'Ouvert'), nO = open.length;
const dow = E.dow;
// 1. Calendrier
const cnt = [0,0,0,0,0]; open.forEach(j => cnt[dow(j.date)]++);
chk('Jours ouvrés par jour de semaine = Amplitudes (48,52,50,50,51)', cnt.join() === '48,52,50,50,51', cnt.join());
chk('13 fériés Monaco 2027', Object.keys(c.feries).length === 13);
chk('365 jours', r.jours.length === 365);
// 2. Effectifs quotidiens
let e2 = [];
r.jours.forEach((j, k) => {
  if (j.garde.length !== 2) e2.push(j.date + ' gardes');
  const prev = k ? r.jours[k-1].garde : [];
  if (j.repos.slice().sort().join() !== prev.slice().sort().join()) e2.push(j.date + ' repos ≠ gardes veille');
  if (j.statut === 'Ouvert') {
    if (j.postes.length !== 8 || j.postes.includes(null)) e2.push(j.date + ' postes');
    if (j.rea.length !== 3) e2.push(j.date + ' réa');
    if (j.consultation.length !== (dow(j.date) === 2 ? 2 : j.consultNb)) e2.push(j.date + ' consult');
    if (dow(j.date) === 2 && j.consultation.length !== 2) e2.push(j.date + ' mercredi ≠ 2');
    const all = [...j.postes, ...j.rea, ...j.consultation, ...j.maternite, ...(j.recup||[]), ...j.recupRea, ...j.tp, ...j.repos];
    if (new Set(all).size !== all.length) e2.push(j.date + ' double affectation');
    j.garde.forEach(i => { if ([5,6,7].includes(j.postes.indexOf(i))) e2.push(j.date + ' garde au bloc long'); });
  } else j.garde.forEach(i => { if (!P[i].we) e2.push(j.date + ' garde WE interdite ' + P[i].code); });
  j.garde.forEach(i => { if (!(P[i].qg > 0)) e2.push(j.date + ' garde sans quotité'); });
});
chk('Chaque jour : 2 gardes, repos = gardes de la veille, 8 postes, 3 réa, consultations, aucune double affectation', !e2.length, e2.slice(0,3).join(' ; '));
// écart minimal entre gardes
let gapMin = 99; P.forEach((m,i) => { const ks = r.jours.map((j,k)=>j.garde.includes(i)?k:-1).filter(k=>k>=0); for (let t=1;t<ks.length;t++) gapMin=Math.min(gapMin,ks[t]-ks[t-1]); });
chk('Écart minimal entre deux gardes ≥ 5 jours', gapMin >= 5, 'min ' + gapMin);
// réa par semaines entières, sans repos dans la semaine
let reaKo = 0; const wk = {}; open.forEach(j => { const m = E.addDays(j.date, -dow(j.date)); const v = [j.rea[0], j.recupRea.length ? j.recupRea[0] : j.rea[1], j.rea[2]].join(); if (wk[m] && wk[m] !== v) reaKo++; wk[m] = v; });
chk('Réa par semaines entières', !reaKo, reaKo + ' ruptures');
// demi-gardes
const dj = r.jours.filter(j => j.demi.length);
chk('Demi-gardes : samedi/dimanche par paires, une nuit seule chacune', dj.length % 2 === 0 && dj.every(j => ['Samedi','Dimanche'].includes(j.jour) && j.nuit.length === j.demi.length && j.nuit.every(i => j.garde.includes(i))), dj.length + ' jours');
// 3. Volumes
const sum = f => PM.reduce((a,m)=>a+f(m),0);
chk('Σ bloc = 8 × 251', sum(m=>m.bloc) === 8*nO, sum(m=>m.bloc));
chk('Σ réa = 3 × 251', sum(m=>m.rea) === 3*nO, sum(m=>m.rea));
chk('Σ consultations = 520 journées (13 000 / 25)', sum(m=>m.consult) === Math.ceil(13000/25), sum(m=>m.consult));
chk('Capacité ≥ 13 000', s.capaciteConsultAn >= 13000 && s.capaciteConsultAn === sum(m=>m.consult)*25, s.capaciteConsultAn);
chk('Σ gardes = 730', sum(m=>m.gardes) === 730);
chk('Σ gardes WE/fériés = 2 × 114', sum(m=>m.gardesWE) === 228, sum(m=>m.gardesWE));
chk('Demi-gardes = nuits seules', sum(m=>m.demi) === sum(m=>m.nuits), sum(m=>m.demi)+' / '+sum(m=>m.nuits));
chk('Σ repos jours ouvrés = 2 × 251', sum(m=>m.repos) === 2*nO, sum(m=>m.repos));
// 4. Partition des jours ouvrés par MAR
let part = PM.filter(m => m.bloc+m.rea+m.consult+m.mater+m.repos+m.tp+m.rc+m.recupRea+m.hb !== nO).map(m=>m.code);
chk('Par MAR : bloc+réa+consult+mater+repos+TP+récupérations posées+sans poste = 251', !part.length, part.join());
// 5. Heures recalculées
let hk = [];
P.forEach((m, i) => {
  let hj = 0, hg = 0;
  r.jours.forEach(j => {
    const a = E.activite(r, j, i), d = dow(j.date);
    if (a.act[0] === 'P') { const p = r.postes[+a.act.slice(1)]; hj += p.heures[d] - (a.garde === 'G16' ? p.apres16 : 0); }
    else if (a.act === 'REA') hj += c.rea.heures - (a.garde === 'G16' ? c.rea.apres16 : 0);
    else if (a.act === 'CS') hj += c.consultations.heuresJour;
    else if (a.act === 'MAT') hj += c.maternite.heures;
    else if (a.act === 'HB') hj += c.hb.heures;
    hg += { G16: 16, G24: 24, GN: 12, DJ: 12, '': 0 }[a.garde];
  });
  if (!near(hj, PM[i].heuresJour, 1e-6) || !near(hg, PM[i].heuresGarde, 1e-6)) hk.push(m.code);
});
chk('Heures de jour et de garde recalculées = page', !hk.length, hk.join());
chk('Σ heures de garde = 502×16 + 216×24 + 12×12 (nuits) + 12×12 (demi)', near(sum(m=>m.heuresGarde), 502*16 + (228-12)*24 + 12*12 + 12*12), String(sum(m=>m.heuresGarde)));
// 6. Absences
let ab = [];
PM.forEach((m, i) => {
  const q = P[i].q;
  if (!near(m.conges, 32*q) || !near(m.formation, 10*q)) ab.push(m.code + ' congés/formation');
  if (!near(m.recupSamedis, m.samedis + m.samedisDemi/2)) ab.push(m.code + ' récup samedis');
  if (!near(m.recupFin18, m.fin18/4)) ab.push(m.code + ' récup 18h');
  const absHB = m.conges + m.rtt + m.recupSamedis + Math.max(m.recupFin18 - m.rc, 0);
  if (!near(m.hbDisponible, m.hb - absHB - m.formation)) ab.push(m.code + ' jours libres');
  if (!near(m.absences, m.conges + m.rtt + m.formation + m.recup + m.tp)) ab.push(m.code + ' total');
  if (Math.abs(m.tp - (1-q)*nO) > 3) ab.push(m.code + ' TP ' + m.tp);
});
chk('Absences par MAR (congés 32q, formation 10q, récupérations, TP ≈ (1−q)×251)', !ab.length, ab.slice(0,4).join(' ; '));
chk('Σ samedis de garde (½ demi) = 104', near(sum(m=>m.samedis + m.samedisDemi/2), 104), String(sum(m=>m.samedis + m.samedisDemi/2)));
chk('Σ jours finis à 18h = 3 × 251', sum(m=>m.fin18) === 3*nO);
// 7. Indicateurs de synthèse
chk('ETP = Σ quotités = 21,1', near(s.etp, 21.1, 1e-9));
chk('ETP de garde = 19,8', near(s.etpGarde, 19.8, 1e-9));
chk('MAR libres / jour = Σ jours libres / 251', near(s.marDisponiblesParJour, sum(m=>m.hbDisponible)/nO));
chk('Moyenne journalière des libres = indicateur annuel', near(Object.values(S.parJour).reduce((a,x)=>a+x.libres,0)/nO, s.marDisponiblesParJour, 1e-6));
chk('Libérable = Σ libres − 0,5 × 251', near(s.recupLiberableAn, Math.max(sum(m=>m.hbDisponible) - 0.5*nO, 0)));
chk('Récupération service = Σ récup + libérable', near(s.recupTotaleService, sum(m=>m.recup) + s.recupLiberableAn));
chk('Valeur de la part = 1 200 000 / 15', s.valeurPart === 80000);
chk('Σ parts = 15 et Σ revenus = CA', near(sum(m=>m.parts), 15) && near(sum(m=>m.revenu), 1200000, 1e-3));
const pl = PM.filter(m => m.q === 1 && m.qg > 0);
chk('h/sem avec garde = moyenne des temps pleins', near(s.hSemAvecGarde, pl.reduce((a,m)=>a+m.hSemAvecGarde,0)/pl.length));
// 8. Équité
const rng = (f, g) => { const v = PM.filter(g).map(f); return [Math.min(...v), Math.max(...v)]; };
const gq = rng(m => m.gardes / m.qg, m => m.qg > 0), bq = rng(m => (m.bloc + m.rea) / m.q, m => m.q > 0), rq = rng(m => m.rea / m.q, m => m.q >= 0.5 && !P[PM.indexOf(m)].rea1 && !P[PM.indexOf(m)].joursFixes), cq = rng(m => m.consult / m.q, m => m.q > 0);
chk('Gardes / quotité de garde homogènes (écart ≤ 2)', gq[1] - gq[0] <= 2, gq.map(x=>x.toFixed(1)).join(' à '));
chk('(Bloc + réa) / quotité homogène (écart ≤ 8)', bq[1] - bq[0] <= 8, bq.map(x=>x.toFixed(1)).join(' à '));
chk('Réa / quotité hors groupe Réa 1 et jours fixes (écart ≤ 12)', rq[1] - rq[0] <= 12, rq.map(x=>x.toFixed(1)).join(' à '));
chk('Consultations / quotité (écart ≤ 4)', cq[1] - cq[0] <= 4, cq.map(x=>x.toFixed(1)).join(' à '));
// Réa 1 : groupe dédié, rotation par semaines entières
const g1 = P.map((m, i) => i).filter(i => P[i].rea1);
const sem = {}; open.forEach(j => { sem[E.addDays(j.date, -dow(j.date))] = j.rea[0]; });
const r1 = Object.values(sem);
chk('Réa 1 assurée par le groupe dédié (5 MAR), semaines entières', g1.length === 5 && r1.every(i => g1.includes(i)) && open.every(j => !j.rea.slice(2).some(i => g1.includes(i))));
const ws = {}; open.forEach(j => { (ws[E.addDays(j.date, -dow(j.date))] ||= []).push(j); }); const wl = Object.values(ws);
let r2ko = 0; wl.forEach((w, n) => { if (!n) return; const p1 = wl[n-1][0].rea[0]; w.forEach(j => { if ((j.recupRea.length ? j.recupRea[0] : j.rea[1]) !== p1) r2ko++; }); });
chk('Réa 2 = MAR de la Réa 1 de la semaine précédente (2 semaines enchaînées)', !r2ko, r2ko + ' écarts');
chk('Pas de jour de récupération propre au groupe Réa 1', PM.every(m => m.recupRea === 0) && open.every(j => j.rea.length === 3));
const parG = g1.map(i => r1.filter(x => x === i).length);
chk('Réa 1 : rotation équilibrée dans le groupe', Math.max(...parG) - Math.min(...parG) <= 1, parG.join(' / ') + ' semaines');
// Jours fixes : le MAR à 0,6 travaille lundi, mardi, mercredi
const jf = P.map((m, i) => i).filter(i => P[i].joursFixes);
chk('Jours fixes respectés (aucun poste ni garde hors jours travaillés, pas de réa)', jf.length === 1 && jf.every(i => open.every(j => {
  const a = E.activite(r, j, i).act, d = dow(j.date);
  return P[i].joursFixes[d] ? a !== 'TP' : a === 'TP' && !j.garde.includes(i);
}) && PM[i].rea === 0), jf.map(i => P[i].code).join());
// 9. Analytique vs planning
const sim = E.simulateETP(r, [s.etp])[0];
chk('Simulation ETP (21,1) ≈ planning : MAR libres / jour', near(sim.marDisponiblesParJour, s.marDisponiblesParJour, 0.15), sim.marDisponiblesParJour.toFixed(2) + ' / ' + s.marDisponiblesParJour.toFixed(2));
chk('Simulation ETP (21,1) ≈ planning : h/sem avec garde', near(sim.hSemAvecGarde, s.hSemAvecGarde, 1.5), sim.hSemAvecGarde.toFixed(1) + ' / ' + s.hSemAvecGarde.toFixed(1));
// 10. Points d'attention
const neg = PM.filter(m => m.hbDisponible < 0).map(m => m.code + ' ' + m.hbDisponible.toFixed(1));
chk('Chaque MAR a assez de jours sans poste pour ses absences', !neg.length, neg.join(' ; '));
chk('Règles du moteur (verify) et avertissements', !E.verify(r).length && !r.warnings.length, E.verify(r).length + ' / ' + r.warnings.length);
  assert.equal(ko, 0, out.filter(l => l.startsWith('KO')).join('\n'));
});
