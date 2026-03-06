/**
 * ============================================
 * models/Category.js - SCHEMA DANH MỤC
 * ============================================
 */

const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên danh mục không được để trống'],
        unique: true,
        trim: true,
        maxlength: 100,
    },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String },
    icon: { type: String },  // CSS class hoặc URL icon
    image: { type: String },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
    },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

CategorySchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-');
    }
    next();
});

module.exports = mongoose.model('Category', CategorySchema);
