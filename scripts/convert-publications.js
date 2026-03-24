/**
 * One-time conversion: parse source-publications.html → publications_data/*.json
 * Run: node scripts/convert-publications.js
 */

const fs   = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const htmlFile  = path.join(__dirname, 'source-publications.html');
const outputDir = path.join(__dirname, '../publications_data');

// ── Delete placeholder files ──────────────────────────────────────────────────
fs.readdirSync(outputDir)
  .filter(f => f.includes('placeholder'))
  .forEach(f => { fs.unlinkSync(path.join(outputDir, f)); console.log('Deleted:', f); });

const html = fs.readFileSync(htmlFile, 'utf-8');
const $ = cheerio.load(html);

// ── Helpers ───────────────────────────────────────────────────────────────────

const STOPWORDS = new Set(['a','an','the','of','in','for','and','to','with','on',
  'at','by','from','through','using','via','as','or','is','are','be','its','this','that']);

function makeSlug(text, n = 3) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w))
    .slice(0, n)
    .join('-');
}

function camelCase(id) {
  return id.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

function parseAuthors(str) {
  const result = [];
  // Matches: "FamilyName[optional space+word], I." or "I.I."
  const re = /([A-Z][A-Za-z\u00C0-\u024F\-]+(?:\s[A-Z][A-Za-z\u00C0-\u024F\-]+)*),\s*([A-Z]\.(?:[A-Z]\.)*)/g;
  let m;
  while ((m = re.exec(str)) !== null) {
    const family = m[1].trim();
    const given  = family === 'Blake' ? 'John' : m[2].trim();
    const author = { family, given };
    if (family === 'Blake') author.self = true;
    result.push(author);
  }
  // Safety: if Blake not found but text mentions Blake, append
  if (!result.some(a => a.family === 'Blake') && /Blake/.test(str)) {
    result.push({ family: 'Blake', given: 'John', self: true });
  }
  return result;
}

function determineType(liHtml, liText) {
  if (liHtml.includes('pink_journal_icon')) return 'journal';

  // Misc: these take priority before conference/chapter checks
  if (/\[Ph\.D\. Dissertation\]/.test(liText))                          return 'misc';
  if (/Newspaper column/.test(liText))                                   return 'misc';
  if (/\bNewsletter\b/.test(liText))                                     return 'misc';
  if (/Extended abstract in|Extended abstract/i.test(liText))           return 'misc';
  if (/Working papers of/.test(liText))                                  return 'misc';
  // Small journal-like publications without volume/issue elsewhere
  if (/\bThe Word,\s*\d/.test(liText))                                   return 'misc';
  if (/\bEnglish Teaching Professional,\s*\d/.test(liText))             return 'misc';
  if (/AsiaCALL Online Journal.*\bAbstracts\b/i.test(liText))           return 'misc';
  if (/Abstracts of the 17th Asia Association/.test(liText))            return 'misc';

  // Books (edited PanSIG volumes + Ming Pao books)
  if (/PanSIG Journal/.test(liText) && /\(Eds\.\)/.test(liText))        return 'book';
  if (/Get a Job and Succeed|Daily Life in Hong Kong/.test(liText))     return 'book';

  // Book chapters: has an editor, OR is in a Lecture Notes / IGI / named book
  if (/\(Eds?\.\)/.test(liText) && /\bIn\b/.test(liText))               return 'book_chapter';
  if (/Lecture Notes/.test(liText))                                      return 'book_chapter';
  if (/Hershey, PA:\s*IGI Global/.test(liText))                         return 'book_chapter';
  if (/Frontiers in Artificial Intelligence/.test(liText))               return 'book_chapter';

  // Conferences
  if (/Proceedings|Conference proceedings|Proceeding\s/i.test(liText))  return 'conference';

  return 'conference'; // default
}

const PURE_MAP = {
  journal:      'contribution_to_journal_article',
  conference:   'contribution_to_conference',
  book_chapter: 'contribution_to_book',
  book:         'book',
  misc:         'other',
};

const usedIds = new Set();
function uniqueId(base) {
  base = base.replace(/[^a-z0-9\-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
  let id = base, i = 2;
  while (usedIds.has(id)) id = `${base}-${i++}`;
  usedIds.add(id);
  return id;
}

const MONTH_MAP = { January:'01',February:'02',March:'03',April:'04',May:'05',
  June:'06',July:'07',August:'08',September:'09',October:'10',November:'11',December:'12' };

// ── Main loop ─────────────────────────────────────────────────────────────────

const STATUSES = ['under_review', 'in_press', 'published'];
let total = 0;

$('ol').each((sectionIdx, ol) => {
  const status = STATUSES[sectionIdx] || 'published';

  $(ol).find('> li').each((j, liEl) => {
    const liHtml = $(liEl).html() || '';
    const liText = $(liEl).text().replace(/\s+/g, ' ').trim();
    if (liText.length < 20) return;

    // ── Extract links ──────────────────────────────────────────────────────
    let doi = null, pdf = null, url = null;
    $(liEl).find('a[href]').each((k, a) => {
      const href = $(a).attr('href') || '';
      const txt  = $(a).text().toLowerCase().trim();
      if (!href) return;
      if (/doi\.org\//.test(href)) {
        if (!doi) doi = href.replace(/https?:\/\/(?:dx\.)?doi\.org\//, '').trim();
      } else if (txt === 'pdf' || href.toLowerCase().endsWith('.pdf')) {
        if (!pdf) pdf = href.startsWith('pdfs/') ? '/' + href : href;
      } else if (href.length > 4 && !href.startsWith('papers/') && !href.startsWith('/papers/')) {
        if (!url) url = href;
      }
    });

    // ── Year / date ────────────────────────────────────────────────────────
    const yearMatch  = liText.match(/\((?:(?:\w+)\s+)?(\d{4})\)/);
    const year       = yearMatch ? parseInt(yearMatch[1]) : 2026;
    const monthMatch = liText.match(/\((January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\)/);
    const month      = monthMatch ? MONTH_MAP[monthMatch[1]] : '01';
    const date       = `${year}-${month}-01`;

    // ── Split author string vs rest ────────────────────────────────────────
    const splitRe   = /\s*\((?:(?:\w+\s+)?\d{4}|under review)\)\.\s*/;
    const parts     = liText.split(splitRe);
    const authorStr = parts[0] || '';
    const rest      = (parts[1] || liText).trim();

    // ── Title: first sentence of rest ─────────────────────────────────────
    // Ends before ". Uppercase", " [", or end
    const titleRaw = rest.split(/\.\s+(?=[A-Z\[\(])/)[0];
    const title    = titleRaw.replace(/\.$/, '').trim();

    // ── Type & authors ─────────────────────────────────────────────────────
    const pubType = determineType(liHtml, liText);
    const authors = parseAuthors(authorStr);
    const firstFam = (authors[0]?.family || 'unknown').toLowerCase().replace(/[^a-z]/g, '');

    // ── ID ─────────────────────────────────────────────────────────────────
    const id         = uniqueId(`${firstFam}${year}-${makeSlug(title)}`);
    const bibtex_key = camelCase(id);

    // ── Venue / structure parsing ──────────────────────────────────────────
    const afterTitle = rest.slice(title.length).replace(/^\.\s*/, '').trim();
    let venue = null, booktitle = null, editor = null, publisher = null;
    let volume = null, issue = null, pages = null;

    // Pages
    const pgMatch = afterTitle.match(/\(pp\.\s*([\d]+[–\-]+[\d]+|[\d]+\s*[-–]+\s*[\d]+|[\d,]+)\)/) ||
                    afterTitle.match(/,\s*([\d]+(?:[–\-]+[\d]+)?)\s*\./);
    if (pgMatch) pages = pgMatch[1].replace(/\s/g, '');

    if (pubType === 'journal') {
      const jm = afterTitle.match(/^([^,\.]+)/);
      if (jm) venue = jm[1].trim();
      const vm = afterTitle.match(/[,\s](\d+)\s*[\(\s,]/);
      if (vm) volume = vm[1];
      const im = afterTitle.match(/\((\d+(?:-\d+)?)\)/);
      if (im) issue = im[1];
      const pm = afterTitle.match(/,\s*([\d]+[–\-–]+[\d]+)/);
      if (pm && !pages) pages = pm[1];

    } else if (pubType === 'conference') {
      const pm = afterTitle.match(/(Proceedings[^.]+|Conference proceedings[^.]+)/i);
      venue = pm ? pm[1].replace(/\s*\(pp\..*/, '').trim() : afterTitle.split(/\.\s+[A-Z]/)[0].trim();
      const pubm = afterTitle.match(/\b(IEEE(?:\s+Xplore)?|ACM|Springer|IATED|JALT|ACL|AAAI|Atlantic Press|Asia-Pacific Society|Research-publishing\.net|IOS Press)\b/);
      if (pubm) publisher = pubm[1];

    } else if (pubType === 'book_chapter') {
      const em = afterTitle.match(/In\s+([^(]+?)\s*\(Eds?\.\)/i);
      if (em) editor = em[1].replace(/^\s*[:,]\s*/, '').trim();
      const btm = afterTitle.match(/(?:In\s+[^,]+\s*\(Eds?\.\)[,.]?\s*)([A-Z][^.]{10,}?)(?:\s*\(pp\.|\s*\(Vol\.|\s*\.\s*[A-Z][a-z]|\s*,\s*Vol\.)/);
      if (btm) booktitle = btm[1].trim();
      const pubm = afterTitle.match(/\b(Springer(?:\s+\w+)?|IGI Global|Routledge|Palgrave\s*McMillan|IOS Press|Academic Press|Elsevier|WAC Clearinghouse|Research-publishing\.net|Labcom Publications|IATED|IEEE|ACM|Atlantic Press|Asia-Pacific Society|Springer Nature)\b/);
      if (pubm) publisher = pubm[1];

    } else if (pubType === 'book') {
      const pubm = afterTitle.match(/(Ming Pao Publishing|JALT)/);
      if (pubm) publisher = pubm[1];

    } else {
      // misc
      const vm = afterTitle.split('.')[0].trim();
      if (vm.length > 2) venue = vm;
    }

    // peer_reviewed
    const peer_reviewed = ['journal', 'conference', 'book_chapter'].includes(pubType) &&
      !/Extended abstract|Working papers|Newsletter|The Word,|OnCUE,|PeerSpectives,|English Teaching Professional|AsiaCALL Online|Abstracts of the 17th/.test(liText);

    // ── Build and write ────────────────────────────────────────────────────
    const pub = { id, bibtex_key, type: pubType, pure_category: PURE_MAP[pubType],
      title, authors, year, date, status, peer_reviewed };
    if (venue)     pub.venue     = venue;
    if (booktitle) pub.booktitle = booktitle;
    if (editor)    pub.editor    = editor;
    if (volume)    pub.volume    = volume;
    if (issue)     pub.issue     = issue;
    if (pages)     pub.pages     = pages;
    if (publisher) pub.publisher = publisher;
    if (doi)       pub.doi       = doi;
    if (url)       pub.url       = url;
    if (pdf)       pub.pdf       = pdf;
    pub.abstract = '';
    pub.tags     = [];

    const fname = `${year}-${firstFam}-${makeSlug(title, 3)}.json`.replace(/[^a-z0-9\-\.]/g, '');
    fs.writeFileSync(path.join(outputDir, fname), JSON.stringify(pub, null, 2), 'utf-8');
    total++;
    console.log(`[${total}] ${fname}`);
  });
});

console.log(`\n✓ ${total} publications written to publications_data/`);
