/**
 * ============================================
 * routes/productRoutes.js - ROUTES SẢN PHẨM
 * ============================================
 */

const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const { validateProduct, validateProductQuery } = require('../middleware/validate');

// --- Public Routes ---
router.get('/', validateProductQuery, productController.getProducts);      // Danh sách + bộ lọc
router.get('/featured', productController.getFeaturedProducts); // Nổi bật
router.get('/best-sellers', productController.getBestSellers);     // Bán chạy
router.get('/:slug', productController.getProduct);         // Chi tiết 1 SP

// --- User Routes (Cần đăng nhập) ---
router.post('/:id/reviews', protect, productController.addReview); // Đánh giá

// --- Admin Routes ---
router.post('/', ...adminOnly, validateProduct, productController.createProduct); // Tạo SP
router.put('/:id', ...adminOnly, validateProduct, productController.updateProduct); // Cập nhật
router.delete('/:id', ...adminOnly, productController.deleteProduct); // Xóa

module.exports = router;
