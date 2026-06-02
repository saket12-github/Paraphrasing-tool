// TogetherAI configuration
// All sensitive values come from environment variables (.env file)

// Fail fast at startup if the API key is missing — better than a cryptic error at request time
if (!process.env.TOGETHER_API_KEY) {
  throw new Error('Missing TOGETHER_API_KEY in environment variables. Copy .env.example to .env and fill in your key.');
}

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

// The model to use. Set TOGETHER_MODEL in .env or fall back to a free default.
const TOGETHER_MODEL = process.env.TOGETHER_MODEL || 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free';

// TogetherAI OpenAI-compatible chat completions endpoint
const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions';

// Hard cap on output tokens — prevents runaway responses and controls cost
const MAX_TOKENS = 1024;

// Default sampling temperature (0 = deterministic, 1 = creative)
const TEMPERATURE = 0.7;

module.exports = {
  TOGETHER_API_KEY,
  TOGETHER_MODEL,
  TOGETHER_API_URL,
  MAX_TOKENS,
  TEMPERATURE,
};
