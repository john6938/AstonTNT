// Constants
const VERBS = {
    toBe: ["is", "am", "are", "was", "were"],
    toDo: ["do", "does", "did"],
    toHave: ["has", "have", "had"],
    modal: [
        "can",
        "could",
        "shall",
        "should",
        "will",
        "would",
        "may",
        "might",
        "must",
    ]
};

// Handle input changes
function changeInput(value) {
    const input = value.trim();
    const button = document.getElementById("button");
    button.disabled = !input.length;
}

// Process positive sentences
function handlePositiveSentence(verbs, verbConjugate) {
    if (VERBS.toBe.includes(verbs[0]) && verbConjugate[0]["PresentTense"] == verbs[0]) {
        return "am I";
    }
    if (VERBS.toBe.includes(verbs[0]) && verbConjugate[0]["PastTense"] == verbs[0]) {
        return "was I";
    }
    if (VERBS.toHave.includes(verbs[0]) && verbs.length == 1) {
        return "had".includes(verbs[0]) ? "did I" : "do I";
    }
    if (VERBS.toHave.includes(verbs[0]) && verbs.length !== 1) {
        return verbs[0] + " I";
    }
    if (!VERBS.toBe.includes(verbs[0]) && verbConjugate[0]["PastTense"] == verbs[0]) {
        return "did I";
    }
    if (!VERBS.toBe.includes(verbs[0]) && verbConjugate[0]["PresentTense"] == verbs[0]) {
        return "do I";
    }
    return "do I";  // default case
}

// Process negative sentences
function handleNegativeSentence(Verbs) {
    const verbSplit = Verbs.split(" ")[0];
    const contractions = nlp(verbSplit).contractions().expand().text();
    const hasContraction = contractions.length ? true : false;
    const conjugate = hasContraction
        ? nlp(contractions.split(" ")[0]).verbs().conjugate()
        : nlp(verbSplit).verbs().conjugate();

    if (hasContraction) {
        return handleContractionVerb(contractions, conjugate);
    }
    return handleRegularVerb(verbSplit, conjugate);
}

// Handle contraction verbs
function handleContractionVerb(contractions, conjugate) {
    const verb = contractions.split(" ")[0];
    
    if (VERBS.toBe.includes(verb) && 
        verb.split(" ")[0] == conjugate[0]["PresentTense"]) {
        return "am I";
    }
    if (VERBS.toBe.includes(verb) && 
        verb == conjugate[0]["PastTense"]) {
        return "was I";
    }
    if (VERBS.modal.includes(verb)) {
        return verb + " I";
    }
    if (VERBS.toDo.includes(verb) && 
        verb == conjugate[0]["PastTense"]) {
        return "did I";
    }
    return "do I";
}

// Handle regular verbs
function handleRegularVerb(verbSplit, conjugate) {
    if (VERBS.toBe.includes(verbSplit) && 
        verbSplit == conjugate[0]["PresentTense"]) {
        return "am I";
    }
    if (VERBS.toBe.includes(verbSplit) && 
        verbSplit == conjugate[0]["PastTense"]) {
        return "was I";
    }
    if (VERBS.modal.includes(verbSplit)) {
        return verbSplit + " I";
    }
    if (VERBS.toDo.includes(verbSplit) && 
        verbSplit == conjugate[0]["PastTense"]) {
        return "did I";
    }
    if (VERBS.toHave.includes(verbSplit) && 
        verbSplit == conjugate[0]["PresentTense"]) {
        return "has I";
    }
    if (VERBS.toHave.includes(verbSplit) && 
        verbSplit == conjugate[0]["PastTense"]) {
        return "had I";
    }
    return "do I";
}

// Main generate function
function generate() {
    const value = document.getElementById("text-input").value.trim();
    const result = document.getElementById("result");
    
    // Parse the input
    const verbs = nlp(value).verbs().out().split(" ");
    const verbArray = nlp(value).verbs().isNegative().out("array");
    const verbConjugate = nlp(value).verbs().conjugate();
    
    // Generate response
    const isNegativeSentence = verbArray.length ? true : false;
    let generateText = isNegativeSentence ? "Neither " : "So ";
    
    // Process the sentence
    if (!isNegativeSentence) {
        generateText += handlePositiveSentence(verbs, verbConjugate);
    } else {
        const Verbs = nlp(value).verbs().out();
        generateText += handleNegativeSentence(Verbs);
    }
    
    // Update UI
    result.innerText = generateText;
    
    // Reset input state
    document.getElementById("text-input").value = "";
    document.getElementById("button").disabled = true;
}