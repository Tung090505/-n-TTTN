

const handleCastErrorDB = (err) => {
    const message = `Dữ liệu không hợp lệ: ${err.path} = ${err.value}`;
    return { statusCode: 400, message };
};

const handleDuplicateFieldsDB = (err) => {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Giá trị "${value}" đã tồn tại cho trường "${field}". Vui lòng dùng giá trị khác.`;
    return { statusCode: 400, message };
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Dữ liệu không hợp lệ: ${errors.join('. ')}`;
    return { statusCode: 400, message };
};

const handleJWTError = () => ({
    statusCode: 401,
    message: 'Token không hợp lệ. Vui lòng đăng nhập lại.'
});

const handleJWTExpiredError = () => ({
    statusCode: 401,
    message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
});

const errorHandler = (err, req, res, next) => {
    let error = {
        statusCode: err.statusCode || 500,
        message: err.message || 'Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.',
    };

    if (process.env.NODE_ENV === 'development') {
        console.error(`❌ [${req.method}] ${req.originalUrl} - LỖI:`, err.message);
        if (err.stack && !err.isOperational) console.error(err.stack);
    }

    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    if (req.originalUrl.startsWith('/api')) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        });
    }

    return res.status(error.statusCode).render('error', {
        title: `Lỗi ${error.statusCode}`,
        statusCode: error.statusCode,
        message: error.message,
    });
};

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; 
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = errorHandler;
module.exports.AppError = AppError;
