/**
 * Generate publications.bib from publications_data/*.json
 * Usage: node scripts/generate-bib.js
 */

const fs = require('fs');
const path = require('path');
const { toBibtex } = require('./formatters');

const dataDir = path.join(__dirname, '../publications_data');
const outFile = path.join(__dirname, '../publications.bib');

const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
const pubs = files
  .map(f => JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf-8')))
  .sort((a, b) => b.year - a.year);

const output = pubs.map(toBibtex).join('\n\n');
fs.writeFileSync(outFile, output, 'utf-8');
console.log(`Wrote ${pubs.length} entr${pubs.length === 1 ? 'y' : 'ies'} to ${outFile}`);
