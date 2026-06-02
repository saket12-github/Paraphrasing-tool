const togetherService = require('../services/togetherService');

// Valid paraphrasing modes — used for allowlist validation
const VALID_MODES = ['standard', 'professional', 'academic', 'creative', 'simple', 'formal', 'casual'];

/**
 * POST /api/paraphrase
 * Validates the request body, calls the AI service, and returns the result.
 */
async function paraphrase(req, res, next) {
  const { text, mode, tone, targetAudience } = req.body;

  // ─── Input Validation ───────────────────────────────────────────────────────

  const trimmedText = (text || '').trim();

  if (!trimmedText) {
    return res.status(400).json({ error: 'Validation failed', details: 'Text is required.' });
  }

  if (trimmedText.length < 10) {
    return res.status(400).json({ error: 'Validation failed', details: 'Text must be at least 10 characters long.' });
  }

  if (trimmedText.length > 5000) {
    return res.status(400).json({ error: 'Validation failed', details: 'Text must not exceed 5000 characters.' });
  }

  if (!mode || !VALID_MODES.includes(mode)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: `Mode must be one of: ${VALID_MODES.join(', ')}.`,
    });
  }

  const trimmedTone = (tone || '').trim();
  if (!trimmedTone) {
    return res.status(400).json({ error: 'Validation failed', details: 'Tone is required.' });
  }

  if (trimmedTone.length > 50) {
    return res.status(400).json({ error: 'Validation failed', details: 'Tone must not exceed 50 characters.' });
  }

  if (targetAudience && typeof targetAudience === 'string' && targetAudience.trim().length > 100) {
    return res.status(400).json({ error: 'Validation failed', details: 'Target audience must not exceed 100 characters.' });
  }

  // ─── Call AI Service ────────────────────────────────────────────────────────

  try {
    const paraphrased = await togetherService.paraphraseText(
      trimmedText,
      mode,
      trimmedTone,
      targetAudience ? targetAudience.trim() : null
    );

    return res.json({ paraphrased, mode, tone: trimmedTone });
  } catch (err) {
    // Pass the error to Express's global error handler in server.js
    next(err);
  }
}

module.exports = { paraphrase };
