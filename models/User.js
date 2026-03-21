

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const AddressSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },   
    ward: { type: String, required: true },    
    district: { type: String, required: true },    
    city: { type: String, required: true },    
    isDefault: { type: Boolean, default: false },   
}, { _id: true });

const UserSchema = new mongoose.Schema({

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

    password: {
        type: String,
        required: [true, 'Mật khẩu không được để trống'],
        minlength: [8, 'Mật khẩu phải có ít nhất 8 ký tự'],
        select: false, 
    },

    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },

    role: {
        type: String,
        enum: ['customer', 'staff', 'admin'],
        default: 'customer',
    },

    isActive: {
        type: Boolean,
        default: true, 
    },

    isEmailVerified: {
        type: Boolean,
        default: false,
    },

    avatar: {
        type: String,
        default: 'https://ui-avatars.com/api/?background=random&color=fff&name=User',
    },

    addresses: [AddressSchema],

    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }],

    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastLoginAt: { type: Date },

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

UserSchema.virtual('fullName').get(function () {
    return `${this.lastName} ${this.firstName}`;
});

UserSchema.index({ phone: 1 });
UserSchema.index({ role: 1 });

UserSchema.pre('save', async function (next) {
    
    if (!this.isModified('password')) {
        return next();
    }

    try {
        
        const salt = await bcrypt.genSalt(config.bcrypt.saltRounds);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

UserSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

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

UserSchema.methods.getDefaultAddress = function () {
    return this.addresses.find(addr => addr.isDefault) || this.addresses[0] || null;
};

module.exports = mongoose.model('User', UserSchema);
