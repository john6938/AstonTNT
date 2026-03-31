#!/usr/bin/env node
/**
 * Interactive CLI to edit an existing publication in publications_data/
 * Usage: npm run edit-pub
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'publications_data');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function cancel() {
  console.log('\nCancelled. No changes saved.');
  rl.close();
  process.exit(0);
}

rl.on('SIGINT', cancel);

function ask(question, defaultVal) {
  return new Promise(resolve => {
    const hint = defaultVal !== undefined && defaultVal !== '' ? ` [${defaultVal}]` : '';
    rl.question(`${question}${hint}: `, answer => {
      const trimmed = answer.trim();
      if (trimmed.toLowerCase() === 'cancel') cancel();
      resolve(trimmed || defaultVal || '');
    });
  });
}

// Ask but allow clearing a field with "-"
function askField(label, current) {
  return new Promise(resolve => {
    const hint = current ? ` [${current}]` : ' [blank]';
    rl.question(`${label}${hint}: `, answer => {
      const trimmed = answer.trim();
      if (trimmed.toLowerCase() === 'cancel') cancel();
      if (trimmed === '-') resolve('');          // "-" clears the field
      else if (trimmed === '') resolve(current); // Enter keeps current
      else resolve(trimmed);
    });
  });
}

function loadAll() {
  return fs.readdirSync(DATA_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
        return { file: f, data };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function search(pubs, query) {
  const q = query.toLowerCase();
  return pubs.filter(({ data }) => {
    const titleMatch = data.title && data.title.toLowerCase().includes(q);
    const authorMatch = data.authors && data.authors.some(a =>
      `${a.family} ${a.given}`.toLowerCase().includes(q)
    );
    const yearMatch = String(data.year) === q;
    return titleMatch || authorMatch || yearMatch;
  });
}

const TYPE_OPTIONS = ['journal', 'conference', 'book_chapter', 'book', 'misc'];
const STATUS_OPTIONS = ['under_review', 'in_press', 'published'];
const PURE_MAP = {
  journal: 'journal_article',
  conference: 'contribution_to_conference',
  book_chapter: 'contribution_to_book_anthology',
  book: 'book',
  misc: 'other'
};

function parseAuthors(input) {
  return input.split(';').map(a => {
    const parts = a.trim().split(/\s+/);
    return { family: parts[0], given: parts.slice(1).join(' ') };
  });
}

async function editAuthors(authors) {
  const current = authors.map(a => `${a.family} ${a.given}`).join('; ');
  console.log(`\nCurrent authors: ${current}`);
  console.log('Enter all authors as "Family Given; Family Given" to replace, or press Enter to keep.');

  const input = await askField('Authors', '');
  if (!input) return authors;

  const newAuthors = parseAuthors(input);

  console.log('Which author is you? (enter number, or 0 if none)');
  newAuthors.forEach((a, i) => console.log(`  ${i + 1}) ${a.family}, ${a.given}`));
  const selfIdx = parseInt(await ask('Self', '0'));
  if (selfIdx > 0 && newAuthors[selfIdx - 1]) {
    newAuthors[selfIdx - 1].self = true;
    newAuthors[selfIdx - 1].given = 'John';
  }

  return newAuthors;
}

async function editPublication(entry) {
  const { file, data } = entry;
  const pub = JSON.parse(JSON.stringify(data)); // deep copy

  console.log(`\n--- Editing: ${pub.title} (${pub.year}) ---`);
  console.log('Press Enter to keep current value. Type "-" to clear a field. Type "cancel" to quit.\n');

  pub.title = await askField('Title', pub.title);
  pub.year = parseInt(await askField('Year', String(pub.year)));
  pub.date = `${pub.year}-01-01`;

  console.log(`\nType: ${TYPE_OPTIONS.map((t, i) => `${i + 1}) ${t}`).join('  ')}`);
  const currentTypeIdx = TYPE_OPTIONS.indexOf(pub.type) + 1;
  const typeIdx = await ask(`Choose type (1-5)`, String(currentTypeIdx));
  pub.type = TYPE_OPTIONS[parseInt(typeIdx) - 1] || pub.type;
  pub.pure_category = PURE_MAP[pub.type];

  console.log(`\nStatus: ${STATUS_OPTIONS.map((s, i) => `${i + 1}) ${s}`).join('  ')}`);
  const currentStatusIdx = STATUS_OPTIONS.indexOf(pub.status) + 1;
  const statusIdx = await ask(`Choose status (1-3)`, String(currentStatusIdx));
  pub.status = STATUS_OPTIONS[parseInt(statusIdx) - 1] || pub.status;

  pub.authors = await editAuthors(pub.authors);

  pub.venue = await askField('Venue / journal / conference', pub.venue || '');
  if (!pub.venue) delete pub.venue;

  pub.doi = await askField('DOI (without https://doi.org/)', pub.doi || '');
  if (!pub.doi) delete pub.doi;

  const currentPdf = pub.pdf ? pub.pdf.replace('https://jb11.org/pdfs/', '') : '';
  const newPdf = await askField('PDF filename (e.g. blake2025title.pdf)', currentPdf);
  pub.pdf = newPdf ? `https://jb11.org/pdfs/${newPdf}` : undefined;
  if (!pub.pdf) delete pub.pdf;

  pub.url = await askField('URL (non-DOI link)', pub.url || '');
  if (!pub.url) delete pub.url;

  pub.editor = await askField('Editor(s)', pub.editor || '');
  if (!pub.editor) delete pub.editor;

  pub.publisher = await askField('Publisher', pub.publisher || '');
  if (!pub.publisher) delete pub.publisher;

  pub.pages = await askField('Pages (e.g. 123-145)', pub.pages || '');
  if (!pub.pages) delete pub.pages;

  pub.volume = await askField('Volume', pub.volume || '');
  if (!pub.volume) delete pub.volume;

  pub.number = await askField('Issue / number', pub.number || '');
  if (!pub.number) delete pub.number;

  const pr = await askField('Peer reviewed? (y/n)', pub.peer_reviewed ? 'y' : 'n');
  pub.peer_reviewed = pr.toLowerCase() !== 'n';

  const currentAbstract = pub.abstract || '';
  console.log(`\nAbstract${currentAbstract ? ` [current: ${currentAbstract.slice(0, 80)}...]` : ' [blank]'}`);
  console.log('Paste abstract text and press Enter (or press Enter to keep current, "-" to clear):');
  pub.abstract = await askField('Abstract', currentAbstract);
  if (!pub.abstract) delete pub.abstract;

  console.log('\n--- Preview ---');
  console.log(JSON.stringify(pub, null, 2));
  console.log(`\nFile: publications_data/${file}`);

  const confirm = await ask('\nSave? (y/n)', 'y');
  if (confirm.toLowerCase() === 'y') {
    fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(pub, null, 2) + '\n');
    console.log(`\nSaved! Now run: npm run build && npm start`);
  } else {
    console.log('Cancelled. No changes saved.');
  }
}

async function main() {
  console.log('\n=== Edit Publication ===\n');
  console.log('Search by title keywords, author name, or year. Type "cancel" at any prompt to quit.\n');

  const pubs = loadAll();

  let results = [];
  while (results.length === 0) {
    const query = await ask('Search');
    if (!query) continue;
    results = search(pubs, query);
    if (results.length === 0) console.log('  No matches found. Try again.');
  }

  if (results.length === 1) {
    console.log(`\nFound: ${results[0].data.title} (${results[0].data.year})`);
    const confirm = await ask('Edit this? (y/n)', 'y');
    if (confirm.toLowerCase() !== 'y') cancel();
    await editPublication(results[0]);
  } else {
    console.log(`\nFound ${results.length} matches:`);
    results.slice(0, 20).forEach((r, i) => {
      console.log(`  ${i + 1}) ${r.data.title} (${r.data.year})`);
    });
    if (results.length > 20) console.log(`  ... and ${results.length - 20} more. Refine your search.`);

    const idx = await ask('Choose number to edit (or refine search by typing again)');
    const num = parseInt(idx);
    if (num > 0 && num <= results.length) {
      await editPublication(results[num - 1]);
    } else {
      console.log('Invalid selection. Please restart and refine your search.');
    }
  }

  rl.close();
}

main().catch(err => { console.error(err); rl.close(); });
