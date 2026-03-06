/**
 * ============================================
 * utils/seeder.js - DỮ LIỆU MẪU (SEED DATA)
 * ============================================
 * Chạy: npm run seed
 * Tự động tạo dữ liệu mẫu để test ứng dụng
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const connectDB = require('../db');

// ============================================
// DỮ LIỆU MẪU SẢN PHẨM (ẢNH TỪ INTERNET)
// ============================================
const sampleProducts = [
    // ---- LAPTOP ----
    {
        name: 'ASUS ROG Zephyrus G16 2024',
        description: 'Laptop gaming cao cấp với màn hình OLED 240Hz, hiệu năng đỉnh cao',
        shortDescription: 'Laptop gaming OLED 240Hz với AMD Ryzen 9 và RTX 4070',
        category: 'laptop',
        brand: 'ASUS',
        price: 52990000,
        salePrice: 47990000,
        stock: 15,
        thumbnail: 'https://dlcdnwebimgs.asus.com/gain/97E2597B-61A6-4A5D-80D7-9057B18A51C3/w717/h525',
        isFeatured: true,
        specifications: {
            cpu: 'AMD Ryzen 9 8945HS',
            gpu: 'NVIDIA RTX 4070 8GB',
            ram: 32,
            storage: '1TB NVMe SSD',
            display: '16 inch OLED 240Hz 2560x1600'
        },
        isActive: true,
        isNewArrival: true,
        warranty: { months: 24, condition: '1 đổi 1 trong 30 ngày' }
    },
    {
        name: 'MacBook Pro 14 M3 Pro',
        description: 'Laptop Workstation mạnh mẽ từ Apple với chip M3 Pro mới nhất',
        shortDescription: 'Siêu bền, siêu mạnh, màn hình Liquid Retina XDR',
        category: 'laptop',
        brand: 'Apple',
        price: 49990000,
        salePrice: 45990000,
        stock: 10,
        thumbnail: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697311054290',
        isFeatured: true,
        specifications: {
            cpu: 'Apple M3 Pro',
            gpu: '14-core GPU',
            ram: 18,
            storage: '512GB SSD',
            display: '14.2 inch Liquid Retina XDR'
        },
        isActive: true,
        isNewArrival: true,
        warranty: { months: 12, condition: 'Bảo hành chính hãng Apple' }
    },

    // ---- CPU ----
    {
        name: 'Intel Core i9-14900K',
        description: 'Bộ vi xử lý flagship của Intel thế hệ 14',
        shortDescription: 'CPU flagship Intel thế hệ 14 - 24 nhân 32 luồng 6.0GHz',
        category: 'cpu',
        brand: 'Intel',
        price: 13490000,
        salePrice: 12490000,
        stock: 30,
        isFeatured: true,
        thumbnail: 'https://m.media-amazon.com/images/I/61NlU6WvKXL._AC_SL1500_.jpg',
        specifications: {
            cores: 24,
            threads: 32,
            socket: 'LGA1700'
        },
        isActive: true,
        isNewArrival: true
    },

    // ---- GPU ----
    {
        name: 'MSI GeForce RTX 4080 SUPER GAMING X SLIM',
        description: 'Card đồ họa RTX 4080 SUPER với 16GB GDDR6X',
        shortDescription: 'GPU RTX 4080 SUPER 16GB GDDR6X - Gaming 4K đỉnh cao',
        category: 'gpu',
        brand: 'MSI',
        price: 28990000,
        stock: 8,
        isFeatured: true,
        thumbnail: 'https://asset.msi.com/resize/image/global/product/five_pictures1_2024012918115665b778ec5232b.png6240b55a5863f78c7a3316f2e280926b/1024.png',
        specifications: {
            chipset: 'NVIDIA RTX 4080 SUPER',
            vram: 16,
            vramType: 'GDDR6X'
        },
        isActive: true,
        isNewArrival: true
    },

    // ---- RAM ----
    {
        name: 'Kingston Fury Beast DDR5 32GB (2x16GB) 6000MHz',
        description: 'Bộ RAM DDR5 dung lượng 32GB',
        shortDescription: 'RAM DDR5 32GB Dual Channel 6000MHz CL30',
        category: 'ram',
        brand: 'Kingston',
        price: 2890000,
        salePrice: 2490000,
        stock: 50,
        thumbnail: 'https://m.media-amazon.com/images/I/71YyM9l3+3L._AC_SL1500_.jpg',
        specifications: {
            capacity: 32,
            type: 'DDR5',
            speed: '6000MHz'
        },
        isActive: true,
        isNewArrival: true
    }
];

// Admin user mẫu
const sampleAdmin = {
    firstName: 'Admin',
    lastName: 'TechStore',
    email: 'admin@techstore.vn',
    password: 'Admin@123456',
    role: 'admin',
    isActive: true,
};

// Hàm Seed Dữ Liệu
const seedData = async () => {
    try {
        await connectDB();
        console.log('🌱 Bắt đầu seed dữ liệu mẫu chuyên nghiệp...\n');

        await Product.deleteMany({});
        await User.deleteMany({ role: 'admin' });
        console.log('🗑️  Đã xóa dữ liệu cũ');

        const admin = await User.create(sampleAdmin);
        console.log(`👤 Đã tạo tài khoản Admin: ${admin.email}`);

        for (const p of sampleProducts) {
            await Product.create(p);
            console.log(`   - [${p.category.toUpperCase()}] ${p.name}`);
        }

        console.log('\n✅ Seed dữ liệu thành công!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi khi seed dữ liệu:', error);
        process.exit(1);
    }
};

seedData();
