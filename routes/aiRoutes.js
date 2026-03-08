/**
 * ============================================
 * routes/aiRoutes.js - ROUTES AI BUILD PC
 * ============================================
 * Định nghĩa các endpoint cho tính năng
 * AI gợi ý cấu hình máy tính.
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// --- Trang Build PC (Render giao diện) ---
router.get('/build-pc', aiController.getBuildPC);

// --- API: AI Mode - Sinh cấu hình từ mô tả ---
router.post('/api/ai/build-pc', aiController.aiBuildPC);

// --- API: Hybrid Mode - Gợi ý linh kiện còn lại ---
router.post('/api/ai/suggest-parts', aiController.suggestParts);

module.exports = router;
