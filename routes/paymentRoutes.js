
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Webhook của SePay không cần đăng nhập bằng JWT của user. 
// Việc xác thực dùng SEPAY_WEBHOOK_TOKEN trong header Authorization.
router.post('/webhook/sepay', paymentController.sepayWebhook);

module.exports = router;
