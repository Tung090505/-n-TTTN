/**
 * ============================================
 * controllers/authController.js - XÁC THỰC NGƯỜI DÙNG
 * ============================================
 * Xử lý đăng ký, đăng nhập, đăng xuất
 * và quản lý phiên đăng nhập JWT
 */

const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

// ============================================
// HÀM TIỆN ÍCH: Tạo token và gửi response
// ============================================
/**
 * Tạo JWT token, lưu vào cookie HttpOnly và trả về response
 * @param {Object} user - Mongoose User document
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 */
const sendTokenResponse = (user, statusCode, res) => {
    // Tạo JWT Token
    const token = user.getSignedJwtToken();

    // Cấu hình Cookie Options
    const cookieOptions = {
        expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000),
        httpOnly: true,                                      // Chống XSS (JS không đọc được)
        secure: process.env.NODE_ENV === 'production',     // Chỉ HTTPS ở production
        sameSite: 'strict',                                  // Chống CSRF
    };

    // Không trả về password trong response
    user.password = undefined;

    res.status(statusCode)
        .cookie('token', token, cookieOptions)
        .json({
            success: true,
            token,
            data: { user },
        });
};

// ============================================
// ĐĂNG KÝ TÀI KHOẢN
// POST /api/auth/register
// ============================================
exports.register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new AppError('Email này đã được đăng ký. Vui lòng dùng email khác.', 400));
        }

        // Tạo user mới (mật khẩu sẽ tự động được băm bởi Mongoose middleware)
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            phone,
        });

        // Tạo token và gửi response
        sendTokenResponse(user, 201, res);

    } catch (error) {
        next(error);
    }
};

// ============================================
// ĐĂNG NHẬP
// POST /api/auth/login
// ============================================
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Tìm user theo email, bao gồm password (vì select: false)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            // Thông báo chung để tránh lộ thông tin (user có tồn tại không)
            return next(new AppError('Email hoặc mật khẩu không đúng.', 401));
        }

        // Kiểm tra tài khoản có bị khóa không
        if (!user.isActive) {
            return next(new AppError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.', 401));
        }

        // So sánh mật khẩu
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return next(new AppError('Email hoặc mật khẩu không đúng.', 401));
        }

        // Cập nhật thời gian đăng nhập cuối
        user.lastLoginAt = new Date();
        await user.save({ validateBeforeSave: false });

        // Tạo token và gửi response
        sendTokenResponse(user, 200, res);

    } catch (error) {
        next(error);
    }
};

// ============================================
// ĐĂNG XUẤT
// POST /api/auth/logout
// ============================================
exports.logout = (req, res) => {
    // Xóa cookie token bằng cách đặt thời gian hết hạn về quá khứ
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000), // Hết hạn sau 10 giây
        httpOnly: true,
    });

    // Xóa session
    if (req.session) {
        req.session.destroy();
    }

    res.status(200).json({
        success: true,
        message: 'Đăng xuất thành công.',
    });
};

// ============================================
// LẤY THÔNG TIN NGƯỜI DÙNG HIỆN TẠI
// GET /api/auth/me
// ============================================
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// CẬP NHẬT THÔNG TIN CÁ NHÂN
// PUT /api/auth/update-profile
// ============================================
exports.updateProfile = async (req, res, next) => {
    try {
        // Chỉ cho phép cập nhật các trường nhất định
        const allowedFields = ['firstName', 'lastName', 'phone', 'avatar'];
        const updateData = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin thành công.',
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// ĐỔI MẬT KHẨU
// PUT /api/auth/change-password
// ============================================
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Lấy user kèm password
        const user = await User.findById(req.user.id).select('+password');

        // Kiểm tra mật khẩu hiện tại
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return next(new AppError('Mật khẩu hiện tại không đúng.', 401));
        }

        // Cập nhật mật khẩu mới (sẽ tự động băm qua Mongoose middleware)
        user.password = newPassword;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};
