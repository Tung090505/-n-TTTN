

const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    name: { type: String, required: true }, 
    thumbnail: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }, 
}, { _id: false });

const OrderSchema = new mongoose.Schema({

    orderCode: {
        type: String,
        unique: true,
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    items: {
        type: [OrderItemSchema],
        required: true,
        validate: {
            validator: arr => arr.length > 0,
            message: 'Đơn hàng phải có ít nhất 1 sản phẩm',
        },
    },

    subtotal: { type: Number, required: true }, 
    shippingFee: { type: Number, default: 0 },      
    discount: { type: Number, default: 0 },      
    totalAmount: { type: Number, required: true },  

    couponCode: { type: String },
    couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
    },

    shippingAddress: {
        fullName: { type: String },
        phone: { type: String, required: true },
        street: { type: String, required: true },
        ward: { type: String, required: true },
        district: { type: String, required: true },
        city: { type: String, required: true },
    },

    paymentMethod: {
        type: String,
        enum: ['cod', 'bank_transfer', 'momo', 'vnpay', 'sepay'],
        default: 'cod',
    },

    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'refunded', 'failed'],
        default: 'unpaid',
    },

    paidAt: { type: Date }, 

    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled', 'refunded'],
        default: 'pending',
    },

    statusHistory: [{
        status: { type: String },
        note: { type: String },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        updatedAt: { type: Date, default: Date.now },
    }],

    customerNote: { type: String, maxlength: 500 },

    adminNote: { type: String },

    cancelReason: { type: String },

    deliveredAt: { type: Date }, 

}, {
    timestamps: true,
});

OrderSchema.index({ user: 1, createdAt: -1 });

OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });

OrderSchema.pre('save', function (next) {
    if (!this.orderCode) {
        
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).slice(2, 6).toUpperCase();
        this.orderCode = `TS${timestamp}${random}`;
    }

    this.subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    this.totalAmount = this.subtotal + this.shippingFee - this.discount;

    next();
});

module.exports = mongoose.model('Order', OrderSchema);
