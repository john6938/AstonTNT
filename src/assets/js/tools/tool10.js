// tool10.js — Reported Speech Converter
// Transforms direct speech into reported speech with tense backshift.
// Uses compromise.js (loaded globally) plus an irregular verb lookup table.

'use strict';

// ── Irregular verbs: infinitive → past participle ────────────────────────
const IRREGULAR = {
  arise:'arisen', awake:'awoken', be:'been', bear:'borne', beat:'beaten',
  become:'become', begin:'begun', bend:'bent', bet:'bet', bind:'bound',
  bite:'bitten', bleed:'bled', blow:'blown', break:'broken', breed:'bred',
  bring:'brought', build:'built', burn:'burnt', buy:'bought', catch:'caught',
  choose:'chosen', come:'come', cost:'cost', cut:'cut', deal:'dealt',
  dig:'dug', do:'done', draw:'drawn', dream:'dreamt', drink:'drunk',
  drive:'driven', eat:'eaten', fall:'fallen', feed:'fed', feel:'felt',
  fight:'fought', find:'found', flee:'fled', fly:'flown', forbid:'forbidden',
  forget:'forgotten', forgive:'forgiven', freeze:'frozen', get:'got',
  give:'given', go:'gone', grow:'grown', hang:'hung', have:'had',
  hear:'heard', hide:'hidden', hit:'hit', hold:'held', hurt:'hurt',
  keep:'kept', know:'known', lay:'laid', lead:'led', leave:'left',
  lend:'lent', let:'let', lie:'lain', lose:'lost', make:'made',
  mean:'meant', meet:'met', pay:'paid', put:'put', quit:'quit',
  read:'read', ride:'ridden', ring:'rung', rise:'risen', run:'run',
  say:'said', see:'seen', seek:'sought', sell:'sold', send:'sent',
  set:'set', shake:'shaken', shine:'shone', shoot:'shot', show:'shown',
  shrink:'shrunk', shut:'shut', sing:'sung', sink:'sunk', sit:'sat',
  sleep:'slept', slide:'slid', speak:'spoken', spend:'spent', spin:'spun',
  spread:'spread', stand:'stood', steal:'stolen', stick:'stuck',
  sting:'stung', strike:'struck', strive:'striven', swear:'sworn',
  sweep:'swept', swim:'swum', swing:'swung', take:'taken', teach:'taught',
  tear:'torn', tell:'told', think:'thought', throw:'thrown',
  understand:'understood', wake:'woken', wear:'worn', win:'won',
  wind:'wound', write:'written'
};

// ── Time expression map ──────────────────────────────────────────────────
const TIME_MAP = [
  [/\bnow\b/gi,           'then'],
  [/\btoday\b/gi,         'that day'],
  [/\btonight\b/gi,       'that night'],
  [/\byesterday\b/gi,     'the day before'],
  [/\btomorrow\b/gi,      'the following day'],
  [/\bhere\b/gi,          'there'],
  [/\bthis\b/gi,          'that'],
  [/\bthese\b/gi,         'those'],
  [/\blast week\b/gi,     'the previous week'],
  [/\bnext week\b/gi,     'the following week'],
  [/\blast year\b/gi,     'the previous year'],
  [/\bnext year\b/gi,     'the following year'],
  [/\bago\b/gi,           'before'],
];

