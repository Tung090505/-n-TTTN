/**
 * ============================================
 * controllers/cartController.js - GIỎ HÀNG
 * ============================================
 * Quản lý giỏ hàng: Thêm, xóa, cập nhật số lượng
 * và tính tổng tiền tự động
 */

const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { AppError } = require('../middleware/errorHandler');

// ============================================
// LẤY GIỎ HÀNG CỦA USER
// GET /api/cart
// ============================================
exports.getCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product', 'name slug thumbnail price salePrice stock isActive brand');

        if (!cart) {
            // Tự tạo giỏ hàng rỗng nếu chưa có
            cart = await Cart.create({ user: req.user.id, items: [] });
        }

        // Lọc bỏ các sản phẩm đã bị xóa hoặc hết hàng
        const validItems = cart.items.filter(item =>
            item.product && item.product.isActive
        );

        if (validItems.length !== cart.items.length) {
            cart.items = validItems;
            cart.updateTotals();
            await cart.save();
        }

        res.status(200).json({
            success: true,
            data: { cart },
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// THÊM SẢN PHẨM VÀO GIỎ HÀNG
// POST /api/cart/add
// ============================================
exports.addToCart = async (req, res, next) => {
    try {
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return next(new AppError('Thiếu thông tin sản phẩm.', 400));
        }

        // Kiểm tra sản phẩm tồn tại và còn hàng
        const product = await Product.findById(productId);

        if (!product || !product.isActive) {
            return next(new AppError('Sản phẩm không tồn tại hoặc đã ngừng bán.', 404));
        }

        if (product.stock < quantity) {
            return next(new AppError(`Chỉ còn ${product.stock} sản phẩm trong kho.`, 400));
        }

        // Tìm hoặc tạo giỏ hàng
        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            cart = new Cart({ user: req.user.id, items: [] });
        }

        // Kiểm tra số lượng trong giỏ + số lượng thêm không vượt quá tồn kho
        const existingItem = cart.items.find(
            item => item.product.toString() === productId.toString()
        );
        const currentQtyInCart = existingItem ? existingItem.quantity : 0;

        if (currentQtyInCart + quantity > product.stock) {
            return next(new AppError(
                `Không thể thêm. Bạn đã có ${currentQtyInCart} trong giỏ. Tồn kho: ${product.stock}.`,
                400
            ));
        }

        // Thêm vào giỏ (dùng giá finalPrice: salePrice hoặc price)
        const price = product.finalPrice;
        cart.addItem(productId, price, Number(quantity));
        await cart.save();

        // Populate để trả về thông tin chi tiết
        await cart.populate('items.product', 'name slug thumbnail price salePrice stock brand');

        res.status(200).json({
            success: true,
            message: `Đã thêm "${product.name}" vào giỏ hàng.`,
            data: { cart },
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// CẬP NHẬT SỐ LƯỢNG SẢN PHẨM TRONG GIỎ
// PUT /api/cart/update
// ============================================
exports.updateCartItem = async (req, res, next) => {
    try {
        const { productId, quantityChange } = req.body;

        if (!productId || quantityChange === undefined) {
            return next(new AppError('Thiếu thông tin cập nhật giỏ hàng.', 400));
        }

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return next(new AppError('Giỏ hàng không tồn tại.', 404));
        }

        // Tìm item trong giỏ
        const item = cart.items.find(i => i.product.toString() === productId);
        if (!item) {
            return next(new AppError('Sản phẩm không có trong giỏ hàng.', 404));
        }

        const newQuantity = item.quantity + Number(quantityChange);

        // Kiểm tra tồn kho nếu tăng
        if (quantityChange > 0) {
            const product = await Product.findById(productId);
            if (product && product.stock < newQuantity) {
                return next(new AppError(`Chỉ còn ${product.stock} sản phẩm trong kho.`, 400));
            }
        }

        if (newQuantity <= 0) {
            cart.removeItem(productId);
        } else {
            item.quantity = newQuantity;
            cart.updateTotals();
        }

        await cart.save();
        await cart.populate('items.product', 'name slug thumbnail price salePrice stock brand');

        res.status(200).json({
            success: true,
            message: 'Đã cập nhật giỏ hàng.',
            data: { cart },
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// XÓA SẢN PHẨM KHỎI GIỎ HÀNG
// DELETE /api/cart/:productId
// ============================================
exports.removeFromCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return next(new AppError('Giỏ hàng không tồn tại.', 404));
        }

        cart.removeItem(req.params.productId);
        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Đã xóa sản phẩm khỏi giỏ hàng.',
            data: { cart },
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// XÓA TOÀN BỘ GIỎ HÀNG
// DELETE /api/cart
// ============================================
exports.clearCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (cart) {
            cart.clearCart();
            await cart.save();
        }

        res.status(200).json({
            success: true,
            message: 'Đã xóa toàn bộ giỏ hàng.',
        });
    } catch (error) {
        next(error);
    }
};
