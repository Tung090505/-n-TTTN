

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      
      serverSelectionTimeoutMS: 5000, 
      socketTimeoutMS: 45000,         
    });

    console.log(` MongoDB đã kết nối thành công: ${conn.connection.host}`);
    console.log(` Tên Database: ${conn.connection.name}`);

  } catch (error) {
    console.error(` Lỗi kết nối MongoDB: ${error.message}`);
    
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('  MongoDB đã mất kết nối. Đang thử kết nối lại...');
});

mongoose.connection.on('reconnected', () => {
  console.log(' MongoDB đã kết nối lại thành công!');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log(' MongoDB đã đóng kết nối do ứng dụng tắt.');
  process.exit(0);
});

module.exports = connectDB;
