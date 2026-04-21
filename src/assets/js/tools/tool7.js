/**
 * Question Answer System
 * This script handles yes/no questions and provides appropriate responses
 */

// 展示答案的函数
function displayAnswer(type) {
    const question = document.smpl.word.value;
    if (!question.trim()) {
        setAnswer("Please enter a question first.", "");
        return;
    }

    const answer = type === 'positive' ? positive_answer(question) : negative_answer(question);
    setAnswer(answer, type);
}

// 设置答案的辅助函数
function setAnswer(text, type) {
    const answerBox = document.getElementById('answerBox');
    answerBox.textContent = text;
    answerBox.className = 'answer-box ' + type;
}

function positive_answer(word) {
    var text = word.toLowerCase();
    var words = text.split(/\s/);
     
    // First check if it's a special question (5W1H)
    if(text.match(/^(what|who|where|when|why|how)\s/i)) {
        return "Sorry, I can only answer yes/no questions.";
    }

    //Case: shall
    if(text.match(/shall\s/)){
        if(text.match(/\si\s/)) return "Yes, please.";
        if(text.match(/\swe\s/)) return "Yes, let's.";
    }
    
    //Case: Do,Does,Did,Have,Has,Can,Should,Will
    else if(text.match(/d\w*\s/) || text.match(/ha\w*\s/) || text.match(/can\s/) || text.match(/should\s/) || text.match(/will\s/)){ 
        if(text.match(/\byou\b/)) return "Yes, I " + words[0] + ".";
        if(text.match(/\smr\.\b|\smstr\.\b/)) return "Yes, he " + words[0] + ".";
        if(text.match(/\sms\.\b|\smiss\.\b|\smrs\.\b/)) return "Yes, she " + words[0] + ".";
        return "Yes," + text.match(/\b\s\w+\s/) + words[0] + ".";
    }
    
    //Case: Are,Is,Was,Were
    else if(text.match(/are\s/) || text.match(/is\s/) || text.match(/was\s/) || text.match(/were\s/)){
        var lastWord = words[words.length-1].replace(/[?.!]$/, '');
        
        if(text.match(/are\s/) && text.match(/\byou\b/)) {
            return "Yes, I am " + lastWord + ".";
        }
        if(text.match(/were\s/) && text.match(/\byou\b/)) {
            return "Yes, I was " + lastWord + ".";
        }
        if(text.match(/\smr\.\b|\smstr\.\b/)) {
            var verb = text.match(/are|is|was|were/)[0];
            var correctVerb = verb === 'are' ? 'is' : verb;
            return "Yes, he " + correctVerb + " " + lastWord + ".";
        }
        if(text.match(/\sms\.\b|\smiss\.\b|\smrs\.\b/)) {
            var verb = text.match(/are|is|was|were/)[0];
            var correctVerb = verb === 'are' ? 'is' : verb;
            return "Yes, she " + correctVerb + " " + lastWord + ".";
        }
        
        var subject = text.match(/\b\s\w+\s/);
        var verb = text.match(/are|is|was|were/)[0];
        return "Yes," + subject + verb + " " + lastWord + ".";
    }
    
    return "Sorry, I don't understand the question.";
}

function negative_answer(word) {
    var text = word.toLowerCase();
    var words = text.split(/\s/);
     
    // First check if it's a special question (5W1H)
    if(text.match(/^(what|who|where|when|why|how)\s/i)) {
        return "Sorry, I can only answer yes/no questions.";
    }

    //Case: shall
    if(text.match(/shall\s/)){
        if(text.match(/\si\s/)) return "No, thank you.";
        if(text.match(/\swe\s/)) return "No, let's not.";
    }
    
    //Case: Do,Does,Did,Have,Has,Can,Should,Will
    else if(text.match(/d\w*\s/) || text.match(/ha\w*\s/) || text.match(/can\s/) || text.match(/should\s/) || text.match(/will\s/)){ 
        if(text.match(/\byou\b/)) return "No, I do not.";
        if(text.match(/\smr\.\b|\smstr\.\b/)) return "No, he does not.";
        if(text.match(/\sms\.\b|\smiss\.\b|\smrs\.\b/)) return "No, she does not.";
        return "No," + text.match(/\b\s\w+\s/) + "does not.";
    }
    
    //Case: Are,Is,Was,Were
    else if(text.match(/are\s/) || text.match(/is\s/) || text.match(/was\s/) || text.match(/were\s/)){
        var lastWord = words[words.length-1].replace(/[?.!]$/, '');
        
        if(text.match(/are\s/) && text.match(/\byou\b/)) {
            return "No, I am not " + lastWord + ".";
        }
        if(text.match(/were\s/) && text.match(/\byou\b/)) {
            return "No, I was not " + lastWord + ".";
        }
        if(text.match(/\smr\.\b|\smstr\.\b/)) {
            var verb = text.match(/are|is|was|were/)[0];
            var correctVerb = verb === 'are' ? 'is' : verb;
            return "No, he " + correctVerb + " not " + lastWord + ".";
        }
        if(text.match(/\sms\.\b|\smiss\.\b|\smrs\.\b/)) {
            var verb = text.match(/are|is|was|were/)[0];
            var correctVerb = verb === 'are' ? 'is' : verb;
            return "No, she " + correctVerb + " not " + lastWord + ".";
        }
        
        var subject = text.match(/\b\s\w+\s/);
        var verb = text.match(/are|is|was|were/)[0];
        return "No," + subject + verb + " not " + lastWord + ".";
    }
    
    return "Sorry, I don't understand the question.";
}