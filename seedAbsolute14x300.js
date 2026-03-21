
require('dotenv').config();
const connectDB = require('./db');
const Product = require('./models/Product');

/** 
 * DANH SÁCH 14 DANH MỤC CHUẨN (Category Enum)
 * laptop, pc, cpu, gpu, ram, storage, motherboard, psu, case, cooling, monitor, keyboard, mouse, headset 
 */

const marketData = {
    laptop: [
        { brand: 'Acer', name: 'Aspire 3 A315', price: 9500000, img: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef' },
        { brand: 'Apple', name: 'MacBook Pro 16 M3 Max', price: 89900000, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8' }
    ],
    pc: [
        { brand: 'TechStore', name: 'PC Gaming Ultra G1', price: 15500000, img: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7' },
        { brand: 'TechStore', name: 'Workstation X-Pro', price: 45000000, img: 'https://images.unsplash.com/photo-1547082299-de196ea013d6' }
    ],
    cpu: [
        { brand: 'Intel', name: 'Core i3-12100F', price: 2100000, img: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea' },
        { brand: 'Intel', name: 'Core i9-14900KS', price: 18500000, img: 'https://images.unsplash.com/photo-1610484790073-4ca594e50eb1' }
    ],
    gpu: [
        { brand: 'NVIDIA', name: 'GTX 1650', price: 3500000, img: 'https://images.unsplash.com/photo-1591488320449-011701bb6704' },
        { brand: 'NVIDIA', name: 'RTX 4090 ROG Strix', price: 62000000, img: 'https://images.unsplash.com/photo-1555616635-640973b06412' }
    ],
    ram: [
        { brand: 'Kingston', name: 'ValueRAM 8GB', price: 450000, img: 'https://images.unsplash.com/photo-1562976540-1502c2145186' },
        { brand: 'G.Skill', name: 'Trident Z5 RGB 64GB', price: 6500000, img: 'https://images.unsplash.com/photo-1562976540-1502c2145186' }
    ],
    storage: [
        { brand: 'WD', name: 'Blue 1TB HDD', price: 950000, img: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2' },
        { brand: 'Samsung', name: '990 Pro 2TB NVMe', price: 5200000, img: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2' }
    ],
    motherboard: [
        { brand: 'ASRock', name: 'H610M-HDV', price: 1800000, img: 'https://images.unsplash.com/photo-1518770660439-4636190af475' },
        { brand: 'ASUS', name: 'ROG MAXIMUS Z790 HERO', price: 18900000, img: 'https://images.unsplash.com/photo-1518770660439-4636190af475' }
    ],
    psu: [
        { brand: 'Xigmatek', name: 'X-Power III 500', price: 650000, img: 'https://images.unsplash.com/photo-1587202372690-0708f3702580' },
        { brand: 'ASUS', name: 'ROG Thor 1200W Platinum', price: 9500000, img: 'https://images.unsplash.com/photo-1587202372690-0708f3702580' }
    ],
    case: [
        { brand: 'Xigmatek', name: 'Gaming X', price: 550000, img: 'https://images.unsplash.com/photo-1547082299-de196ea013d6' },
        { brand: 'Lian Li', name: 'O11 Dynamic EVO', price: 4800000, img: 'https://images.unsplash.com/photo-1547082299-de196ea013d6' }
    ],
    cooling: [
        { brand: 'Deepcool', name: 'ICE EDGE FS V2', price: 150000, img: 'https://images.unsplash.com/photo-1518770660439-4636190af475' },
        { brand: 'NZXT', name: 'Kraken Elite 360 RGB', price: 7900000, img: 'https://images.unsplash.com/photo-1518770660439-4636190af475' }
    ],
    monitor: [
        { brand: 'Samsung', name: 'LS24R350', price: 2850000, img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf' },
        { brand: 'ASUS', name: 'ROG Swift OLED PG32UCDM', price: 38500000, img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf' }
    ],
    keyboard: [
        { brand: 'Dareu', name: 'EK87', price: 450000, img: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae' },
        { brand: 'Corsair', name: 'K100 RGB', price: 5500000, img: 'https://images.unsplash.com/photo-1595225476474-87563907a212' }
    ],
    mouse: [
        { brand: 'Fuhlen', name: 'L102', price: 120000, img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46' },
        { brand: 'Razer', name: 'Viper V3 Pro', price: 3800000, img: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7' }
    ],
    headset: [
        { brand: 'Zidli', name: 'ZH7', price: 250000, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e' },
        { brand: 'SteelSeries', name: 'Arctis Nova Pro', price: 8900000, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e' }
    ]
};

const seedAbsolute14x300 = async () => {
    try {
        await connectDB();
        console.log('🧹 Dọn dẹp Database cho chiến dịch nạp 14 DANH MỤC THẬT...');
        await Product.deleteMany({});

        const cats = Object.keys(marketData);
        const productsPerCat = Math.ceil(300 / cats.length); // Khoảng 21-22 sp mỗi mục
        const finalProducts = [];

        cats.forEach((cat) => {
            const templates = marketData[cat];
            for (let i = 1; i <= productsPerCat; i++) {
                // Phân bổ mẫu: 0 -> Low, 1 -> High, còn lại -> Random Mid
                const t = (i === 1) ? templates[0] : (i === 2) ? templates[1] : templates[Math.floor(Math.random() * templates.length)];
                
                // Tạo dải giá rộng từ Budget đến Enthusiast
                const multiplier = (i === 1) ? 0.9 : (i === 2) ? 1.0 : (Math.random() * 5 + 0.5); 
                let price = Math.floor((t.price * multiplier) / 10000) * 10000;
                
                // Giới hạn giá laptop/pc để ko bị ảo quá mức
                if (cat === 'laptop' || cat === 'pc') price = Math.max(9000000, Math.min(price, 120000000));
                if (cat === 'mouse' || cat === 'keyboard') price = Math.max(120000, Math.min(price, 12000000));

                finalProducts.push({
                    name: `${t.brand} ${t.name.split(' ')[0]} ${cat.toUpperCase()} Elite-X${i}`,
                    brand: t.brand,
                    category: cat,
                    price: price,
                    salePrice: (i % 5 === 0) ? Math.floor(price * 0.85) : null,
                    thumbnail: t.img + `?sig=${cat}${i}`,
                    specifications: { 'Phiên bản': `V${i}.0`, 'Bảo hành': '36 tháng', 'Mã kho': `WH-${cat.slice(0,2)}-${i}` },
                    description: `Sản phẩm ${cat} từ ${t.brand} cao cấp. Cam kết giá tốt nhất thị trường và hỗ trợ kỹ thuật trọn đời.`,
                    shortDescription: `Danh mục ${cat} chính hãng.`,
                    stock: Math.floor(Math.random() * 100) + 1,
                    isActive: true,
                    isFeatured: (price > 40000000),
                    isNewArrival: (i === 1)
                });
            }
        });

        // Cắt bớt nếu thừa 300
        const final300 = finalProducts.slice(0, 300);

        console.log(`🚀 Đang nạp ${final300.length} sản phẩm chia đều cho 14 DANH MỤC...`);
        for (let j = 0; j < final300.length; j++) {
            await Product.create(final300[j]);
            if ((j + 1) % 50 === 0) console.log(`   ✅ Đã nạp ${j + 1} sản phẩm...`);
        }

        console.log('\n💎 HOÀN THÀNH CHUẨN 100%! 14 danh mục đều đã có sản phẩm với dải giá cực rộng.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
};

seedAbsolute14x300();
