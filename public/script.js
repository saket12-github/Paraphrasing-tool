// ─── DOM References ───────────────────────────────────────────────────────────
// Grab all elements once at the top — avoids repeated DOM lookups
const inputText      = document.getElementById('inputText');
const charCount      = document.getElementById('charCount');
const charCounter    = charCount.parentElement; // the .char-counter wrapper div
const modeSelect     = document.getElementById('modeSelect');
const toneSelect     = document.getElementById('toneSelect');
const audienceInput  = document.getElementById('audienceInput');
const paraphraseBtn  = document.getElementById('paraphraseBtn');
const clearBtn       = document.getElementById('clearBtn');
const spinner        = document.getElementById('spinner');
const errorMsg       = document.getElementById('errorMsg');
const outputText     = document.getElementById('outputText');
const copyBtn        = document.getElementById('copyBtn');

const MAX_LENGTH     = 5000;
const WARN_THRESHOLD = 4500;

// ─── Character Counter ────────────────────────────────────────────────────────
inputText.addEventListener('input', () => {
  const length = inputText.value.length;
  charCount.textContent = length;

  // Visual feedback as the user approaches the limit
  charCounter.classList.toggle('warning', length >= WARN_THRESHOLD && length < MAX_LENGTH);
  charCounter.classList.toggle('error',   length >= MAX_LENGTH);
});

// ─── Form Validation ──────────────────────────────────────────────────────────
// Returns { valid: boolean, message: string }
// Mirrors server-side validation so the user gets instant feedback
function validateForm() {
  const text = inputText.value.trim();
  const mode = modeSelect.value;

  if (!text) {
    return { valid: false, message: 'Please enter some text to paraphrase.' };
  }
  if (text.length < 10) {
    return { valid: false, message: 'Text must be at least 10 characters long.' };
  }
  if (text.length > MAX_LENGTH) {
    return { valid: false, message: `Text must not exceed ${MAX_LENGTH} characters.` };
  }
  if (!mode) {
    return { valid: false, message: 'Please select a paraphrasing mode.' };
  }

  return { valid: true, message: '' };
}

// ─── Show / Hide Helpers ──────────────────────────────────────────────────────
function showError(message) {
  errorMsg.textContent = message;
  errorMsg.hidden = false;
}

function hideError() {
  errorMsg.hidden = true;
  errorMsg.textContent = '';
}

function showSpinner() {
  spinner.hidden = false;
}

function hideSpinner() {
  spinner.hidden = true;
}

// ─── Paraphrase Handler ───────────────────────────────────────────────────────
paraphraseBtn.addEventListener('click', async () => {
  // 1. Validate before doing anything
  const { valid, message } = validateForm();
  if (!valid) {
    showError(message);
    return;
  }

  // 2. Clear previous output and error, show loading state
  hideError();
  outputText.textContent = '';
  copyBtn.hidden = true;
  showSpinner();
  paraphraseBtn.disabled = true;
  paraphraseBtn.textContent = 'Paraphrasing...';

  // 3. Build the request payload
  const payload = {
    text:           inputText.value.trim(),
    mode:           modeSelect.value,
    tone:           toneSelect.value,
    targetAudience: audienceInput.value.trim() || null,
  };

  try {
    // 4. Send the request to the backend
    const response = await fetch('/api/paraphrase', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      // 5a. Success — display the result
      outputText.textContent = data.paraphrased;
      copyBtn.hidden = false;
    } else {
      // 5b. Server returned a validation or known error
      showError(data.details || data.error || 'Something went wrong. Please try again.');
    }

  } catch (networkError) {
    // 5c. Network failure (offline, server down, etc.)
    showError('Could not reach the server. Please check your connection and try again.');
  } finally {
    // 6. Always restore the button and hide the spinner
    hideSpinner();
    paraphraseBtn.disabled = false;
    paraphraseBtn.textContent = 'Paraphrase';
  }
});

// ─── Copy to Clipboard ────────────────────────────────────────────────────────
copyBtn.addEventListener('click', async () => {
  const textToCopy = outputText.textContent;
  if (!textToCopy) return;

  try {
    await navigator.clipboard.writeText(textToCopy);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = 'Copy to Clipboard';
    }, 2000);
  } catch {
    // Clipboard API may be blocked in some browsers — graceful fallback
    showError('Could not copy text. Please select and copy it manually.');
  }
});

// ─── Clear Button ─────────────────────────────────────────────────────────────
clearBtn.addEventListener('click', () => {
  inputText.value          = '';
  audienceInput.value      = '';
  modeSelect.value         = '';
  toneSelect.value         = 'neutral';

  charCount.textContent    = '0';
  charCounter.classList.remove('warning', 'error');

  outputText.textContent   = '';
  copyBtn.hidden           = true;
  hideError();
  hideSpinner();
});
