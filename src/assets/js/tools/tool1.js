function convert() {
    const order = [
        'quantity', 'opinion', 'size', 'age', 'shape', 'color', 'origin', 'material', 'purpose'
    ];

    let text = document.getElementById('textInput').value;
    let output = document.getElementById('output');

    if (text.trim() === "") {
        output.innerText = "Please enter some text.";
        return;
    }

    // テキストを解析
    let doc = nlp(text);
    // 名詞フレーズを抽出
    let nounPhrases = doc.nouns().out('array');
    
    let result = [];
    
    nounPhrases.forEach(nounPhrase => {
        let phraseDoc = nlp(nounPhrase);
        let adjectives = phraseDoc.adjectives().out('array');
        let determiners = phraseDoc.match('#Determiner').out('array');
        let quantity = phraseDoc.numbers().out('array');
     
        
        // 各形容詞の種類を特定しオブジェクトに格納
        let adjWithTypes = adjectives.map(adj => ({
            text: adj,
            type: identifyAdjectiveType(adj)
        }));

        // 形容詞を並び替え
        adjWithTypes.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));

        /*// 並び替えた形容詞を再構築
        let sortedAdjectives = adjWithTypes.map(adj => adj.text).join(' ');
        
        // 再構築されたフレーズで元のフレーズを置換
        let restOfPhrase = phraseDoc.not('#Adjective').not('#Determiner').out('text');
        let newPhrase = `${determiners} ${sortedAdjectives} ${restOfPhrase}`;*/
      
      
        let sortedAdjectives = adjWithTypes.map(adj => `<span class="${adj.type}">${adj.text}</span>`).join(' ');
      
        let htmlQuantities = `<span class="quantity">${quantity.join(' ')}</span>`;

        let restOfPhrase = phraseDoc.not('#Adjective').not('#Determiner').not('#Value').out('text');
        let newPhrase = `${determiners.join(' ')} ${htmlQuantities} ${sortedAdjectives} ${restOfPhrase}`;
      
        text = text.replace(nounPhrase, newPhrase);
    });

    //output.innerText = `${text}.`;
    output.innerHTML = `${text}.`;
}

function identifyAdjectiveType(adj) {
    // 簡略化のための辞書（完全なリストではない）
    const types = {
quantity: [
'one', 'two', 'three', 'many', 'few',
'several', 'some', 'any', 'all', 'both',
'each', 'every', 'no', 'half', 'much'
],
opinion: [
'amazing', 'awesome', 'awful', 'beautiful', 'boring',
'brilliant', 'charming', 'confusing', 'cool', 'cute',
'delightful', 'disgusting', 'dreadful', 'excellent', 'fabulous',
'fantastic', 'frightening', 'funny', 'good', 'great',
'horrible', 'impressive', 'incredible', 'interesting', 'lovely',
'magnificent', 'marvelous', 'nice', 'outstanding', 'poor',
'remarkable', 'ridiculous', 'rad', 'scary', 'silly',
'splendid', 'stunning', 'stupid', 'terrible', 'terrific',
'thrilling', 'ugly', 'unbelievable', 'unpleasant', 'wonderful',
'witty', 'horrendous', 'sensational', 'delicious'
],
size: [
'big', 'small', 'large', 'tiny', 'huge',
'gigantic', 'enormous', 'massive', 'vast', 'miniature',
'compact', 'tall', 'short', 'long', 'wide',
'narrow', 'thick', 'thin', 'deep', 'shallow',
'bulky', 'slim', 'petite', 'colossal', 'immense',
'mammoth', 'minute', 'sizable', 'mighty'
],
age: [
'old', 'young', 'new', 'ancient', 'modern',
'middle-aged', 'elderly', 'mature', 'immature', 'aged',
'infant', 'juvenile', 'teenage', 'adolescent', 'senior',
'fresh', 'recent', 'prime', 'youthful', 'vintage'
],
shape: [
'round', 'square', 'rectangular', 'triangular', 'oval',
'circular', 'flat', 'curved', 'straight', 'angular',
'elliptical', 'hexagonal', 'octagonal', 'pyramidal', 'spherical',
'conical', 'cylindrical', 'linear', 'bent'
],
color: [
'red', 'blue', 'green', 'yellow', 'black',
'white', 'gray', 'brown', 'orange', 'purple',
'pink', 'cyan', 'magenta', 'beige', 'violet',
'indigo', 'turquoise', 'teal', 'silver', 'gold',
'maroon'
],
origin: [
'american', 'british', 'chinese', 'french', 'german',
'italian', 'japanese', 'korean', 'mexican', 'russian',
'spanish', 'thai', 'indian', 'turkish', 'brazilian',
'canadian', 'australian', 'greek', 'egyptian', 'swedish',
'dutch'
],
material: [
'wooden', 'metal', 'plastic', 'cotton', 'silk',
'leather', 'wool', 'glass', 'ceramic', 'stone',
'fabric', 'paper', 'rubber', 'aluminum', 'stainless',
'marble', 'linen', 'velvet', 'acrylic', 'concrete',
'polyester'
],
purpose: [
'sleeping', 'cooking', 'cleaning', 'writing', 'reading',
'driving', 'training', 'working', 'playing', 'exercising',
'bathing', 'traveling', 'studying', 'gardening', 'fishing',
'shopping', 'resting', 'painting', 'singing', 'dancing',
'teaching','office'
],
    };

    for (let type in types) {
        if (types[type].includes(adj.toLowerCase())) {
            return type;
        }
    }
    return 'opinion'; // default = opinion
}