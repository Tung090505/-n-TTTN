/**
 * ============================================
 * routes/adminRoutes.js - DASHBOARD & QUẢN TRỊ
 * ============================================
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Tất cả các route admin đều cần đăng nhập và phải có role 'admin'
router.use(protect);
router.use(authorize('admin'));

// Render giao diện Admin (EJS)
router.get('/dashboard', adminController.getDashboard);
router.get('/san-pham', adminController.getAdminProducts);
router.get('/san-pham/them', adminController.getModifyProduct);
router.get('/san-pham/sua/:id', adminController.getModifyProduct);
router.get('/don-hang', adminController.getAdminOrders);
router.get('/nguoi-dung', adminController.getAdminUsers);
router.put('/nguoi-dung/:id/toggle-status', adminController.toggleUserStatus);

module.exports = router;
