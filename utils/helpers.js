/**
 * ============================================
 * utils/helpers.js - HÀM TIỆN ÍCH
 * ============================================
 */

/**
 * Định dạng tiền VNĐ
 * @param {number} amount - Số tiền
 * @returns {string} - "1.990.000đ"
 */
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

/**
 * Làm tròn rating
 * @param {number} rating
 * @returns {number}
 */
const roundRating = (rating) => Math.round(rating * 10) / 10;

/**
 * Tạo slug từ chuỗi tiếng Việt
 * @param {string} str
 * @returns {string}
 */
const createSlug = (str) => {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

/**
 * Async wrapper để tránh try-catch lặp lại
 * @param {Function} fn - Async function
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { formatCurrency, roundRating, createSlug, asyncHandler };