// ── Pronoun map (first person → second person) ───────────────────────────
const PRONOUN_MAP = [
  [/\bI'm\b/gi,    "you're"],
  [/\bI've\b/gi,   "you've"],
  [/\bI'll\b/gi,   "you'll"],
  [/\bI'd\b/gi,    "you'd"],
  [/\bI\b/g,       'you'],
  [/\bme\b/gi,     'you'],
  [/\bmy\b/gi,     'your'],
  [/\bmine\b/gi,   'yours'],
  [/\bmyself\b/gi, 'yourself'],
  [/\bwe\b/gi,     'you'],
  [/\bour\b/gi,    'your'],
  [/\bus\b/gi,     'you'],
];

// ── Modal backshift map ──────────────────────────────────────────────────
const MODAL_BACKSHIFT = {
  'will':   'would',
  'can':    'could',
  'may':    'might',
  'shall':  'would',
  'must':   'had to',
};

// ── Past participle lookup ───────────────────────────────────────────────
function getPastParticiple(infinitive) {
  const key = infinitive.toLowerCase().trim();
  if (IRREGULAR[key]) return IRREGULAR[key];
  // Regular verb: past = past participle
  if (key.endsWith('e'))  return key + 'd';
  if (key.endsWith('y') && !/[aeiou]y$/.test(key)) return key.slice(0,-1) + 'ied';
  // Consonant doubling heuristic (one syllable, CVC pattern)
  if (/^[a-z]+[^aeiou][aeiou][^aeioux]$/.test(key)) return key + key.slice(-1) + 'ed';
  return key + 'ed';
}

// ── Main transform function ──────────────────────────────────────────────
function convertToReported() {
  const inputEl  = document.getElementById('textInput');
  const outputEl = document.getElementById('output');
  const stepsEl  = document.getElementById('steps');

  const raw = inputEl.value.trim();
  if (!raw) {
    outputEl.textContent = 'Please enter a sentence.';
    stepsEl.innerHTML = '';
    return;
  }

  let text = raw.replace(/[.?!]+$/, '').trim();
  const steps = [];

  // Step 1: pronoun changes
  let step1 = text;
  PRONOUN_MAP.forEach(([pat, rep]) => { step1 = step1.replace(pat, rep); });
  if (step1 !== text) steps.push({ label: 'Pronoun change', value: step1 });

  // Step 2: modal backshift
  let step2 = step1;
  const doc2 = nlp(step2);
  let modalChanged = false;
  Object.entries(MODAL_BACKSHIFT).forEach(([modal, replacement]) => {
    const pattern = new RegExp(`\\b${modal}\\b`, 'gi');
    if (pattern.test(step2)) {
      step2 = step2.replace(pattern, replacement);
      modalChanged = true;
    }
  });
  if (modalChanged) steps.push({ label: 'Modal backshift', value: step2 });

  // Step 3: tense backshift (present → past, past → past perfect)
  let step3 = step2;
  const doc3 = nlp(step2);

  // Detect if already past perfect — don't double-shift
  const alreadyPerfect = /\bhad\b.+/i.test(step2);

  if (!alreadyPerfect && !modalChanged) {
    const verbs = doc3.verbs();
    const verbData = verbs.json();

    if (verbData.length > 0) {
      const tense = verbData[0].verb && verbData[0].verb.tense;
      const conjugations = verbs.conjugate();

      if (tense === 'PastTense' || (conjugations[0] && step2.includes(conjugations[0].PastTense))) {
        // Past → Past perfect: "had" + past participle
        const infinitive = conjugations[0] ? conjugations[0].Infinitive : '';
        if (infinitive) {
          const pastParticiple = getPastParticiple(infinitive);
          const pastForm = conjugations[0].PastTense || '';
          if (pastForm && step3.includes(pastForm)) {
            step3 = step3.replace(new RegExp(`\\b${pastForm}\\b`), `had ${pastParticiple}`);
            steps.push({ label: 'Tense backshift (past → past perfect)', value: step3 });
          }
        }
      } else {
        // Present → Past
        const shifted = nlp(step2);
        shifted.verbs().toPastTense();
        const newText = shifted.text();
        if (newText !== step2) {
          step3 = newText;
          steps.push({ label: 'Tense backshift (present → past)', value: step3 });
        }
      }
    }
  }

  // Step 4: time expression changes
  let step4 = step3;
  TIME_MAP.forEach(([pat, rep]) => { step4 = step4.replace(pat, rep); });
  if (step4 !== step3) steps.push({ label: 'Time expression change', value: step4 });

  // Step 5: build final output
  // Lowercase first letter (it follows "that")
  const finalSentence = step4.charAt(0).toLowerCase() + step4.slice(1);
  const result = `You said that ${finalSentence}.`;

  // Display
  outputEl.innerHTML = `<span class="highlight">${result}</span>`;

  // Display transformation steps
  if (steps.length > 0) {
    stepsEl.innerHTML = steps.map((s, i) =>
      `<div class="step-item">
        <span class="step-label">${i + 1}. ${s.label}</span>
        <span class="step-value">${s.value}</span>
      </div>`
    ).join('');
  } else {
    stepsEl.innerHTML = '<em style="color:#888;">No transformations were needed.</em>';
  }
}
