
require('dotenv').config();
const connectDB = require('./db');
const Product = require('./models/Product');

const specsTable = {
    laptop: [
        { brand: 'Apple', name: 'MacBook Air M2', price: 27990000, specs: { 'Chip': 'Apple M2 8-core CPU', 'RAM': '8GB Unified', 'SSD': '256GB', 'Màn hình': '13.6 inch Liquid Retina' }, desc: 'MacBook Air với chip M2 mới mang lại hiệu năng kinh ngạc trong một thiết kế siêu mỏng và nhẹ.' },
        { brand: 'ASUS', name: 'ROG Zephyrus G14', price: 34500000, specs: { 'CPU': 'AMD Ryzen 9 7940HS', 'GPU': 'RTX 4060 8GB', 'RAM': '16GB DDR5', 'SSD': '1TB NVMe' }, desc: 'Laptop gaming 14-inch mạnh mẽ nhất thế giới với màn hình Nebula Display đỉnh cao.' },
        { brand: 'Dell', name: 'XPS 13 Plus', price: 38990000, specs: { 'CPU': 'Intel Core i7-1360P', 'RAM': '16GB LPDDR5', 'SSD': '512GB NVMe', 'Màn hình': '13.4 inch 3.5K OLED Touch' }, desc: 'Đột phá thiết kế với hàng phím chức năng cảm ứng và touchpad tàng hình.' },
        { brand: 'MSI', name: 'Raider GE78 HX', price: 65000000, specs: { 'CPU': 'i9-13980HX', 'GPU': 'RTX 4080 12GB', 'RAM': '32GB DDR5', 'SSD': '2TB' }, desc: 'Đỉnh cao laptop gaming với dải đèn Matrix cực chất và hiệu năng không giới hạn.' }
    ],
    cpu: [
        { brand: 'Intel', name: 'Core i9-14900K', price: 14500000, specs: { 'Nhân/Luồng': '24/32', 'Xung nhịp': 'Lên đến 6.0GHz', 'Socket': 'LGA 1700' }, desc: 'CPU mạnh mẽ nhất cho game thủ và nhà sáng tạo nội dung.' },
        { brand: 'AMD', name: 'Ryzen 7 7800X3D', price: 10800000, specs: { 'Nhân/Luồng': '8/16', 'L3 Cache': '96MB 3D V-Cache', 'Socket': 'AM5' }, desc: 'CPU chơi game tốt nhất thế giới hiện tại.' }
    ],
    gpu: [
        { brand: 'NVIDIA', name: 'RTX 4090 Founders Edition', price: 52000000, specs: { 'VRAM': '24GB GDDR6X', 'Nhân CUDA': '16384', 'TDP': '450W' }, desc: 'Card đồ họa mạnh mẽ nhất hành tinh, chinh phục mọi tựa game 4K.' },
        { brand: 'ASUS', name: 'ROG Strix RTX 4070 Ti', price: 24500000, specs: { 'VRAM': '12GB GDDR6X', 'Xung nhịp': '2760MHz', 'Giao tiếp': 'PCIe 4.0' }, desc: 'Dòng card đồ họa cao cấp với tản nhiệt xịn nhất phân khúc.' }
    ],
    ram: [
        { brand: 'Kingston', name: 'Fury Beast 32GB DDR5', price: 3200000, specs: { 'Dung lượng': '32GB (2x16GB)', 'Bus': '6000MHz', 'Loại': 'DDR5' }, desc: 'RAM hiệu năng cao hỗ trợ Intel XMP 3.0.' }
    ],
    storage: [
        { brand: 'Samsung', name: '990 Pro 2TB', price: 4800000, specs: { 'Dung lượng': '2TB', 'Tốc độ đọc': '7450MB/s', 'Chuẩn': 'PCIe 4.0 NVMe' }, desc: 'Ổ cứng SSD nhanh nhất hiện nay cho PC và PS5.' }
    ]
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

const seed300Products = async () => {
    try {
        await connectDB();
        console.log('🧹 Đang làm sạch database...');
        await Product.deleteMany({});

        const cats = Object.keys(thumbnails);
        const finalProducts = [];

        for (let i = 1; i <= 300; i++) {
            const cat = cats[Math.floor(Math.random() * cats.length)];
            const templates = specsTable[cat] || [
                { brand: 'Generic', name: 'High-End Component', price: 2000000, specs: { 'Loại': 'Chính hãng', 'Bảo hành': '24 tháng' }, desc: 'Linh kiện chất lượng cao dành cho bộ máy của bạn.' }
            ];
            
            const template = templates[Math.floor(Math.random() * templates.length)];
            
            finalProducts.push({
                name: `${template.name} V${i}`,
                brand: template.brand,
                category: cat,
                price: template.price + (Math.floor(Math.random() * 1000) * 1000), // Thêm biến động giá ngẫu nhiên
                description: template.desc + ` Đây là phiên bản đặc biệt số hiệu ${i} với độ bền được kiểm chứng nghiêm ngặt.`,
                shortDescription: `Sản phẩm ${cat} chất lượng cao từ ${template.brand}.`,
                specifications: { ...template.specs, 'Mã sản phẩm': `TS-${i}` },
                thumbnail: thumbnails[cat],
                stock: Math.floor(Math.random() * 50) + 10,
                isActive: true,
                isFeatured: i <= 20, // 20 sản phẩm nổi bật
                isNewArrival: Math.random() > 0.8
            });
        }

        console.log('🚀 Đang bắt đầu nạp 300 sản phẩm với thông số chuyên sâu...');
        
        // Chia nhỏ mảng để insert theo batch hoặc loop (create để sinh slug)
        for (let j = 0; j < finalProducts.length; j++) {
            await Product.create(finalProducts[j]);
            if ((j + 1) % 50 === 0) console.log(`   ✅ Đã nạp ${j + 1}/300 sản phẩm...`);
        }

        console.log('✅ Hoàn tất! Database hiện có đầy đủ 300 sản phẩm "thật".');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
};

seed300Products();
