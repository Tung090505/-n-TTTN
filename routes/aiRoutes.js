

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.get('/build-pc', aiController.getBuildPC);

router.post('/api/ai/build-pc', aiController.aiBuildPC);

router.post('/api/ai/suggest-parts', aiController.suggestParts);

module.exports = router;
