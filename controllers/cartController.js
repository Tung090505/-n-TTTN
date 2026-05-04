

const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { AppError } = require('../middleware/errorHandler');

exports.getCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product', 'name slug thumbnail price salePrice stock isActive brand');

        if (!cart) {
            
            cart = await Cart.create({ user: req.user.id, items: [] });
        }

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

exports.addToCart = async (req, res, next) => {
    try {
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return next(new AppError('Thiếu thông tin sản phẩm.', 400));
        }

        const product = await Product.findById(productId);

        if (!product || !product.isActive) {
            return next(new AppError('Sản phẩm không tồn tại hoặc đã ngừng bán.', 404));
        }

        if (product.stock < quantity) {
            return next(new AppError(`Chỉ còn ${product.stock} sản phẩm trong kho.`, 400));
        }

        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            cart = new Cart({ user: req.user.id, items: [] });
        }

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

        const price = product.finalPrice;
        cart.addItem(productId, price, Number(quantity));
        await cart.save();

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

        const item = cart.items.find(i => i.product.toString() === productId);
        if (!item) {
            return next(new AppError('Sản phẩm không có trong giỏ hàng.', 404));
        }

        const newQuantity = item.quantity + Number(quantityChange);

        // Always validate against current stock, regardless of increase or decrease
        if (newQuantity > 0) {
            const product = await Product.findById(productId);
            if (!product) {
                return next(new AppError('Sản phẩm không tồn tại.', 404));
            }
            
            if (product.stock < newQuantity) {
                return next(new AppError(
                    `Chỉ còn ${product.stock} sản phẩm trong kho. Bạn không thể có ${newQuantity} sản phẩm trong giỏ.`, 
                    400
                ));
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
