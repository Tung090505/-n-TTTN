const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, adminOnly, staffAndAdmin } = require('../middleware/auth');

router.use(protect);

// Dashboard - Cả 2
router.get('/dashboard', ...staffAndAdmin, adminController.getDashboard);

// Quản lý sản phẩm - Cả 2
router.get('/san-pham', ...staffAndAdmin, adminController.getAdminProducts);
router.get('/san-pham/them', ...staffAndAdmin, adminController.getModifyProduct);
router.get('/san-pham/sua/:id', ...staffAndAdmin, adminController.getModifyProduct);

// Quản lý đơn hàng - Cả 2
router.get('/don-hang', ...staffAndAdmin, adminController.getAdminOrders);

// Hỗ trợ khách hàng (Chat)
router.get('/chat-support', ...staffAndAdmin, (req, res) => {
    res.render('admin/chat-support', {
        title: 'Hỗ trợ Khách hàng | TechStore',
        active: 'chat'
    });
});

// Quản lý người dùng - CHỈ ADMIN
router.get('/nguoi-dung', ...adminOnly, adminController.getAdminUsers);
router.post('/nguoi-dung/staff', ...adminOnly, adminController.createStaff);
router.put('/nguoi-dung/:id/toggle-status', ...adminOnly, adminController.toggleUserStatus);

module.exports = router;
