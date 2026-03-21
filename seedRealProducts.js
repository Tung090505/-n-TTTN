
require('dotenv').config();
const connectDB = require('./db');
const Product = require('./models/Product');

const laptopSpecs = [
    {
        brand: 'Apple',
        models: [
            { name: 'MacBook Air M2', price: 27000000, specs: { 'CPU': 'Apple M2 8-core', 'GPU': '8-core GPU', 'RAM': '8GB Unified', 'Ổ cứng': '256GB SSD', 'Màn hình': '13.6 inch Liquid Retina' }, desc: 'MacBook Air với chip M2 cực kỳ mạnh mẽ, thiết kế siêu mỏng nhẹ và thời lượng pin lên đến 18 giờ.' },
            { name: 'MacBook Pro 14 M3', price: 45000000, specs: { 'CPU': 'Apple M3 8-core', 'GPU': '10-core GPU', 'RAM': '16GB Unified', 'Ổ cứng': '512GB SSD', 'Màn hình': '14.2 inch Liquid Retina XDR' }, desc: 'MacBook Pro 14 inch với chip M3 mang lại hiệu năng chuyên nghiệp vượt trội cho các tác vụ đồ họa và lập trình.' }
        ]
    },
    {
        brand: 'ASUS',
        models: [
            { name: 'ROG Zephyrus G14', price: 35000000, specs: { 'CPU': 'AMD Ryzen 9 7940HS', 'GPU': 'RTX 4060 8GB', 'RAM': '16GB DDR5', 'Ổ cứng': '1TB SSD NVMe', 'Màn hình': '14 inch QHD+ 165Hz' }, desc: 'Laptop gaming 14 inch mạnh mẽ nhất thế giới với thiết kế sang trọng và hiệu năng đỉnh cao từ NVIDIA RTX 40 series.' },
            { name: 'Vivobook 15 OLED', price: 15500000, specs: { 'CPU': 'Intel Core i5-12500H', 'GPU': 'Intel Iris Xe', 'RAM': '8GB DDR4', 'Ổ cứng': '512GB SSD', 'Màn hình': '15.6 inch FHD OLED' }, desc: 'Trải nghiệm hình ảnh tuyệt đỉnh với màn hình OLED rực rỡ và hiệu năng ổn định cho văn phòng, học tập.' }
        ]
    },
    {
        brand: 'MSI',
        models: [
            { name: 'MSI Katana 15', price: 22000000, specs: { 'CPU': 'Intel Core i7-13620H', 'GPU': 'RTX 4050 6GB', 'RAM': '16GB DDR5', 'Ổ cứng': '512GB SSD', 'Màn hình': '15.6 inch FHD 144Hz' }, desc: 'Thanh kiếm Katana mạnh mẽ giúp bạn làm chủ mọi đấu trường game với cấu hình tối tân nhất.' }
        ]
    },
    {
        brand: 'Dell',
        models: [
            { name: 'XPS 13 9315', price: 32000000, specs: { 'CPU': 'Intel Core i5-1230U', 'GPU': 'Intel Iris Xe', 'RAM': '16GB LPDDR5', 'Ổ cứng': '512GB SSD', 'Màn hình': '13.4 inch FHD+ Touch' }, desc: 'Biểu tượng của sự sang trọng và tính di động cao, XPS 13 là lựa chọn hàng đầu cho doanh nhân.' }
        ]
    }
];

const cpuSpecs = [
    { brand: 'Intel', models: [
        { name: 'Core i9-14900K', price: 15000000, specs: { 'Số nhân/luồng': '24 nhân / 32 luồng', 'Xung nhịp': 'Lên đến 6.0 GHz', 'Socket': 'LGA 1700', 'TDP': '125W' }, desc: 'Vị vua hiệu năng mới từ Intel, chuyên trị các tác vụ render nặng và chơi game đỉnh cao.' },
        { name: 'Core i5-13400F', price: 52000000, specs: { 'Số nhân/luồng': '10 nhân / 16 luồng', 'Xung nhịp': 'Lên đến 4.6 GHz', 'Socket': 'LGA 1700', 'Ghi chú': 'Không tích hợp đồ họa' }, desc: 'CPU gaming quốc dân với hiệu năng trên giá thành cực tốt.' }
    ]},
    { brand: 'AMD', models: [
        { name: 'Ryzen 7 7800X3D', price: 11000000, specs: { 'Số nhân/luồng': '8 nhân / 16 luồng', 'Xung nhịp': 'Lên đến 5.0 GHz', 'Cache': '96MB L3 V-Cache', 'Socket': 'AM5' }, desc: 'CPU chơi game tốt nhất thế giới hiện nay nhờ công nghệ 3D V-Cache độc quyền.' }
    ]}
];

const gpuSpecs = [
    { brand: 'NVIDIA', models: [
        { name: 'GeForce RTX 4090', price: 55000000, specs: { 'VRAM': '24GB GDDR6X', 'Nhân CUDA': '16384', 'TDP': '450W', 'Nguồn đề xuất': '850W+' }, desc: 'Đỉnh cao đồ họa thế giới, hỗ trợ Ray Tracing và DLSS 3.0 cho trải nghiệm 4K mượt mà.' },
        { name: 'GeForce RTX 4060 Ti', price: 12000000, specs: { 'VRAM': '8GB GDDR6', 'Nhân CUDA': '4352', 'TDP': '160W' }, desc: 'Lựa chọn tuyệt vời cho chơi game ở độ phân giải 1080p và 1440p settings cao.' }
    ]}
];

const seedRealProducts = async () => {
    try {
        await connectDB();
        console.log('🧹 Đang làm sạch database sản phẩm cũ...');
        await Product.deleteMany({});

        const allSeedData = [];

        // Laptops
        laptopSpecs.forEach(b => {
            b.models.forEach(m => {
                allSeedData.push({
                    name: m.name,
                    brand: b.brand,
                    category: 'laptop',
                    price: m.price,
                    description: m.desc,
                    shortDescription: `Laptop ${m.name} cao cấp từ ${b.brand}.`,
                    specifications: m.specs,
                    thumbnail: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=500&auto=format&fit=crop',
                    stock: 50,
                    isActive: true,
                    isFeatured: true
                });
            });
        });

        // CPUs
        cpuSpecs.forEach(b => {
            b.models.forEach(m => {
                allSeedData.push({
                    name: `${b.brand} ${m.name}`,
                    brand: b.brand,
                    category: 'cpu',
                    price: m.price,
                    description: m.desc,
                    shortDescription: `Vi xử lý ${m.name} mạnh mẽ.`,
                    specifications: m.specs,
                    thumbnail: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=500&auto=format&fit=crop',
                    stock: 100,
                    isActive: true
                });
            });
        });

        // GPUs
        gpuSpecs.forEach(b => {
            b.models.forEach(m => {
                allSeedData.push({
                    name: `${b.brand} ${m.name}`,
                    brand: b.brand,
                    category: 'gpu',
                    price: m.price,
                    description: m.desc,
                    shortDescription: `Card đồ họa ${m.name} hiệu năng cao.`,
                    specifications: m.specs,
                    thumbnail: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=500&auto=format&fit=crop',
                    stock: 30,
                    isActive: true
                });
            });
        });

        console.log(`🚀 Đang nạp ${allSeedData.length} sản phẩm thực tế...`);
        for (const p of allSeedData) {
            await Product.create(p);
        }

        console.log('✅ Hoàn tất nạp dữ liệu thật!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
};

seedRealProducts();
