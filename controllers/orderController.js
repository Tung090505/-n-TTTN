

const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { AppError } = require('../middleware/errorHandler');

exports.createOrder = async (req, res, next) => {
    try {
        const { shippingAddress, paymentMethod, customerNote, deliveryMethod, pointsUsed } = req.body;
        
        const User = require('../models/User');
        const user = await User.findById(req.user.id);

        if (pointsUsed > user.points) {
            return next(new AppError('Bạn không có đủ điểm tích lũy.', 400));
        }

        const cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product');

        if (!cart || cart.items.length === 0) {
            return next(new AppError('Giỏ hàng của bạn đang trống.', 400));
        }

        const orderItems = [];
        const stockUpdates = []; 

        for (const item of cart.items) {
            const product = item.product;

            if (!product || !product.isActive) {
                return next(new AppError(`Sản phẩm "${item.product?.name || 'không xác định'}" không còn bán.`, 400));
            }

            if (product.stock < item.quantity) {
                return next(new AppError(
                    `Sản phẩm "${product.name}" chỉ còn ${product.stock} cái trong kho, không đủ để đặt ${item.quantity} cái.`,
                    400
                ));
            }

            orderItems.push({
                product: product._id,
                name: product.name,
                thumbnail: product.thumbnail,
                quantity: item.quantity,
                price: product.finalPrice, 
            });

            stockUpdates.push({
                productId: product._id,
                quantity: item.quantity,
            });
        }

        const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const shippingFee = subtotal >= 5000000 ? 0 : 30000; 

        if (!shippingAddress.fullName) {
            shippingAddress.fullName = `${req.user.lastName} ${req.user.firstName}`;
        }

        // O2O Logistics & Loyalty Ship: Free shipping if pick up at store OR if Gold/Diamond member
        if (deliveryMethod === 'store_pickup' || ['gold', 'diamond'].includes(user.membershipLevel)) {
            shippingFee = 0;
        }

        // Tier Percentage Discount
        const tierDiscountRates = { standard: 0, silver: 0.02, gold: 0.05, diamond: 0.1 };
        const tierRate = tierDiscountRates[user.membershipLevel] || 0;
        const tierDiscount = Math.round(subtotal * tierRate);

        // Coupons
        let couponDiscount = 0;
        let couponId = null;
        if (req.body.couponCode) {
            const Coupon = require('../models/Coupon');
            const coupon = await Coupon.findOne({ code: req.body.couponCode.toUpperCase() });
            if (coupon && coupon.isValid() && subtotal >= coupon.minOrderAmount) {
                if (coupon.discountType === 'percent') {
                    couponDiscount = Math.round(subtotal * (coupon.discountAmount / 100));
                    if (coupon.maxDiscountAmount && couponDiscount > coupon.maxDiscountAmount) {
                        couponDiscount = coupon.maxDiscountAmount;
                    }
                } else {
                    couponDiscount = coupon.discountAmount;
                }
                couponId = coupon._id;
                coupon.usedCount += 1;
                await coupon.save();
            }
        }

        const order = await Order.create({
            user: req.user.id,
            items: orderItems,
            subtotal,
            shippingFee,
            tierDiscount,
            discount: couponDiscount,
            couponCode: req.body.couponCode?.toUpperCase(),
            couponId,
            membershipLevelAtPurchase: user.membershipLevel,
            totalAmount: subtotal + shippingFee - tierDiscount - couponDiscount - (pointsUsed || 0) * 1000,
            shippingAddress: deliveryMethod === 'store_pickup' ? undefined : shippingAddress,
            paymentMethod,
            customerNote,
            deliveryMethod: deliveryMethod || 'home_delivery',
            pointsUsed: pointsUsed || 0,
            pointsEarned: Math.floor(subtotal / 100000), // 1 point per 100k
            statusHistory: [{
                status: 'pending',
                note: 'Đơn hàng mới được tạo',
            }],
        });

        // Deduct points from user immediately if used
        if (pointsUsed > 0) {
            user.points -= pointsUsed;
            await user.save();
        }

        await Promise.all(
            stockUpdates.map(({ productId, quantity }) =>
                Product.findByIdAndUpdate(productId, {
                    $inc: { stock: -quantity, sold: quantity },
                })
            )
        );

        await Cart.findOneAndUpdate(
            { user: req.user.id },
            { $set: { items: [], totalAmount: 0, totalItems: 0 } }
        );

        res.status(201).json({
            success: true,
            message: `Đặt hàng thành công! Mã đơn hàng: ${order.orderCode}`,
            data: { order },
        });
    } catch (error) {
        next(error);
    }
};

exports.getMyOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find({ user: req.user.id })
                .sort('-createdAt')
                .skip(skip)
                .limit(limit)
                .select('-adminNote -statusHistory'),
            Order.countDocuments({ user: req.user.id }),
        ]);

        res.status(200).json({
            success: true,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: { orders },
        });
    } catch (error) {
        next(error);
    }
};

exports.getOrderDetail = async (req, res, next) => {
    try {
        const order = await Order.findOne({
            orderCode: req.params.orderCode,
            user: req.user.id, 
        });

        if (!order) {
            return next(new AppError('Không tìm thấy đơn hàng.', 404));
        }

        res.status(200).json({
            success: true,
            data: { order },
        });
    } catch (error) {
        next(error);
    }
};

exports.cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findOne({
            orderCode: req.params.orderCode,
            user: req.user.id,
        });

        if (!order) {
            return next(new AppError('Không tìm thấy đơn hàng.', 404));
        }

        if (!['pending', 'confirmed'].includes(order.orderStatus)) {
            return next(new AppError(
                'Không thể hủy đơn hàng đang được xử lý hoặc đã giao.',
                400
            ));
        }

        order.orderStatus = 'cancelled';
        order.cancelReason = req.body.reason || 'Khách hàng hủy đơn';
        order.statusHistory.push({
            status: 'cancelled',
            note: req.body.reason || 'Khách hàng hủy đơn',
        });

        await order.save();

        await Promise.all(
            order.items.map(item =>
                Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity, sold: -item.quantity },
                })
            )
        );

        res.status(200).json({
            success: true,
            message: 'Đã hủy đơn hàng thành công.',
            data: { order },
        });
    } catch (error) {
        next(error);
    }
};

exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { status, note } = req.body;

        const order = await Order.findOne({ orderCode: req.params.id });
        if (!order) {
            return next(new AppError('Không tìm thấy đơn hàng.', 404));
        }

        order.orderStatus = status;
        order.statusHistory.push({
            status,
            note: note || `Cập nhật trạng thái: ${status}`,
            updatedBy: req.user.id,
        });

        if (status === 'delivered') {
            order.deliveredAt = new Date();
            order.paymentStatus = 'paid'; 

            // Update User for Loyalty and Stats
            const User = require('../models/User');
            const user = await User.findById(order.user);
            if (user) {
                user.points += order.pointsEarned;
                user.totalSpent += order.totalAmount;
                user.totalOrders += 1;

                // Recalculate membership level
                if (user.totalSpent >= 50000000) user.membershipLevel = 'diamond';
                else if (user.totalSpent >= 15000000) user.membershipLevel = 'gold';
                else if (user.totalSpent >= 5000000) user.membershipLevel = 'silver';

                await user.save();
            }
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái đơn hàng thành công.',
            data: { order },
        });
    } catch (error) {
        next(error);
    }
};
