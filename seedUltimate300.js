
require('dotenv').config();
const connectDB = require('./db');
const Product = require('./models/Product');

const marketData = {
    laptop: [
        { brand: 'Acer', name: 'Aspire 3', price: 9500000, img: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef', tier: 'Low' },
        { brand: 'HP', name: 'Pavilion 15', price: 15900000, img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed', tier: 'Mid' },
        { brand: 'Apple', name: 'MacBook Pro 16 M3 Max', price: 89900000, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8', tier: 'High' }
    ],
    cpu: [
        { brand: 'Intel', name: 'Core i3-12100F', price: 2100000, img: 'https://images.unsplash.com/photo-1555617766-c94804975da3', tier: 'Low' },
        { brand: 'AMD', name: 'Ryzen 5 7600', price: 5500000, img: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', tier: 'Mid' },
        { brand: 'Intel', name: 'Core i9-14900KS', price: 18500000, img: 'https://images.unsplash.com/photo-1610484790073-4ca594e50eb1', tier: 'High' }
    ],
    gpu: [
        { brand: 'NVIDIA', name: 'GTX 1650', price: 3500000, img: 'https://images.unsplash.com/photo-1624701928517-44c8ac49d93c', tier: 'Low' },
        { brand: 'NVIDIA', name: 'RTX 4060 Ti', price: 11500000, img: 'https://images.unsplash.com/photo-1591488320449-011701bb6704', tier: 'Mid' },
        { brand: 'NVIDIA', name: 'RTX 4090 ROG Strix', price: 62000000, img: 'https://images.unsplash.com/photo-1555616635-640973b06412', tier: 'High' }
    ],
    motherboard: [
        { brand: 'ASRock', name: 'H610M-HDV', price: 1800000, img: 'https://images.unsplash.com/photo-1518770660439-4636190af475', tier: 'Low' },
        { brand: 'MSI', name: 'MAG B760 TOMAHAWK', price: 4900000, img: 'https://images.unsplash.com/photo-1518770660439-4636190af475', tier: 'Mid' },
        { brand: 'ASUS', name: 'ROG MAXIMUS Z790 HERO', price: 18900000, img: 'https://images.unsplash.com/photo-1518770660439-4636190af475', tier: 'High' }
    ],
    psu: [
        { brand: 'Xigmatek', name: 'X-Power III 500', price: 650000, img: 'https://images.unsplash.com/photo-1587202372690-0708f3702580', tier: 'Low' },
        { brand: 'Corsair', name: 'RM850e Gold', price: 3200000, img: 'https://images.unsplash.com/photo-1587202372690-0708f3702580', tier: 'Mid' },
        { brand: 'ASUS', name: 'ROG Thor 1200W Platinum II', price: 9500000, img: 'https://images.unsplash.com/photo-1587202372690-0708f3702580', tier: 'High' }
    ],
    case: [
        { brand: 'Xigmatek', name: 'Gaming X', price: 550000, img: 'https://images.unsplash.com/photo-1547082299-de196ea013d6', tier: 'Low' },
        { brand: 'NZXT', name: 'H5 Flow', price: 2300000, img: 'https://images.unsplash.com/photo-1547082299-de196ea013d6', tier: 'Mid' },
        { brand: 'Lian Li', name: 'O11 Dynamic EVO', price: 4800000, img: 'https://images.unsplash.com/photo-1547082299-de196ea013d6', tier: 'High' }
    ],
    cooling: [
        { brand: 'Deepcool', name: 'ICE EDGE MINI FS V2', price: 150000, img: 'https://images.unsplash.com/photo-1518770660439-4636190af475', tier: 'Low' },
        { brand: 'Cooler Master', name: 'Hyper 212 Spectrum', price: 450000, img: 'https://images.unsplash.com/photo-1518770660439-4636190af475', tier: 'Mid' },
        { brand: 'NZXT', name: 'Kraken Elite 360 RGB', price: 7900000, img: 'https://images.unsplash.com/photo-1518770660439-4636190af475', tier: 'High' }
    ],
    keyboard: [
        { brand: 'Dareu', name: 'EK87', price: 450000, img: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae', tier: 'Low' },
        { brand: 'Akko', name: '3068B Plus', price: 1650000, img: 'https://images.unsplash.com/photo-1595225476474-87563907a212', tier: 'Mid' },
        { brand: 'Corsair', name: 'K100 RGB', price: 5500000, img: 'https://images.unsplash.com/photo-1595225476474-87563907a212', tier: 'High' }
    ],
    mouse: [
        { brand: 'Fuhlen', name: 'L102', price: 120000, img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46', tier: 'Low' },
        { brand: 'Logitech', name: 'G502 Hero', price: 950000, img: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7', tier: 'Mid' },
        { brand: 'Razer', name: 'Viper V3 Pro', price: 3800000, img: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7', tier: 'High' }
    ],
    headset: [
        { brand: 'Zidli', name: 'ZH7', price: 250000, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e', tier: 'Low' },
        { brand: 'HyperX', name: 'Cloud II', price: 1850000, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e', tier: 'Mid' },
        { brand: 'SteelSeries', name: 'Arctis Nova Pro Wireless', price: 8900000, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e', tier: 'High' }
    ],
    ram: [
        { brand: 'Kingston', name: 'ValueRAM 8GB', price: 450000, img: 'https://images.unsplash.com/photo-1562976540-1502c2145186', tier: 'Low' },
        { brand: 'Corsair', name: 'Vengeance RGB 16GB', price: 1450000, img: 'https://images.unsplash.com/photo-1562976540-1502c2145186', tier: 'Mid' },
        { brand: 'G.Skill', name: 'Trident Z5 RGB 64GB', price: 6500000, img: 'https://images.unsplash.com/photo-1562976540-1502c2145186', tier: 'High' }
    ],
    storage: [
        { brand: 'Western Digital', name: 'Blue 1TB HDD', price: 950000, img: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2', tier: 'Low' },
        { brand: 'Samsung', name: '980 NVMe 500GB', price: 1350000, img: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2', tier: 'Mid' },
        { brand: 'Crucial', name: 'T705 Gen5 2TB', price: 9800000, img: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2', tier: 'High' }
    ]
};

const seedUltimate300 = async () => {
    try {
        await connectDB();
        console.log('🧹 Xóa dữ liệu cũ, chuẩn bị hệ thống dữ liệu "Vàng"...');
        await Product.deleteMany({});

        const categories = Object.keys(marketData);
        const finalProducts = [];

        for (let i = 1; i <= 300; i++) {
            const cat = categories[i % categories.length];
            const templates = marketData[cat];
            
            // Lấy mẫu theo tỷ lệ (33% Low, 33% Mid, 33% High)
            const template = templates[i % templates.length];
            
            // Thêm biến động giá nhỏ (+/- 2%) cho từng item cụ thể
            const price = Math.floor(template.price * (1 + (Math.random() * 0.04 - 0.02)));
            const salePrice = (i % 7 === 0) ? Math.floor(price * 0.85) : null;

            finalProducts.push({
                name: `${template.brand} ${template.name} - ${template.tier} Series No.${i}`,
                brand: template.brand,
                category: cat,
                price: price,
                salePrice: salePrice,
                thumbnail: template.img + `?sig=${i}`, // Sig để ảnh vẫn khác nhau một chút nhưng cùng loại
                specifications: { 
                    'Phân khúc': template.tier,
                    'Thương hiệu': template.brand,
                    'Bảo hành': '36 tháng',
                    'Mã lô': `BATCH-${cat.toUpperCase()}-${i}`
                },
                description: `Đây là dòng sản phẩm ${template.name} thuộc phân khúc ${template.tier}. \nCung cấp hiệu năng tối ưu cho người dùng ${template.tier === 'High' ? 'chuyên nghiệp' : template.tier === 'Mid' ? 'văn phòng & gaming' : 'phổ thông'}. Bảo hành chính hãng 1 đổi 1.`,
                shortDescription: `Sản phẩm ${cat} từ ${template.brand} chất lượng cực cao.`,
                stock: Math.floor(Math.random() * 50) + 10,
                isActive: true,
                isFeatured: (template.tier === 'High' && Math.random() > 0.5),
                isNewArrival: (i % 10 === 0)
            });
        }

        console.log('🚀 Đang nạp 300 sản phẩm với:');
        console.log('   - 12 Danh mục linh kiện đầy đủ');
        console.log('   - 3 Phân khúc giá: Thấp (Low), Trung (Mid), Cao (High)');
        console.log('   - Hình ảnh đúng loại thiết bị');
        
        for (let j = 0; j < finalProducts.length; j++) {
            await Product.create(finalProducts[j]);
            if ((j + 1) % 50 === 0) console.log(`   ✅ Đã nạp ${j + 1}/300 sản phẩm...`);
        }

        console.log('\n🏆 HOÀN THÀNH MIỄN CHÊ! 300 sản phẩm chính xác tuyệt đối đã sẵn sàng.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi nạp liệu:', error);
        process.exit(1);
    }
};

seedUltimate300();
