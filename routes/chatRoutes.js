const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect, staffAndAdmin } = require('../middleware/auth');

// Lưu ý: route này dành cho cả khách và nhân viên lấy lịch sử chat của 1 room
router.get('/history/:room', protect, chatController.getChatHistory);

// Dành cho nhân viên: Lấy danh sách những khách hàng đang chat
router.get('/customer-list', ...staffAndAdmin, chatController.getCustomerChatList);

// Đánh dấu tin nhắn đã đọc
router.patch('/mark-read/:room', ...staffAndAdmin, chatController.markAsRead);

module.exports = router;
