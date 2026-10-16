// Tests du moteur de simulation des MAR au bloc.
// Lancer : node --test tests/*.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../bloc-mar-engine.js');

const R = E.generate();
const S = R.stats;
const idx = code => R.equipe.findIndex(m => m.code === code);

test('aucune règle dure violée', () => {
  assert.deepEqual(E.verify(R), []);
  assert.deepEqual(R.warnings, []);
});

test('chaque jour ouvré : 8 postes, 3 réa, 2 gardes', () => {
  R.jours.forEach(j => {
    assert.equal(j.garde.length, 2, j.date);
    if (j.statut === 'Ouvert') {
      assert.equal(j.postes.filter(x => x !== null).length, 8, j.date);
      assert.equal(j.rea.length, 3, j.date);
    }
  });
});

test('fériés de Monaco : bloc fermé', () => {
  ['2027-01-27', '2027-11-19', '2027-12-08'].forEach(d => {
    const j = R.jours.find(x => x.date === d);
    assert.equal(j.statut, 'Férié'); assert.equal(j.postes, null);
  });
  assert.equal(S.synthese.joursBloc, 251);
});

test('réanimation par semaines entières', () => {
  const byWeek = {};
  R.jours.filter(j => j.statut === 'Ouvert').forEach(j => {
    const k = E.addDays(j.date, -E.dow(j.date));
    const v = j.rea.slice().sort().join(',');
    if (byWeek[k]) assert.equal(byWeek[k], v, j.date); else byWeek[k] = v;
  });
});

test('pas de garde de WE (MAR 01) et quotité de garde 0 (MAR 04, MAR 05)', () => {
  R.jours.forEach(j => {
    if (j.statut !== 'Ouvert') assert.ok(!j.garde.includes(idx('MAR 01')), j.date);
    assert.ok(!j.garde.includes(idx('MAR 04')) && !j.garde.includes(idx('MAR 05')), j.date);
  });
});

test('gardes au prorata de la quotité de garde', () => {
  S.parMar.filter(m => m.qg > 0).forEach(m => {
    assert.ok(Math.abs(m.gardes / m.qg - 730 / S.synthese.etpGarde) <= 1.5, `${m.code} : ${m.gardes}`);
  });
});

test('demi-gardes de WE : jour samedi + dimanche, nuit seule pour le MAR de garde', () => {
  const mb = idx('MAR 05');
  const jours = R.jours.filter(j => j.demi.includes(mb));
  assert.ok(jours.length >= 2 && jours.length % 2 === 0);
  jours.forEach(j => {
    assert.ok(['Samedi', 'Dimanche'].includes(j.jour), j.date);
    assert.equal(j.nuit.length, 1);
    assert.ok(j.garde.includes(j.nuit[0]));
  });
  assert.equal(S.parMar[mb].demi, jours.length);
  assert.equal(S.parMar[mb].gardes, 0);
});

test('temps partiel : jours TP au prorata', () => {
  S.parMar.filter(m => m.q < 1).forEach(m => {
    assert.ok(Math.abs(m.tp - (1 - m.q) * 251) <= 5, `${m.code} : ${m.tp}`);
  });
});

test('simulation ETP : plus d\'ETP, plus de MAR disponibles et moins d\'heures', () => {
  const sim = E.simulateETP(R, [18, 20, 24]);
  assert.ok(sim[0].marDisponiblesParJour < sim[1].marDisponiblesParJour);
  assert.ok(sim[1].marDisponiblesParJour < sim[2].marDisponiblesParJour);
  assert.ok(sim[0].hSemAvecGarde > sim[2].hSemAvecGarde);
  assert.equal(sim[1].marDisponiblesParJour.toFixed(1), '0.4');                 // 20 ETP : marge faible
});

test('configuration modifiée : 1 garde par jour, pas de demi-gardes', () => {
  const cfg = E.mergeConfig();
  cfg.gardes.parJour = 1;
  cfg.equipe.forEach(m => { m.demiWE = false; });
  const r = E.generate(cfg);
  assert.deepEqual(E.verify(r), []);
  assert.equal(r.stats.synthese.gardesParAn, 365);
  assert.equal(r.stats.synthese.demiGardes, 0);
});

test('part financière : CA 1 200 000 € et 15 parts', () => {
  const s = S.synthese;
  assert.equal(s.valeurPart, 80000);
  assert.ok(Math.abs(s.partsAttribuees - 15) < 1e-9);                       // parts au prorata de la quotité
  const tp = S.parMar.find(m => m.q === 0.5);
  const plein = S.parMar.find(m => m.q === 1);
  assert.ok(Math.abs(tp.revenu - plein.revenu / 2) < 1e-6);
  const cfg = E.mergeConfig();
  cfg.finance = { ca: 1500000, parts: 12 };
  cfg.equipe.forEach((m, i) => { m.parts = i < 12 ? 1 : 0; });
  const r = E.generate(cfg);
  assert.equal(r.stats.synthese.valeurPart, 125000);
  assert.equal(r.stats.parMar[0].revenu, 125000);
  assert.equal(r.stats.parMar[20].revenu, 0);
  const g = E.simulateFinance([1200000, 1320000], [15, 16], 2000);
  assert.equal(g[0][0].valeurPart, 80000);
  assert.equal(g[1][1].valeurPart, 82500);
  assert.equal(g[0][0].euroHeure, 40);
});

