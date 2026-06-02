const express = require('express');
const router = express.Router();
const paraphraseController = require('../controllers/paraphraseController');

// POST /api/paraphrase
router.post('/', paraphraseController.paraphrase);

module.exports = router;
