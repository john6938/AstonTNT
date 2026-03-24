/**
 * Shared publication formatters used by:
 *   - src/_data/publications.js  (build-time, attaches strings to each pub)
 *   - scripts/generate-bib.js    (CLI export)
 */

// ── Author helpers ────────────────────────────────────────────────────────────

function formatAuthorsAPA(authors) {
  if (!authors || !authors.length) return '';
  const names = authors.map(a => `${a.family}, ${a.given.charAt(0)}.`);
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]}, & ${names[1]}`;
  return names.slice(0, -1).join(', ') + ', & ' + names[names.length - 1];
}

function formatAuthorsBib(authors) {
  return authors.map(a => `${a.family}, ${a.given}`).join(' and ');
}

// Reverse "Johnson, M." → "M. Johnson" (for APA7 editor display)
// Handles "Johnson, M. and Davis, P." → "M. Johnson & P. Davis"
function editorForAPA(editorStr) {
  if (!editorStr) return '';
  const names = editorStr.split(' and ').map(e => {
    const parts = e.trim().split(',').map(s => s.trim());
    return parts.length >= 2 ? `${parts[1]} ${parts[0]}` : e.trim();
  });
  const label = names.length > 1 ? 'Eds.' : 'Ed.';
  const joined = names.length === 1
    ? names[0]
    : names.length === 2
      ? `${names[0]} & ${names[1]}`
      : names.slice(0, -1).join(', ') + ' & ' + names[names.length - 1];
  return `${joined} (${label}), `;
}

function formatPagesBib(pages) {
  // Ensure LaTeX en-dash style: 33–51 → 33--51
  return String(pages).replace('–', '--').replace(/(?<!-)-(?!-)/, '--');
}

// ── APA7 ──────────────────────────────────────────────────────────────────────
// Returns an HTML string (use | safe in Nunjucks).

function toAPA7(pub) {
  const au = formatAuthorsAPA(pub.authors);
  const yr = pub.year;

  let doi = '';
  if (pub.doi) {
    doi = ` <a href="https://doi.org/${pub.doi}" class="pub-doi-link" target="_blank" rel="noopener">https://doi.org/${pub.doi}</a>`;
  } else if (pub.url) {
    doi = ` <a href="${pub.url}" class="pub-doi-link" target="_blank" rel="noopener">${pub.url}</a>`;
  }

  if (pub.type === 'journal') {
    let s = `${au} (${yr}). ${pub.title}. <em>${pub.venue}</em>`;
    if (pub.volume) {
      s += `, <em>${pub.volume}</em>`;
      if (pub.issue) s += `(${pub.issue})`;
      if (pub.pages) s += `, ${pub.pages}`;
    }
    return s + '.' + doi;
  }

  if (pub.type === 'conference') {
    let s = `${au} (${yr}). ${pub.title}. In <em>${pub.venue}</em>`;
    if (pub.pages) s += ` (pp. ${pub.pages})`;
    if (pub.publisher) s += `. ${pub.publisher}`;
    return s + '.' + doi;
  }

  if (pub.type === 'book_chapter') {
    const ed = pub.editor ? `In ${editorForAPA(pub.editor)}` : 'In ';
    let s = `${au} (${yr}). ${pub.title}. ${ed}<em>${pub.booktitle}</em>`;
    if (pub.pages) s += ` (pp. ${pub.pages})`;
    if (pub.publisher) s += `. ${pub.publisher}`;
    return s + '.' + doi;
  }

  if (pub.type === 'book') {
    let s = `${au} (${yr}). <em>${pub.title}</em>`;
    if (pub.publisher) s += `. ${pub.publisher}`;
    return s + '.' + doi;
  }

  // misc / default
  let s = `${au} (${yr}). ${pub.title}`;
  if (pub.venue) s += `. <em>${pub.venue}</em>`;
  return s + '.' + doi;
}

// ── BibTeX ────────────────────────────────────────────────────────────────────

const bibTypeMap = {
  journal:     'article',
  conference:  'inproceedings',
  book_chapter:'incollection',
  book:        'book',
  misc:        'misc'
};

function toBibtex(pub) {
  const entryType = bibTypeMap[pub.type] || 'misc';
  const lines = [];

  const field = (key, val) => {
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      lines.push(`  ${key} = {${val}}`);
    }
  };

  field('author', formatAuthorsBib(pub.authors));
  field('title', pub.title);
  field('year', pub.year);

  if (pub.type === 'journal') {
    field('journal', pub.venue);
    field('volume', pub.volume);
    field('number', pub.issue);
    if (pub.pages) field('pages', formatPagesBib(pub.pages));
    field('publisher', pub.publisher);
  } else if (pub.type === 'conference') {
    field('booktitle', pub.venue);
    if (pub.pages) field('pages', formatPagesBib(pub.pages));
    field('publisher', pub.publisher);
  } else if (pub.type === 'book_chapter') {
    field('booktitle', pub.booktitle);
    field('editor', pub.editor);
    if (pub.pages) field('pages', formatPagesBib(pub.pages));
    field('publisher', pub.publisher);
  } else if (pub.type === 'book') {
    field('publisher', pub.publisher);
  } else {
    field('howpublished', pub.venue);
    field('url', pub.url);
  }

  if (pub.doi) field('doi', pub.doi);

  return `@${entryType}{${pub.bibtex_key},\n${lines.join(',\n')}\n}`;
}

module.exports = { toAPA7, toBibtex };
