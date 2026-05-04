const mongoose = require('mongoose');

const websiteFeedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Vui lòng đăng nhập để đánh giá']
    },
    rating: {
        type: Number,
        required: [true, 'Vui lòng chọn mức đánh giá'],
        min: 1,
        max: 5,
        enum: [1, 2, 3, 4, 5]
    },
    ratingText: {
        type: String,
        required: true,
        enum: ['Rất tệ', 'Không tốt', 'Bình thường', 'Tốt', 'Rất tốt']
    },
    comment: {
        type: String,
        maxlength: [500, 'Nhận xét không được quá 500 ký tự']
    },
    category: {
        type: String,
        enum: ['Giao diện', 'Tốc độ', 'Sản phẩm', 'Dịch vụ', 'Khác'],
        default: 'Khác'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index để tìm kiếm nhanh
websiteFeedbackSchema.index({ user: 1, createdAt: -1 });
websiteFeedbackSchema.index({ rating: 1 });

// Mỗi user chỉ được đánh giá 1 lần (có thể sửa lại sau)
websiteFeedbackSchema.index({ user: 1 }, { unique: true });

// Static method: Tính thống kê
websiteFeedbackSchema.statics.getStatistics = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$rating',
                count: { $sum: 1 }
            }
        },
        {
            $sort: { _id: -1 }
        }
    ]);

    // Tính tổng và phần trăm
    const total = stats.reduce((sum, item) => sum + item.count, 0);
    const ratingMap = {
        5: 'Rất tốt',
        4: 'Tốt',
        3: 'Bình thường',
        2: 'Không tốt',
        1: 'Rất tệ'
    };

    const result = stats.map(item => ({
        rating: item._id,
        ratingText: ratingMap[item._id],
        count: item.count,
        percentage: ((item.count / total) * 100).toFixed(2)
    }));

    // Tính điểm trung bình
    const avgRating = stats.reduce((sum, item) => sum + (item._id * item.count), 0) / total;

    return {
        total,
        avgRating: avgRating.toFixed(2),
        breakdown: result
    };
};

module.exports = mongoose.model('WebsiteFeedback', websiteFeedbackSchema);
