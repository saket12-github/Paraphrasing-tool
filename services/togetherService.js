// Note: fetch() is used here — requires Node.js 18 or higher
const { TOGETHER_API_KEY, TOGETHER_MODEL, TOGETHER_API_URL, MAX_TOKENS } = require('../config/together');

// ─── Mode Instructions ────────────────────────────────────────────────────────
// Each mode gets a specific writing instruction injected into the prompt.
const MODE_INSTRUCTIONS = {
  standard:     'Use clear, natural everyday language.',
  professional: 'Use formal business language suitable for corporate communication.',
  academic:     'Use precise scholarly language with discipline-appropriate vocabulary.',
  creative:     'Use vivid, expressive language with varied sentence structures and imagery.',
  simple:       'Use the simplest possible words. Write short sentences. Aim for a 6th grade reading level.',
  formal:       'Use polished, elevated formal language appropriate for official documents.',
  casual:       'Use relaxed, conversational language as if talking to a close friend.',
};

// Creative modes need more variety; analytical modes need more precision.
const MODE_TEMPERATURES = {
  creative:  0.9,
  academic:  0.5,
  simple:    0.5,
};
const DEFAULT_TEMPERATURE = 0.7;

/**
 * Builds the system and user prompts for the TogetherAI API call.
 * Keeping prompt construction separate makes it easy to test and tweak.
 */
function buildPrompt(text, mode, tone, targetAudience) {
  // System prompt: sets the AI's role and hard constraints.
  // Stable across requests — good for prompt caching if the provider supports it.
  const systemPrompt = `You are an expert writing assistant specializing in paraphrasing.
Your task is to rewrite the text provided by the user according to their instructions.

Rules you must follow:
- Preserve the original meaning exactly — do not add, remove, or change facts
- Do not include any explanations, notes, or preamble
- Output ONLY the paraphrased text, nothing else`;

  // User prompt: combines all the user's choices into a clear task description.
  const audienceLine = targetAudience
    ? `\nTarget audience: ${targetAudience}`
    : '';

  const userPrompt = `Paraphrase the following text.

Mode: ${mode}
Instruction: ${MODE_INSTRUCTIONS[mode]}

Tone: ${tone}${audienceLine}

Text to paraphrase:
"${text}"`;

  return { systemPrompt, userPrompt };
}

/**
 * Calls the TogetherAI chat completions API and returns the paraphrased text.
 *
 * @param {string} text - The original text to paraphrase
 * @param {string} mode - Paraphrasing style (standard, professional, etc.)
 * @param {string} tone - Desired tone (neutral, confident, etc.)
 * @param {string|null} targetAudience - Optional intended audience
 * @returns {Promise<string>} The paraphrased text
 */
async function paraphraseText(text, mode, tone, targetAudience) {
  const { systemPrompt, userPrompt } = buildPrompt(text, mode, tone, targetAudience);
  const temperature = MODE_TEMPERATURES[mode] ?? DEFAULT_TEMPERATURE;

  const requestBody = {
    model: TOGETHER_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userPrompt },
    ],
    max_tokens:  MAX_TOKENS,
    temperature: temperature,
    stream:      false,
  };

  const response = await fetch(TOGETHER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOGETHER_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  // If the API returns a non-2xx status, surface the error clearly
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`TogetherAI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const result = data?.choices?.[0]?.message?.content?.trim();

  if (!result) {
    throw new Error('TogetherAI returned an empty response. Please try again.');
  }

  return result;
}

module.exports = { paraphraseText };
