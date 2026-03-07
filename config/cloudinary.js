const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cấu hình thông tin tài khoản Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Thiết lập nơi lưu trữ ảnh trên Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'TechStore_Products', // Tên thư mục trên Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // Định dạng ảnh được phép
        transformation: [{ width: 800, height: 800, crop: 'limit' }] // Tự động tối ưu kích thước
    }
});

// Middleware multer để xử lý file từ form gửi lên
const uploadCloud = multer({ storage });

module.exports = { cloudinary, uploadCloud };
