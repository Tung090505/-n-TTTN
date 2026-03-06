/**
 * ============================================
 * app.js - KHỞI TẠO ỨNG DỤNG EXPRESS
 * ============================================
 * File chính của ứng dụng TechStore E-Commerce
 * Cấu hình: Middleware bảo mật, Routes, Error Handling
 */

// Tải biến môi trường từ file .env TRƯỚC TIÊN
require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const methodOverride = require('method-override');
const session = require('express-session');

// Middleware bảo mật chống tấn công
const mongoSanitize = require('express-mongo-sanitize'); // Chống NoSQL Injection
const xss = require('xss-clean');              // Chống XSS Attack
const hpp = require('hpp');                    // Chống HTTP Parameter Pollution
const rateLimit = require('express-rate-limit');     // Giới hạn request

// Kết nối Database
const connectDB = require('./db');

// Import Routes
const viewRoutes = require('./routes/viewRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Import Error Handler
const errorHandler = require('./middleware/errorHandler');

// ============================================
// KHỞI TẠO KẾT NỐI DATABASE
// ============================================
connectDB();

// ============================================
// KHỞI TẠO ỨNG DỤNG EXPRESS
// ============================================
const app = express();

// ============================================
// CẤU HÌNH TEMPLATE ENGINE (EJS)
// ============================================
const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ============================================
// MIDDLEWARE BẢO MẬT (Đặt TRƯỚC các route)
// ============================================

/**
 * 1. HELMET - Bảo vệ HTTP Headers
 * Tự động thiết lập các header bảo mật để chống lại
 * các cuộc tấn công phổ biến như ClickJacking, MIME Sniffing...
 */
app.use(helmet({
    contentSecurityPolicy: false, // Tắt CSP để ưu tiên hiển thị giao diện
    crossOriginEmbedderPolicy: false,
}));

/**
 * 2. RATE LIMITER - Chống DDoS và Spam
 * Giới hạn số lượng request từ một IP trong khoảng thời gian nhất định
 */
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 phút
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,                         // Tối đa 100 requests
    message: {
        success: false,
        message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút!'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Áp dụng rate limit cho tất cả API routes
app.use('/api/', limiter);

/**
 * 3. Rate Limiter đặc biệt cho Authentication (Chặt hơn)
 * Chống brute-force tấn công đăng nhập
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 10,                    // Tối đa 10 lần đăng nhập
    message: {
        success: false,
        message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút!'
    }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

/**
 * 4. CORS - Cấu hình Cross-Origin Resource Sharing
 */
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://yourdomain.com']
        : ['http://localhost:3000', 'http://localhost:5000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

// ============================================
// MIDDLEWARE XỬ LÝ DỮ LIỆU
// ============================================

// Parse JSON body (Giới hạn 10kb để chống tấn công body too large)
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Parse Cookies
app.use(cookieParser());

// Method Override (cho phép dùng PUT/DELETE trong HTML form)
app.use(methodOverride('_method'));

// Nén response để tăng tốc độ tải trang
app.use(compression());

// ============================================
// MIDDLEWARE CHỐNG TẤN CÔNG DỮ LIỆU
// ============================================

/**
 * 5. MongoDB Sanitize - Chống NoSQL Injection
 * Loại bỏ các ký tự đặc biệt ($, .) trong request body/params/query
 * VD: Ngăn chặn: { "email": { "$gt": "" } }
 */
app.use(mongoSanitize());

/**
 * 6. XSS Clean - Chống Cross-Site Scripting
 * Làm sạch dữ liệu đầu vào, loại bỏ script độc hại
 * VD: Ngăn chặn: <script>document.cookie</script>
 */
app.use(xss());

/**
 * 7. HPP - Chống HTTP Parameter Pollution
 * Ngăn chặn tấn công bằng cách gửi nhiều giá trị cho cùng 1 tham số
 * VD: ?sort=price&sort=rating -> Chỉ lấy giá trị cuối cùng
 */
app.use(hpp({
    // Các trường được phép có nhiều giá trị
    whitelist: ['price', 'rating', 'category', 'brand']
}));

// ============================================
// SESSION (Dùng cho giỏ hàng và Flash Messages)
// ============================================
app.use(session({
    secret: process.env.SESSION_SECRET || 'techstore_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Chỉ HTTPS ở production
        httpOnly: true,                                 // Chống XSS lấy cookie
        maxAge: 24 * 60 * 60 * 1000,                   // 1 ngày
        sameSite: 'strict'                             // Chống CSRF
    }
}));

// ============================================
// STATIC FILES & LOGGING
// ============================================
app.use(express.static(path.join(__dirname, 'public')));

// Logging chỉ ở môi trường development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    console.log('🔧 Đang chạy ở chế độ Development');
}

// ============================================
// MIDDLEWARE TRUYỀN DỮ LIỆU CHO VIEW (EJS)
// ============================================
const jwt = require('jsonwebtoken');
const User = require('./models/User');

app.use(async (req, res, next) => {
    const token = req.cookies.token || (req.session && req.session.token);
    res.locals.user = null;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            res.locals.user = await User.findById(decoded.id).select('-password');
            req.user = res.locals.user; // Gán cho req để middleware bảo mật sử dụng được
        } catch (err) {
            // Token hết hạn hoặc không hợp lệ
        }
    }

    res.locals.success = req.session.success || null;
    res.locals.error = req.session.error || null;
    delete req.session.success;
    delete req.session.error;
    next();
});

// ============================================
// ĐỊNH NGHĨA ROUTES
// ============================================
app.use('/', viewRoutes);    // Giao diện (Render EJS)
app.use('/api/auth', authRoutes);    // Xác thực người dùng
app.use('/api/products', productRoutes); // Quản lý sản phẩm
app.use('/api/cart', cartRoutes);    // Giỏ hàng
app.use('/api/orders', orderRoutes);   // Đơn hàng
app.use('/admin', adminRoutes);   // Trang quản trị


// ============================================
// XỬ LÝ ROUTE KHÔNG TỒN TẠI (404)
// ============================================
app.use((req, res, next) => {
    const error = new Error(`Không tìm thấy trang: ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
});

// ============================================
// MIDDLEWARE XỬ LÝ LỖI TOÀN CỤC
// (Phải đặt SAU tất cả routes)
// ============================================
app.use(errorHandler);

// ============================================
// KHỞI ĐỘNG SERVER
// ============================================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`🚀 TechStore Server đang chạy trên port ${PORT}`);
    console.log(`🌐 Truy cập: http://localhost:${PORT}`);
    console.log(`📅 Thời gian khởi động: ${new Date().toLocaleString('vi-VN')}`);
});

// Xử lý lỗi không bắt được (Unhandled Promise Rejections)
process.on('unhandledRejection', (err) => {
    console.error(`❌ Lỗi không được xử lý: ${err.message}`);
    // Đóng server an toàn trước khi thoát
    server.close(() => {
        process.exit(1);
    });
});

module.exports = app;
