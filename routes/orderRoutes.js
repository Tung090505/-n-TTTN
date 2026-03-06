/**
 * ============================================
 * routes/orderRoutes.js - ROUTES ĐƠN HÀNG
 * ============================================
 */

const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const adminController = require('../controllers/adminController');
const { protect, adminOnly, staffAndAdmin } = require('../middleware/auth');
const { validateOrder } = require('../middleware/validate');

// --- User Routes ---
router.post('/', protect, validateOrder, orderController.createOrder);     // Đặt hàng
router.get('/my-orders', protect, orderController.getMyOrders);      // Lịch sử đơn hàng
router.get('/my-orders/:orderCode', protect, orderController.getOrderDetail);   // Chi tiết đơn
router.put('/my-orders/:orderCode/cancel', protect, orderController.cancelOrder);      // Hủy đơn

// --- Admin/Staff Routes ---
router.get('/admin', ...staffAndAdmin, adminController.getAdminOrders);       // Tất cả đơn hàng
router.put('/admin/:id/status', ...staffAndAdmin, orderController.updateOrderStatus); // Cập nhật trạng thái

module.exports = router;
