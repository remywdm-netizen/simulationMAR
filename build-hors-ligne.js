// Construit une version hors ligne de l'application : un seul fichier HTML, sans dépendance (moteur et
// bibliothèque Excel intégrés). Usage : node build-hors-ligne.js [sortie.html] [equipe.json]
// equipe.json (facultatif) : configuration exportée (« ⬇ Configuration ») dont l'équipe devient l'équipe par défaut
// du fichier produit. Ce fichier reste local : ne pas le publier s'il contient des noms.
const fs = require('fs'), path = require('path');
const dir = __dirname, sortie = process.argv[2] || path.join(dir, 'simulation-mar-hors-ligne.html'), equipe = process.argv[3];
const lire = f => fs.readFileSync(path.join(dir, f), 'utf8').replace(/<\/script/gi, '<\\/script');
let html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
let config = '';
if (equipe) {
  const c = JSON.parse(fs.readFileSync(equipe, 'utf8'));
  config = `\n<script>/* configuration par défaut de cette version hors ligne */\n(function(E, c){ Object.keys(c).forEach(k => { E.DEFAULT_CONFIG[k] = c[k]; }); })(window.BlocMarEngine, ${JSON.stringify(c).replace(/</g, '\\u003c')});\n</script>`;
}
const remplace = (balise, contenu) => { if (!html.includes(balise)) throw new Error('introuvable : ' + balise); html = html.replace(balise, () => contenu); };
remplace('<script src="lib/xlsx.full.min.js"></script>', '<script>\n' + lire('lib/xlsx.full.min.js') + '\n</script>');
remplace('<script src="bloc-mar-engine.js"></script>', '<script>\n' + lire('bloc-mar-engine.js') + '\n</script>' + config);
html = html.replace('<title>', '<title>(hors ligne) ');
fs.writeFileSync(sortie, html);
console.log(sortie, Math.round(fs.statSync(sortie).size / 1024) + ' Ko');
