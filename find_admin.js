
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function findAdmins() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const admins = await User.find({ role: 'admin' });
    if (admins.length > 0) {
      console.log('--- DANH SÁCH ADMIN ---');
      admins.forEach(u => {
        console.log(`- Email: ${u.email}`);
      });
    } else {
      console.log('Không tìm thấy tài khoản admin nào trong database.');
    }
  } catch (err) {
    console.error('Lỗi khi tìm admin:', err.message);
  } finally {
    mongoose.connection.close();
  }
}

findAdmins();
