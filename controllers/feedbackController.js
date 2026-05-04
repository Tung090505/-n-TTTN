const WebsiteFeedback = require('../models/WebsiteFeedback');
const catchAsync = require('../utils/catchAsync');

// @desc    Tạo đánh giá website
// @route   POST /api/feedback
// @access  Private (Customer only)
exports.createFeedback = catchAsync(async (req, res, next) => {
    const { rating, comment, category } = req.body;

    // Map rating number to text
    const ratingMap = {
        1: 'Rất tệ',
        2: 'Không tốt',
        3: 'Bình thường',
        4: 'Tốt',
        5: 'Rất tốt'
    };

    // Kiểm tra user đã đánh giá chưa
    const existingFeedback = await WebsiteFeedback.findOne({ user: req.user._id });
    
    if (existingFeedback) {
        return res.status(400).json({
            success: false,
            message: 'Bạn đã đánh giá website rồi. Vui lòng cập nhật đánh giá cũ.'
        });
    }

    const feedback = await WebsiteFeedback.create({
        user: req.user._id,
        rating,
        ratingText: ratingMap[rating],
        comment,
        category
    });

    res.status(201).json({
        success: true,
        message: 'Cảm ơn bạn đã đánh giá!',
        data: feedback
    });
});

// @desc    Cập nhật đánh giá website
// @route   PUT /api/feedback/:id
// @access  Private (Customer only)
exports.updateFeedback = catchAsync(async (req, res, next) => {
    const { rating, comment, category } = req.body;

    const ratingMap = {
        1: 'Rất tệ',
        2: 'Không tốt',
        3: 'Bình thường',
        4: 'Tốt',
        5: 'Rất tốt'
    };

    let feedback = await WebsiteFeedback.findById(req.params.id);

    if (!feedback) {
        return res.status(404).json({
            success: false,
            message: 'Không tìm thấy đánh giá'
        });
    }

    // Kiểm tra quyền sở hữu
    if (feedback.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền cập nhật đánh giá này'
        });
    }

    feedback.rating = rating || feedback.rating;
    feedback.ratingText = ratingMap[rating] || feedback.ratingText;
    feedback.comment = comment || feedback.comment;
    feedback.category = category || feedback.category;

    await feedback.save();

    res.status(200).json({
        success: true,
        message: 'Cập nhật đánh giá thành công',
        data: feedback
    });
});

// @desc    Lấy đánh giá của user hiện tại
// @route   GET /api/feedback/my-feedback
// @access  Private (Customer only)
exports.getMyFeedback = catchAsync(async (req, res, next) => {
    const feedback = await WebsiteFeedback.findOne({ user: req.user._id });

    res.status(200).json({
        success: true,
        data: feedback
    });
});

// @desc    Lấy tất cả đánh giá (Admin only)
// @route   GET /api/feedback
// @access  Private (Admin only)
exports.getAllFeedbacks = catchAsync(async (req, res, next) => {
    const feedbacks = await WebsiteFeedback.find()
        .populate('user', 'name email')
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: feedbacks.length,
        data: feedbacks
    });
});

// @desc    Lấy thống kê đánh giá
// @route   GET /api/feedback/statistics
// @access  Private (Admin only)
exports.getStatistics = catchAsync(async (req, res, next) => {
    const stats = await WebsiteFeedback.getStatistics();

    res.status(200).json({
        success: true,
        data: stats
    });
});

// @desc    Xóa đánh giá (Admin only)
// @route   DELETE /api/feedback/:id
// @access  Private (Admin only)
exports.deleteFeedback = catchAsync(async (req, res, next) => {
    const feedback = await WebsiteFeedback.findById(req.params.id);

    if (!feedback) {
        return res.status(404).json({
            success: false,
            message: 'Không tìm thấy đánh giá'
        });
    }

    await feedback.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Xóa đánh giá thành công'
    });
});
