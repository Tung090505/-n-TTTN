/**
 * ============================================
 * models/User.js - SCHEMA NGƯỜI DÙNG
 * ============================================
 * Quản lý tài khoản người dùng với bảo mật cao
 * Mật khẩu được băm bằng bcrypt trước khi lưu
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

// ============================================
// SUB-SCHEMA: ĐỊA CHỈ GIAO HÀNG
// ============================================
const AddressSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },   // Số nhà, đường
    ward: { type: String, required: true },    // Phường/Xã
    district: { type: String, required: true },    // Quận/Huyện
    city: { type: String, required: true },    // Tỉnh/Thành phố
    isDefault: { type: Boolean, default: false },   // Địa chỉ mặc định
}, { _id: true });

// ============================================
// SCHEMA CHÍNH: NGƯỜI DÙNG
// ============================================
const UserSchema = new mongoose.Schema({

    // --- THÔNG TIN CÁ NHÂN ---
    firstName: {
        type: String,
        required: [true, 'Tên không được để trống'],
        trim: true,
        maxlength: [50, 'Tên không được vượt quá 50 ký tự'],
    },

    lastName: {
        type: String,
        required: [true, 'Họ không được để trống'],
        trim: true,
        maxlength: [50, 'Họ không được vượt quá 50 ký tự'],
    },

    email: {
        type: String,
        required: [true, 'Email không được để trống'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Email không đúng định dạng',
        ],
    },

    phone: {
        type: String,
        match: [/^(0[3|5|7|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ'],
    },

    // --- BẢO MẬT ---
    password: {
        type: String,
        required: [true, 'Mật khẩu không được để trống'],
        minlength: [8, 'Mật khẩu phải có ít nhất 8 ký tự'],
        select: false, // KHÔNG tự động trả về password khi query
    },

    // Token đặt lại mật khẩu
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },

    // --- PHÂN QUYỀN ---
    role: {
        type: String,
        enum: ['customer', 'staff', 'admin'],
        default: 'customer',
    },

    isActive: {
        type: Boolean,
        default: true, // Tài khoản có đang hoạt động không
    },

    isEmailVerified: {
        type: Boolean,
        default: false,
    },

    // --- AVATAR ---
    avatar: {
        type: String,
        default: 'https://ui-avatars.com/api/?background=random&color=fff&name=User',
    },

    // --- ĐỊA CHỈ ---
    addresses: [AddressSchema],

    // --- WISHLIST (Sản phẩm yêu thích) ---
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }],

    // --- THỐNG KÊ ---
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastLoginAt: { type: Date },

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// ============================================
// VIRTUAL FIELDS
// ============================================

// Họ tên đầy đủ
UserSchema.virtual('fullName').get(function () {
    return `${this.lastName} ${this.firstName}`;
});

// ============================================
// INDEX
// ============================================
// UserSchema.index({ email: 1 }); // Đã có unique: true ở field definition
UserSchema.index({ phone: 1 });
UserSchema.index({ role: 1 });

// ============================================
// MIDDLEWARE - BĂM MẬT KHẨU TRƯỚC KHI LƯU
// ============================================
UserSchema.pre('save', async function (next) {
    // Chỉ băm mật khẩu khi nó được thay đổi
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Tạo salt và băm mật khẩu
        const salt = await bcrypt.genSalt(config.bcrypt.saltRounds);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * So sánh mật khẩu người dùng nhập với mật khẩu đã băm trong DB
 * @param {string} enteredPassword - Mật khẩu người dùng nhập vào
 * @returns {Promise<boolean>} - true nếu đúng, false nếu sai
 */
UserSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Tạo JWT Token để xác thực
 * Token được ký bằng secret key và có thời hạn
 * @returns {string} - JWT Token
 */
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign(
        {
            id: this._id,
            email: this.email,
            role: this.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE || '30d',
        }
    );
};

/**
 * Lấy địa chỉ mặc định của người dùng
 */
UserSchema.methods.getDefaultAddress = function () {
    return this.addresses.find(addr => addr.isDefault) || this.addresses[0] || null;
};

module.exports = mongoose.model('User', UserSchema);
