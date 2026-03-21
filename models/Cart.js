

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
        required: true, 
    },
}, { _id: false });

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, 
    },

    items: {
        type: [CartItemSchema],
        default: [],
    },

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

CartSchema.methods.updateTotals = function () {
    this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    this.totalAmount = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

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

CartSchema.methods.removeItem = function (productId) {
    this.items = this.items.filter(
        item => item.product.toString() !== productId.toString()
    );
    this.updateTotals();
};

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

CartSchema.methods.clearCart = function () {
    this.items = [];
    this.totalAmount = 0;
    this.totalItems = 0;
};

module.exports = mongoose.model('Cart', CartSchema);
