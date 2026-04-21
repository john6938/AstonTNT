// tool9.js — Article checker
// ESM imports removed: compromise loaded globally; doubleMetaphone replaced
// with a lightweight vowel-sound heuristic covering the most common cases.

function doesStartWithVowelSound(text) {
  const t = text.toLowerCase().trim();
  // Silent-h words that take "an"
  if (/^ho(ur|nest|nor|our)/.test(t)) return true;
  // U/Eu words that sound like "you" — take "a"
  if (/^(uni|use|usu|util|uber|eu)/.test(t)) return false;
  // One-letter vowel start
  return /^[aeiou]/.test(t);
}

function HasSuperlative(noun, adjectives) {
  return adjectives.some(a =>
    a.terms.some(t => t.tags.includes("Superlative"))
  );
}

function IsProperNoun(noun) {
  return noun.terms[0].tags.includes("ProperNoun");
}

function IsPlural(noun) {
  return nlp(noun.text).nouns().isPlural().ptrs.length > 0;
}

function WasPreviouslyMentioned(noun, adjectives, allNouns) {
  return allNouns.some(n =>
    n.text === noun.text &&
    n.offset.index < noun.terms[0].offset.index
  );
}

function IsCountable(noun) {
  return !noun.terms[0].tags.includes("Uncountable");
}

function DoesStartWithVowelSound(noun, adjectives) {
  const firstWord = adjectives.concat([noun])[0];
  return doesStartWithVowelSound(firstWord.terms[0].text);
}

function GetArticle(noun, adjectives, allNouns) {
  return ToDecisionTree({
    condition: HasSuperlative,
    yes: "the",
    no: {
      condition: IsProperNoun,
      yes: {
        condition: IsPlural,
        yes: "the",
        no: " "
      },
      no: {
        condition: WasPreviouslyMentioned,
        yes: "the",
        no: {
          condition: IsCountable,
          yes: {
            condition: IsPlural,
            yes: " ",
            no: {
              condition: DoesStartWithVowelSound,
              yes: "an",
              no: "a"
            }
          },
          no: " "
        }
      }
    }
  })(noun, adjectives, allNouns);
}

function ToDecisionTree(json) {
  if (typeof json === "string") return json;
  return DecisionTreeNode(
    json.condition,
    ToDecisionTree(json.yes),
    ToDecisionTree(json.no)
  );
}

function DecisionTreeNode(condition, yes, no) {
  return function(...args) {
    if (condition(...args)) {
      return typeof yes === "function" ? yes(...args) : yes;
    } else {
      return typeof no === "function" ? no(...args) : no;
    }
  };
}

function Parse() {
  const input = document.getElementById("input_text").value;
  const doc = nlp(input);

  const sentences = doc.sentences().out('offsets');
  const sentenceStartIndexes = sentences.map(s => s.terms[0].offset.index);

  const allNouns = doc.match("#Noun").out('offsets');
  const terms = doc.terms().out('offsets');

  const underscoreIndexes = terms
    .map((t, i) => t.text === "_" ? i : -1)
    .filter(t => t !== -1);

  for (const underscoreIndex of underscoreIndexes) {
    let currentTermIndex = underscoreIndex + 1;
    const adjectives = [];
    let noun = "";

    while (currentTermIndex < terms.length &&
           !sentenceStartIndexes.includes(currentTermIndex)) {
      const currentTerm = terms[currentTermIndex];
      if (currentTerm.terms[0].tags.includes("Noun")) {
        noun = currentTerm;
        break;
      } else {
        adjectives.push(currentTerm);
      }
      currentTermIndex++;
    }

    if (noun !== "") {
      const termToReplace = doc.terms().eq(underscoreIndex);
      termToReplace.replace(GetArticle(noun, adjectives, allNouns));
      if (sentenceStartIndexes.includes(underscoreIndex)) {
        termToReplace.toTitleCase();
      }
    }
  }

  document.getElementById("result_text").value = doc.text();
}

document.addEventListener('DOMContentLoaded', () => {
  const parseButton = document.getElementById('parseButton');
  if (parseButton) parseButton.addEventListener('click', Parse);
});
