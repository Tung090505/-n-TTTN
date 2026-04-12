const Coupon = require('../models/Coupon');
const { AppError } = require('../middleware/errorHandler');

// Admin: Get all coupons
exports.getAdminCoupons = async (req, res, next) => {
    try {
        const coupons = await Coupon.find().sort('-createdAt');
        res.render('admin/coupons', {
            title: 'Quản lý Mã giảm giá | TechStore',
            active: 'coupons',
            coupons
        });
    } catch (error) {
        next(error);
    }
};

// Admin: Create coupon
exports.createCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Tạo mã giảm giá thành công',
            data: { coupon }
        });
    } catch (error) {
        next(error);
    }
};

// Admin: Toggle status
exports.toggleCouponStatus = async (req, res, next) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return next(new AppError('Không tìm thấy mã giảm giá', 404));

        coupon.isActive = !coupon.isActive;
        await coupon.save();

        res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái thành công'
        });
    } catch (error) {
        next(error);
    }
};

// User: Validate coupon
exports.validateCoupon = async (req, res, next) => {
    try {
        const { code, orderAmount } = req.body;
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Mã giảm giá không tồn tại'
            });
        }

        if (!coupon.isValid()) {
            return res.status(400).json({
                success: false,
                message: 'Mã giảm giá đã hết hạn hoặc hết lượt sử dụng'
            });
        }

        if (orderAmount < coupon.minOrderAmount) {
            return res.status(400).json({
                success: false,
                message: `Đơn hàng tối thiểu ${coupon.minOrderAmount.toLocaleString('vi-VN')}đ để sử dụng mã này`
            });
        }

        let discount = 0;
        if (coupon.discountType === 'percent') {
            discount = Math.round(orderAmount * (coupon.discountAmount / 100));
            if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
                discount = coupon.maxDiscountAmount;
            }
        } else {
            discount = coupon.discountAmount;
        }

        res.status(200).json({
            success: true,
            message: 'Áp dụng mã giảm giá thành công',
            data: {
                couponId: coupon._id,
                code: coupon.code,
                discount
            }
        });
    } catch (error) {
        next(error);
    }
};
