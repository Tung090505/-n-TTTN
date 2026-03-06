/**
 * ============================================
 * models/Order.js - SCHEMA ĐƠN HÀNG
 * ============================================
 * Quản lý đơn hàng, bao gồm thông tin sản phẩm,
 * địa chỉ giao hàng, phương thức thanh toán
 */

const mongoose = require('mongoose');

// ============================================
// SUB-SCHEMA: CHI TIẾT SẢN PHẨM TRONG ĐƠN HÀNG
// ============================================
const OrderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    name: { type: String, required: true }, // Lưu lại tên (dù product bị xóa)
    thumbnail: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }, // Giá tại thời điểm đặt hàng
}, { _id: false });

// ============================================
// SCHEMA CHÍNH: ĐƠN HÀNG
// ============================================
const OrderSchema = new mongoose.Schema({

    // Mã đơn hàng duy nhất (tự động tạo)
    orderCode: {
        type: String,
        unique: true,
    },

    // Người đặt hàng
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    // Danh sách sản phẩm
    items: {
        type: [OrderItemSchema],
        required: true,
        validate: {
            validator: arr => arr.length > 0,
            message: 'Đơn hàng phải có ít nhất 1 sản phẩm',
        },
    },

    // --- GIÁ TRỊ ĐƠN HÀNG ---
    subtotal: { type: Number, required: true }, // Tổng tiền hàng (chưa phí ship)
    shippingFee: { type: Number, default: 0 },      // Phí vận chuyển
    discount: { type: Number, default: 0 },      // Số tiền giảm giá (voucher)
    totalAmount: { type: Number, required: true },  // Tổng thanh toán cuối cùng

    // --- VOUCHER ---
    couponCode: { type: String },
    couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
    },

    // --- ĐỊA CHỈ GIAO HÀNG ---
    shippingAddress: {
        fullName: { type: String },
        phone: { type: String, required: true },
        street: { type: String, required: true },
        ward: { type: String, required: true },
        district: { type: String, required: true },
        city: { type: String, required: true },
    },

    // --- THANH TOÁN ---
    paymentMethod: {
        type: String,
        enum: ['cod', 'bank_transfer', 'momo', 'vnpay'],
        default: 'cod',
    },

    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'refunded', 'failed'],
        default: 'unpaid',
    },

    paidAt: { type: Date }, // Thời điểm thanh toán thành công

    // --- TRẠNG THÁI ĐƠN HÀNG ---
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled', 'refunded'],
        default: 'pending',
    },

    // Lịch sử thay đổi trạng thái
    statusHistory: [{
        status: { type: String },
        note: { type: String },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        updatedAt: { type: Date, default: Date.now },
    }],

    // Ghi chú của khách hàng
    customerNote: { type: String, maxlength: 500 },

    // Ghi chú của admin
    adminNote: { type: String },

    // Lý do hủy (nếu bị hủy)
    cancelReason: { type: String },

    deliveredAt: { type: Date }, // Thời điểm giao hàng thành công

}, {
    timestamps: true,
});

// ============================================
// INDEX
// ============================================
OrderSchema.index({ user: 1, createdAt: -1 });
// OrderSchema.index({ orderCode: 1 }); // Đã có unique: true ở field definition
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });

// ============================================
// MIDDLEWARE - Tự tạo mã đơn hàng trước khi lưu
// ============================================
OrderSchema.pre('save', function (next) {
    if (!this.orderCode) {
        // Tạo mã đơn hàng: TS + timestamp + random
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).slice(2, 6).toUpperCase();
        this.orderCode = `TS${timestamp}${random}`;
    }

    // Tự động tính tổng tiền
    this.subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    this.totalAmount = this.subtotal + this.shippingFee - this.discount;

    next();
});

module.exports = mongoose.model('Order', OrderSchema);
