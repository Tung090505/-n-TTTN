

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

const mongoSanitize = require('express-mongo-sanitize'); 
const xss = require('xss-clean');              
const hpp = require('hpp');                    
const rateLimit = require('express-rate-limit');     

const connectDB = require('./db');

const viewRoutes = require('./routes/viewRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');

const errorHandler = require('./middleware/errorHandler');

connectDB();

const app = express();

app.set('trust proxy', 1);

const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet({
    contentSecurityPolicy: false, 
    crossOriginEmbedderPolicy: false,
}));

const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, 
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,                         
    message: {
        success: false,
        message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút!'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,                    
    message: {
        success: false,
        message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút!'
    }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://yourdomain.com']
        : ['http://localhost:3000', 'http://localhost:5000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

app.use(express.json({ limit: '10kb' }));

app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(cookieParser());

app.use(methodOverride('_method'));

app.use(compression());

app.use(mongoSanitize());

app.use(xss());

app.use(hpp({
    
    whitelist: ['price', 'rating', 'category', 'brand']
}));

app.use(session({
    secret: process.env.SESSION_SECRET || 'techstore_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', 
        httpOnly: true,                                 
        maxAge: 24 * 60 * 60 * 1000,                   
        sameSite: 'strict'                             
    }
}));

app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'development') {

    app.use(morgan('dev', {
        skip: (req, res) => res.statusCode < 400
    }));
    console.log('🔧 Đang chạy ở chế độ Development (Chỉ hiển thị log khi có lỗi >= 400)');
}

const jwt = require('jsonwebtoken');
const User = require('./models/User');

app.use(async (req, res, next) => {
    const token = req.cookies.token || (req.session && req.session.token);
    res.locals.user = null;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            res.locals.user = await User.findById(decoded.id).select('-password');
            req.user = res.locals.user; 
        } catch (err) {
            
        }
    }

    res.locals.success = req.session.success || null;
    res.locals.error = req.session.error || null;
    delete req.session.success;
    delete req.session.error;
    next();
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use('/', viewRoutes);    
app.use('/api/auth', authRoutes);    
app.use('/api/products', productRoutes); 
app.use('/api/cart', cartRoutes);    
app.use('/api/orders', orderRoutes);   
app.use('/admin', adminRoutes);   
app.use('/', aiRoutes);          

app.use((req, res, next) => {
    const error = new Error(`Không tìm thấy trang: ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`🚀 TechStore Server đang chạy trên port ${PORT}`);
    console.log(`🌐 Truy cập: http://localhost:${PORT}`);
    console.log(`📅 Thời gian khởi động: ${new Date().toLocaleString('vi-VN')}`);
});

process.on('unhandledRejection', (err) => {
    console.error(`❌ Lỗi không được xử lý: ${err.message}`);
    
    server.close(() => {
        process.exit(1);
    });
});

module.exports = app;
