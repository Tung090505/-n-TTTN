

const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', cartController.getCart);         
router.post('/add', cartController.addToCart);       
router.put('/update', cartController.updateCartItem);  
router.delete('/', cartController.clearCart);       
router.delete('/:productId', cartController.removeFromCart);  

module.exports = router;
