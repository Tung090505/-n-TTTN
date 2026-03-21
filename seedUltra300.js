
require('dotenv').config();
const connectDB = require('./db');
const Product = require('./models/Product');

const realThumbnails = {
    laptop: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop', // MacBook
        'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=600&auto=format&fit=crop', // Gaming Laptop
        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=600&auto=format&fit=crop', // Dell XPS
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=600&auto=format&fit=crop', // Silver Laptop
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=600&auto=format&fit=crop'  // Laptop on Desk
    ],
    cpu: [
        'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=600&auto=format&fit=crop', // CPU Chip
        'https://images.unsplash.com/photo-1555617766-c94804975da3?q=80&w=600&auto=format&fit=crop', // Processor
        'https://images.unsplash.com/photo-1610484790073-4ca594e50eb1?q=80&w=600&auto=format&fit=crop'  // CPU Close-up
    ],
    gpu: [
        'https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=600&auto=format&fit=crop', // Graphics Card
        'https://images.unsplash.com/photo-1555616635-640973b06412?q=80&w=600&auto=format&fit=crop', // GPU Side
        'https://images.unsplash.com/photo-1624701928517-44c8ac49d93c?q=80&w=600&auto=format&fit=crop'  // RTX Card
    ],
    ram: [
        'https://images.unsplash.com/photo-1562976540-1502c2145186?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1541029071515-84cc53f32c3f?q=80&w=600&auto=format&fit=crop'
    ],
    storage: [
        'https://images.unsplash.com/photo-1544652478-6653e09f18a2?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1531492746076-1a1bd9c25277?q=80&w=600&auto=format&fit=crop'
    ],
    monitor: [
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1547119957-637f8679db1e?q=80&w=600&auto=format&fit=crop'
    ],
    keyboard: [
        'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=600&auto=format&fit=crop'
    ],
    mouse: [
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=600&auto=format&fit=crop'
    ]
};

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
    ]
};

const seedUltra300 = async () => {
    try {
        await connectDB();
        console.log('🧹 Đang dọn dẹp hệ thống...');
        await Product.deleteMany({});

        const cats = Object.keys(realThumbnails);
        const finalProducts = [];

        for (let i = 1; i <= 300; i++) {
            const cat = cats[Math.floor(Math.random() * cats.length)];
            const templates = specsTable[cat] || [
                { brand: 'Generic', name: 'Premium Performance', price: 2500000, specs: { 'Loại': 'Chuyên nghiệp', 'Bảo hành': '36 tháng' }, desc: 'Sản phẩm linh kiện công nghệ cao cấp nhất.' }
            ];
            
            const template = templates[Math.floor(Math.random() * templates.length)];
            const imgPool = realThumbnails[cat] || realThumbnails['laptop'];
            const randomImg = imgPool[Math.floor(Math.random() * imgPool.length)];

            finalProducts.push({
                name: `${template.name} Edition #${i}`,
                brand: template.brand,
                category: cat,
                price: template.price + (Math.floor(Math.random() * 2000) * 1000),
                description: template.desc + ` Phiên bản này được tinh chỉnh riêng biệt (Mã lô: PRD-${i}) cho độ ổn định tối đa dưới tải nặng.`,
                shortDescription: `Linh kiện ${cat} từ ${template.brand} chuyên dụng.`,
                specifications: { ...template.specs, 'Serial': `TS-REAL-${i}`, 'Trạng thái': 'Mới 100%' },
                thumbnail: randomImg,
                stock: Math.floor(Math.random() * 80) + 5,
                isActive: true,
                isFeatured: i <= 25,
                isNewArrival: Math.random() > 0.75
            });
        }

        console.log('🚀 Đang nạp 300 sản phẩm với HÌNH ẢNH THẬT và THÔNG SỐ CHI TIẾT...');
        for (let j = 0; j < finalProducts.length; j++) {
            await Product.create(finalProducts[j]);
            if ((j + 1) % 50 === 0) console.log(`   ✅ Đã nạp ${j + 1}/300 sản phẩm...`);
        }

        console.log('\n🌟 HOÀN TẤT! Hệ thống đã sở hữu 300 sản phẩm cực đẹp và chi tiết.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi nạp liệu:', error);
        process.exit(1);
    }
};

seedUltra300();
