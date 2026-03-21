
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const connectDB = require('./db');

const categories = [
    'laptop', 'cpu', 'gpu', 'ram', 'storage', 
    'motherboard', 'psu', 'case', 'monitor', 
    'keyboard', 'mouse', 'headset'
];

const brands = {
    laptop: ['Apple', 'ASUS', 'MSI', 'Dell', 'HP', 'Lenovo', 'Acer', 'Gigabyte'],
    cpu: ['Intel', 'AMD'],
    gpu: ['NVIDIA', 'AMD', 'ASUS', 'MSI', 'Gigabyte', 'EVGA'],
    ram: ['Kingston', 'Corsair', 'G.Skill', 'Crucial', 'TeamGroup'],
    storage: ['Samsung', 'Western Digital', 'Kingston', 'Crucial', 'Seagate'],
    motherboard: ['ASUS', 'MSI', 'Gigabyte', 'ASRock'],
    psu: ['Corsair', 'Cooler Master', 'EVGA', 'Seasonic', 'Thermaltake'],
    case: ['NZXT', 'Corsair', 'Lian Li', 'Xigmatek', 'Deepcool'],
    monitor: ['Samsung', 'LG', 'ASUS', 'Dell', 'ViewSonic', 'AOC'],
    keyboard: ['Logitech', 'Razer', 'Corsair', 'Akko', 'Ducky'],
    mouse: ['Logitech', 'Razer', 'SteelSeries', 'Zowie'],
    headset: ['HyperX', 'Logitech', 'Razer', 'SteelSeries', 'Sony']
};

const thumbnails = {
    laptop: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=500&auto=format&fit=crop',
    cpu: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=500&auto=format&fit=crop',
    gpu: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=500&auto=format&fit=crop',
    ram: 'https://images.unsplash.com/photo-1562976540-1502c2145186?q=80&w=500&auto=format&fit=crop',
    storage: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?q=80&w=500&auto=format&fit=crop',
    motherboard: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=500&auto=format&fit=crop',
    psu: 'https://images.unsplash.com/photo-1587202372690-0708f3702580?q=80&w=500&auto=format&fit=crop',
    case: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?q=80&w=500&auto=format&fit=crop',
    monitor: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=500&auto=format&fit=crop',
    keyboard: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=500&auto=format&fit=crop',
    mouse: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=500&auto=format&fit=crop',
    headset: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=500&auto=format&fit=crop'
};

const generateProducts = (count) => {
    const products = [];
    for (let i = 1; i <= count; i++) {
        const cat = categories[Math.floor(Math.random() * categories.length)];
        const brand = brands[cat][Math.floor(Math.random() * brands[cat].length)];
        const price = Math.floor(Math.random() * 50000000) + 500000; // 500k to 50M
        const salePrice = Math.random() > 0.7 ? Math.floor(price * 0.9) : null;
        
        products.push({
            name: `${brand} ${cat.toUpperCase()} Model ${i}`,
            description: `Đây là mô tả chi tiết cho sản phẩm ${brand} ${cat} phiên bản đặc biệt số ${i}. Sản phẩm được bảo hành chính hãng và hỗ trợ trả góp 0%.`,
            shortDescription: `Sản phẩm ${cat} từ thương hiệu ${brand} chất lượng cao.`,
            category: cat,
            brand: brand,
            price: price,
            salePrice: salePrice,
            stock: Math.floor(Math.random() * 100) + 10,
            sold: Math.floor(Math.random() * 500),
            thumbnail: thumbnails[cat],
            isFeatured: Math.random() > 0.9, // 10% featured to fill home page
            isNewArrival: Math.random() > 0.8,
            isActive: true,
            rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
            numReviews: Math.floor(Math.random() * 100),
            warranty: { months: 24, condition: 'Chính hãng 1 đổi 1' }
        });
    }
    return products;
};

const seedBulk = async () => {
    try {
        await connectDB();
        console.log('🚀 Bắt đầu nạp 300+ sản phẩm vào Database (Sử dụng .create để tạo Slug)...');
        
        const bulkData = generateProducts(310);
        
        let successCount = 0;
        for (const p of bulkData) {
            try {
                // Sử dụng .create() để Mongoose chạy middleware pre('save') tạo slug
                await Product.create(p);
                successCount++;
                if (successCount % 10 === 0) console.log(`   ✅ Đã nạp ${successCount}/310 sản phẩm...`);
            } catch (err) {
                console.error(`   ❌ Lỗi tại sản phẩm ${p.name}:`, err.message);
            }
        }
        
        console.log(`\n✅ Hoàn tất! Đã thêm mới thành công ${successCount} sản phẩm.`);
        console.log('📊 Tổng sản phẩm trong Database:', await Product.countDocuments({}));
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi hệ thống khi seed:', error);
        process.exit(1);
    }
};

seedBulk();
