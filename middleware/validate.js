/**
 * ============================================
 * middleware/validate.js - MIDDLEWARE VALIDATION
 * ============================================
 * Sử dụng express-validator để kiểm tra
 * và làm sạch dữ liệu đầu vào (Input Sanitization)
 */

const { body, param, query, validationResult } = require('express-validator');

// ============================================
// HÀM XỬ LÝ KẾT QUẢ VALIDATION
// ============================================
/**
 * Kiểm tra kết quả validation và trả về lỗi nếu có
 * Đặt middleware này sau các validation rules
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => ({
            field: err.path,
            message: err.msg,
        }));

        // --- IN LOG LỖI RA TERMINAL ---
        console.log(`🔴 Validation Error:`, JSON.stringify(errorMessages, null, 2));

        return res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: errorMessages,
        });
    }

    next();
};

// ============================================
// VALIDATION RULES: XÁC THỰC NGƯỜI DÙNG
// ============================================
const validateRegister = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('Tên không được để trống')
        .isLength({ max: 50 }).withMessage('Tên không được vượt quá 50 ký tự')
        .escape(), // Chống XSS

    body('lastName')
        .trim()
        .notEmpty().withMessage('Họ không được để trống')
        .isLength({ max: 50 }).withMessage('Họ không được vượt quá 50 ký tự')
        .escape(),

    body('email')
        .trim()
        .notEmpty().withMessage('Email không được để trống')
        .isEmail().withMessage('Email không đúng định dạng')
        .normalizeEmail(), // Chuẩn hóa email (lowercase, remove dots...)

    body('password')
        .notEmpty().withMessage('Mật khẩu không được để trống')
        .isLength({ min: 8 }).withMessage('Mật khẩu phải có ít nhất 8 ký tự')
        .matches(/^(?=.*[A-Z])(?=.*\d)/).withMessage(
            'Mật khẩu phải chứa ít nhất 1 chữ hoa và 1 số'
        ),

    body('confirmPassword')
        .notEmpty().withMessage('Xác nhận mật khẩu không được để trống')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Mật khẩu xác nhận không khớp');
            }
            return true;
        }),

    body('phone')
        .optional()
        .matches(/^(0[3|5|7|8|9])+([0-9]{8})\b/)
        .withMessage('Số điện thoại không hợp lệ (VD: 0912345678)'),

    handleValidationErrors,
];

const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email không được để trống')
        .isEmail().withMessage('Email không đúng định dạng')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Mật khẩu không được để trống'),

    handleValidationErrors,
];

// ============================================
// VALIDATION RULES: SẢN PHẨM
// ============================================
const validateProduct = [
    body('name')
        .trim()
        .notEmpty().withMessage('Tên sản phẩm không được để trống')
        .isLength({ max: 200 }).withMessage('Tên không được vượt quá 200 ký tự')
        .escape(),

    body('description')
        .trim()
        .notEmpty().withMessage('Mô tả không được để trống'),

    body('category')
        .notEmpty().withMessage('Danh mục không được để trống')
        .isIn(['laptop', 'pc', 'cpu', 'gpu', 'ram', 'storage', 'motherboard', 'psu', 'case', 'cooling', 'monitor', 'keyboard', 'mouse', 'headset'])
        .withMessage('Danh mục không hợp lệ'),

    body('brand')
        .trim()
        .notEmpty().withMessage('Thương hiệu không được để trống')
        .escape(),

    body('price')
        .notEmpty().withMessage('Giá không được để trống')
        .isFloat({ min: 0 }).withMessage('Giá phải là số dương'),

    body('salePrice')
        .optional({ nullable: true, checkFalsy: true })
        .isFloat({ min: 0 }).withMessage('Giá khuyến mãi phải là số dương')
        .custom((val, { req }) => {
            if (val && Number(val) >= Number(req.body.price)) {
                throw new Error('Giá khuyến mãi phải nhỏ hơn giá gốc');
            }
            return true;
        }),

    body('stock')
        .notEmpty().withMessage('Tồn kho không được để trống')
        .isInt({ min: 0 }).withMessage('Tồn kho phải là số nguyên không âm'),

    handleValidationErrors,
];

// ============================================
// VALIDATION RULES: ĐƠN HÀNG
// ============================================
const validateOrder = [

    body('shippingAddress.phone')
        .notEmpty().withMessage('Số điện thoại không được để trống')
        .matches(/^(0[3|5|7|8|9])+([0-9]{8})\b/)
        .withMessage('Số điện thoại không hợp lệ'),

    body('shippingAddress.street')
        .trim()
        .notEmpty().withMessage('Địa chỉ không được để trống')
        .escape(),

    body('shippingAddress.ward')
        .trim()
        .notEmpty().withMessage('Phường/Xã không được để trống')
        .escape(),

    body('shippingAddress.district')
        .trim()
        .notEmpty().withMessage('Quận/Huyện không được để trống')
        .escape(),

    body('shippingAddress.city')
        .trim()
        .notEmpty().withMessage('Tỉnh/Thành phố không được để trống')
        .escape(),

    body('paymentMethod')
        .notEmpty().withMessage('Phương thức thanh toán không được để trống')
        .isIn(['cod', 'bank_transfer', 'momo', 'vnpay'])
        .withMessage('Phương thức thanh toán không hợp lệ'),

    handleValidationErrors,
];

// ============================================
// VALIDATION RULES: QUERY PARAMETERS (bộ lọc)
// ============================================
const validateProductQuery = [
    query('minPrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('Giá tối thiểu không hợp lệ'),

    query('maxPrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('Giá tối đa không hợp lệ'),

    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Số trang phải là số nguyên dương'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 }).withMessage('Giới hạn phải từ 1 đến 50'),

    query('sort')
        .optional()
        .isIn(['price', '-price', 'rating', '-rating', 'createdAt', '-createdAt', 'sold', '-sold'])
        .withMessage('Tùy chọn sắp xếp không hợp lệ'),

    handleValidationErrors,
];

module.exports = {
    validateRegister,
    validateLogin,
    validateProduct,
    validateOrder,
    validateProductQuery,
    handleValidationErrors,
};
