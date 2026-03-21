
require('dotenv').config();
const connectDB = require('./db');
const Product = require('./models/Product');

// Dữ liệu mẫu cực kỳ chi tiết với dải giá phân tách rõ rệt
const marketData = {
    laptop: [
        { brand: 'Acer', name: 'Aspire 3 A315', price: 8990000, img: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef', tier: 'Giá rẻ', specs: {'CPU': 'Intel i3', 'RAM': '8GB'} },
        { brand: 'ASUS', name: 'Vivobook 15 X1504', price: 14500000, img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed', tier: 'Tầm trung', specs: {'CPU': 'Intel i5', 'RAM': '16GB'} },
        { brand: 'Apple', name: 'MacBook Pro 16 M3 Max', price: 92900000, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8', tier: 'Cao cấp', specs: {'Chip': 'M3 Max', 'RAM': '36GB'} }
    ],
    cpu: [
        { brand: 'Intel', name: 'Core i3-12100F', price: 2150000, img: 'https://images.unsplash.com/photo-1555617766-c94804975da3', tier: 'Giá rẻ' },
        { brand: 'AMD', name: 'Ryzen 5 7600X', price: 6200000, img: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', tier: 'Tầm trung' },
        { brand: 'Intel', name: 'Core i9-14900KS', price: 18990000, img: 'https://images.unsplash.com/photo-1610484790073-4ca594e50eb1', tier: 'Cao cấp' }
    ],
    gpu: [
        { brand: 'NVIDIA', name: 'GeForce GTX 1650', price: 3450000, img: 'https://images.unsplash.com/photo-1624701928517-44c8ac49d93c', tier: 'Giá rẻ' },
        { brand: 'NVIDIA', name: 'GeForce RTX 4060 Ti', price: 11990000, img: 'https://images.unsplash.com/photo-1591488320449-011701bb6704', tier: 'Tầm trung' },
        { brand: 'NVIDIA', name: 'GeForce RTX 4090 OC', price: 64500000, img: 'https://images.unsplash.com/photo-1555616635-640973b06412', tier: 'Cao cấp' }
    ],
    motherboard: [
        { brand: 'ASRock', name: 'H610M-HDV', price: 1750000, img: 'https://images.unsplash.com/photo-1518770660439-4636190af475', tier: 'Giá rẻ' },
        { brand: 'MSI', name: 'B760M MORTAR', price: 4200000, img: 'https://images.unsplash.com/photo-1518770660439-4636190af475', tier: 'Tầm trung' },
        { brand: 'ASUS', name: 'ROG MAXIMUS Z790', price: 19500000, img: 'https://images.unsplash.com/photo-1518770660439-4636190af475', tier: 'Cao cấp' }
    ],
    monitor: [
        { brand: 'Samsung', name: 'LS24R350', price: 2850000, img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf', tier: 'Giá rẻ' },
        { brand: 'LG', name: '27UP850-W 4K', price: 9500000, img: 'https://images.unsplash.com/photo-1547119957-637f8679db1e', tier: 'Tầm trung' },
        { brand: 'ASUS', name: 'ROG Swift PG32UCDM OLED', price: 38500000, img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf', tier: 'Cao cấp' }
    ],
    keyboard: [
        { brand: 'Dareu', name: 'EK87 v2', price: 490000, img: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae', tier: 'Giá rẻ' },
        { brand: 'Akko', name: '5075B Plus', price: 1950000, img: 'https://images.unsplash.com/photo-1595225476474-87563907a212', tier: 'Tầm trung' },
        { brand: 'Razer', name: 'Huntsman V3 Pro', price: 6200000, img: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae', tier: 'Cao cấp' }
    ]
};

const extraCategories = ['psu', 'case', 'cooling', 'mouse', 'headset', 'storage'];
const extraTemplates = {
    psu: { low: 700000, mid: 2500000, high: 8500000, img: 'https://images.unsplash.com/photo-1587202372690-0708f3702580' },
    case: { low: 600000, mid: 2200000, high: 5500000, img: 'https://images.unsplash.com/photo-1547082299-de196ea013d6' },
    cooling: { low: 200000, mid: 1500000, high: 7500000, img: 'https://images.unsplash.com/photo-1518770660439-4636190af475' },
    mouse: { low: 150000, mid: 1200000, high: 3900000, img: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7' },
    headset: { low: 300000, mid: 2100000, high: 9500000, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e' },
    storage: { low: 800000, mid: 2800000, high: 12500000, img: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2' }
};

const seedDiversity300 = async () => {
    try {
        await connectDB();
        console.log('🧹 Dọn dẹp Database...');
        await Product.deleteMany({});

        const allCats = [...Object.keys(marketData), ...extraCategories];
        const finalProducts = [];

        for (let i = 1; i <= 300; i++) {
            const cat = allCats[i % allCats.length];
            let template;
            let price;
            let tier;
            let img;
            let brand;
            let name;

            if (marketData[cat]) {
                const subTemplate = marketData[cat][i % 3];
                brand = subTemplate.brand;
                name = subTemplate.name;
                price = subTemplate.price;
                tier = subTemplate.tier;
                img = subTemplate.img;
            } else {
                const extra = extraTemplates[cat];
                const tiers = ['Giá rẻ', 'Tầm trung', 'Cao cấp'];
                const tierIdx = i % 3;
                tier = tiers[tierIdx];
                brand = ['Corsair', 'Logitech', 'Samsung', 'HyperX', 'NZXT'][i % 5];
                name = `${brand} ${cat.toUpperCase()} ${tier} Edition`;
                price = tierIdx === 0 ? extra.low : tierIdx === 1 ? extra.mid : extra.high;
                img = extra.img;
            }

            // Tạo dải giá rộng bằng cách nhân với (1 + biến số)
            // Thay vì random 2%, dùng random lớn hơn (ví dụ 15%) để tạo ra sự khác biệt rõ rệt từng phiên bản
            const spread = (Math.random() * 0.3) - 0.15; // Phân tán giá lên tới 15%
            const finalPrice = Math.floor((price * (1 + spread)) / 10000) * 10000;
            const salePrice = (i % 5 === 0) ? Math.floor(finalPrice * 0.8) : null;

            finalProducts.push({
                name: `${name} - Model TS${i}`,
                brand: brand,
                category: cat,
                price: finalPrice,
                salePrice: salePrice,
                thumbnail: img + `?sig=${i}`,
                specifications: { 
                    'Phân khúc': tier,
                    'Mã SP': `VIP-${i}`,
                    'Hiệu năng': tier === 'Cao cấp' ? 'Cực đỉnh' : tier === 'Tầm trung' ? 'Mạnh mẽ' : 'Ổn định'
                },
                description: `Sản phẩm ${name} mang lại sự lựa chọn hoàn hảo trong tầm giá ${tier}. \n\nĐây là phiên bản được tối ưu hóa cho AI Search để lọc chính xác theo yêu cầu người dùng.`,
                shortDescription: `Danh mục ${cat} phân khúc ${tier}.`,
                stock: Math.floor(Math.random() * 30) + 5,
                isActive: true,
                isFeatured: (tier === 'Cao cấp'),
                isNewArrival: (i % 8 === 0)
            });
        }

        console.log('🚀 Đang nạp 300 sản phẩm ĐA DẠNG GIÁ TRỊ (Rải đều từ Rẻ đến Siêu Sang)...');
        for (let j = 0; j < finalProducts.length; j++) {
            await Product.create(finalProducts[j]);
            if ((j + 1) % 50 === 0) console.log(`   ✅ Đã nạp ${j + 1}/300 sản phẩm đa dạng...`);
        }

        console.log('\n💎 XONG! Bây giờ dải giá đã rất rộng (từ vài trăm ngàn đến gần trăm triệu), AI sẽ lọc chuẩn 100%.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
};

seedDiversity300();
