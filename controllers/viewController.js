

const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const ApiFeatures = require('../utils/apiFeatures');
const { generateVietQR } = require('../utils/paymentUtils');

exports.getHome = async (req, res, next) => {
    try {
        const featuredProducts = await Product.find({ isFeatured: true, isActive: true })
            .limit(8)
            .select('name slug thumbnail price salePrice rating numReviews brand');

        res.render('index', {
            title: 'TechStore - Mua Laptop, PC & Linh Kiện Chính Hãng',
            featuredProducts
        });
    } catch (error) {
        next(error);
    }
};

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

exports.getProductDetail = async (req, res, next) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug, isActive: true })
            .populate('reviews.user', 'firstName lastName avatar');

        if (!product) {
            return res.status(404).render('error', { title: '404 - Không tìm thấy', statusCode: 404, message: 'Sản phẩm không tồn tại.' });
        }

        const relatedProducts = await Product.find({
            category: product.category,
            _id: { $ne: product._id },
            isActive: true
        }).limit(4);

        let hasPurchased = false;
        if (req.user) {
            const hasOrder = await Order.findOne({
                user: req.user.id,
                orderStatus: 'delivered',
                'items.product': product._id
            });
            hasPurchased = !!hasOrder;
        }

        res.render('products/detail', {
            title: `${product.name} | TechStore`,
            product,
            relatedProducts,
            hasPurchased
        });
    } catch (error) {
        next(error);
    }
};

exports.getLogin = (req, res) => {
    if (req.user) return res.redirect('/');
    res.render('auth/login', { title: 'Đăng nhập | TechStore' });
};

exports.getRegister = (req, res) => {
    if (req.user) return res.redirect('/');
    res.render('auth/register', { title: 'Đăng ký tài khoản | TechStore' });
};

exports.getForgotPassword = (req, res) => {
    res.render('auth/forgot-password', { title: 'Quên mật khẩu | TechStore' });
};

exports.getResetPassword = (req, res) => {
    res.render('auth/reset-password', {
        title: 'Đặt lại mật khẩu | TechStore',
        token: req.params.token
    });
};

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

        if (req.user.role !== 'admin' && req.user.role !== 'staff') {
            query.user = req.user.id;
        }

        const order = await Order.findOne(query)
            .populate('user', 'firstName lastName email phone')
            .populate('items.product', 'slug');
        if (!order) return res.status(404).render('error', { title: 'Lỗi', statusCode: 404, message: 'Không tìm thấy đơn hàng.' });

        let sepayQR = null;
        if (order.paymentMethod === 'sepay' && order.paymentStatus === 'unpaid') {
            sepayQR = generateVietQR(
                process.env.SEPAY_BANK_NAME,
                process.env.SEPAY_BANK_ACCOUNT,
                process.env.SEPAY_BANK_OWNER,
                order.totalAmount,
                order.orderCode
            );
        }

        res.render('user/order-detail', {
            title: `Đơn hàng #${order.orderCode} | TechStore`,
            order,
            sepayQR
        });
    } catch (error) {
        next(error);
    }
};

exports.getWishlist = async (req, res, next) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id).populate('wishlist');
        res.render('user/wishlist', {
            title: 'Danh sách yêu thích | TechStore',
            wishlist: user.wishlist
        });
    } catch (error) {
        next(error);
    }
};

exports.getFeedback = (req, res) => {
    res.render('feedback', { 
        title: 'Đánh giá Website | TechStore',
        user: req.user
    });
};
