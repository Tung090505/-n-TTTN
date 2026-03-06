/**
 * ============================================
 * routes/viewRoutes.js - ROUTES TRUY CẬP TRỰC TIẾP (EJS)
 * ============================================
 */

const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');
const { protectView } = require('../middleware/auth');

// --- Public Pages ---
router.get('/', viewController.getHome);
router.get('/san-pham', viewController.getProducts);
router.get('/san-pham/:slug', viewController.getProductDetail);
router.get('/dang-nhap', viewController.getLogin);
router.get('/dang-ky', viewController.getRegister);

// --- Protected Pages (Cần đăng nhập) ---
router.get('/gio-hang', protectView, viewController.getCart);
router.get('/thanh-toan', protectView, viewController.getCheckout);
router.get('/tai-khoan', protectView, viewController.getProfile);
router.get('/tai-khoan/don-hang', protectView, viewController.getMyOrders);
router.get('/tai-khoan/don-hang/:orderCode', protectView, viewController.getOrderDetail);

module.exports = router;
