// Sentiment Analysis Demo using Transformers.js
// Model: Xenova/distilbert-base-uncased-finetuned-sst-2-english

let classifier = null;
let isLoading = false;

// DOM elements
const inputEl = document.getElementById('demo-input');
const analyzeBtn = document.getElementById('analyze-btn');
const sampleBtn = document.getElementById('sample-btn');
const resultContainer = document.getElementById('result-container');

const SAMPLE_TEXT = "Learning natural language processing opens incredible opportunities for students and society alike. It empowers people to build tools that break down language barriers, improve communication, and make information more accessible to everyone. The skills gained are genuinely exciting and deeply rewarding.";

// Initialize on first interaction
async function initModel() {
  if (classifier || isLoading) return;

  isLoading = true;
  updateUI('loading', 'Loading AI model...');
  analyzeBtn.disabled = true;

  try {
    // Dynamic import of Transformers.js
    const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1');

    // Load sentiment analysis pipeline
    classifier = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');

    isLoading = false;
    analyzeBtn.disabled = false;
    updateUI('ready', '');

    // Run analysis if there's text
    if (inputEl.value.trim()) {
      await analyze();
    }
  } catch (error) {
    isLoading = false;
    analyzeBtn.disabled = false;
    updateUI('error', 'Failed to load model. Please try again.');
    console.error('Model loading error:', error);
  }
}

// Analyze text
async function analyze() {
  const text = inputEl.value.trim();

  if (!text) {
    updateUI('empty', 'Enter some text to analyze');
    return;
  }

  // Initialize model if not loaded
  if (!classifier) {
    await initModel();
    if (!classifier) return;
  }

  analyzeBtn.disabled = true;
  updateUI('analyzing', 'Analyzing...');

  try {
    const result = await classifier(text);
    const sentiment = result[0];

    updateUI('result', sentiment);
    analyzeBtn.disabled = false;
  } catch (error) {
    updateUI('error', 'Analysis failed. Please try again.');
    analyzeBtn.disabled = false;
    console.error('Analysis error:', error);
  }
}

// Update UI based on state
function updateUI(state, data) {
  switch (state) {
    case 'loading':
      resultContainer.innerHTML = `
        <div class="loading-indicator">
          <div class="spinner-border spinner-border-sm" role="status"></div>
          <span>${data}</span>
        </div>
      `;
      break;

    case 'analyzing':
      resultContainer.innerHTML = `
        <div class="loading-indicator">
          <div class="spinner-border spinner-border-sm" role="status"></div>
          <span>${data}</span>
        </div>
      `;
      break;

    case 'result':
      const isPositive = data.label === 'POSITIVE';
      const confidence = (data.score * 100).toFixed(1);
      const emoji = isPositive ? '&#128512;' : '&#128542;';

      resultContainer.innerHTML = `
        <div class="result-box ${isPositive ? 'result-positive' : 'result-negative'}">
          <div class="result-label">${emoji} ${data.label}</div>
          <div class="result-confidence">${confidence}% confidence</div>
        </div>
      `;
      break;

    case 'error':
      resultContainer.innerHTML = `
        <div class="text-warning">
          <i class="bi bi-exclamation-triangle me-2"></i>${data}
        </div>
      `;
      break;

    case 'empty':
      resultContainer.innerHTML = `
        <div class="text-muted">
          <i class="bi bi-chat-text me-2"></i>${data}
        </div>
      `;
      break;

    case 'ready':
    default:
      resultContainer.innerHTML = '';
      break;
  }
}

// Event listeners
analyzeBtn.addEventListener('click', analyze);

sampleBtn.addEventListener('click', () => {
  inputEl.value = SAMPLE_TEXT;
  updateUI('ready', '');
});

// Allow Enter key to trigger analysis (Shift+Enter for new line)
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    analyze();
  }
});

// Initial state
updateUI('ready', '');
