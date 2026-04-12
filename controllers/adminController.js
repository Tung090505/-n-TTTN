

const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

exports.getDashboard = async (req, res, next) => {
    try {
        const today = new Date();
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

        const [
            totalRevenueData,
            monthRevenueData,
            lastMonthRevenueData,
            totalOrders,
            pendingOrders,
            totalProducts,
            lowStockProducts,
            totalUsers,
            newUsersThisMonth,
            diamondUsers,
            totalPointsData,
            recentOrders,
            topProducts
        ] = await Promise.all([
            Order.aggregate([{ $match: { orderStatus: 'delivered' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
            Order.aggregate([{ $match: { orderStatus: 'delivered', createdAt: { $gte: thisMonth } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
            Order.aggregate([{ $match: { orderStatus: 'delivered', createdAt: { $gte: lastMonth, $lte: lastMonthEnd } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
            Order.countDocuments(),
            Order.countDocuments({ orderStatus: { $in: ['pending', 'confirmed'] } }),
            Product.countDocuments({ isActive: true }),
            Product.countDocuments({ isActive: true, stock: { $lt: 10 } }),
            User.countDocuments({ role: 'customer' }),
            User.countDocuments({ role: 'customer', createdAt: { $gte: thisMonth } }),
            User.countDocuments({ membershipLevel: 'diamond' }),
            User.aggregate([{ $group: { _id: null, total: { $sum: '$points' } } }]),
            Order.find().sort('-createdAt').limit(6).populate('user', 'firstName lastName'),
            Product.find({ isActive: true }).sort('-sold').limit(5)
        ]);

        const currentMonthRevenue = monthRevenueData[0]?.total || 0;
        const previousMonthRevenue = lastMonthRevenueData[0]?.total || 0;
        const revenueGrowth = previousMonthRevenue > 0
            ? (((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100).toFixed(1)
            : 100;

        const stats = {
            totalRevenue: totalRevenueData[0]?.total || 0,
            monthRevenue: currentMonthRevenue,
            revenueGrowth,
            totalOrders,
            pendingOrders,
            totalProducts,
            lowStockProducts,
            totalUsers,
            newUsersThisMonth,
            diamondUsers,
            totalPoints: totalPointsData[0]?.total || 0
        };

        res.render('admin/dashboard', {
            title: 'Hệ thống Quản Trị | TechStore',
            stats,
            recentOrders,
            topProducts
        });
    } catch (error) {
        next(error);
    }
};

exports.getAdminProducts = async (req, res, next) => {
    try {
        const products = await Product.find().sort('-createdAt');
        res.render('admin/products/index', {
            title: 'Quản lý Sản phẩm | TechStore',
            products
        });
    } catch (err) { next(err); }
};

exports.getAdminOrders = async (req, res, next) => {
    try {
        const orders = await Order.find().sort('-createdAt').populate('user', 'firstName lastName phone');
        res.render('admin/orders/index', {
            title: 'Quản lý Đơn hàng | TechStore',
            orders
        });
    } catch (err) { next(err); }
};

exports.getModifyProduct = async (req, res, next) => {
    try {
        let product = null;
        if (req.params.id) {
            product = await Product.findById(req.params.id);
        }
        res.render('admin/products/modify', {
            title: product ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới',
            product
        });
    } catch (err) { next(err); }
};

exports.getAdminUsers = async (req, res, next) => {
    try {
        const users = await User.find().sort('-createdAt');
        res.render('admin/users/index', {
            title: 'Quản lý Người dùng | TechStore',
            users
        });
    } catch (err) { next(err); }
};

exports.toggleUserStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
        }

        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Bạn không thể tự khóa tài khoản của chính mình' });
        }

        user.isActive = !user.isActive;
        await user.save({ validateBeforeSave: false });

        res.json({
            success: true,
            message: `Đã ${user.isActive ? 'mở khóa' : 'khóa'} tài khoản ${user.email} thành công!`,
            isActive: user.isActive
        });
    } catch (err) { next(err); }
};

exports.createStaff = async (req, res, next) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Email này đã được sử dụng' });
        }
        await User.create({
            firstName, lastName, email, phone, password,
            role: 'staff', isEmailVerified: true
        });
        res.status(201).json({ success: true, message: 'Đã tạo tài khoản nhân viên thành công!' });
    } catch (err) { next(err); }
};
