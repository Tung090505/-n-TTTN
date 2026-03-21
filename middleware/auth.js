

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    try {
        
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        
        else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        else if (req.session && req.session.token) {
            token = req.session.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.',
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

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

        req.user = user;
        next();

    } catch (error) {
        
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

const adminOnly = [protect, authorize('admin')];

const staffAndAdmin = [protect, authorize('admin', 'staff')];

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
