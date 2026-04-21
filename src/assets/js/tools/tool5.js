function convertToPolite() {
    let text = document.getElementById('textInput').value;
    let output = document.getElementById('output');

    if (text.trim() === "") {
        output.innerText = "Please enter some text.";
        return;
    }
  
    const sentences = text.split(/(?<=[.!?])\s+/);

    if (sentences.length > 1) {
      output.innerText = "Please input 1 sentence.";
      return;
   }

    let doc = nlp(text); // Using 'doc' as the variable name for nlp result
    let clone = doc.clone();
    clone.match('Will').remove();
    let subject = clone.match('#Noun').out('array')[0] || "you";
    if (subject.endsWith('.')) subject = subject.slice(0, -1);
  
    let level;
  
    let adj_neg=false;
    let pattern =  /\bcannot\b|\bnot\b|\b[a-z]+n't\b/gi;
    let isNegative = pattern.test(text);
  
    // Use nlp to find sentences and check for specific polite structures
  if(!isNegative){
    if (doc.match('could ' + subject + ' please').found || 
        doc.match('would ' + subject + ' please').found) {
        level = 6;
    } else if (doc.match('could '+ subject).found || 
               doc.match('would '+ subject).found) {
        level = 5;
    } else if (doc.match('can ' + subject + ' please').found || 
               doc.match('will ' + subject + ' please').found) {
        level = 4;
    } else if (doc.match('can ' + subject).found || 
               doc.match('will ' + subject).found) {
        level = 3;
    } else if (doc.match(', please').found || 
               doc.match('Please').found) {
        level = 2;
    } else if (startsWithInfinitiveVerb(text)){
        level = 1; // Default to level 1 if no polite phrases are found}

    }
    
    else{
      output.innerText = "Input error:\nPlease input a request or command sentence.\nExample: Can I play a game?";
      return;
    }
  }
  
  else {
     if (doc.match('could ' + subject + ' please not').found || 
         doc.match('would ' + subject + ' please not').found ||
         doc.match('couldn\'t ' + subject + ' please').found || 
         doc.match('wouldn\'t ' + subject + ' please').found ||
         doc.match('could not ' + subject + ' please').found || 
         doc.match('would not ' + subject + ' please').found) {
        level = 6;
       if(doc.match('couldn\'t ' + subject + ' please').found || 
         doc.match('wouldn\'t ' + subject + ' please').found ||
         doc.match('could not ' + subject + ' please').found || 
         doc.match('would not ' + subject + ' please').found) adj_neg = true;
       
    } else if (doc.match('could ' + subject + ' not').found || 
               doc.match('would ' + subject + ' not').found ||
               doc.match('Could not ' + subject).found || 
               doc.match('Would not ' + subject).found ||
               doc.match('Couldn\'t ' + subject).found || 
               doc.match('Wouldn\'t ' + subject).found) {
        level = 5;
        if(doc.match('Could not ' + subject).found || 
           doc.match('Would not ' + subject).found ||
           doc.match('Couldn\'t ' + subject).found || 
           doc.match('Wouldn\'t ' + subject).found) adj_neg = true;
          
    } else if (doc.match('can ' + subject + ' please not').found || 
               doc.match('will ' + subject + ' please not').found ||
               doc.match('cannot ' + subject + ' please').found || 
               doc.match('will not ' + subject + ' please').found ||
               doc.match('can\'t ' + subject + ' please').found || 
               doc.match('won\'t ' + subject + ' please').found) {
        level = 4;
      
      if(doc.match('Cannot ' + subject + ' please').found || 
         doc.match('Will not ' + subject + ' please').found ||
         doc.match('Can\'t ' + subject + ' please').found ||
         doc.match('Won\'t ' + subject + ' please').found) adj_neg = true;
      
    } else if (doc.match('can ' + subject + ' not').found || 
               doc.match('will ' + subject + ' not').found||
               doc.match('cannot ' + subject).found || 
               doc.match('will not ' + subject).found || 
               doc.match('can\'t ' + subject).found || 
               doc.match('won\'t ' + subject).found ) {
        level = 3;
        if(doc.match('cannot ' + subject).found || 
           doc.match('will not ' + subject).found || 
           doc.match('can\'t ' + subject).found || 
           doc.match('won\'t ' + subject).found) adj_neg = true;
      
      
    } else if (doc.match(', please').found || 
               doc.match('Please').found) {
        level = 2;
    } else if (startsWithInfinitiveVerb(text)){
        level = 1; // Default to level 1 if no polite phrases are found}
    }else{
      output.innerText = "Input error:\nPlease input a request or command sentence.\nExample: Can I play a game?";
      return;
    }
    
  }
    RaisePoliteLevel(level,text,isNegative,adj_neg,subject);
}

