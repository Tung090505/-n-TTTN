/**
 * ============================================
 * routes/cartRoutes.js - ROUTES GIỎ HÀNG
 * ============================================
 */

const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

// Tất cả các route giỏ hàng đều yêu cầu đăng nhập
router.use(protect);

router.get('/', cartController.getCart);         // Xem giỏ hàng
router.post('/add', cartController.addToCart);       // Thêm vào giỏ
router.put('/update', cartController.updateCartItem);  // Cập nhật số lượng
router.delete('/', cartController.clearCart);       // Xóa toàn bộ
router.delete('/:productId', cartController.removeFromCart);  // Xóa 1 sản phẩm

module.exports = router;
