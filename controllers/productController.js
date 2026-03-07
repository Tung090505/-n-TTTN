/**
 * ============================================
 * controllers/productController.js - QUẢN LÝ SẢN PHẨM
 * ============================================
 * CRUD operations và các tính năng lọc nâng cao
 */

const Product = require('../models/Product');
const ApiFeatures = require('../utils/apiFeatures');
const { AppError } = require('../middleware/errorHandler');

// ============================================
// LẤY DANH SÁCH SẢN PHẨM (Bộ lọc nâng cao)
// GET /api/products
// ============================================
exports.getProducts = async (req, res, next) => {
    try {
        // Áp dụng bộ lọc nâng cao
        const features = new ApiFeatures(Product.find(), req.query)
            .filter()    // Lọc theo danh mục, thương hiệu, giá, thông số kỹ thuật
            .search()    // Tìm kiếm full-text
            .sort()      // Sắp xếp
            .limitFields() // Chọn trường
            .paginate(); // Phân trang

        // Đếm tổng số sản phẩm (để tính số trang)
        const totalFeatures = new ApiFeatures(Product.find(), req.query)
            .filter()
            .search();
        const total = await Product.countDocuments(totalFeatures.query.getFilter());

        const products = await features.query;

        // Thông tin phân trang
        const { page, limit } = features.pagination;
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            total,
            totalPages,
            currentPage: page,
            limit,
            count: products.length,
            data: { products },
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// LẤY CHI TIẾT 1 SẢN PHẨM
// GET /api/products/:slug
// ============================================
exports.getProduct = async (req, res, next) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug, isActive: true })
            .populate('createdBy', 'firstName lastName')
            .populate('reviews.user', 'firstName lastName avatar');

        if (!product) {
            return next(new AppError('Không tìm thấy sản phẩm.', 404));
        }

        // Lấy sản phẩm liên quan (cùng danh mục)
        const relatedProducts = await Product.find({
            category: product.category,
            _id: { $ne: product._id }, // Loại trừ sản phẩm hiện tại
            isActive: true,
        })
            .limit(8)
            .select('name slug thumbnail price salePrice rating numReviews brand');

        res.status(200).json({
            success: true,
            data: { product, relatedProducts },
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// TẠO SẢN PHẨM MỚI (Admin)
// POST /api/products
// ============================================
exports.createProduct = async (req, res, next) => {
    try {
        // Gắn admin tạo sản phẩm
        req.body.createdBy = req.user.id;

        // Nếu có file ảnh được upload từ Cloudinary
        if (req.file) {
            req.body.thumbnail = req.file.path;
        }

        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            message: `Đã thêm sản phẩm "${product.name}" thành công.`,
            data: { product },
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// CẬP NHẬT SẢN PHẨM (Admin)
// PUT /api/products/:id
// ============================================
exports.updateProduct = async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return next(new AppError('Không tìm thấy sản phẩm.', 404));
        }

        // Nếu có file ảnh mới được upload
        if (req.file) {
            req.body.thumbnail = req.file.path;
        }

        // Cập nhật các trường thông tin từ req.body
        Object.assign(product, req.body);

        // Lưu sản phẩm (hành động này sẽ kích hoạt validator và middleware .pre('save'))
        product = await product.save();

        res.status(200).json({
            success: true,
            message: 'Cập nhật sản phẩm thành công.',
            data: { product },
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// XÓA SẢN PHẨM (Admin) - Xóa mềm
// DELETE /api/products/:id
// ============================================
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return next(new AppError('Không tìm thấy sản phẩm.', 404));
        }

        // Xóa mềm: Chỉ ẩn sản phẩm, không xóa khỏi DB
        product.isActive = false;
        await product.save();

        res.status(200).json({
            success: true,
            message: `Đã xóa sản phẩm "${product.name}" thành công.`,
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// THÊM ĐÁNH GIÁ SẢN PHẨM
// POST /api/products/:id/reviews
// ============================================
exports.addReview = async (req, res, next) => {
    try {
        const { rating, title, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return next(new AppError('Không tìm thấy sản phẩm.', 404));
        }

        // Kiểm tra user đã đánh giá chưa
        const alreadyReviewed = product.reviews.find(
            r => r.user.toString() === req.user.id.toString()
        );
        if (alreadyReviewed) {
            return next(new AppError('Bạn đã đánh giá sản phẩm này rồi.', 400));
        }

        // Thêm đánh giá mới
        product.reviews.push({
            user: req.user.id,
            userName: req.user.fullName,
            rating: Number(rating),
            title,
            comment,
        });

        // Cập nhật rating trung bình
        product.calculateRating();
        await product.save();

        res.status(201).json({
            success: true,
            message: 'Cảm ơn bạn đã đánh giá sản phẩm!',
            data: { rating: product.rating, numReviews: product.numReviews },
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// LẤY SẢN PHẨM NỔI BẬT / BÁN CHẠY
// GET /api/products/featured
// GET /api/products/best-sellers
// ============================================
exports.getFeaturedProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ isFeatured: true, isActive: true })
            .limit(8)
            .select('name slug thumbnail price salePrice rating numReviews brand category');

        res.status(200).json({ success: true, count: products.length, data: { products } });
    } catch (error) {
        next(error);
    }
};

exports.getBestSellers = async (req, res, next) => {
    try {
        const products = await Product.getBestSellers(12);
        res.status(200).json({ success: true, count: products.length, data: { products } });
    } catch (error) {
        next(error);
    }
};
