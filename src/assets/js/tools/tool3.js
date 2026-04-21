const getSubject = (sentence) => {
	const sentenceArr = sentence.text().split(" ")
	const lastWordIndex = sentence.verbs().subjects().ptrs[0][2]
	const subject = sentenceArr.slice(0, lastWordIndex).join(" ");

	console.log("---BEGIN: getSubject---")
	console.log("verbs")
	console.log(sentence.text().split())
	console.log("subjects");
	console.log(subject)
	console.log(sentence.verbs().subjects().json()[0].text);
	console.log("---END: getSubject---")

	return subject
}

const isAlias = (formattedSubject) => {
  console.log(formattedSubject);
	const aliasWord = new Set(["it", "that", "this", "he", "she"])
	return aliasWord.has(formattedSubject)
}

const sameSubject = (subject1, subject2) => {
	// return true // testcases mey be same sentence
	const formattedSubject1 = subject1.toLowerCase();
	const formattedSubject2 = subject2.toLowerCase();
	return formattedSubject1 === formattedSubject2 || isAlias(formattedSubject2)
}

const getMainTense = (sentence) => {
	const verb = sentence.verbs()
	console.log("---BEGIN: getMainTense ---")
	console.log("verbs")
	console.log(verb.json());
	console.log("---END: getMainTense ---")
	return verb.json()[0].verb.grammar.tense;
}

const contradictTense = (sentence1, sentence2) => {
	const tense1 = getMainTense(sentence1);
	const tense2 = getMainTense(sentence2);
	
	const tenseNum = new Map([["PastTense", 1], ["PresentTense", 2], ["FutureTense"]]);
	console.log("---BEGIN: contradictTense ---")
	console.log("tenses")
	console.log(tenseNum.get(tense1));
	console.log(tenseNum.get(tense2));
	console.log("---END: contradictTense ---")
	return !(tenseNum.has(tense1) && tenseNum.has(tense2) && tenseNum.get(tense1) <= tenseNum.get(tense2));
}

const getMainForm = (sentence) => {
	const verb = sentence.verbs()
	const index = sentence.verbs().ptrs[0][1] === 0 ? 1 : 0
	console.log("---BEGIN: getMainForm ---")
  console.log(verb.json()[index])
	console.log(verb.json()[index].verb.grammar.form)
	//console.log("verbs")
	//console.log(verb.json());
	//console.log(verb.json()[0].verb.grammar.form)
	//console.log(typeof(verb.json()[0].verb.grammar.form))
	console.log("---END: getMainForm ---")
	return verb.json()[index].verb.grammar.form;
}

const isPerfect = (sentence) => {
	const auxiliary = sentence.verbs().json()[0].verb.auxiliary;
	return auxiliary.includes("have") || auxiliary.includes("had");
}

const getPastParticipleVerb = (sentence) => {
	const verbs = sentence.verbs();
	const index = verbs.ptrs[0][1] === 0 ? 1 : 0
	//console.log("---BEGIN: getPastParticipleVerb ---")
	//console.log(verbs.json()[index].verb.root);
	//console.log(verbs.json()[index].index);
	//console.log("---END: getPastParticipleVerb ---")
	return sentence.verbs().json()[index].verb.root;
}

const getPresentParticipleVerb = (sentence) => {
	const verbs = sentence.verbs();
	const terms = verbs.toGerund().json()[(verbs.ptrs[0][1] === 0 ? 1 : 0)].terms;
	//console.log("---BEGIN: getPresentParticipleVerb ---")
	//console.log(terms)
	//console.log()
	//console.log(verbs.ptrs[0][1] === 0);
	//console.log(verbs.json()[0].verb.root);
	//console.log(verbs.json()[0].index);
	//console.log("---END: getPresentParticipleVerb ---")
	return terms.map((word => word.text)).slice(1, terms.length).join(" ");
}

