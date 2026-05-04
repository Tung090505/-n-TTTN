

const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');
const { protectView } = require('../middleware/auth');

router.get('/', viewController.getHome);
router.get('/san-pham', viewController.getProducts);
router.get('/san-pham/:slug', viewController.getProductDetail);
router.get('/dang-nhap', viewController.getLogin);
router.get('/dang-ky', viewController.getRegister);
router.get('/quen-mat-khau', viewController.getForgotPassword);
router.get('/dat-lai-mat-khau/:token', viewController.getResetPassword);

router.get('/gio-hang', protectView, viewController.getCart);
router.get('/thanh-toan', protectView, viewController.getCheckout);
router.get('/tai-khoan', protectView, viewController.getProfile);
router.get('/tai-khoan/don-hang', protectView, viewController.getMyOrders);
router.get('/tai-khoan/don-hang/:orderCode', protectView, viewController.getOrderDetail);
router.get('/tai-khoan/yeu-thich', protectView, viewController.getWishlist);
router.get('/danh-gia-website', protectView, viewController.getFeedback);

module.exports = router;
