

const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { AppError } = require('../middleware/errorHandler');

exports.createOrder = async (req, res, next) => {
    try {
        const { shippingAddress, paymentMethod, customerNote } = req.body;

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

        const order = await Order.create({
            user: req.user.id,
            items: orderItems,
            subtotal,
            shippingFee,
            totalAmount: subtotal + shippingFee,
            shippingAddress,
            paymentMethod,
            customerNote,
            statusHistory: [{
                status: 'pending',
                note: 'Đơn hàng mới được tạo',
            }],
        });

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
