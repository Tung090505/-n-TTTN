/**
 * ============================================
 * models/Product.js - SCHEMA SẢN PHẨM LINH HOẠT
 * ============================================
 * Thiết kế schema linh hoạt để lưu trữ các thông số kỹ thuật
 * khác nhau cho từng loại linh kiện máy tính.
 *
 * Ví dụ:
 *   - CPU:        { cores: 8, threads: 16, baseClock: 3.6, boostClock: 5.0, socket: 'AM5' }
 *   - GPU (VGA):  { vram: 12, vramType: 'GDDR6X', coreClock: 2.5, cudaCores: 10752 }
 *   - RAM:        { capacity: 16, busSpeed: 3200, type: 'DDR4', latency: 'CL16' }
 *   - Laptop:     { screenSize: 15.6, resolution: '1920x1080', refreshRate: 144, cpu: 'i7-13700H' }
 */

const mongoose = require('mongoose');

// ============================================
// SUB-SCHEMA: ẢNH SẢN PHẨM
// ============================================
const ImageSchema = new mongoose.Schema({
    url: { type: String, required: true },  // Đường dẫn ảnh
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
    isVerified: { type: Boolean, default: false }, // Đã mua hàng và đánh giá
}, { timestamps: true });

// ============================================
// SCHEMA CHÍNH: SẢN PHẨM
// ============================================
const ProductSchema = new mongoose.Schema({

    // --- THÔNG TIN CƠ BẢN ---
    name: {
        type: String,
        required: [true, 'Tên sản phẩm không được để trống'],
        trim: true,
        maxlength: [200, 'Tên sản phẩm không được vượt quá 200 ký tự'],
    },

    slug: {
        type: String,
        unique: true, // Dùng cho SEO-friendly URL
        lowercase: true,
    },

    sku: {
        type: String,
        unique: true,    // Mã hàng hóa duy nhất
        sparse: true,    // Cho phép null nhưng không trùng
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

    // --- PHÂN LOẠI SẢN PHẨM ---
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

    // --- GIÁ CẢ ---
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
                // Giá khuyến mãi phải nhỏ hơn giá gốc
                return val === null || val < this.price;
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

    // --- TỒN KHO ---
    stock: {
        type: Number,
        default: 0,
        min: [0, 'Tồn kho không được âm'],
    },

    sold: {
        type: Number,
        default: 0, // Số lượng đã bán
    },

    isAvailable: {
        type: Boolean,
        default: true, // Có đang bán không
    },

    // --- HÌNH ẢNH ---
    images: {
        type: [ImageSchema],
        default: [],
    },

    thumbnail: {
        type: String,
        default: '/images/default-product.webp',
    },

    // --- THÔNG SỐ KỸ THUẬT LINH HOẠT ---
    /**
     * Đây là trường quan trọng nhất - Lưu thông số kỹ thuật cho từng loại sản phẩm
     * Dùng Mixed type để lưu trữ object có cấu trúc khác nhau
     *
     * Ví dụ CPU:
     *   specifications: {
     *     cores: 8,               // Số nhân
     *     threads: 16,            // Số luồng
     *     baseClock: 3.6,         // Xung nhịp cơ bản (GHz)
     *     boostClock: 5.0,        // Xung nhịp tăng tốc (GHz)
     *     socket: 'AM5',          // Loại socket
     *     tdp: 65,                // Công suất nhiệt (W)
     *     cache: { l2: '8MB', l3: '32MB' }
     *   }
     *
     * Ví dụ GPU:
     *   specifications: {
     *     vram: 12,               // VRAM (GB)
     *     vramType: 'GDDR6X',     // Loại VRAM
     *     coreClock: 2.23,        // Xung GPU (GHz)
     *     boostClock: 2.51,       // Xung boost (GHz)
     *     cudaCores: 10752,       // Số CUDA cores (NVIDIA)
     *     streamProcessors: null, // Số Stream Processors (AMD)
     *     memoryBus: 192,         // Bus bộ nhớ (bit)
     *     tdp: 285,               // Công suất (W)
     *     ports: ['HDMI 2.1', 'DisplayPort 1.4']
     *   }
     *
     * Ví dụ RAM:
     *   specifications: {
     *     capacity: 16,           // Dung lượng (GB)
     *     type: 'DDR4',           // Loại RAM
     *     busSpeed: 3200,         // Tốc độ Bus (MHz)
     *     latency: 'CL16',        // CAS Latency
     *     voltage: 1.35,          // Điện áp (V)
     *     formFactor: 'DIMM',     // Form factor (DIMM/SO-DIMM)
     *     ecc: false              // Hỗ trợ ECC không
     *   }
     */
    specifications: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },

    /**
     * Attributes: Các thuộc tính có thể lọc (dạng key-value)
     * Lưu riêng để tạo index tìm kiếm hiệu quả hơn
     * VD: { 'Màu sắc': 'Đen', 'Bảo hành': '24 tháng', 'Xuất xứ': 'Mỹ' }
     */
    attributes: {
        type: Map,
        of: String,
        default: {},
    },

    // --- TAGS VÀ TÌM KIẾM ---
    tags: {
        type: [String],
        default: [],
        lowercase: true,
    },

    // --- ĐÁNH GIÁ ---
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

    // --- TRẠNG THÁI HIỂN THỊ ---
    isActive: {
        type: Boolean,
        default: true,  // Có hiển thị trên trang không
    },

    isFeatured: {
        type: Boolean,
        default: false, // Sản phẩm nổi bật
    },

    isNewArrival: {
        type: Boolean,
        default: false, // Sản phẩm mới
    },

    // --- THÔNG TIN BẢO HÀNH ---
    warranty: {
        months: { type: Number, default: 12 }, // Thời gian bảo hành (tháng)
        condition: { type: String, default: '1 đổi 1 trong 30 ngày' },
    },

    // --- ADMIN ---
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

}, {
    timestamps: true, // Tự động thêm createdAt và updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// ============================================
// VIRTUAL FIELDS (Trường ảo - không lưu vào DB)
// ============================================

// Giá bán thực tế (sau giảm giá)
ProductSchema.virtual('finalPrice').get(function () {
    return this.salePrice !== null ? this.salePrice : this.price;
});

// Kiểm tra còn hàng không
ProductSchema.virtual('inStock').get(function () {
    return this.stock > 0;
});

// Số tiền tiết kiệm được
ProductSchema.virtual('savedAmount').get(function () {
    if (this.salePrice !== null) {
        return this.price - this.salePrice;
    }
    return 0;
});

// ============================================
// INDEX - Tối ưu hiệu suất tìm kiếm
// ============================================
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' }); // Tìm kiếm full-text
ProductSchema.index({ category: 1, brand: 1 });   // Lọc theo danh mục và thương hiệu
ProductSchema.index({ price: 1 });                 // Sắp xếp theo giá
ProductSchema.index({ salePrice: 1 });             // Lọc theo giá khuyến mãi
ProductSchema.index({ rating: -1 });               // Sắp xếp theo đánh giá
ProductSchema.index({ sold: -1 });                 // Sản phẩm bán chạy
ProductSchema.index({ createdAt: -1 });            // Sản phẩm mới nhất
// ProductSchema.index({ slug: 1 }, { unique: true }); // Đã có unique: true ở field definition

// ============================================
// MIDDLEWARE (HOOKS)
// ============================================

// Tự động tạo slug từ tên sản phẩm trước khi lưu
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
    if (this.salePrice && this.price) {
        this.discountPercent = Math.round(((this.price - this.salePrice) / this.price) * 100);
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

/**
 * Lấy top sản phẩm bán chạy
 */
ProductSchema.statics.getBestSellers = function (limit = 8) {
    return this.find({ isActive: true, stock: { $gt: 0 } })
        .sort({ sold: -1 })
        .limit(limit)
        .select('name slug thumbnail price salePrice rating numReviews sold brand category');
};

module.exports = mongoose.model('Product', ProductSchema);
