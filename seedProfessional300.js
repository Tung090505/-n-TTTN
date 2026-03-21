
require('dotenv').config();
const connectDB = require('./db');
const Product = require('./models/Product');

const marketInventory = [
    // --- LAPTOPS (Dải giá từ 9tr đến 90tr) ---
    { name: 'Laptop Acer Aspire 3 A315 i3-1215U', brand: 'Acer', category: 'laptop', price: 9990000, salePrice: 8990000, thumb: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef', specs: {'CPU': 'Intel i3-1215U', 'RAM': '8GB', 'SSD': '256GB'} },
    { name: 'Laptop ASUS Vivobook 15 X1504 i5-1335U', brand: 'ASUS', category: 'laptop', price: 16500000, salePrice: 14990000, thumb: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed', specs: {'CPU': 'Intel i5-1335U', 'RAM': '16GB', 'SSD': '512GB'} },
    { name: 'Laptop Gaming MSI Katana 15 B13VFK RTX 4060', brand: 'MSI', category: 'laptop', price: 29990000, salePrice: 27500000, thumb: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2', specs: {'CPU': 'i7-13620H', 'GPU': 'RTX 4060', 'RAM': '16GB'} },
    { name: 'Laptop Gaming ASUS ROG Zephyrus G16 (2024)', brand: 'ASUS', category: 'laptop', price: 54990000, salePrice: 48990000, thumb: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2', specs: {'CPU': 'Core Ultra 9', 'GPU': 'RTX 4070', 'RAM': '32GB'} },
    { name: 'Apple MacBook Pro 16 inch M3 Max (2024)', brand: 'Apple', category: 'laptop', price: 92900000, salePrice: 89900000, thumb: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8', specs: {'Chip': 'M3 Max', 'RAM': '36GB', 'SSD': '1TB'} },

    // --- GPU (Card đồ họa - Đang thiếu ảnh & Giá lệch) ---
    { name: 'VGA ASUS Dual GeForce RTX 3050 6GB', brand: 'ASUS', category: 'gpu', price: 5200000, salePrice: 4850000, thumb: 'https://images.unsplash.com/photo-1591488320449-011701bb6704', specs: {'VRAM': '6GB GDDR6', 'Giao tiếp': 'PCIe 4.0'} },
    { name: 'VGA MSI GeForce RTX 4060 Ti VENTUS 2X', brand: 'MSI', category: 'gpu', price: 11990000, salePrice: 10890000, thumb: 'https://images.unsplash.com/photo-1591488320449-011701bb6704', specs: {'VRAM': '8GB GDDR6', 'Nhân CUDA': '4352'} },
    { name: 'VGA ASUS ROG Strix GeForce RTX 4080 SUPER', brand: 'ASUS', category: 'gpu', price: 34990000, salePrice: 32500000, thumb: 'https://images.unsplash.com/photo-1555616635-640973b06412', specs: {'VRAM': '16GB GDDR6X', 'Xung nhịp': '2670 MHz'} },
    { name: 'VGA MSI GeForce RTX 4090 SUPRIM X 24G', brand: 'MSI', category: 'gpu', price: 62500000, salePrice: 59900000, thumb: 'https://images.unsplash.com/photo-1624701928517-44c8ac49d93c', specs: {'VRAM': '24GB GDDR6X', 'Cố định': '450W'} },

    // --- CPU ---
    { name: 'CPU Intel Core i3-12100F', brand: 'Intel', category: 'cpu', price: 2150000, salePrice: 1990000, thumb: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', specs: {'Nhân/Luồng': '4/8', 'Socket': 'LGA 1700'} },
    { name: 'CPU AMD Ryzen 5 7600', brand: 'AMD', category: 'cpu', price: 5800000, salePrice: 5450000, thumb: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', specs: {'Nhân/Luồng': '6/12', 'Socket': 'AM5'} },
    { name: 'CPU Intel Core i9-14900K', brand: 'Intel', category: 'cpu', price: 15490000, salePrice: 14500000, thumb: 'https://images.unsplash.com/photo-1610484790073-4ca594e50eb1', specs: {'Nhân/Luồng': '24/32', 'Xung nhịp': '6.0 GHz'} },

    // --- MOTHERBOARD (Bo mạch chủ) ---
    { name: 'Mainboard MSI H610M-E DDR4', brand: 'MSI', category: 'motherboard', price: 1850000, salePrice: null, thumb: 'https://images.unsplash.com/photo-1518770660439-4636190af475', specs: {'Chipset': 'H610', 'Socket': 'LGA 1700'} },
    { name: 'Mainboard ASUS TUF GAMING B760-PLUS WIFI', brand: 'ASUS', category: 'motherboard', price: 4950000, salePrice: 4650000, thumb: 'https://images.unsplash.com/photo-1563720223185-11003d516935', specs: {'Chipset': 'B760', 'Chuẩn': 'ATX'} },
    { name: 'Mainboard ASUS ROG MAXIMUS Z790 HERO', brand: 'ASUS', category: 'motherboard', price: 18990000, salePrice: null, thumb: 'https://images.unsplash.com/photo-1518770660439-4636190af475', specs: {'Chipset': 'Z790', 'Tính năng': 'Overclock'} },

    // --- PSU (Nguồn) ---
    { name: 'Nguồn Xigmatek X-POWER III 550', brand: 'Xigmatek', category: 'psu', price: 750000, salePrice: 690000, thumb: 'https://images.unsplash.com/photo-1587202372690-0708f3702580', specs: {'Công suất': '500W', 'Hiệu suất': '80 Plus'} },
    { name: 'Nguồn Corsair RM850e 850W 80 Plus Gold', brand: 'Corsair', category: 'psu', price: 3250000, salePrice: 2950000, thumb: 'https://images.unsplash.com/photo-1587202372690-0708f3702580', specs: {'Công suất': '850W', 'Loại': 'Full Modular'} },

    // --- CASE (Vỏ máy) ---
    { name: 'Vỏ máy tính Xigmatek Gaming X 3FX', brand: 'Xigmatek', category: 'case', price: 650000, salePrice: null, thumb: 'https://images.unsplash.com/photo-1547082299-de196ea013d6', specs: {'Kích thước': 'Mid Tower', 'Fan': '3x RGB'} },
    { name: 'Vỏ máy tính NZXT H9 Elite Black', brand: 'NZXT', category: 'case', price: 6500000, salePrice: null, thumb: 'https://images.unsplash.com/photo-1547082299-de196ea013d6', specs: {'Loại': 'Dual Chamber', 'Mặt kính': '3 mặt cường lực'} },

    // --- MOUSE, KEYBOARD, HEADSET ---
    { name: 'Chuột Logitech G102 Gen2 Lightsync', brand: 'Logitech', category: 'mouse', price: 450000, salePrice: 380000, thumb: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46', specs: {'DPI': '8000', 'Loại': 'Wired'} },
    { name: 'Chuột Razer Viper V3 Pro', brand: 'Razer', category: 'mouse', price: 3990000, salePrice: null, thumb: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7', specs: {'Trọng lượng': '54g', 'Loại': 'Wireless'} },
    { name: 'Bàn phím Akko 3068B Plus Multi-mode', brand: 'Akko', category: 'keyboard', price: 1850000, salePrice: 1550000, thumb: 'https://images.unsplash.com/photo-1595225476474-87563907a212', specs: {'Switch': 'Akko Jelly Purpler', 'Keycap': 'PBT Double-shot'} },
    { name: 'Tai nghe HyperX Cloud II Red', brand: 'HyperX', category: 'headset', price: 1950000, salePrice: 1750000, thumb: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e', specs: {'Kiểu': 'Over-ear', 'Âm thanh': '7.1 Surround'} }
];

const seedProfessional300 = async () => {
    try {
        await connectDB();
        console.log('🧹 Dọn dẹp Database để nạp hệ thống "Thật 100%"...');
        await Product.deleteMany({});

        const finalProducts = [];

        for (let i = 1; i <= 300; i++) {
            const template = marketInventory[i % marketInventory.length];
            
            // Biến thiên giá cực nhỏ (1%) để tạo số hiệu Seri khác nhau nhưng vẫn giữ đúng khung giá thị trường
            const price = Math.floor(template.price * (1 + (Math.random() * 0.02 - 0.01)));
            const salePrice = template.salePrice ? Math.floor(template.salePrice * (1 + (Math.random() * 0.02 - 0.01))) : null;

            finalProducts.push({
                name: `${template.name} - Seri ${i + 1000}`,
                brand: template.brand,
                category: template.category,
                price: price,
                salePrice: salePrice,
                thumbnail: template.thumb + `?sig=${i}`, // Sig giúp Unsplash ko cache trùng ảnh nhưng vẫn cùng chủ đề
                specifications: { ...template.specs, 'Mã vạch': `TS-${i}`, 'Bảo hành': '36 tháng chính hãng' },
                description: `${template.name} là sản phẩm hàng đầu trong phân khúc. Cam kết chất lượng từ ${template.brand}. Giao hàng 2H.`,
                shortDescription: `Sản phẩm ${template.category} chính hãng từ ${template.brand}.`,
                stock: Math.floor(Math.random() * 40) + 5,
                isActive: true,
                isFeatured: (price > 30000000),
                isNewArrival: (i % 12 === 0)
            });
        }

        console.log('🚀 Đang nạp 300 sản phẩm với:');
        console.log('   - Giá chuẩn 100% thị trường (Acer Pro, MacBook, RTX 4090, v.v.)');
        console.log('   - Ảnh Card đồ họa chuẩn VGA, Nguồn chuẩn PSU, Laptop chuẩn Laptop');
        console.log('   - Đầy đủ các danh mục linh kiện ngoại vi');
        
        for (let j = 0; j < finalProducts.length; j++) {
            await Product.create(finalProducts[j]);
            if ((j + 1) % 50 === 0) console.log(`   ✅ Đã xử lý ${j + 1}/300 sản phẩm...`);
        }

        console.log('\n💎 CHÚC MỪNG! Website hiện đã có 300 sản phẩm chuẩn như một cửa hàng thực thụ.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
};

seedProfessional300();
