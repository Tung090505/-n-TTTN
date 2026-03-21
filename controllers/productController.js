

const Product = require('../models/Product');
const ApiFeatures = require('../utils/apiFeatures');
const { AppError } = require('../middleware/errorHandler');

exports.getProducts = async (req, res, next) => {
    try {
        
        const features = new ApiFeatures(Product.find(), req.query)
            .filter()    
            .search()    
            .sort()      
            .limitFields() 
            .paginate(); 

        const totalFeatures = new ApiFeatures(Product.find(), req.query)
            .filter()
            .search();
        const total = await Product.countDocuments(totalFeatures.query.getFilter());

        const products = await features.query;

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

exports.getProduct = async (req, res, next) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug, isActive: true })
            .populate('createdBy', 'firstName lastName')
            .populate('reviews.user', 'firstName lastName avatar');

        if (!product) {
            return next(new AppError('Không tìm thấy sản phẩm.', 404));
        }

        const relatedProducts = await Product.find({
            category: product.category,
            _id: { $ne: product._id }, 
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

exports.createProduct = async (req, res, next) => {
    try {
        
        req.body.createdBy = req.user.id;

        if (req.file) {
            req.body.thumbnail = req.file.path;
        }

        if (req.body.specifications) {
            let specs = req.body.specifications;
            
            while (typeof specs === 'string') {
                try {
                    specs = JSON.parse(specs);
                    if (typeof specs !== 'object') break; 
                } catch (e) {
                    specs = {};
                    break;
                }
            }
            req.body.specifications = specs || {};
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

exports.updateProduct = async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return next(new AppError('Không tìm thấy sản phẩm.', 404));
        }

        if (req.file) {
            req.body.thumbnail = req.file.path;
        }

        if (req.body.specifications) {
            let specs = req.body.specifications;
            while (typeof specs === 'string') {
                try {
                    specs = JSON.parse(specs);
                    if (typeof specs !== 'object') break;
                } catch (e) {
                    break; 
                }
            }
            if (typeof specs === 'object' && specs !== null) {
                req.body.specifications = specs;
            }
        }

        Object.assign(product, req.body);

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

exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return next(new AppError('Không tìm thấy sản phẩm.', 404));
        }

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

exports.addReview = async (req, res, next) => {
    try {
        const { rating, title, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return next(new AppError('Không tìm thấy sản phẩm.', 404));
        }

        const alreadyReviewed = product.reviews.find(
            r => r.user.toString() === req.user.id.toString()
        );
        if (alreadyReviewed) {
            return next(new AppError('Bạn đã đánh giá sản phẩm này rồi.', 400));
        }

        product.reviews.push({
            user: req.user.id,
            userName: req.user.fullName,
            rating: Number(rating),
            title,
            comment,
        });

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
