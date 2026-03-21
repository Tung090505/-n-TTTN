

const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    url: { type: String, required: true },  
    alt: { type: String, default: '' },      // Mô tả alt cho SEO
    isPrimary: { type: Boolean, default: false },  // Ảnh đại diện chính
}, { _id: false });

// ============================================
// SUB-SCHEMA: ĐÁNH GIÁ SẢN PHẨM
// ============================================
const ReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    userName: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    title: { type: String, maxlength: 100 },
    comment: { type: String, maxlength: 1000 },
    isVerified: { type: Boolean, default: false }, 
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Tên sản phẩm không được để trống'],
        trim: true,
        maxlength: [200, 'Tên sản phẩm không được vượt quá 200 ký tự'],
    },

    slug: {
        type: String,
        unique: true, 
        lowercase: true,
    },

    sku: {
        type: String,
        unique: true,    
        sparse: true,    
        uppercase: true,
    },

    description: {
        type: String,
        required: [true, 'Mô tả sản phẩm không được để trống'],
    },

    shortDescription: {
        type: String,
        maxlength: 500,
    },

    category: {
        type: String,
        required: [true, 'Danh mục không được để trống'],
        enum: {
            values: [
                'laptop', 'pc', 'cpu', 'gpu', 'ram',
                'storage', 'motherboard', 'psu', 'case',
                'cooling', 'monitor', 'keyboard', 'mouse', 'headset'
            ],
            message: 'Danh mục "{VALUE}" không hợp lệ',
        },
        lowercase: true,
    },

    brand: {
        type: String,
        required: [true, 'Thương hiệu không được để trống'],
        trim: true,
    },

    price: {
        type: Number,
        required: [true, 'Giá sản phẩm không được để trống'],
        min: [0, 'Giá không được âm'],
    },

    salePrice: {
        type: Number,
        default: null,
        min: [0, 'Giá khuyến mãi không được âm'],
        validate: {
            validator: function (val) {
                
                if (val === null || val === undefined) return true;
                
                return val < this.price;
            },
            message: 'Giá khuyến mãi phải nhỏ hơn giá gốc',
        },
    },

    discountPercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },

    stock: {
        type: Number,
        default: 0,
        min: [0, 'Tồn kho không được âm'],
    },

    sold: {
        type: Number,
        default: 0, 
    },

    isAvailable: {
        type: Boolean,
        default: true, 
    },

    images: {
        type: [ImageSchema],
        default: [],
    },

    thumbnail: {
        type: String,
        default: '/images/default-product.webp',
    },

    specifications: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },

    attributes: {
        type: Map,
        of: String,
        default: {},
    },

    tags: {
        type: [String],
        default: [],
        lowercase: true,
    },

    reviews: [ReviewSchema],

    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },

    numReviews: {
        type: Number,
        default: 0,
    },

    isActive: {
        type: Boolean,
        default: true,  
    },

    isFeatured: {
        type: Boolean,
        default: false, 
    },

    isNewArrival: {
        type: Boolean,
        default: false, 
    },

    warranty: {
        months: { type: Number, default: 12 }, 
        condition: { type: String, default: '1 đổi 1 trong 30 ngày' },
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

}, {
    timestamps: true, 
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

ProductSchema.virtual('finalPrice').get(function () {
    return this.salePrice !== null ? this.salePrice : this.price;
});

ProductSchema.virtual('inStock').get(function () {
    return this.stock > 0;
});

ProductSchema.virtual('savedAmount').get(function () {
    if (this.salePrice !== null) {
        return this.price - this.salePrice;
    }
    return 0;
});

ProductSchema.index({ name: 'text', description: 'text', tags: 'text' }); 
ProductSchema.index({ category: 1, brand: 1 });   
ProductSchema.index({ price: 1 });                 
ProductSchema.index({ salePrice: 1 });             
ProductSchema.index({ rating: -1 });               
ProductSchema.index({ sold: -1 });                 
ProductSchema.index({ createdAt: -1 });            

ProductSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Xóa dấu tiếng Việt
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    // Tính phần trăm giảm giá tự động
    if (this.salePrice && this.price && this.salePrice < this.price) {
        this.discountPercent = Math.round(((this.price - this.salePrice) / this.price) * 100);
    } else {
        this.discountPercent = 0;
    }

    next();
});

// Cập nhật rating trung bình khi có đánh giá mới
ProductSchema.methods.calculateRating = function () {
    if (this.reviews.length === 0) {
        this.rating = 0;
        this.numReviews = 0;
    } else {
        const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
        this.rating = Math.round((totalRating / this.reviews.length) * 10) / 10;
        this.numReviews = this.reviews.length;
    }
};

// ============================================
// STATIC METHODS
// ============================================

/**
 * Lấy sản phẩm theo danh mục kèm phân trang
 */
ProductSchema.statics.getByCategory = function (category, page = 1, limit = 12) {
    const skip = (page - 1) * limit;
    return this.find({ category, isActive: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-reviews -__v');
};

ProductSchema.statics.getBestSellers = function (limit = 8) {
    return this.find({ isActive: true, stock: { $gt: 0 } })
        .sort({ sold: -1 })
        .limit(limit)
        .select('name slug thumbnail price salePrice rating numReviews sold brand category');
};

module.exports = mongoose.model('Product', ProductSchema);
