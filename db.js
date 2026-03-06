/**
 * ============================================
 * db.js - KẾT NỐI CƠ SỞ DỮ LIỆU MONGODB
 * ============================================
 * Quản lý kết nối Mongoose đến MongoDB
 * Bao gồm xử lý lỗi và tự động kết nối lại
 */

const mongoose = require('mongoose');

/**
 * Hàm kết nối đến MongoDB
 * Sử dụng URI từ biến môi trường MONGO_URI
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Các tùy chọn kết nối tối ưu
      serverSelectionTimeoutMS: 5000, // Timeout sau 5 giây nếu không kết nối được
      socketTimeoutMS: 45000,         // Timeout socket sau 45 giây
    });

    console.log(`✅ MongoDB đã kết nối thành công: ${conn.connection.host}`);
    console.log(`📦 Tên Database: ${conn.connection.name}`);

  } catch (error) {
    console.error(`❌ Lỗi kết nối MongoDB: ${error.message}`);
    // Thoát tiến trình nếu không thể kết nối database
    process.exit(1);
  }
};

// Lắng nghe sự kiện mất kết nối
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB đã mất kết nối. Đang thử kết nối lại...');
});

// Lắng nghe sự kiện kết nối lại thành công
mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB đã kết nối lại thành công!');
});

// Xử lý thoát ứng dụng an toàn - đóng kết nối MongoDB
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🛑 MongoDB đã đóng kết nối do ứng dụng tắt.');
  process.exit(0);
});

module.exports = connectDB;
