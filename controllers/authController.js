

const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

const sendTokenResponse = (user, statusCode, res) => {

    const token = user.getSignedJwtToken();

    const cookieOptions = {
        expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    };

    user.password = undefined;

    res.status(statusCode)
        .cookie('token', token, cookieOptions)
        .json({
            success: true,
            token,
            data: { user },
        });
};

exports.register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new AppError('Email này đã được đăng ký. Vui lòng dùng email khác.', 400));
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            phone,
        });

        sendTokenResponse(user, 201, res);

    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');

        if (!user) {

            return next(new AppError('Email hoặc mật khẩu không đúng.', 401));
        }

        if (!user.isActive) {
            return next(new AppError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.', 401));
        }

        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return next(new AppError('Email hoặc mật khẩu không đúng.', 401));
        }

        user.lastLoginAt = new Date();
        await user.save({ validateBeforeSave: false });

        sendTokenResponse(user, 200, res);

    } catch (error) {
        next(error);
    }
};

exports.logout = (req, res) => {

    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });

    if (req.session) {
        req.session.destroy();
    }

    res.status(200).json({
        success: true,
        message: 'Đăng xuất thành công.',
    });
};

exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {

        const allowedFields = ['firstName', 'lastName', 'phone', 'avatar'];
        const updateData = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin thành công.',
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select('+password');

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return next(new AppError('Mật khẩu hiện tại không đúng.', 401));
        }

        user.password = newPassword;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

exports.addAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (req.body.isDefault) user.addresses.forEach(a => a.isDefault = false);
        user.addresses.push(req.body);
        await user.save();
        res.status(200).json({ success: true, message: 'Đã thêm địa chỉ.', data: { user } });
    } catch (error) { next(error); }
};

exports.deleteAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.id);
        await user.save();
        res.status(200).json({ success: true, message: 'Đã xóa địa chỉ.' });
    } catch (error) { next(error); }
};

exports.forgotPassword = async (req, res, next) => {
    const crypto = require('crypto');
    const sendEmail = require('../utils/sendEmail');
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return next(new AppError('Không tìm thấy người dùng với email này.', 404));
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `${req.protocol}://${req.get('host')}/dat-lai-mat-khau/${resetToken}`;

        const message = `Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản tại TechStore. Vui lòng nhấn vào đường dẫn bên dưới để thực hiện:\n\n ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Đặt lại mật khẩu - TechStore',
                message,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #333;">
                        <h2>Yêu cầu đặt lại mật khẩu</h2>
                        <p>Chào ${user.firstName},</p>
                        <p>Bạn nhận được email này vì đã có yêu cầu đặt lại mật khẩu cho tài khoản TechStore của bạn.</p>
                        <p>Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu. Đường dẫn này sẽ hết hạn sau 10 phút.</p>
                        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Đặt lại mật khẩu</a>
                        <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #999;">TechStore Team - Chuyên thiết bị công nghệ & PC Gaming</p>
                    </div>
                `
            });

            res.status(200).json({ success: true, message: 'Email đặt lại mật khẩu đã được gửi.' });
        } catch (error) {
            console.log(error);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            return next(new AppError('Không thể gửi email. Vui lòng thử lại sau.', 500));
        }
    } catch (error) {
        next(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    const crypto = require('crypto');
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return next(new AppError('Liên kết không hợp lệ hoặc đã hết hạn.', 400));
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

exports.toggleWishlist = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const productId = req.params.productId;

        const index = user.wishlist.indexOf(productId);
        let message = '';

        if (index === -1) {
            user.wishlist.push(productId);
            message = 'Đã thêm vào danh sách yêu thích.';
        } else {
            user.wishlist.splice(index, 1);
            message = 'Đã xóa khỏi danh sách yêu thích.';
        }

        await user.save();

        res.status(200).json({
            success: true,
            message,
            wishlist: user.wishlist
        });
    } catch (error) {
        next(error);
    }
};
