#!/usr/bin/env node
/**
 * Interactive CLI to add a new publication to publications_data/
 * Usage: npm run add-pub
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

class Cancelled extends Error {}

function cancel() {
  console.log('\nCancelled. No file saved.');
  rl.close();
  process.exit(0);
}

rl.on('SIGINT', cancel);

function ask(question, defaultVal) {
  return new Promise(resolve => {
    const hint = defaultVal !== undefined ? ` [${defaultVal}]` : '';
    rl.question(`${question}${hint}: `, answer => {
      const trimmed = answer.trim();
      if (trimmed.toLowerCase() === 'cancel') cancel();
      resolve(trimmed || defaultVal || '');
    });
  });
}

function askRequired(question) {
  return new Promise(async resolve => {
    let answer = '';
    while (!answer) {
      answer = (await ask(question)).trim();
      if (!answer) console.log('  (required — or type "cancel" to quit)');
    }
    resolve(answer);
  });
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function toBibtexKey(family, year, title) {
  const firstWord = title.split(/\s+/).find(w => w.length > 3) || title.split(/\s+/)[0];
  const word = firstWord.replace(/[^a-zA-Z]/g, '');
  return `${family}${year}${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`;
}

function parseAuthors(input) {
  // Expects: "Blake John; Smith A.; Jones B." — semicolon separated
  // First token = family name, rest = given
  return input.split(';').map(a => {
    const parts = a.trim().split(/\s+/);
    return { family: parts[0], given: parts.slice(1).join(' ') };
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

async function main() {
  console.log('\n=== Add New Publication ===\n');
  console.log('Authors: enter as "Family Given; Family Given" (semicolon separated)');
  console.log('Press Enter to accept [defaults] where shown. Type "cancel" at any prompt to quit.\n');

  const title = await askRequired('Title');
  const year = await askRequired('Year');

  console.log(`\nType: ${TYPE_OPTIONS.map((t, i) => `${i + 1}) ${t}`).join('  ')}`);
  const typeIdx = await ask('Choose type (1-5)', '1');
  const type = TYPE_OPTIONS[parseInt(typeIdx) - 1] || 'misc';

  console.log(`\nStatus: ${STATUS_OPTIONS.map((s, i) => `${i + 1}) ${s}`).join('  ')}`);
  const statusIdx = await ask('Choose status (1-3)', '1');
  const status = STATUS_OPTIONS[parseInt(statusIdx) - 1] || 'under_review';

  const authorsRaw = await askRequired('Authors (Family Given; Family Given; ...)');
  const authors = parseAuthors(authorsRaw);

  // Mark self
  console.log('\nWhich author is you? (enter number, or 0 if none)');
  authors.forEach((a, i) => console.log(`  ${i + 1}) ${a.family}, ${a.given}`));
  const selfIdx = await ask('Self', '0');
  const selfNum = parseInt(selfIdx);
  if (selfNum > 0 && authors[selfNum - 1]) {
    authors[selfNum - 1].self = true;
    authors[selfNum - 1].given = 'John'; // full given name for self
  }

  const venue = await ask('Venue / journal / conference name', '');
  const doi = await ask('DOI (without https://doi.org/)', '');
  const pdf = await ask('PDF filename (e.g. blake2025title.pdf, leave blank if none)', '');
  const peerReviewed = await ask('Peer reviewed? (y/n)', 'y');

  // Auto-generate id and bibtex_key from first author family name
  const firstFamily = authors[0].family;
  const titleSlug = slugify(title.split(' ').slice(0, 4).join(' '));
  const id = `${firstFamily.toLowerCase()}${year}-${titleSlug}`;
  const bibtexKey = toBibtexKey(firstFamily, year, title);

  const pub = {
    id,
    bibtex_key: bibtexKey,
    type,
    pure_category: PURE_MAP[type],
    title,
    authors,
    year: parseInt(year),
    date: `${year}-01-01`,
    status,
    peer_reviewed: peerReviewed.toLowerCase() !== 'n',
    venue,
    doi,
    pdf: pdf ? `https://jb11.org/pdfs/${pdf}` : '',
    abstract: '',
    tags: []
  };

  // Remove empty string fields (except abstract/tags)
  if (!pub.doi) delete pub.doi;
  if (!pub.pdf) delete pub.pdf;
  if (!pub.venue) delete pub.venue;

  const filename = `${year}-${firstFamily.toLowerCase()}-${titleSlug}.json`;
  const outPath = path.join(__dirname, '..', 'publications_data', filename);

  console.log('\n--- Preview ---');
  console.log(JSON.stringify(pub, null, 2));
  console.log(`\nFile: publications_data/${filename}`);

  const confirm = await ask('\nSave? (y/n)', 'y');
  if (confirm.toLowerCase() === 'y') {
    fs.writeFileSync(outPath, JSON.stringify(pub, null, 2) + '\n');
    console.log(`\nSaved! Now run: npm run build && npm start`);
  } else {
    console.log('Cancelled.');
  }

  rl.close();
}

main().catch(err => { console.error(err); rl.close(); });
