/**
 * ============================================
 * controllers/viewController.js - ĐIỀU HƯỚNG GIAO DIỆN
 * ============================================
 * Render các trang EJS thân thiện với người dùng
 */

const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const ApiFeatures = require('../utils/apiFeatures');

// --- TRANG CHỦ ---
exports.getHome = (req, res) => {
    res.render('index', {
        title: 'TechStore - Mua Laptop, PC & Linh Kiện Chính Hãng'
    });
};

// --- TRANG DANH SÁCH SẢN PHẨM ---
exports.getProducts = async (req, res, next) => {
    try {
        const features = new ApiFeatures(Product.find(), req.query)
            .filter()
            .search()
            .sort()
            .paginate();

        const [products, total] = await Promise.all([
            features.query,
            Product.countDocuments(features.query.getFilter())
        ]);

        res.render('products/index', {
            title: 'Danh mục Linh Kiện Máy Tính | TechStore',
            products,
            total,
            query: req.query,
            currentPage: parseInt(req.query.page) || 1,
            totalPages: Math.ceil(total / (req.query.limit || 12))
        });
    } catch (error) {
        next(error);
    }
};

// --- TRANG CHI TIẾT SẢN PHẨM ---
exports.getProductDetail = async (req, res, next) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug, isActive: true })
            .populate('reviews.user', 'firstName lastName avatar');

        if (!product) {
            return res.status(404).render('error', { statusCode: 404, message: 'Sản phẩm không tồn tại.' });
        }

        const relatedProducts = await Product.find({
            category: product.category,
            _id: { $ne: product._id },
            isActive: true
        }).limit(4);

        res.render('products/detail', {
            title: `${product.name} | TechStore`,
            product,
            relatedProducts
        });
    } catch (error) {
        next(error);
    }
};

// --- TRANG AUTH ---
exports.getLogin = (req, res) => {
    if (req.user) return res.redirect('/');
    res.render('auth/login', { title: 'Đăng nhập | TechStore' });
};

exports.getRegister = (req, res) => {
    if (req.user) return res.redirect('/');
    res.render('auth/register', { title: 'Đăng ký tài khoản | TechStore' });
};

// --- TRANG GIỎ HÀNG & THANH TOÁN ---
exports.getCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
        res.render('cart', {
            title: 'Giỏ hàng | TechStore',
            cart: cart || { items: [], totalAmount: 0, totalItems: 0 }
        });
    } catch (error) {
        next(error);
    }
};

exports.getCheckout = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
        if (!cart || cart.items.length === 0) return res.redirect('/gio-hang');

        res.render('checkout', {
            title: 'Thanh toán | TechStore',
            cart
        });
    } catch (error) {
        next(error);
    }
};

// --- QUẢN LÝ TÀI KHOẢN & ĐƠN HÀNG (USER) ---
exports.getProfile = (req, res) => {
    res.render('profile', { title: 'Thông tin tài khoản | TechStore' });
};

exports.getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort('-createdAt');
        res.render('user/orders', {
            title: 'Đơn hàng của tôi | TechStore',
            orders
        });
    } catch (error) {
        next(error);
    }
};

exports.getOrderDetail = async (req, res, next) => {
    try {
        const query = { orderCode: req.params.orderCode };
        // Nếu không phải admin/staff thì chỉ xem đơn của chính mình
        if (req.user.role !== 'admin' && req.user.role !== 'staff') {
            query.user = req.user.id;
        }

        const order = await Order.findOne(query).populate('user', 'firstName lastName email phone');
        if (!order) return res.status(404).render('error', { statusCode: 404, title: 'Lỗi', message: 'Không tìm thấy đơn hàng.' });

        res.render('user/order-detail', {
            title: `Đơn hàng #${order.orderCode} | TechStore`,
            order
        });
    } catch (error) {
        next(error);
    }
};