function RaisePoliteLevel(level,text,isNegative,adj_neg,subject) {
  
  let doc = nlp(text);
  let outputTexts = [];
  
  //If it's too polite, return message.
  if(level==6){
    output.innerText = "It's too polite!";
    return;
  }
  
  //No polite to please
  if(level==1){
    
    text = text.replace(/!+$/, '.');
    
    let politeText1;
    let firstSpaceIndex = text.indexOf(' ');
    let firstWord;
    let remainingText
    
    if (firstSpaceIndex !== -1) {
      firstWord = text.slice(0, firstSpaceIndex).toLowerCase();
      remainingText = text.slice(firstSpaceIndex);
      politeText1 = "Please " + firstWord + remainingText;
      if (!politeText1.endsWith('.')) politeText1 += ".";
      outputTexts.push(politeText1);
    } else {
       let politeText1 = "Please " + text.toLowerCase();
       if (!politeText1.endsWith('.')) politeText1 += ".";
       outputTexts.push(politeText1);
    }
    
    let politeText2;
    if (text.endsWith('.')) 
    politeText2 = text.slice(0, -1) + ", please.";
    else politeText2 = text + ", please."
    outputTexts.push(politeText2);
    
    if (politeText2.startsWith("Do not")) outputTexts.push("'Do not' is a stronger expression than 'Don't'.");
    
    text = firstWord + remainingText;
    outputTexts.push("\n↓\n↓ more polite\n↓\n");
    level++;
  }
　
  //please to can you
  if(level==2){
    subject = "you";
    
    if (text.endsWith('.')) {
        text = text.slice(0, -1);
        text += "?";
    }
    
    if (!text.endsWith('?')) {
        text += "?";
    }
    
    let politeText1; //Can you
    let politeText2; //Will you
    
    let regex = /^(Please\s+) | (,\s*please\.?)$/i;
    if (!regex.test(text)) {
        text = text.replace(/,\s*please\.?\s*|please\s*/gi, '');
        if(isNegative)text = text.replace(/don't|do\s+not/gi, 'not');
      
        let firstSpaceIndex = text.indexOf(' ');
        if (firstSpaceIndex !== -1) {
          let firstWord = text.slice(0, firstSpaceIndex).toLowerCase();
          let remainingText = text.slice(firstSpaceIndex);
          politeText1 = "Can "+subject+" " + firstWord + remainingText;
          politeText2 = "Will "+subject+" " + firstWord + remainingText;
          outputTexts.push(politeText1);
          outputTexts.push(politeText2);
        } else {
          politeText1 = "Can "+subject+" " + text.toLowerCase();
          politeText2 = "Will "+subject+" " + text.toLowerCase();
          outputTexts.push(politeText1);
          outputTexts.push(politeText2);
        }
    }
    
    if (text.endsWith('?')) {
        text = text.slice(0, -1);
        text += ".";
    }
    
    outputTexts.push("\n↓\n↓ more polite\n↓\n");
    text = politeText1;
    level++;
  }
  
  //can you to can you please
  if(level==3){
    let politeText1;
    let politeText2;
    
    if (text.endsWith('.')) {
        text = text.slice(0, -1);
        text += "?";
    }
    
    if (!text.endsWith('?')) {
        text += "?";
    }
    
    if(!adj_neg){
      politeText1 = text.replace(new RegExp(`(Can ${subject}|Will ${subject})\\s+(\\w+)`, 'i'), `Can ${subject} please $2`);
      politeText2 = text.replace(new RegExp(`(Can ${subject}|Will ${subject})\\s+(\\w+)`, 'i'), `Will ${subject} please $2`);
    
      outputTexts.push(politeText1);
      outputTexts.push(politeText2);
    }else{
      politeText1 = text.replace(new RegExp(`(Can't ${subject}|Won't ${subject}|Cannot ${subject}|Will not ${subject})\\s+(\\w+)`, 'i'), `Can't ${subject} please $2`);
      politeText2 = text.replace(new RegExp(`(Can't ${subject}|Won't ${subject}|Cannot ${subject}|Will not ${subject})\\s+(\\w+)`, 'i'), `Won't ${subject} please $2`);
    
      outputTexts.push(politeText1);
      outputTexts.push(politeText2);
    }
    
    outputTexts.push("\n↓\n↓ more polite\n↓\n");
    text = politeText1;
    level++;
  }
  
  //can you please to could you
  if(level==4){
    let politeText1;
    let politeText2;
    
    if (text.endsWith('.')) {
        text = text.slice(0, -1);
        text += "?";
    }
    
    if (!text.endsWith('?')) {
        text += "?";
    }
    
    text = text.replace(/,\s*please\.?\s*|please\s*/gi, '');
    
    if (!adj_neg) {
    politeText1 = text.replace(new RegExp(`(Can ${subject}|Will ${subject})`, 'i'), `Could ${subject}`);
    politeText2 = text.replace(new RegExp(`(Can ${subject}|Will ${subject})`, 'i'), `Would ${subject}`);

    outputTexts.push(politeText1);
    outputTexts.push(politeText2);
} else {
    politeText1 = text.replace(new RegExp(`(Can't ${subject}|Won't ${subject}|Cannot ${subject}|Will not ${subject})`, 'i'), `Couldn't ${subject}`);
    politeText2 = text.replace(new RegExp(`(Can't ${subject}|Won't ${subject}|Cannot ${subject}|Will not ${subject})`, 'i'), `Wouldn't ${subject}`);

    outputTexts.push(politeText1);
    outputTexts.push(politeText2);
}

      
    outputTexts.push("\n↓\n↓ more polite\n↓\n");
    text = politeText1;
    level++;
  }
  
  //could you to could you please
  if(level==5){
    let politeText1;
    let politeText2;
    
    if (text.endsWith('.')) {
        text = text.slice(0, -1);
        text += "?";
    }
    
    if (!text.endsWith('?')) {
        text += "?";
    }
    
    if (!adj_neg) {
      politeText1 = text.replace(new RegExp(`(Could ${subject}|Would ${subject})\\s+(\\w+)`, 'i'), `Could ${subject} please $2`);
      politeText2 = text.replace(new RegExp(`(Could ${subject}|Would ${subject})\\s+(\\w+)`, 'i'), `Would ${subject} please $2`);
    } else {
      politeText1 = text.replace(new RegExp(`(Could not ${subject}|Would not ${subject}|Couldn't ${subject}|Wouldn't ${subject})\\s+(\\w+)`, 'i'), `Couldn't ${subject} please $2`);
      politeText2 = text.replace(new RegExp(`(Could not ${subject}|Would not ${subject}|Couldn't ${subject}|Wouldn't ${subject})\\s+(\\w+)`, 'i'), `Wouldn't ${subject} please $2`);
    }
    
    outputTexts.push(politeText1);
    outputTexts.push(politeText2);
    
    outputTexts.push("\n");
    
    text = politeText1;
    level++;
  }
  
  if(adj_neg)outputTexts.push("Attention:\nIt's not negative request sentence.");
  
  output.innerText = outputTexts.join('\n');
  
  let highlightedText = output.innerHTML.replace(/\b(please|Please|Can't|Will|Could|Would|Can|Won't|Couldn't|Wouldn't)\b/g, '<span class="red-text">$1</span>');
  output.innerHTML = highlightedText;
}

function startsWithInfinitiveVerb(sentence) {
  const doc = nlp(sentence);
  const firstTerm = doc.terms().first();

  if (firstTerm.found) {
    const tags = firstTerm.json()[0].terms[0].tags;
   
    if (tags.includes('Verb') && tags.includes('Infinitive') && !sentence.startsWith('Do')) {
      return true;
    }
  }
  
  if ((sentence.startsWith("Do not") || sentence.startsWith("Don't")) && !sentence.endsWith('?')) {
    return true;
  }

  if (sentence.startsWith('Do ')) {
    if(sentence.endsWith('?'))return false;
    if(!sentence.endsWith('?'))return true;
  }

  return false;
}