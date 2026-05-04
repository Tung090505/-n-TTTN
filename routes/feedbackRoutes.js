const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');

// Routes cho Customer
router.use(protect); // Tất cả routes đều cần đăng nhập

router.route('/')
    .post(authorize('customer'), feedbackController.createFeedback)
    .get(authorize('admin', 'staff'), feedbackController.getAllFeedbacks);

router.get('/my-feedback', authorize('customer'), feedbackController.getMyFeedback);

router.get('/statistics', authorize('admin', 'staff'), feedbackController.getStatistics);

router.route('/:id')
    .put(authorize('customer'), feedbackController.updateFeedback)
    .delete(authorize('admin'), feedbackController.deleteFeedback);

module.exports = router;
