/**
 * ============================================
 * middleware/errorHandler.js - XỬ LÝ LỖI TOÀN CỤC
 * ============================================
 * Middleware xử lý tất cả các lỗi trong ứng dụng
 * Chuyển đổi lỗi Mongoose/JWT thành response thân thiện
 */

/**
 * Xử lý lỗi khi ID MongoDB không hợp lệ (CastError)
 * VD: GET /product/abc (abc không phải ObjectId hợp lệ)
 */
const handleCastErrorDB = (err) => {
    const message = `Dữ liệu không hợp lệ: ${err.path} = ${err.value}`;
    return { statusCode: 400, message };
};

/**
 * Xử lý lỗi trùng lặp dữ liệu (Duplicate Key)
 * VD: Đăng ký email đã tồn tại
 */
const handleDuplicateFieldsDB = (err) => {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Giá trị "${value}" đã tồn tại cho trường "${field}". Vui lòng dùng giá trị khác.`;
    return { statusCode: 400, message };
};

/**
 * Xử lý lỗi validation của Mongoose
 * VD: Thiếu trường bắt buộc, sai định dạng dữ liệu
 */
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Dữ liệu không hợp lệ: ${errors.join('. ')}`;
    return { statusCode: 400, message };
};

/**
 * Xử lý lỗi JWT Token không hợp lệ
 */
const handleJWTError = () => ({
    statusCode: 401,
    message: 'Token không hợp lệ. Vui lòng đăng nhập lại.'
});

/**
 * Xử lý lỗi JWT Token hết hạn
 */
const handleJWTExpiredError = () => ({
    statusCode: 401,
    message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
});

// ============================================
// MIDDLEWARE XỬ LÝ LỖI CHÍNH
// ============================================
const errorHandler = (err, req, res, next) => {
    let error = {
        statusCode: err.statusCode || 500,
        message: err.message || 'Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.',
    };

    // Log lỗi ở môi trường development
    if (process.env.NODE_ENV === 'development') {
        console.error(`❌ [${req.method}] ${req.originalUrl} - LỖI:`, err.message);
        if (err.stack && !err.isOperational) console.error(err.stack);
    }

    // --- Phân loại và xử lý từng loại lỗi ---
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    // --- Gửi response ---
    // Nếu là API request (JSON)
    if (req.originalUrl.startsWith('/api')) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            // Chỉ trả về stack trace ở development
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        });
    }

    // Nếu là EJS (View) request -> render trang lỗi
    return res.status(error.statusCode).render('error', {
        title: `Lỗi ${error.statusCode}`,
        statusCode: error.statusCode,
        message: error.message,
    });
};

/**
 * Lớp lỗi tùy chỉnh - AppError
 * Dùng để tạo lỗi với status code xác định
 *
 * @example
 * throw new AppError('Sản phẩm không tồn tại', 404);
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Đánh dấu lỗi do logic (không phải bug)
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = errorHandler;
module.exports.AppError = AppError;
