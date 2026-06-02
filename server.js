// Load environment variables FIRST before any other imports
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const paraphraseRoutes = require('./routes/paraphrase');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────

// Allow cross-origin requests (useful when running frontend on a separate dev server)
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Serve the frontend (HTML, CSS, JS) from the public/ folder
app.use(express.static(path.join(__dirname, 'public')));

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use('/api/paraphrase', paraphraseRoutes);

// ─── Global Error Handler ────────────────────────────────────────────────────
// This catches any errors passed via next(err) in controllers/services
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error. Please try again.' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
