const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Mã giảm giá là bắt buộc'],
        unique: true,
        uppercase: true,
        trim: true,
    },
    discountType: {
        type: String,
        enum: ['percent', 'fixed'],
        default: 'percent',
    },
    discountAmount: {
        type: Number,
        required: [true, 'Giá trị giảm giá là bắt buộc'],
        min: 0,
    },
    minOrderAmount: {
        type: Number,
        default: 0,
        min: 0,
    },
    maxDiscountAmount: {
        type: Number, 
        min: 0,
    },
    startDate: {
        type: Date,
        default: Date.now,
    },
    endDate: {
        type: Date,
        required: [true, 'Ngày hết hạn là bắt buộc'],
    },
    usageLimit: {
        type: Number,
        default: null, // null means unlimited
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Check if coupon is valid
CouponSchema.methods.isValid = function() {
    const now = new Date();
    const isWithinDate = now >= this.startDate && now <= this.endDate;
    const isNotExceeded = this.usageLimit === null || this.usedCount < this.usageLimit;
    return this.isActive && isWithinDate && isNotExceeded;
};

module.exports = mongoose.model('Coupon', CouponSchema);
