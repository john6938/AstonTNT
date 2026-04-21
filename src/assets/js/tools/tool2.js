function modifySentence(type) {
    let text = document.getElementById('textInput').value;
    let output = document.getElementById('output');
    let loading = document.getElementById('loading');
  
    if (text.trim() === "") {
      output.innerText = "Please enter some text.";
      return;
    }
  
    loading.style.display = "inline-block";
    setTimeout(() => {
      let doc = nlp(text);
      let verbPhrase = doc.verbs().toInfinitive().out('text');
      let subject = doc.nouns().out('text');
      let subjectArray=subject.split(' ')
      subject=subjectArray[0]
      let remainingString = subjectArray.slice(1).join(' ');

      let past, present, future;

      switch(type) {
        case 'possibility':
          past = `${subject} could ${verbPhrase} ${remainingString}`;
          present = `${subject} can ${verbPhrase} ${remainingString}`;
          future = `${subject} will be able to ${verbPhrase} ${remainingString}`;
          break;
        case 'ability':
          past = `${subject} was able to ${verbPhrase} ${remainingString}`;
          present = `${subject} is able to ${verbPhrase} ${remainingString}`;
          future = `${subject} will be able to ${verbPhrase} ${remainingString}`;
          break;
        case 'obligation':
          past = `${subject} should ${verbPhrase} ${remainingString}`;
          present = `${subject} shall ${verbPhrase} ${remainingString}`;
          future = `${subject} will have to ${verbPhrase} ${remainingString}`;
          break;
        case 'permission':
          past = `${subject} might ${verbPhrase} ${remainingString}`;
          present = `${subject} may ${verbPhrase} ${remainingString}`;
          future = `${subject} may ${verbPhrase} ${remainingString}`;
          break;
        default:
          past = present = future = "Invalid type";
      }
  
      output.innerHTML = `<p>Past: ${past}</p><p>Present: ${present}</p><p>Future: ${future}</p>`;
      loading.style.display = "none";
    }, 500);
  }
  