/**
 * ============================================
 * middleware/auth.js - MIDDLEWARE XÁC THỰC JWT
 * ============================================
 * Kiểm tra JWT Token trong mỗi request để bảo vệ các route
 * Hỗ trợ đọc token từ: Cookie hoặc Authorization Header
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ============================================
// MIDDLEWARE: BẢO VỆ ROUTE (Yêu cầu đăng nhập)
// ============================================
/**
 * Kiểm tra xem người dùng đã đăng nhập chưa
 * Token được đọc từ cookie 'token' hoặc Authorization header
 */
const protect = async (req, res, next) => {
    let token;

    try {
        // --- Đọc token từ Cookie (Ưu tiên) ---
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        // --- Hoặc đọc từ Authorization Header: "Bearer <token>" ---
        else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // --- Hoặc đọc từ Session (dành cho EJS) ---
        else if (req.session && req.session.token) {
            token = req.session.token;
        }

        // Không có token -> Chưa đăng nhập
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.',
            });
        }

        // --- Xác thực token ---
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Tìm user trong database (kiểm tra user còn tồn tại và active không)
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Tài khoản không tồn tại. Vui lòng đăng nhập lại.',
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.',
            });
        }

        // Gắn thông tin user vào request để các middleware tiếp theo sử dụng
        req.user = user;
        next();

    } catch (error) {
        // Token không hợp lệ hoặc đã hết hạn
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token không hợp lệ. Vui lòng đăng nhập lại.',
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Lỗi xác thực. Vui lòng thử lại.',
        });
    }
};

// ============================================
// MIDDLEWARE: PHÂN QUYỀN (Authorize Roles)
// ============================================
/**
 * Kiểm tra quyền hạn của người dùng
 * Phải dùng sau middleware 'protect'
 *
 * @example
 * // Chỉ admin và staff mới được truy cập
 * router.get('/admin', protect, authorize('admin', 'staff'), controller)
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Bạn không có quyền truy cập chức năng này. Yêu cầu quyền: ${roles.join(', ')}`,
            });
        }
        next();
    };
};

// ============================================
// MIDDLEWARE: CHỈ DÀNH CHO ADMIN
// ============================================
const adminOnly = [protect, authorize('admin')];

// ============================================
// MIDDLEWARE: DÀNH CHO ADMIN VÀ STAFF
// ============================================
const staffAndAdmin = [protect, authorize('admin', 'staff')];

// ============================================
// MIDDLEWARE XÁC THỰC CHO EJS (View-based)
// Chuyển hướng về trang đăng nhập thay vì trả JSON
// ============================================
const protectView = async (req, res, next) => {
    let token = req.cookies?.token || req.session?.token;

    if (!token) {
        req.session.error = 'Vui lòng đăng nhập để tiếp tục.';
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user || !user.isActive) {
            req.session.error = 'Phiên đăng nhập không hợp lệ.';
            return res.redirect('/login');
        }

        req.user = user;
        res.locals.user = user;
        next();
    } catch (error) {
        req.session.error = 'Phiên đăng nhập đã hết hạn.';
        return res.redirect('/login');
    }
};

module.exports = { protect, authorize, adminOnly, staffAndAdmin, protectView };
