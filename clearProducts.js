
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const connectDB = require('./db');

const namesToRemove = [
    'AMD Ryzen 5 5600X',
    'Intel Core i5-12400F',
    'Intel Core i5-13400F',
    'AMD Ryzen 7 5800X',
    'Intel Core i7-13700K',
    'Intel Core i3-12100F',
    'AMD Ryzen 5 7600',
    'ASUS Dual GeForce RTX 4060 OC 8GB',
    'MSI GeForce RTX 4060 Ti VENTUS 2X 8G OC',
    'Gigabyte GeForce RTX 4070 WINDFORCE OC 12G',
    'MSI GeForce RTX 3060 VENTUS 2X 12G OC',
    'ASUS GeForce GT 1030 2GB',
    'Kingston Fury Beast DDR4 16GB (2x8GB) 3200MHz',
    'Corsair Vengeance DDR5 32GB (2x16GB) 5600MHz',
    'Kingston Fury Beast DDR4 8GB 3200MHz',
    'G.Skill Trident Z5 RGB DDR5 32GB (2x16GB) 6000MHz',
    'Samsung 980 Pro 1TB NVMe M.2 SSD',
    'WD Blue SN580 500GB NVMe M.2 SSD',
    'Kingston NV2 250GB NVMe M.2 SSD',
    'Samsung 990 Pro 2TB NVMe M.2 SSD',
    'Gigabyte B760M DS3H DDR4',
    'MSI PRO B660M-A DDR4',
    'MSI MAG B550 TOMAHAWK',
    'ASUS ROG STRIX B650E-E GAMING WIFI',
    'Gigabyte H610M H DDR4',
    'Corsair CV550 550W 80+ Bronze',
    'Corsair RM650x 650W 80+ Gold Full Modular',
    'Corsair RM850x 850W 80+ Gold Full Modular',
    'Cooler Master MWE 450W 80+ White',
    'EVGA SuperNOVA 750 G6 750W 80+ Gold',
    'NZXT H5 Flow Mid Tower',
    'Corsair 4000D Airflow Mid Tower',
    'Xigmatek NYX 3F Micro ATX',
    'Lian Li LANCOOL III Mid Tower',
    'Deepcool CC360 ARGB Micro ATX'
];

const clearRecentProducts = async () => {
    try {
        await connectDB();
        console.log('🧹 Đang xóa các sản phẩm vừa được thêm bởi script seed...');
        
        const result = await Product.deleteMany({ name: { $in: namesToRemove } });
        
        console.log(`✅ Đã xóa thành công ${result.deletedCount} sản phẩm.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi khi xóa dữ liệu:', error);
        process.exit(1);
    }
};

clearRecentProducts();
