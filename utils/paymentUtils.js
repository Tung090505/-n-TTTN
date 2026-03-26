
/**
 * Tạo link QR chuyển khoản VietQR
 * @param {string} bankId - Mã ngân hàng (ví dụ: mbbank, vcb, ...)
 * @param {string} accountNo - Số tài khoản ngân hàng
 * @param {string} accountName - Tên chủ tài khoản
 * @param {number} amount - Số tiền
 * @param {string} description - Nội dung chuyển khoản
 * @returns {string} - Đường dẫn ảnh QR
 */
exports.generateVietQR = (bankId, accountNo, accountName, amount, description) => {
    const template = 'qr_only'; // Template của VietQR (qr_only, compact, compact2, print)
    const encodedDescription = encodeURIComponent(description);
    const encodedAccountName = encodeURIComponent(accountName);
    
    return `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${encodedDescription}&accountName=${encodedAccountName}`;
};
