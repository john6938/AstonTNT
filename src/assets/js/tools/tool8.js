let input_place = document.getElementById("i");
let output_place = document.getElementById("a");
let analyze_btn = document.getElementById("analyze-btn");

function findSubarray(arr, subarr) {
    for (var i = 0; i < 1 + (arr.length - subarr.length); i++) {
        var j = 0;
        for (; j < subarr.length; j++)
            if (arr[i + j] !== subarr[j])
                break;
        if (j == subarr.length)
            return i;
    }
    return -1;
}

function isPerfectTense(verbParse) {
    let rawText = verbParse.text || '';
    let terms = nlp(rawText).terms().json();
    let firstTermIsHaveHasOrHad = false;
    
    if (terms.length < 1) return false;
    
    if (terms[0].normal == "have") {
        cursor = rawText.indexOf("have") + 4;
        firstTermIsHaveHasOrHad = true;
    }
    if (terms[0].normal == "had") {
        cursor = rawText.indexOf("has") + 3;
        firstTermIsHaveHasOrHad = true;
    }
    if (terms[0].normal == "has") {
        cursor = rawText.indexOf("had") + 3;
        firstTermIsHaveHasOrHad = true;
    }
    
    let foundParticipleWords = false;
    for (let i = 1; i < terms.length; i++) {
        let verbData = nlp(terms[i].normal).verbs().json();
        
        if (verbData.length < 1) continue;
        
        const verb = verbData[0];
        if (verb.conjugation && verb.conjugation.Participle == terms[i].normal) {
            foundParticipleWords = true;
            break;
        }
    }
    
    return firstTermIsHaveHasOrHad && foundParticipleWords;
}

function wordsFromTokens(tokens) {
    let wordsList = [];
    for (token of tokens) {
        wordsList.push(token.normal || token.text || '');
    }
    return wordsList;
}

function drawSentence(tokensList) {
    output_place.innerHTML = "";
    
    for (token of tokensList) {
        let tokenEl = document.createElement("token");

        let tenseEl = document.createElement("tense");
        if (token.tense)
            tenseEl.innerHTML = token.tense;
        tokenEl.appendChild(tenseEl);
        
        let wordEl = document.createElement("word");
        wordEl.innerHTML = token.word || '-';
        tokenEl.appendChild(wordEl);
        if (token.tense)
            wordEl.className = "verb";

        output_place.appendChild(tokenEl);
    }
}

function getTense(verb) {
    const root = verb.root || verb.normal || verb.text || '';
    const text = verb.text || '';
    const normal = verb.normal || '';
    
    const irregularPastForms = new Set([
        'went', 'ate', 'saw', 'took', 'came', 'knew', 'grew', 'drew',
        'flew', 'threw', 'spoke', 'drove', 'wrote', 'rode', 'rose',
        'ran', 'said', 'read', 'told', 'thought', 'made', 'found',
        'got', 'bought', 'brought', 'caught', 'taught', 'sat', 'won',
        'understood', 'stood', 'kept', 'slept', 'felt', 'left', 'meant',
        'sent', 'built', 'dealt', 'spent', 'bent', 'lent', 'broke',
        'chose', 'spoke', 'stole', 'woke', 'wore', 'tore'
    ]);

    if (irregularPastForms.has(normal)) {
        return 'Past';
    }

    if (verb.tags && (
        verb.tags.includes('PastTense') ||
        verb.tags.includes('Past')
    )) {
        return 'Past';
    }

    if (normal.endsWith('ed') && !normal.endsWith('need')) {
        return 'Past';
    }
    

    if (['was', 'were'].includes(normal)) {
        return 'Past';
    }
    
    if (text.startsWith('will ') || text.startsWith('shall ')) {
        return 'Future';
    }

    const doc = nlp(text);
    const terms = doc.terms().json();
    for (let term of terms) {
        if (term.tags && term.tags.includes('PastTense')) {
            return 'Past';
        }
    }
    
    return 'Present';
}

function analysisString(str) {
    // print to see result for check
    let verbs = nlp(str).verbs();
    let verbsParsingResult = verbs.json();
    console.log("Verbs parsing result:", verbsParsingResult);
    console.log("Raw verbs data:", verbs.data());

    // Get all verbs
    let parsedTerms = nlp(str).terms().json();
    
    let verbTenses = [];
    for (let verbParse of verbsParsingResult) {
        let text = verbParse.text || '';
        let normal = verbParse.normal || '';
        
        // log details of verb
        console.log("Processing verb:", {
            text: text,
            normal: normal,
            tags: verbParse.tags,
            terms: nlp(text).terms().json()
        });

        // Decide the tense based on verb
        let doc = nlp(text);
        let verbData = doc.verbs().conjugate()[0];
        console.log("Verb conjugation:", verbData);

        let tense = 'Present'; // default = present

        // past
        if (verbData && (
            text === verbData.PastTense ||
            normal === verbData.PastTense
        )) {
            tense = 'Past';
        }
        // future
        else if (text.startsWith('will ') || text.startsWith('shall ')) {
            tense = 'Future';
        }

        // other features
        let isPassive = text.includes('been ') || text.includes('being ');
        let isPerfect = /\b(have|has|had)\b/.test(text);
        let isContinuous = text.includes('ing');

        let tagPerfect = isPerfect ? " Perfect " : " ";
        let tagPassive = isPassive ? "Passive " : "";
        let tagCon = isContinuous ? "Continuous " : "";
        
        verbTenses.push(tagPassive + tense + tagPerfect + tagCon);
    }
    
    // Establish tokens
    let tokens = [];
    let lowestIndex = 0;
    for (let term of parsedTerms) {
        let token = {};
        let termText = term.text || '';
        lowestIndex += str.substring(lowestIndex, str.length).indexOf(termText);
        token.indexStart = lowestIndex;
        token.word = termText;
        token.normal = term.normal || termText;
        lowestIndex += termText.length;
        token.indexEnd = lowestIndex;
        tokens.push(token);
    }
    
    // Deal with verb
    let wordsList = wordsFromTokens(tokens);
    let verbTexts = verbs.text();
    let verbWords = verbTexts.split(' ');
    
    for (let j = 0; j < verbsParsingResult.length; j++) {
        let verbText = verbsParsingResult[j].text || '';
        let verbWordsList = verbText.split(' ');
        let verbTense = verbTenses[j];
        
        let i = findSubarray(wordsList, verbWordsList);
        
        if (i < 0) continue;
        
        tokens.splice(i, verbWordsList.length, {
            indexStart: tokens[i].indexStart,
            indexEnd: tokens[i + verbWordsList.length - 1].indexEnd,
            word: verbText,
            normal: verbText.toLowerCase(),
            tense: verbTense
        });

        wordsList = wordsFromTokens(tokens);
    }
    
    return tokens;
}

function eventFunct() {
    let str = input_place.value;
    let tokensDataPackage = analysisString(str);
    drawSentence(tokensDataPackage);
}

analyze_btn.addEventListener("click", eventFunct);