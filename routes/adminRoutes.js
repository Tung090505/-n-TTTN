

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', adminController.getDashboard);
router.get('/san-pham', adminController.getAdminProducts);
router.get('/san-pham/them', adminController.getModifyProduct);
router.get('/san-pham/sua/:id', adminController.getModifyProduct);
router.get('/don-hang', adminController.getAdminOrders);
router.get('/nguoi-dung', adminController.getAdminUsers);
router.put('/nguoi-dung/:id/toggle-status', adminController.toggleUserStatus);

module.exports = router;
