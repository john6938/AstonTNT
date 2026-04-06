const fs = require('fs');
const path = require('path');
const { toAPA7, toBibtex } = require('../../scripts/formatters');

module.exports = function() {
  const dir = path.join(__dirname, '../../publications_data');

  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

  const pubs = files.map(f => {
    const pub = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'));
    pub.bibtexStr = toBibtex(pub);
    pub.apa7 = toAPA7(pub);
    return pub;
  });

  // Newest first (treat missing/empty dates as oldest)
  pubs.sort((a, b) => {
    const da = a.date ? new Date(a.date) : new Date(0);
    const db = b.date ? new Date(b.date) : new Date(0);
    return db - da;
  });

  return pubs;
};
