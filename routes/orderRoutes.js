

const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const adminController = require('../controllers/adminController');
const { protect, adminOnly, staffAndAdmin } = require('../middleware/auth');
const { validateOrder } = require('../middleware/validate');

router.post('/', protect, validateOrder, orderController.createOrder);     
router.get('/my-orders', protect, orderController.getMyOrders);      
router.get('/my-orders/:orderCode', protect, orderController.getOrderDetail);   
router.put('/my-orders/:orderCode/cancel', protect, orderController.cancelOrder);      

router.get('/admin', ...staffAndAdmin, adminController.getAdminOrders);       
router.put('/admin/:id/status', ...staffAndAdmin, orderController.updateOrderStatus); 

module.exports = router;
