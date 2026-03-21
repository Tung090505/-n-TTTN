

const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const { validateProduct, validateProductQuery } = require('../middleware/validate');
const { uploadCloud } = require('../config/cloudinary');

router.get('/', validateProductQuery, productController.getProducts);      
router.get('/featured', productController.getFeaturedProducts); 
router.get('/best-sellers', productController.getBestSellers);     
router.get('/:slug', productController.getProduct);         

router.post('/:id/reviews', protect, productController.addReview); 

router.post('/', ...adminOnly, uploadCloud.single('image'), validateProduct, productController.createProduct); 
router.put('/:id', ...adminOnly, uploadCloud.single('image'), validateProduct, productController.updateProduct); 
router.delete('/:id', ...adminOnly, productController.deleteProduct); 

module.exports = router;
