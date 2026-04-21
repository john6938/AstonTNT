function convertToFormal() {
    let text = document.getElementById('textInput').value;
    let output = document.getElementById('output');
    let loading = document.getElementById('loading');

    if (text.trim() === "") {
        output.innerText = "Please enter some text.";
        return;
    }

    // Initialize flags
    let SL = 0;
    let CO = 0;
    let CW = 0;

    loading.style.display = "inline-block";
    setTimeout(() => {
        // Slang to formal conversion
        const slangToFormal = {
            "bail": "leave abruptly",
            "bucks": "dollars",
            "chill": "relax",
            "cool": "good",
            "dude": "person",
            "epic": "impressive",
            "fab": "fabulous",
            "guy": "person",
            "howdy": "hello",
            "kinda": "kind of",
            "lame": "unimpressive",
            "lit": "exciting",
            "LOL": "laugh out loud",
            "nope": "no",
            "OMG": "oh my god",
            "pal": "friend",
            "pissed": "angry",
            "rad": "cool",
            "reckon": "believe",
            "rip-off": "overpriced",
            "screw up": "make a mistake",
            "so": "very",
            "stuff": "things",
            "sucks": "is unfortunate",
            "totally": "completely",
            "vibe": "feeling",
            "wassup": "what is up",
            "wanna": "want to",
            "whatcha": "what are you",
            "yeah": "yes",
            "yep": "yes",
            "yup": "yes",
            "yo": "hello",
            "bro": "brother",
            "fam": "family",
            "goat": "greatest of all time",
            "lit": "amazing",
            "on fleek": "perfect",
            "salty": "bitter",
            "shady": "suspicious",
            "turnt": "excited",
            "yolo": "you only live once",
            "what's up": "what are you up to"
        };

        // Contractions to formal conversion
        const contractionsToFormal = {
            "ain't": "is not",
            "gonna": "going to",
            "gotta": "have to",
            "He's": "He is",
            "I'm": "I am",
            "I've": "I have",
            "I'll": "I will",
            "She's": "She is",
            "you're": "you are",
            "you've": "you have",
            "you'd": "you would"
        };

        let formalText = text;

        // Apply slang to formal transformation
        for (let slang in slangToFormal) {
            let regex = new RegExp(`\\b${slang}\\b`, 'gi');
            if (formalText.match(regex)) {
                SL = 1; // Set SL flag if any slang word is found
            }
            formalText = formalText.replace(regex, slangToFormal[slang]);
        }

        // Apply contractions to formal transformation
        for (let contraction in contractionsToFormal) {
            let regex = new RegExp(`\\b${contraction}\\b`, 'gi');
            if (formalText.match(regex)) {
                CO = 1; // Set CO flag if any contraction is found
            }
            formalText = formalText.replace(regex, contractionsToFormal[contraction]);
        }

        // Additional specific word replacements for the beginning of the sentence
        if (formalText.startsWith("Can ")) {
            formalText = formalText.replace("Can ", "Could ");
            CW = 1; // Set CW flag if Can is replaced
        } else if (formalText.startsWith("Will ")) {
            formalText = formalText.replace("Will ", "Would ");
            CW = 1; // Set CW flag if Will is replaced
        }

        output.innerText = formalText;
        loading.style.display = "none";
        
    if (SL == 1 && CO == 1 && CW == 1) {
            convertPattern.innerText = "Convert Type: Slang and Contractions and Can/Will to Could/Would";
        } else if (SL == 1 && CO == 0 && CW == 0) {
            convertPattern.innerText = "Convert Type: Slang";
        } else if (SL == 0 && CO == 1 && CW == 0) {
            convertPattern.innerText = "Convert Type: Contractions";
        } else if (SL == 0 && CO == 0 && CW == 1) {
            convertPattern.innerText = "Convert Type: Can/Will to Could/Would";
        } else if (SL == 1 && CO == 1 && CW == 0) {
            convertPattern.innerText = "Convert Type: Slang and Contractions";
        } else if (SL == 1 && CO == 0 && CW == 1) {
            convertPattern.innerText = "Convert Type: Slang and Can/Will to Could/Would";
        } else if (SL == 0 && CO == 1 && CW == 1) {
            convertPattern.innerText = "Convert Type: Contractions and Can/Will to Could/Would";
        } else {
            convertPattern.innerText = "No conversion applied";
        }
    }, 500);
}