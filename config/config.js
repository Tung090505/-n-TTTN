/**
 * ============================================
 * config/config.js - CẤU HÌNH ỨNG DỤNG
 * ============================================
 * Tập trung toàn bộ cấu hình vào một nơi
 * Dễ dàng thay đổi mà không cần sửa nhiều file
 */

module.exports = {
    // Cấu hình JWT
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRE || '30d',
        cookieExpire: parseInt(process.env.JWT_COOKIE_EXPIRE) || 30, // ngày
    },

    // Cấu hình Database
    database: {
        uri: process.env.MONGO_URI || 'mongodb://localhost:27017/techstore',
    },

    // Cấu hình Upload File
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
        uploadPath: process.env.UPLOAD_PATH || './public/uploads',
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    },

    // Cấu hình Phân trang
    pagination: {
        defaultLimit: 12,   // Số sản phẩm mỗi trang
        maxLimit: 50,        // Không cho phép lấy quá 50 sản phẩm/request
    },

    // Danh mục sản phẩm
    categories: [
        'laptop',
        'pc',
        'cpu',
        'gpu',
        'ram',
        'storage',
        'motherboard',
        'psu',
        'case',
        'cooling',
        'monitor',
        'keyboard',
        'mouse',
        'headset',
    ],

    // Trạng thái đơn hàng
    orderStatus: {
        PENDING: 'pending',       // Chờ xác nhận
        CONFIRMED: 'confirmed',     // Đã xác nhận
        PROCESSING: 'processing',    // Đang xử lý
        SHIPPING: 'shipping',      // Đang giao hàng
        DELIVERED: 'delivered',     // Đã giao
        CANCELLED: 'cancelled',     // Đã hủy
        REFUNDED: 'refunded',      // Đã hoàn tiền
    },

    // Trạng thái thanh toán
    paymentStatus: {
        UNPAID: 'unpaid',
        PAID: 'paid',
        REFUNDED: 'refunded',
        FAILED: 'failed',
    },

    // Phương thức thanh toán
    paymentMethods: {
        COD: 'cod',            // Thanh toán khi nhận hàng
        BANK: 'bank_transfer',  // Chuyển khoản ngân hàng
        MOMO: 'momo',           // Ví MoMo
        VNPAY: 'vnpay',          // VNPay
    },

    // Cấu hình Bcrypt
    bcrypt: {
        saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
    },
};