const getRemnant = (sentence) => {
	const sentenceArr = sentence.text().split(" ")
	const sentenceIdArr = sentence.json()[0].terms
	const index = sentence.verbs().ptrs[0][1] === 0 ? 1 : 0
	const lastWordId = sentence.verbs().ptrs[index][4]
	const lastWord = sentenceIdArr.filter((el) => (el.text !== "")).flatMap((el, i) => {
		return (el.id === lastWordId ? i : [])
	})[0]
	//console.log("---BEGIN: getRemnant ---")
	//console.log(sentence)
	//console.log(sentence.verbs().json()[index].verb.postAdverbs);
	//console.log(sentence.verbs().ptrs[index]);
	//console.log(lastWord);
	//console.log("---END: getRemnant ---")
	if(sentence.verbs().ptrs[index][2] === sentenceArr.length){
		const postAdverbs = sentence.verbs().json()[index].verb.postAdverbs.join(" ");
		return postAdverbs === "" ? "" : " " + postAdverbs.slice(0, -1)
	}
  let returnWord = " " + sentenceArr.slice(lastWord+1, sentenceArr.length).join(" ")
  console.log(returnWord[returnWord.length-1])
  if(returnWord[returnWord.length-1] === '.')returnWord = returnWord.slice(0,-1);
	return returnWord;
}

const getVerb = (sentence) => {
	const index = sentence.verbs().ptrs[0][1] === 0 ? 1 : 0
	//console.log("---BEGIN: getVerb ---")
	//console.log(sentence.verbs().ptrs);
	//console.log(sentence.verbs().json()[index]);
	//console.log("---END: getVerb ---")
	return sentence.verbs().json()[index].text;
}

const toBegin = (word) => {
	return word.slice(0,1).toUpperCase() + word.slice(1, word.length);
}

const notBegin = (word) => {
	const pronoun = new Set(["She", "He", "It", "We", "They", "The"])
  console.log("---BEGIN: notBegin---")
  console.log(word)
  console.log("---END: notBegin---")
	if(pronoun.has(word))return word.toLowerCase();
	return word;
}

const toParticipleClause = (sentence1, sentence2) => {
	if(getMainForm(sentence1).includes("passive")){
		if(isPerfect(sentence1)){
			// Perfect passive participle
			// having been xxed some. S V X
			const verb1 = getPastParticipleVerb(sentence1); //xxed
			const remnant1 = getRemnant(sentence1)
			const subject = notBegin(getSubject(sentence1))
			const verb2 = getVerb(sentence2); //xxed
			const remnant2 = getRemnant(sentence2)
			return `<span class="w3-red">Having been ${verb1}</span>${remnant1}, <span class="w3-blue">${subject}</span> ${verb2}${remnant2}.`
		}else{
			// Passive participle
			// xxed some. S V X
			const verb1 = toBegin(getPastParticipleVerb(sentence1)); //xxed
			const remnant1 = getRemnant(sentence1)
			const subject = notBegin(getSubject(sentence1))
			const verb2 = getVerb(sentence2); //xxed
			const remnant2 = getRemnant(sentence2)
			return `<span class="w3-red">${verb1}</span>${remnant1}, <span class="w3-blue">${subject}</span> ${verb2}${remnant2}.`
		}
	}else{
		if(isPerfect(sentence1)){
			// Perfect active participle
			// having xxed some. S V X
			const verb1 = getPastParticipleVerb(sentence1); //xxed
			const remnant1 = getRemnant(sentence1)
			const subject = notBegin(getSubject(sentence1))
			const verb2 = getVerb(sentence2); //xxed
			const remnant2 = getRemnant(sentence2)
			return `<span class="w3-red">Having ${verb1}</span>${remnant1}, <span class="w3-blue">${subject}</span> ${verb2}${remnant2}.`

		}else{
			// Active participle
			// xxing some. S V X
			const verb1 = toBegin(getPresentParticipleVerb(sentence1)); //xxed
			const remnant1 = getRemnant(sentence1)
			const subject = notBegin(getSubject(sentence1))
			const verb2 = getPastParticipleVerb(sentence2); //xxed
			const remnant2 = getRemnant(sentence2)
			return `<span class="w3-red">${verb1}</span>${remnant1}, <span class="w3-blue">${subject}</span> ${verb2}${remnant2}.`
		}
	}
}

