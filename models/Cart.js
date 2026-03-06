/**
 * ============================================
 * models/Cart.js - SCHEMA GIỎ HÀNG
 * ============================================
 * Quản lý giỏ hàng của người dùng
 * Tự động tính tổng tiền khi thay đổi
 */

const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Số lượng phải ít nhất là 1'],
        default: 1,
    },
    price: {
        type: Number,
        required: true, // Lưu giá tại thời điểm thêm vào giỏ
    },
}, { _id: false });

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, // Mỗi user chỉ có 1 giỏ hàng
    },

    items: {
        type: [CartItemSchema],
        default: [],
    },

    // Tổng tiền (tính tự động qua virtual)
    totalAmount: {
        type: Number,
        default: 0,
    },

    totalItems: {
        type: Number,
        default: 0,
    },

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Cập nhật lại tổng tiền và số lượng sản phẩm trong giỏ
 */
CartSchema.methods.updateTotals = function () {
    this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    this.totalAmount = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

/**
 * Thêm sản phẩm vào giỏ hàng
 * Nếu đã có thì tăng số lượng
 */
CartSchema.methods.addItem = function (productId, price, quantity = 1) {
    const existingItem = this.items.find(
        item => item.product.toString() === productId.toString()
    );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        this.items.push({ product: productId, price, quantity });
    }

    this.updateTotals();
};

/**
 * Xóa sản phẩm khỏi giỏ hàng
 */
CartSchema.methods.removeItem = function (productId) {
    this.items = this.items.filter(
        item => item.product.toString() !== productId.toString()
    );
    this.updateTotals();
};

/**
 * Cập nhật số lượng sản phẩm
 */
CartSchema.methods.updateQuantity = function (productId, quantity) {
    const item = this.items.find(
        item => item.product.toString() === productId.toString()
    );

    if (item) {
        if (quantity <= 0) {
            this.removeItem(productId);
        } else {
            item.quantity = quantity;
            this.updateTotals();
        }
    }
};

/**
 * Xóa toàn bộ giỏ hàng (sau khi đặt hàng thành công)
 */
CartSchema.methods.clearCart = function () {
    this.items = [];
    this.totalAmount = 0;
    this.totalItems = 0;
};

module.exports = mongoose.model('Cart', CartSchema);
