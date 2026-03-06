/**
 * ============================================
 * routes/authRoutes.js - ROUTES XÁC THỰC
 * ============================================
 */

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');

// --- Public Routes (Không cần đăng nhập) ---
router.post('/register', validateRegister, authController.register);  // Đăng ký
router.post('/login', validateLogin, authController.login);     // Đăng nhập
router.post('/logout', authController.logout);    // Đăng xuất

// --- Protected Routes (Cần đăng nhập) ---
router.get('/me', protect, authController.getMe);            // Xem thông tin
router.put('/update-profile', protect, authController.updateProfile);    // Cập nhật profile
router.put('/change-password', protect, authController.changePassword);   // Đổi mật khẩu

module.exports = router;
