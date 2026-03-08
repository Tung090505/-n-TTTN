/**
 * ============================================
 * utils/seedPCParts.js - SEED DỮ LIỆU LINH KIỆN PC
 * ============================================
 * Chạy: node utils/seedPCParts.js
 * Thêm đầy đủ sản phẩm cho tất cả category
 * để AI Build PC hoạt động chính xác.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../db');

const pcPartProducts = [
    // ============================================
    // CPU - BỘ XỬ LÝ
    // ============================================
    {
        name: 'AMD Ryzen 5 5600X',
        description: 'CPU gaming phổ biến nhất, hiệu năng cao, giá tốt. 6 nhân 12 luồng, xung boost 4.6GHz, TDP 65W.',
        shortDescription: 'CPU 6 nhân 12 luồng, xung boost 4.6GHz, AM4',
        category: 'cpu', brand: 'AMD',
        price: 3290000, stock: 40,
        thumbnail: 'https://m.media-amazon.com/images/I/61IIbwz-+ML._AC_SL1384_.jpg',
        specifications: { cores: 6, threads: 12, baseClock: 3.7, boostClock: 4.6, socket: 'AM4', tdp: 65 },
        isActive: true, rating: 4.8, numReviews: 125, sold: 200,
        warranty: { months: 36, condition: 'Bảo hành chính hãng' }
    },
    {
        name: 'Intel Core i5-12400F',
        description: 'CPU gaming tầm trung xuất sắc với 6 nhân 12 luồng, xung boost 4.4GHz. Không có iGPU.',
        shortDescription: 'CPU 6 nhân 12 luồng, xung boost 4.4GHz, LGA1700',
        category: 'cpu', brand: 'Intel',
        price: 3190000, stock: 35,
        thumbnail: 'https://m.media-amazon.com/images/I/51CRAkS8M9L._AC_SL1500_.jpg',
        specifications: { cores: 6, threads: 12, baseClock: 2.5, boostClock: 4.4, socket: 'LGA1700', tdp: 65 },
        isActive: true, rating: 4.7, numReviews: 98, sold: 180,
        warranty: { months: 36, condition: 'Bảo hành chính hãng' }
    },
    {
        name: 'Intel Core i5-13400F',
        description: 'CPU thế hệ 13 với 10 nhân 16 luồng (6P+4E), hiệu năng vượt trội so với thế hệ trước.',
        shortDescription: 'CPU 10 nhân 16 luồng, xung boost 4.6GHz, LGA1700',
        category: 'cpu', brand: 'Intel',
        price: 4490000, stock: 25,
        thumbnail: 'https://m.media-amazon.com/images/I/51CRAkS8M9L._AC_SL1500_.jpg',
        specifications: { cores: 10, threads: 16, baseClock: 2.5, boostClock: 4.6, socket: 'LGA1700', tdp: 65 },
        isActive: true, rating: 4.6, numReviews: 72, sold: 120,
        warranty: { months: 36, condition: 'Bảo hành chính hãng' }
    },
    {
        name: 'AMD Ryzen 7 5800X',
        description: 'CPU cao cấp 8 nhân 16 luồng, xung boost 4.7GHz, phù hợp gaming và sáng tạo nội dung.',
        shortDescription: 'CPU 8 nhân 16 luồng, xung boost 4.7GHz, AM4',
        category: 'cpu', brand: 'AMD',
        price: 5990000, stock: 20,
        thumbnail: 'https://m.media-amazon.com/images/I/616VM0JV4jS._AC_SL1384_.jpg',
        specifications: { cores: 8, threads: 16, baseClock: 3.8, boostClock: 4.7, socket: 'AM4', tdp: 105 },
        isActive: true, rating: 4.7, numReviews: 85, sold: 95,
        warranty: { months: 36, condition: 'Bảo hành chính hãng' }
    },
    {
        name: 'Intel Core i7-13700K',
        description: 'CPU flagship Intel thế hệ 13, 16 nhân 24 luồng, hiệu năng đỉnh cao cho mọi tác vụ.',
        shortDescription: 'CPU 16 nhân 24 luồng, xung boost 5.4GHz, LGA1700',
        category: 'cpu', brand: 'Intel',
        price: 8990000, stock: 15,
        thumbnail: 'https://m.media-amazon.com/images/I/51CRAkS8M9L._AC_SL1500_.jpg',
        specifications: { cores: 16, threads: 24, baseClock: 3.4, boostClock: 5.4, socket: 'LGA1700', tdp: 125 },
        isActive: true, rating: 4.8, numReviews: 60, sold: 70,
        warranty: { months: 36, condition: 'Bảo hành chính hãng' }
    },
    {
        name: 'Intel Core i3-12100F',
        description: 'CPU văn phòng tốt nhất phân khúc giá rẻ, 4 nhân 8 luồng, tiết kiệm điện.',
        shortDescription: 'CPU 4 nhân 8 luồng, xung boost 4.3GHz, LGA1700',
        category: 'cpu', brand: 'Intel',
        price: 2190000, stock: 50,
        thumbnail: 'https://m.media-amazon.com/images/I/51CRAkS8M9L._AC_SL1500_.jpg',
        specifications: { cores: 4, threads: 8, baseClock: 3.3, boostClock: 4.3, socket: 'LGA1700', tdp: 58 },
        isActive: true, rating: 4.5, numReviews: 150, sold: 300,
        warranty: { months: 36, condition: 'Bảo hành chính hãng' }
    },
    {
        name: 'AMD Ryzen 5 7600',
        description: 'CPU AM5 thế hệ mới với kiến trúc Zen 4, hỗ trợ DDR5 và PCIe 5.0.',
        shortDescription: 'CPU 6 nhân 12 luồng, AM5, DDR5, PCIe 5.0',
        category: 'cpu', brand: 'AMD',
        price: 4990000, stock: 30,
        thumbnail: 'https://m.media-amazon.com/images/I/51iji7Gel-L._AC_SL1200_.jpg',
        specifications: { cores: 6, threads: 12, baseClock: 3.8, boostClock: 5.1, socket: 'AM5', tdp: 65 },
        isActive: true, rating: 4.6, numReviews: 55, sold: 80,
        warranty: { months: 36, condition: 'Bảo hành chính hãng' }
    },

    // ============================================
    // GPU - CARD ĐỒ HỌA
    // ============================================
    {
        name: 'ASUS Dual GeForce RTX 4060 OC 8GB',
        description: 'Card đồ họa RTX 4060 với 8GB GDDR6, ray tracing, DLSS 3, phù hợp gaming 1080p.',
        shortDescription: 'GPU RTX 4060 8GB GDDR6, Ray Tracing, DLSS 3',
        category: 'gpu', brand: 'ASUS',
        price: 7990000, stock: 25,
        thumbnail: 'https://dlcdnwebimgs.asus.com/gain/3FE3BC30-43E1-41C5-AA6F-16E8EFFDC97F/w717/h525',
        specifications: { chipset: 'RTX 4060', vram: 8, vramType: 'GDDR6', tdp: 115 },
        isActive: true, rating: 4.6, numReviews: 45, sold: 85,
        warranty: { months: 36, condition: 'Bảo hành chính hãng ASUS' }
    },
    {
        name: 'MSI GeForce RTX 4060 Ti VENTUS 2X 8G OC',
        description: 'Card đồ họa RTX 4060 Ti 8GB, hiệu năng gaming 1080p/1440p mạnh mẽ.',
        shortDescription: 'GPU RTX 4060 Ti 8GB GDDR6, Gaming 1440p',
        category: 'gpu', brand: 'MSI',
        price: 10490000, stock: 18,
        thumbnail: 'https://asset.msi.com/resize/image/global/product/product_1684311974e793efeb34aaec4cd1b1b98574f269b0.png62405b55b6ce12f971076b89a27dab7e/1024.png',
        specifications: { chipset: 'RTX 4060 Ti', vram: 8, vramType: 'GDDR6', tdp: 160 },
        isActive: true, rating: 4.7, numReviews: 38, sold: 60,
        warranty: { months: 36, condition: 'Bảo hành chính hãng MSI' }
    },
    {
        name: 'Gigabyte GeForce RTX 4070 WINDFORCE OC 12G',
        description: 'Card đồ họa RTX 4070 12GB GDDR6X, hiệu năng gaming 1440p/4K tuyệt vời.',
        shortDescription: 'GPU RTX 4070 12GB GDDR6X, Gaming 1440p/4K',
        category: 'gpu', brand: 'Gigabyte',
        price: 14990000, stock: 12,
        thumbnail: 'https://m.media-amazon.com/images/I/81kNiSp12UL._AC_SL1500_.jpg',
        specifications: { chipset: 'RTX 4070', vram: 12, vramType: 'GDDR6X', tdp: 200 },
        isActive: true, rating: 4.8, numReviews: 30, sold: 45,
        warranty: { months: 36, condition: 'Bảo hành chính hãng Gigabyte' }
    },
    {
        name: 'MSI GeForce RTX 3060 VENTUS 2X 12G OC',
        description: 'Card đồ họa RTX 3060 12GB, GPU phổ thông cho gaming 1080p và đồ họa cơ bản.',
        shortDescription: 'GPU RTX 3060 12GB GDDR6, Gaming 1080p',
        category: 'gpu', brand: 'MSI',
        price: 5990000, stock: 20,
        thumbnail: 'https://asset.msi.com/resize/image/global/product/product_1638856206ac6b47b1e0e6c0e37027a7f7.png62405b55b6ce12f971076b89a27dab7e/1024.png',
        specifications: { chipset: 'RTX 3060', vram: 12, vramType: 'GDDR6', tdp: 170 },
        isActive: true, rating: 4.5, numReviews: 80, sold: 150,
        warranty: { months: 36, condition: 'Bảo hành chính hãng MSI' }
    },
    {
        name: 'ASUS GeForce GT 1030 2GB',
        description: 'Card đồ họa giá rẻ cho văn phòng, xem phim, lướt web. Silent cooling.',
        shortDescription: 'GPU GT 1030 2GB, Fan-less, Văn phòng',
        category: 'gpu', brand: 'ASUS',
        price: 1690000, stock: 40,
        thumbnail: 'https://dlcdnwebimgs.asus.com/gain/88ADB3DA-ABFF-483F-BE4C-499AA7233D17/w717/h525',
        specifications: { chipset: 'GT 1030', vram: 2, vramType: 'GDDR5', tdp: 30 },
        isActive: true, rating: 4.2, numReviews: 65, sold: 200,
        warranty: { months: 36, condition: 'Bảo hành chính hãng ASUS' }
    },

    // ============================================
    // RAM - BỘ NHỚ
    // ============================================
    {
        name: 'Kingston Fury Beast DDR4 16GB (2x8GB) 3200MHz',
        description: 'Bộ RAM DDR4 16GB Dual Channel, tốc độ 3200MHz CL16, tương thích rộng.',
        shortDescription: 'RAM DDR4 16GB (2x8GB) 3200MHz CL16',
        category: 'ram', brand: 'Kingston',
        price: 890000, stock: 80,
        thumbnail: 'https://m.media-amazon.com/images/I/71YyM9l3+3L._AC_SL1500_.jpg',
        specifications: { capacity: 16, type: 'DDR4', speed: '3200MHz', modules: '2x8GB' },
        isActive: true, rating: 4.7, numReviews: 200, sold: 500,
        warranty: { months: 60, condition: 'Bảo hành lifetime' }
    },
    {
        name: 'Corsair Vengeance DDR5 32GB (2x16GB) 5600MHz',
        description: 'Bộ RAM DDR5 32GB Dual Channel, tốc độ 5600MHz, hỗ trợ Intel XMP 3.0.',
        shortDescription: 'RAM DDR5 32GB (2x16GB) 5600MHz',
        category: 'ram', brand: 'Corsair',
        price: 2490000, stock: 30,
        thumbnail: 'https://m.media-amazon.com/images/I/71Cp4pAjEFL._AC_SL1500_.jpg',
        specifications: { capacity: 32, type: 'DDR5', speed: '5600MHz', modules: '2x16GB' },
        isActive: true, rating: 4.6, numReviews: 45, sold: 70,
        warranty: { months: 60, condition: 'Bảo hành lifetime' }
    },
    {
        name: 'Kingston Fury Beast DDR4 8GB 3200MHz',
        description: 'RAM DDR4 8GB đơn thanh, phù hợp cho văn phòng và học tập.',
        shortDescription: 'RAM DDR4 8GB 3200MHz',
        category: 'ram', brand: 'Kingston',
        price: 450000, stock: 100,
        thumbnail: 'https://m.media-amazon.com/images/I/71YyM9l3+3L._AC_SL1500_.jpg',
        specifications: { capacity: 8, type: 'DDR4', speed: '3200MHz', modules: '1x8GB' },
        isActive: true, rating: 4.5, numReviews: 180, sold: 600,
        warranty: { months: 60, condition: 'Bảo hành lifetime' }
    },
    {
        name: 'G.Skill Trident Z5 RGB DDR5 32GB (2x16GB) 6000MHz',
        description: 'RAM DDR5 cao cấp với tản nhiệt RGB tuyệt đẹp, XMP 3.0, CL30.',
        shortDescription: 'RAM DDR5 32GB (2x16GB) 6000MHz RGB',
        category: 'ram', brand: 'G.Skill',
        price: 3290000, stock: 20,
        thumbnail: 'https://m.media-amazon.com/images/I/71UMbYqJURL._AC_SL1500_.jpg',
        specifications: { capacity: 32, type: 'DDR5', speed: '6000MHz', modules: '2x16GB' },
        isActive: true, rating: 4.8, numReviews: 35, sold: 40,
        warranty: { months: 60, condition: 'Bảo hành lifetime' }
    },

    // ============================================
    // STORAGE - Ổ CỨNG
    // ============================================
    {
        name: 'Samsung 980 Pro 1TB NVMe M.2 SSD',
        description: 'SSD NVMe Gen4 nhanh nhất của Samsung, tốc độ đọc 7000MB/s, ghi 5000MB/s.',
        shortDescription: 'SSD NVMe Gen4 1TB, đọc 7000MB/s',
        category: 'storage', brand: 'Samsung',
        price: 2690000, stock: 40,
        thumbnail: 'https://m.media-amazon.com/images/I/71BpbFlJzkL._AC_SL1500_.jpg',
        specifications: { capacity: 1000, type: 'NVMe SSD Gen4', readSpeed: 7000, writeSpeed: 5000 },
        isActive: true, rating: 4.9, numReviews: 120, sold: 250,
        warranty: { months: 60, condition: 'Bảo hành chính hãng' }
    },
    {
        name: 'WD Blue SN580 500GB NVMe M.2 SSD',
        description: 'SSD NVMe giá tốt cho build tầm trung, tốc độ đọc 4000MB/s.',
        shortDescription: 'SSD NVMe 500GB, đọc 4000MB/s',
        category: 'storage', brand: 'Western Digital',
        price: 1190000, stock: 60,
        thumbnail: 'https://m.media-amazon.com/images/I/71V-jRWaRCL._AC_SL1500_.jpg',
        specifications: { capacity: 500, type: 'NVMe SSD', readSpeed: 4000, writeSpeed: 3600 },
        isActive: true, rating: 4.6, numReviews: 90, sold: 180,
        warranty: { months: 60, condition: 'Bảo hành chính hãng' }
    },
    {
        name: 'Kingston NV2 250GB NVMe M.2 SSD',
        description: 'SSD NVMe giá rẻ cho build văn phòng, tốc độ đọc 3000MB/s.',
        shortDescription: 'SSD NVMe 250GB, đọc 3000MB/s, giá rẻ',
        category: 'storage', brand: 'Kingston',
        price: 590000, stock: 80,
        thumbnail: 'https://m.media-amazon.com/images/I/71GpFLUssqL._AC_SL1500_.jpg',
        specifications: { capacity: 250, type: 'NVMe SSD', readSpeed: 3000, writeSpeed: 1300 },
        isActive: true, rating: 4.4, numReviews: 110, sold: 350,
        warranty: { months: 36, condition: 'Bảo hành chính hãng' }
    },
    {
        name: 'Samsung 990 Pro 2TB NVMe M.2 SSD',
        description: 'SSD NVMe Gen4 flagship 2TB, đọc 7450MB/s, ghi 6900MB/s. Dung lượng lớn cho workstation.',
        shortDescription: 'SSD NVMe Gen4 2TB, đọc 7450MB/s',
        category: 'storage', brand: 'Samsung',
        price: 4990000, stock: 15,
        thumbnail: 'https://m.media-amazon.com/images/I/71BpbFlJzkL._AC_SL1500_.jpg',
        specifications: { capacity: 2000, type: 'NVMe SSD Gen4', readSpeed: 7450, writeSpeed: 6900 },
        isActive: true, rating: 4.9, numReviews: 40, sold: 50,
        warranty: { months: 60, condition: 'Bảo hành chính hãng' }
    },

    // ============================================
    // MOTHERBOARD - BO MẠCH CHỦ
    // ============================================
    {
        name: 'Gigabyte B760M DS3H DDR4',
        description: 'Mainboard B760 hỗ trợ CPU Intel Gen 12/13/14, DDR4, form Micro ATX.',
        shortDescription: 'Mainboard Intel B760, DDR4, Micro ATX',
        category: 'motherboard', brand: 'Gigabyte',
        price: 2390000, stock: 30,
        thumbnail: 'https://m.media-amazon.com/images/I/81Gw-lzYd6L._AC_SL1500_.jpg',
        specifications: { chipset: 'B760', socket: 'LGA1700', ramType: 'DDR4', formFactor: 'Micro ATX', maxRam: 128 },
        isActive: true, rating: 4.5, numReviews: 75, sold: 150,
        warranty: { months: 36, condition: 'Bảo hành chính hãng' }
    },
    {
        name: 'MSI PRO B660M-A DDR4',
        description: 'Mainboard B660 giá tốt cho Intel Gen 12/13, DDR4, 2x M.2, USB 3.2.',
        shortDescription: 'Mainboard Intel B660, DDR4, Micro ATX',
        category: 'motherboard', brand: 'MSI',
        price: 2190000, stock: 25,
        thumbnail: 'https://asset.msi.com/resize/image/global/product/product_1641899437.png62405b55b6ce12f971076b89a27dab7e/1024.png',
        specifications: { chipset: 'B660', socket: 'LGA1700', ramType: 'DDR4', formFactor: 'Micro ATX', maxRam: 128 },
        isActive: true, rating: 4.4, numReviews: 60, sold: 120,
        warranty: { months: 36, condition: 'Bảo hành chính hãng' }
    },
    {
        name: 'MSI MAG B550 TOMAHAWK',
        description: 'Mainboard B550 cao cấp cho AMD AM4, DDR4, 2x M.2, USB-C, 2.5G LAN.',
        shortDescription: 'Mainboard AMD B550, DDR4, ATX',
        category: 'motherboard', brand: 'MSI',
        price: 2890000, stock: 20,
        thumbnail: 'https://asset.msi.com/resize/image/global/product/product_1596443634.png62405b55b6ce12f971076b89a27dab7e/1024.png',
        specifications: { chipset: 'B550', socket: 'AM4', ramType: 'DDR4', formFactor: 'ATX', maxRam: 128 },
        isActive: true, rating: 4.7, numReviews: 85, sold: 100,
        warranty: { months: 36, condition: 'Bảo hành chính hãng' }
    },
    {
        name: 'ASUS ROG STRIX B650E-E GAMING WIFI',
        description: 'Mainboard AM5 cao cấp, DDR5, PCIe 5.0, WiFi 6E, USB4, cho AMD Ryzen 7000.',
        shortDescription: 'Mainboard AMD B650E, DDR5, ATX, WiFi 6E',
        category: 'motherboard', brand: 'ASUS',
        price: 6490000, stock: 10,
        thumbnail: 'https://dlcdnwebimgs.asus.com/gain/56B94C9E-8A5A-48F4-A7E4-CC68F2441C98/w717/h525',
        specifications: { chipset: 'B650E', socket: 'AM5', ramType: 'DDR5', formFactor: 'ATX', maxRam: 128 },
        isActive: true, rating: 4.8, numReviews: 30, sold: 35,
        warranty: { months: 36, condition: 'Bảo hành chính hãng' }
    },
    {
        name: 'Gigabyte H610M H DDR4',
        description: 'Mainboard H610 giá rẻ cho Intel Gen 12/13/14, DDR4, form Micro ATX. Phù hợp văn phòng.',
        shortDescription: 'Mainboard Intel H610, DDR4, Micro ATX, giá rẻ',
        category: 'motherboard', brand: 'Gigabyte',
        price: 1590000, stock: 45,
        thumbnail: 'https://m.media-amazon.com/images/I/81Gw-lzYd6L._AC_SL1500_.jpg',
        specifications: { chipset: 'H610', socket: 'LGA1700', ramType: 'DDR4', formFactor: 'Micro ATX', maxRam: 64 },
        isActive: true, rating: 4.3, numReviews: 95, sold: 250,
        warranty: { months: 36, condition: 'Bảo hành chính hãng' }
    },

    // ============================================
    // PSU - NGUỒN ĐIỆN
    // ============================================
    {
        name: 'Corsair CV550 550W 80+ Bronze',
        description: 'Nguồn 550W chuẩn 80+ Bronze, đủ cho build gaming tầm trung, ổn định.',
        shortDescription: 'Nguồn 550W 80+ Bronze',
        category: 'psu', brand: 'Corsair',
        price: 1090000, stock: 40,
        thumbnail: 'https://m.media-amazon.com/images/I/71lKFrhDkwL._AC_SL1500_.jpg',
        specifications: { wattage: 550, efficiency: '80+ Bronze', modular: false },
        isActive: true, rating: 4.5, numReviews: 85, sold: 200,
        warranty: { months: 36, condition: 'Bảo hành chính hãng' }
    },
    {
        name: 'Corsair RM650x 650W 80+ Gold Full Modular',
        description: 'Nguồn 650W 80+ Gold Full Modular, hoạt động cực êm, fan 0 RPM mode.',
        shortDescription: 'Nguồn 650W 80+ Gold, Full Modular',
        category: 'psu', brand: 'Corsair',
        price: 2190000, stock: 25,
        thumbnail: 'https://m.media-amazon.com/images/I/71gGtUB7sJL._AC_SL1500_.jpg',
        specifications: { wattage: 650, efficiency: '80+ Gold', modular: true },
        isActive: true, rating: 4.8, numReviews: 55, sold: 80,
        warranty: { months: 120, condition: 'Bảo hành 10 năm' }
    },
    {
        name: 'Corsair RM850x 850W 80+ Gold Full Modular',
        description: 'Nguồn 850W cao cấp cho build high-end, 80+ Gold, Full Modular.',
        shortDescription: 'Nguồn 850W 80+ Gold, Full Modular',
        category: 'psu', brand: 'Corsair',
        price: 2990000, stock: 15,
        thumbnail: 'https://m.media-amazon.com/images/I/71gGtUB7sJL._AC_SL1500_.jpg',
        specifications: { wattage: 850, efficiency: '80+ Gold', modular: true },
        isActive: true, rating: 4.9, numReviews: 40, sold: 50,
        warranty: { months: 120, condition: 'Bảo hành 10 năm' }
    },
    {
        name: 'Cooler Master MWE 450W 80+ White',
        description: 'Nguồn 450W giá rẻ, đủ cho build văn phòng, học tập. 80+ White.',
        shortDescription: 'Nguồn 450W 80+ White, giá rẻ',
        category: 'psu', brand: 'Cooler Master',
        price: 690000, stock: 60,
        thumbnail: 'https://m.media-amazon.com/images/I/71e7x4xZUmL._AC_SL1500_.jpg',
        specifications: { wattage: 450, efficiency: '80+ White', modular: false },
        isActive: true, rating: 4.3, numReviews: 100, sold: 300,
        warranty: { months: 36, condition: 'Bảo hành chính hãng' }
    },
    {
        name: 'EVGA SuperNOVA 750 G6 750W 80+ Gold',
        description: 'Nguồn 750W 80+ Gold Full Modular, phù hợp build gaming RTX 4070 Ti/4080.',
        shortDescription: 'Nguồn 750W 80+ Gold, Full Modular',
        category: 'psu', brand: 'EVGA',
        price: 2490000, stock: 18,
        thumbnail: 'https://m.media-amazon.com/images/I/71xCe3fIoJL._AC_SL1500_.jpg',
        specifications: { wattage: 750, efficiency: '80+ Gold', modular: true },
        isActive: true, rating: 4.7, numReviews: 35, sold: 55,
        warranty: { months: 120, condition: 'Bảo hành 10 năm' }
    },

    // ============================================
    // CASE - VỎ MÁY TÍNH
    // ============================================
    {
        name: 'NZXT H5 Flow Mid Tower',
        description: 'Case mid tower thoáng khí với mặt lưới phía trước, hỗ trợ ATX, kính cường lực.',
        shortDescription: 'Case Mid Tower ATX, Airflow tốt, Kính cường lực',
        category: 'case', brand: 'NZXT',
        price: 1890000, stock: 20,
        thumbnail: 'https://m.media-amazon.com/images/I/71Rq+k5B+5L._AC_SL1500_.jpg',
        specifications: { formFactor: 'ATX', type: 'Mid Tower', fans: 2, maxGpuLength: 365 },
        isActive: true, rating: 4.6, numReviews: 50, sold: 80,
        warranty: { months: 24, condition: 'Bảo hành chính hãng' }
    },
    {
        name: 'Corsair 4000D Airflow Mid Tower',
        description: 'Case gaming phổ biến nhất với thiết kế airflow tối ưu, hỗ trợ ATX.',
        shortDescription: 'Case Mid Tower ATX, Airflow xuất sắc',
        category: 'case', brand: 'Corsair',
        price: 2190000, stock: 15,
        thumbnail: 'https://m.media-amazon.com/images/I/71oJ9ae7Y4L._AC_SL1500_.jpg',
        specifications: { formFactor: 'ATX', type: 'Mid Tower', fans: 2, maxGpuLength: 360 },
        isActive: true, rating: 4.8, numReviews: 120, sold: 200,
        warranty: { months: 24, condition: 'Bảo hành chính hãng' }
    },
    {
        name: 'Xigmatek NYX 3F Micro ATX',
        description: 'Case micro ATX giá rẻ, đi kèm 3 fan RGB, kính cường lực. Phù hợp build tầm trung.',
        shortDescription: 'Case Micro ATX, 3 fan RGB, giá rẻ',
        category: 'case', brand: 'Xigmatek',
        price: 690000, stock: 50,
        thumbnail: 'https://m.media-amazon.com/images/I/61PGDR5LqTL._AC_SL1000_.jpg',
        specifications: { formFactor: 'Micro ATX', type: 'Mini Tower', fans: 3, maxGpuLength: 320 },
        isActive: true, rating: 4.3, numReviews: 80, sold: 250,
        warranty: { months: 12, condition: 'Bảo hành chính hãng' }
    },
    {
        name: 'Lian Li LANCOOL III Mid Tower',
        description: 'Case full-size cao cấp, airflow cực tốt, hỗ trợ E-ATX, cable management tuyệt vời.',
        shortDescription: 'Case Mid Tower E-ATX, Airflow đỉnh cao',
        category: 'case', brand: 'Lian Li',
        price: 2990000, stock: 10,
        thumbnail: 'https://m.media-amazon.com/images/I/71nIYSFkLJL._AC_SL1500_.jpg',
        specifications: { formFactor: 'ATX', type: 'Full Tower', fans: 3, maxGpuLength: 420 },
        isActive: true, rating: 4.9, numReviews: 35, sold: 30,
        warranty: { months: 24, condition: 'Bảo hành chính hãng' }
    },
    {
        name: 'Deepcool CC360 ARGB Micro ATX',
        description: 'Case Micro ATX nhỏ gọn giá rẻ, 3 fan ARGB, kính cường lực phù hợp văn phòng.',
        shortDescription: 'Case Micro ATX, 3 fan ARGB, nhỏ gọn',
        category: 'case', brand: 'Deepcool',
        price: 590000, stock: 40,
        thumbnail: 'https://m.media-amazon.com/images/I/71aVu3BQZHL._AC_SL1500_.jpg',
        specifications: { formFactor: 'Micro ATX', type: 'Mini Tower', fans: 3, maxGpuLength: 320 },
        isActive: true, rating: 4.2, numReviews: 65, sold: 180,
        warranty: { months: 12, condition: 'Bảo hành chính hãng' }
    },
];

// ============================================
// HÀM SEED DỮ LIỆU
// ============================================
const seedPCParts = async () => {
    try {
        await connectDB();
        console.log('🌱 Bắt đầu seed dữ liệu linh kiện PC cho AI Build...\n');

        let created = 0;
        let skipped = 0;

        for (const product of pcPartProducts) {
            // Kiểm tra sản phẩm đã tồn tại chưa (theo tên)
            const existing = await Product.findOne({ name: product.name });
            if (existing) {
                console.log(`   ⏭️  [${product.category.toUpperCase()}] ${product.name} - ĐÃ TỒN TẠI`);
                skipped++;
                continue;
            }

            await Product.create(product);
            console.log(`   ✅ [${product.category.toUpperCase()}] ${product.name}`);
            created++;
        }

        console.log(`\n📊 Kết quả: ${created} sản phẩm mới, ${skipped} đã tồn tại`);
        console.log('✅ Seed dữ liệu linh kiện PC thành công!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi khi seed dữ liệu:', error);
        process.exit(1);
    }
};

seedPCParts();
