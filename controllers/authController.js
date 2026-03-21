

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