const color = (text) => {
  let doc = nlp(text);
	let sentence1 = nlp(doc.json()[0].text);
	let sentence2 = doc.json()[1].text;
  let verbs1 = sentence1.verbs()
	console.log("---BEGIN: getVerb ---")
	console.log(verbs1);
	console.log("---END: getVerb ---")
	const index = verbs1.ptrs[0][1] === 0 ? 1 : 0
  console.log(sentence1.verbs().subjects().ptrs[0])
	const sentenceIdArr = sentence1.json()[0].terms
	const lastWordId = sentence1.verbs().subjects().ptrs[0][4]
	const lastWord = sentenceIdArr.filter((el) => (el.text !== "")).flatMap((el, i) => {
		return (el.id === lastWordId ? i : [])
	})[0]
  console.log(lastWord);
	const subject1 = doc.json()[0].text.split(" ").slice(0, lastWord+1).join(" ");
  const subject1Remnant = doc.json()[0].text.split(" ").slice(lastWord+1, verbs1.ptrs[index][1]).join(" ")
  const verb1 = doc.json()[0].text.split(" ").slice(verbs1.ptrs[index][1], verbs1.ptrs[index][2]).join(" ")
  const remnant1 = doc.json()[0].text.split(" ").slice(verbs1.ptrs[index][2]).join(" ");
  return `<span class="w3-blue">${subject1}</span> ${subject1Remnant} <span class="w3-red">${verb1}</span> ${remnant1} ${sentence2}`
}

function convertToParticipleClause() {
  let text = document.getElementById('textInput').value;
  let output = document.getElementById('output');
  let outputForInput = document.getElementById('output-for-input');
  let loading = document.getElementById('loading');
  output.innerText = "";
  outputForInput.innerText = "";

  if (text.trim() === "") {
    output.innerText = "Please enter some text.";
    return;
  }

  loading.style.display = "inline-block";
  setTimeout(() => {
    try{
      let doc = nlp(text);
      if(doc.json().length !== 2){
        output.innerText = "Please input exactly two sentences.";
        loading.style.display = "none";
        return;
      }
      console.log(doc.json()[0].text);
      let sentence1 = nlp(doc.json()[0].text);
      let sentence2 = nlp(doc.json()[1].text);
      console.log(sentence1);
      let subject1 = getSubject(sentence1);
      let subject2 = getSubject(sentence2);
      //console.log(sentence1)
      //console.log(sentence2)
      // check subject is same
      if(!sameSubject(subject1, subject2)){
        output.innerText = "Please set same subject in both sentences.";
        loading.style.display = "none";
        return;
      }
      // check tense isn't contradicted
      if(contradictTense(sentence1, sentence2)){
        output.innerText = "Please set possible tenses between both sentences.";
        loading.style.display = "none";
        return;

      }
      // the subject in first sentence is main subject.
      let participleclaused = toParticipleClause(sentence1, sentence2);
      console.log(participleclaused);
      outputForInput.innerHTML = `<b>Input sentence</b><br>${color(text)}`;
      output.innerHTML = `<b>Participle Clause sentence</b><br>${participleclaused}`;
      loading.style.display = "none";
    } catch(err) {
      console.log(err)
      if(err.toString().includes("TypeError: getMainForm(...) is undefined")){
        output.innerText = 'compromise Issue: "specific verb.grammar.form is undefined"';
      }else{
        output.innerText = `Debug error: "${err}"`;
      }
      loading.style.display = "none";
    }
  }, 500);
}