test('absences : congés, formation, récupérations et temps partiel par MAR', () => {
  S.parMar.forEach(m => {
    assert.ok(Math.abs(m.conges - 32 * m.q) < 1e-9);
    assert.ok(Math.abs(m.formation - 10 * m.q) < 1e-9);
    assert.ok(Math.abs(m.recup - (m.recupSamedis + m.recupFin18)) < 1e-9);
    assert.ok(Math.abs(m.absences - (m.conges + m.rtt + m.formation + m.recup + m.tp)) < 1e-9);
  });
  const s = S.synthese;
  assert.ok(Math.abs(s.absencesTotal - S.parMar.reduce((a, m) => a + m.absences, 0)) < 1e-6);
});

test('demi-garde du samedi : demi-récupération (jour et nuit seule)', () => {
  const mb = S.parMar.find(m => m.demi > 0);
  assert.equal(mb.samedis, 0);
  assert.equal(mb.recupSamedis, mb.samedisDemi / 2);
  const nuits = S.parMar.reduce((a, m) => a + m.samedisDemi, 0);
  assert.equal(nuits, 2 * mb.samedisDemi);                                  // un jour + une nuit seule par samedi partagé
  S.parMar.forEach(m => assert.equal(m.recupSamedis, m.samedis + m.samedisDemi / 2));
});

test('maternité : 1 MAR détaché en journée, hors bloc et hors réa', () => {
  const cfg = E.mergeConfig();
  cfg.maternite.actif = true;
  cfg.maternite.jours = [true, true, false, true, true];                   // pas le mercredi
  cfg.equipe[3].mater = false;
  const r = E.generate(cfg);
  assert.deepEqual(E.verify(r), []);
  r.jours.filter(j => j.statut === 'Ouvert').forEach(j => {
    assert.equal(j.maternite.length, j.jour === 'Mercredi' ? 0 : 1, j.date);
    j.maternite.forEach(i => {
      assert.ok(!j.postes.includes(i) && !j.rea.includes(i) && !j.repos.includes(i) && !j.tp.includes(i));
      assert.notEqual(i, 3);
    });
  });
  const s = r.stats.synthese;
  assert.equal(s.materniteTotal, r.jours.filter(j => j.statut === 'Ouvert' && j.jour !== 'Mercredi').length);
  assert.ok(s.marDisponiblesParJour < S.synthese.marDisponiblesParJour);
  assert.equal(S.synthese.materniteTotal, 0);                              // option désactivée par défaut
});

test('effectif pour 48 h : charge répartie', () => {
  const s = S.synthese;
  assert.ok(s.etpPlafondCharge > 21.1 && s.etpPlafondCharge <= 23, String(s.etpPlafondCharge));
  assert.ok(s.etpPlafondConsult > 25, String(s.etpPlafondConsult));
  const sim = E.simulateETP(R, [s.etpPlafondCharge - 0.1, s.etpPlafondCharge]);
  assert.ok(sim[0].hSemAvecGardeCharge > 48 && sim[1].hSemAvecGardeCharge <= 48);
  const cfg = E.mergeConfig(); cfg.maternite.actif = true;
  assert.ok(E.generate(cfg).stats.synthese.etpPlafondCharge > s.etpPlafondCharge);
});

test('récupération 18h posée dans la semaine de bloc', () => {
  const cfg = E.mergeConfig(); cfg.params.recupDansSemaineBloc = true;
  const r = E.generate(cfg);
  assert.deepEqual(E.verify(r), []);
  const P = r.stats.parMar;
  P.forEach(m => { assert.ok(m.rc <= m.recupFin18 + 1e-9 && m.rc >= Math.floor(m.recupFin18) - 1, `${m.code} ${m.rc}/${m.recupFin18}`); });
  r.jours.forEach(j => (j.recup || []).forEach(i => {
    assert.ok(!j.postes.includes(i) && !j.garde.includes(i) && !j.rea.includes(i));
  }));
  assert.ok(Math.abs(r.stats.synthese.marDisponiblesParJour - S.synthese.marDisponiblesParJour) < 0.05);
  assert.equal(S.parMar.reduce((a, m) => a + m.rc, 0), 0);                  // option désactivée par défaut
});


test('consultations : 2 ou 3 MAR par jour, ajustés aux 13 000 consultations', () => {
  const s = S.synthese, open = R.jours.filter(j => j.statut === 'Ouvert');
  open.forEach(j => {
    assert.ok([2, 3].includes(j.consultation.length), j.date);
    assert.equal(j.consultation.length, j.consultNb);
    j.consultation.forEach(i => assert.ok(!j.postes.includes(i) && !j.rea.includes(i) && !j.repos.includes(i) && !j.tp.includes(i)));
  });
  const jm = open.reduce((a, j) => a + j.consultation.length, 0);
  assert.equal(jm, Math.ceil(13000 / 25));                                    // 520 journées de MAR
  assert.equal(open.filter(j => j.consultNb === 3).length, 520 - 2 * 251);
  assert.equal(s.capaciteConsultAn, 13000);
  assert.ok(s.couvertureConsult >= 1);
  const plein = S.parMar.find(m => m.q === 1 && m.qg === 1), demi = S.parMar.find(m => m.q === 0.5);
  assert.ok(Math.abs(demi.consult - plein.consult / 2) <= 2, `${demi.consult} / ${plein.consult}`);
  const cj = Object.values(S.parJour);
  assert.equal(cj.length, 251);
  assert.ok(Math.abs(cj.reduce((a, x) => a + x.libres, 0) / 251 - s.marDisponiblesParJour) < 0.05);
  const cfg = E.mergeConfig(); cfg.consultations.marMin = 3;                   // 3 MAR tous les jours
  const r3 = E.generate(cfg);
  assert.deepEqual(E.verify(r3), []);
  assert.equal(r3.stats.synthese.capaciteConsultAn, 75 * 251);
});
