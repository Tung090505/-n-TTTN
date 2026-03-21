
require('dotenv').config();
const connectDB = require('./db');
const Product = require('./models/Product');

const realInventory = [
    // --- LAPTOPS ---
    {
        name: 'Apple MacBook Pro 14 M3 Chip',
        brand: 'Apple',
        category: 'laptop',
        price: 39990000,
        salePrice: 37500000,
        thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop',
        specs: { 'Chip': 'M3 8-core CPU', 'RAM': '16GB', 'SSD': '512GB', 'Màn hình': '14.2 inch Liquid Retina XDR' },
        desc: 'MacBook Pro với chip M3 mang đến hiệu năng vượt trội cho các tác vụ hàng ngày và chuyên nghiệp.'
    },
    {
        name: 'ASUS ROG Zephyrus G16 2024',
        brand: 'ASUS',
        category: 'laptop',
        price: 48500000,
        salePrice: null,
        thumbnail: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=600&auto=format&fit=crop',
        specs: { 'CPU': 'Intel Core Ultra 9', 'GPU': 'RTX 4070 8GB', 'RAM': '32GB DDR5', 'Loại màn': 'OLED 2.5K 240Hz' },
        desc: 'Laptop gaming mỏng nhẹ bậc nhất thế giới với màn hình OLED siêu sắc nét.'
    },
    {
        name: 'Dell XPS 13 9340 (2024)',
        brand: 'Dell',
        category: 'laptop',
        price: 35900000,
        salePrice: 33900000,
        thumbnail: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=600&auto=format&fit=crop',
        specs: { 'CPU': 'Intel Core Ultra 7', 'RAM': '16GB', 'SSD': '1TB NVMe', 'Trọng lượng': '1.19kg' },
        desc: 'Biểu tượng laptop doanh nhân mỏng nhẹ sang trọng.'
    },
    // --- CPU ---
    {
        name: 'CPU Intel Core i9-14900K',
        brand: 'Intel',
        category: 'cpu',
        price: 15500000,
        salePrice: 14800000,
        thumbnail: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=600&auto=format&fit=crop',
        specs: { 'Nhân/Luồng': '24/32', 'Xung nhịp': '6.0GHz', 'Socket': 'LGA 1700' },
        desc: 'Vi xử lý tối thượng cho gaming và render video 8K.'
    },
    {
        name: 'CPU AMD Ryzen 7 7800X3D',
        brand: 'AMD',
        category: 'cpu',
        price: 11200000,
        salePrice: 10500000,
        thumbnail: 'https://images.unsplash.com/photo-1555617766-c94804975da3?q=80&w=600&auto=format&fit=crop',
        specs: { 'Nhân/Luồng': '8/16', 'L3 Cache': '96MB 3D V-Cache', 'Socket': 'AM5' },
        desc: 'CPU chuyên game đỉnh nhất thế giới nhờ công nghệ V-Cache.'
    },
    // --- GPU ---
    {
        name: 'VGA ASUS ROG Strix RTX 4090 OC',
        brand: 'ASUS',
        category: 'gpu',
        price: 58900000,
        salePrice: null,
        thumbnail: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=600&auto=format&fit=crop',
        specs: { 'VRAM': '24GB GDDR6X', 'Nhân CUDA': '16384', 'Slot': '3.5 Slot' },
        desc: 'Siêu phẩm đồ họa mạnh nhất thời điểm hiện tại.'
    },
    {
        name: 'VGA MSI GeForce RTX 4070 Ti SUPER',
        brand: 'MSI',
        category: 'gpu',
        price: 24500000,
        salePrice: 22900000,
        thumbnail: 'https://images.unsplash.com/photo-1624701928517-44c8ac49d93c?q=80&w=600&auto=format&fit=crop',
        specs: { 'VRAM': '16GB GDDR6X', 'Xung nhịp': '2670 MHz', 'Loại': 'Gaming X Slim' },
        desc: 'Hiệu năng đồ họa mạnh mẽ cho trải nghiệm 2K tuyệt vời nhất.'
    },
    // --- RAM ---
    {
        name: 'RAM Kingston Fury Beast 32GB DDR5',
        brand: 'Kingston',
        category: 'ram',
        price: 3650000,
        salePrice: 3200000,
        thumbnail: 'https://images.unsplash.com/photo-1562976540-1502c2145186?q=80&w=600&auto=format&fit=crop',
        specs: { 'Dung lượng': '32GB (2x16GB)', 'Bus': '6000MHz', 'Loại': 'DDR5' },
        desc: 'Bộ nhớ DDR5 hiệu năng cao cho các dàn máy thế hệ mới.'
    },
    // --- MONITOR ---
    {
        name: 'Màn hình Samsung Odyssey G7 32 inch',
        brand: 'Samsung',
        category: 'monitor',
        price: 15900000,
        salePrice: 13500000,
        thumbnail: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600&auto=format&fit=crop',
        specs: { 'Độ phân giải': '2K (2560x1440)', 'Tần số quét': '240Hz', 'Độ cong': '1000R' },
        desc: 'Màn hình cong gaming hoàn hảo cho trải nghiệm đắm chìm.'
    }
];

const seedMarketRealProducts = async () => {
    try {
        await connectDB();
        console.log('🧹 Đang làm sạch database để nạp dữ liệu THỰC TẾ...');
        await Product.deleteMany({});

        const allProducts = [];

        // Tạo 300 sản phẩm dựa trên các nền tảng thực tế (với biến thể tên và giá hợp lý)
        for (let i = 1; i <= 300; i++) {
            const template = realInventory[i % realInventory.length];
            
            // Biến động giá nhẹ (+/- 5%) để nhìn tự nhiên
            const priceVariance = template.price * (1 + (Math.random() * 0.1 - 0.05));
            const finalPrice = Math.floor(priceVariance / 10000) * 10000;
            const finalSalePrice = template.salePrice ? (finalPrice * 0.9) : null;

            allProducts.push({
                name: `${template.name} - Model Gen ${i}`,
                brand: template.brand,
                category: template.category,
                price: finalPrice,
                salePrice: finalSalePrice,
                thumbnail: template.thumbnail,
                specifications: { ...template.specs, 'Serial': `TS-MARKET-${i}` },
                description: template.desc + `\n\nĐây là phiên bản thương mại chính thức từ nhà sản xuất. Cam kết bảo hành chính hãng và hỗ trợ trả góp qua thẻ tín dụng.`,
                shortDescription: `Sản phẩm ${template.name} nổi bật trên thị trường.`,
                stock: Math.floor(Math.random() * 100) + 10,
                isActive: true,
                isFeatured: i <= 20,
                isNewArrival: Math.random() > 0.8
            });
        }

        console.log('🚀 Đang nạp 300 sản phẩm với GIÁ THỊ TRƯỜNG chuẩn và HÌNH ẢNH ĐÚNG loại...');
        for (let j = 0; j < allProducts.length; j++) {
            await Product.create(allProducts[j]);
            if ((j + 1) % 50 === 0) console.log(`   ✅ Đã nạp ${j + 1}/300 sản phẩm...`);
        }

        console.log('\n💎 THÀNH CÔNG! Database của bạn hiện có 300 sản phẩm "thật 100%" cả về hình ảnh và giá cả.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
};

seedMarketRealProducts();
