
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../db');

/**
 * Script này sẽ reset toàn bộ sản phẩm và tạo đúng 100 sản phẩm
 * Chia đều cho các danh mục (7-8 sp/danh mục)
 * Mỗi danh mục có đầy đủ các phân khúc giá: Thấp, Vừa, Cao
 * SỬ DỤNG ẢNH SẢN PHẨM THẬT
 */

const categories = [
    'laptop', 'pc', 'cpu', 'gpu', 'ram',
    'storage', 'motherboard', 'psu', 'case',
    'cooling', 'monitor', 'keyboard', 'mouse', 'headset'
];

const brandsMap = {
    laptop: ['Apple', 'ASUS', 'MSI', 'Lenovo', 'Acer', 'Dell', 'HP'],
    pc: ['TechStore Custom', 'MSI', 'ASUS', 'HP'],
    cpu: ['Intel', 'AMD'],
    gpu: ['ASUS', 'MSI', 'Gigabyte', 'Colorful', 'NVIDIA'],
    ram: ['Kingston', 'Corsair', 'G.Skill', 'ADATA', 'TeamGroup'],
    storage: ['Samsung', 'Kingston', 'Western Digital', 'Crucial', 'Seagate'],
    motherboard: ['ASUS', 'MSI', 'Gigabyte', 'ASRock'],
    psu: ['Corsair', 'Cooler Master', 'Seasonic', 'EVGA', 'Gigabyte'],
    case: ['NZXT', 'Corsair', 'Lian Li', 'Xigmatek', 'Deepcool'],
    cooling: ['Deepcool', 'Cooler Master', 'Noctua', 'Corsair', 'NZXT'],
    monitor: ['ASUS', 'Samsung', 'LG', 'ViewSonic', 'Dell', 'AOC'],
    keyboard: ['Corsair', 'Razer', 'Logitech', 'Akko', 'Leopold'],
    mouse: ['Logitech', 'Razer', 'Corsair', 'SteelSeries', 'Zowie'],
    headset: ['HyperX', 'SteelSeries', 'Corsair', 'Razer', 'Sony']
};

const priceRanges = {
    laptop: { low: [10000000, 18000000], mid: [18000000, 35000000], high: [35000000, 80000000] },
    pc: { low: [5000000, 12000000], mid: [12000000, 25000000], high: [25000000, 60000000] },
    cpu: { low: [2000000, 4000000], mid: [4000000, 8000000], high: [8000000, 15000000] },
    gpu: { low: [4000000, 8000000], mid: [8000000, 18000000], high: [18000000, 50000000] },
    ram: { low: [400000, 1000000], mid: [1000000, 3000000], high: [3000000, 6000000] },
    storage: { low: [500000, 1200000], mid: [1200000, 2500000], high: [2500000, 6000000] },
    motherboard: { low: [1500000, 3000000], mid: [3000000, 6000000], high: [6000000, 12000000] },
    psu: { low: [600000, 1200000], mid: [1200000, 2500000], high: [2500000, 5000000] },
    case: { low: [500000, 1200000], mid: [1200000, 2500000], high: [2500000, 5000000] },
    cooling: { low: [200000, 800000], mid: [800000, 2000000], high: [2000000, 5000000] },
    monitor: { low: [1800000, 4000000], mid: [4000000, 10000000], high: [10000000, 25000000] },
    keyboard: { low: [300000, 1200000], mid: [1200000, 3000000], high: [3000000, 6000000] },
    mouse: { low: [200000, 800000], mid: [800000, 2000000], high: [2000000, 4000000] },
    headset: { low: [300000, 1200000], mid: [1200000, 3000000], high: [3000000, 6000000] }
};

const productNamesData = {
    laptop: {
        low: ['Vivobook 14', 'Inspiron 15', 'IdeaPad 3', 'Aspire 5', 'Modern 14'],
        mid: ['Zenbook 13', 'MacBook Air M1', 'Legion 5', 'Victus 16', 'Tuf Gaming F15'],
        high: ['MacBook Pro 14', 'ROG Zephyrus G14', 'XPS 15', 'Blade 16', 'Raider GE78']
    },
    pc: {
        low: ['Office Plus', 'Home Desktop', 'Student PC', 'Basic Workstation'],
        mid: ['Gaming Elite', 'Pro Designer', 'Streamer Box', 'Content Creator PC'],
        high: ['Ultra Gaming 4K', 'Ultimate Workstation', 'Extreme Titan', 'The Beast']
    },
    cpu: {
        low: ['Core i3-12100F', 'Ryzen 3 4100', 'Pentium Gold G7400', 'Core i3-13100'],
        mid: ['Core i5-13400F', 'Ryzen 5 7600', 'Core i5-12400', 'Ryzen 5 5600X'],
        high: ['Core i9-14900K', 'Ryzen 9 7950X', 'Core i7-13700K', 'Ryzen 7 7800X3D']
    },
    gpu: {
        low: ['GTX 1650', 'GT 1030', 'RX 6400', 'RTX 3050'],
        mid: ['RTX 4060', 'RTX 4060 Ti', 'RX 7600', 'RTX 3060'],
        high: ['RTX 4090', 'RTX 4080 SUPER', 'RX 7900 XTX', 'RTX 4070 Ti']
    },
    ram: {
        low: ['Fury Beast 8GB', 'Vengeance LPX 8GB', 'Elite Plus 8GB'],
        mid: ['Fury Beast 16GB RGB', 'Trident Z5 16GB', 'Vengeance RGB 32GB'],
        high: ['Trident Z5 RGB 64GB', 'Dominator Platinum 32GB', 'Fury Renegade 64GB']
    },
    storage: {
        low: ['NV2 250GB', 'Blue 500GB', 'A400 240GB'],
        mid: ['980 Pro 1TB', 'SN850X 1TB', 'Crucial P5 1TB'],
        high: ['990 Pro 2TB', 'FireCuda 530 2TB', 'SN850X 4TB']
    },
    motherboard: {
        low: ['H610M-K', 'A520M-A Pro', 'H510M'],
        mid: ['B760M Mortar', 'B650 Gaming X', 'B550 Tomahawk'],
        high: ['Z790 Hero', 'X670E Taichi', 'Z790 Godlike']
    },
    psu: {
        low: ['CV550', 'MWE 450', 'Elite 500'],
        mid: ['RM750e', 'Focus GX-750', 'Toughpower 750W'],
        high: ['RM1000x', 'Thor 1200W', 'SuperNova 1000']
    },
    case: {
        low: ['NYX', 'CC560', 'Forge M'],
        mid: ['4000D Airflow', 'H5 Flow', 'Lancool II'],
        high: ['O11 Dynamic', 'H9 Elite', 'Hyperion GR701']
    },
    cooling: {
        low: ['AK400', 'Hyper 212', 'SE-214-XT'],
        mid: ['AK620', 'Castle 240EX', 'ML240L'],
        high: ['Kraken Z73', 'NH-D15', 'iCUE H150i']
    },
    monitor: {
        low: ['VA2432', '24MP400', 'G24F-2'],
        mid: ['VG27AQ', 'Odyssey G5', 'UltraGear 27GP850'],
        high: ['Odyssey Neo G9', 'ROG Swift PG32UCDM', 'UltraSharp U3223QE']
    },
    keyboard: {
        low: ['K120', 'K552', 'Logitech K120'],
        mid: ['Akko 3068', 'Keychron K2', 'Anne Pro 2'],
        high: ['K100 RGB', 'Apex Pro', 'G915 Lightspeed']
    },
    mouse: {
        low: ['G102 Gen2', 'Viper Mini', 'DeathAdder Essential'],
        mid: ['G502 Hero', 'Basilisk V3', 'Model O'],
        high: ['G Pro X Superlight', 'Viper V2 Pro', 'DeathAdder V3 Pro']
    },
    headset: {
        low: ['Cloud Stinger', 'BlackShark V2 X', 'G335'],
        mid: ['Cloud II', 'Arctis 5', 'Void RGB Elite'],
        high: ['Cloud III Wireless', 'Arctis Nova Pro', 'G Pro X 2']
    }
};


const productImages = {
    laptop: [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1516339901600-2e1a62dc0c45?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=800&auto=format&fit=crop'
    ],
    cpu: [
        'https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1591405351990-4726e331f141?q=80&w=800&auto=format&fit=crop'
    ],
    gpu: [
        'https://images.unsplash.com/photo-1587202372775-e239fccbc0b2?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1591489383454-dd174df4924c?q=80&w=800&auto=format&fit=crop'
    ],
    ram: [
        'https://images.unsplash.com/photo-1555617766-c948049ad7e5?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=800&auto=format&fit=crop'
    ],
    storage: [
        'https://images.unsplash.com/photo-1563203362-c0dee3a7b9ee?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc48?q=80&w=800&auto=format&fit=crop'
    ],
    motherboard: [
        'https://images.unsplash.com/photo-1614362940767-3dd231bcc302?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop'
    ],
    psu: [
        'https://images.unsplash.com/photo-1628547543913-34cdf94abc5f?q=80&w=800&auto=format&fit=crop'
    ],
    monitor: [
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1547119957-630f9c47b934?q=80&w=800&auto=format&fit=crop'
    ],
    keyboard: [
        'https://images.unsplash.com/photo-1587829741301-379e96f83f77?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=800&auto=format&fit=crop'
    ],
    mouse: [
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=800&auto=format&fit=crop'
    ],
    headset: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1546435770-a3e426553926?q=80&w=800&auto=format&fit=crop'
    ],
    case: [
        'https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=800&auto=format&fit=crop'
    ],
    cooling: [
        'https://images.unsplash.com/photo-1614713833215-6f92d9d92e03?q=80&w=800&auto=format&fit=crop'
    ],
    pc: [
        'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1550745165-9bc0b252723f?q=80&w=800&auto=format&fit=crop'
    ]
};


const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInRange = (range) => Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];

const slugify = (text) => {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

const finalGenerate = () => {
    const allProducts = [];
    categories.forEach((cat) => {
        const count = (cat === 'cpu' || cat === 'gpu') ? 8 : 7;
        for (let i = 0; i < count; i++) {
            let tier = 'mid';
            if (i < 2) tier = 'low';
            else if (i >= count - 2) tier = 'high';

            const brand = getRandom(brandsMap[cat]);
            const modelName = getRandom(productNamesData[cat][tier]);
            const name = `${brand} ${modelName}`;
            const price = getRandomInRange(priceRanges[cat][tier]);



            const catImgs = productImages[cat] || [];
            const thumbnail = catImgs[i % catImgs.length] || `https://picsum.photos/seed/${cat}${i}/400/400`;


            allProducts.push({
                name: name,
                slug: slugify(name + '-' + Math.random().toString(36).substring(7)),
                description: `Sản phẩm ${name} chính hãng từ ${brand}. Phân khúc ${tier} với hiệu năng vượt trội trong tầm giá.`,
                shortDescription: `${name} - Hiệu năng ${tier} danh mục ${cat}`,
                category: cat,
                brand: brand,
                price: price,
                salePrice: Math.random() > 0.8 ? Math.floor(price * 0.95) : null,
                stock: getRandomInRange([10, 100]),
                thumbnail: thumbnail,
                isActive: true,


                isFeatured: Math.random() > 0.9,
                rating: 0,
                numReviews: 0,
                sold: 0,
                warranty: { months: tier === 'high' ? 36 : 24, condition: 'Chính hãng' }
            });

        }
    });

    while (allProducts.length < 100) {
        const cat = getRandom(categories);
        const tier = getRandom(['low', 'mid', 'high']);


        const brand = getRandom(brandsMap[cat]);
        const modelName = getRandom(productNamesData[cat][tier]);
        const name = `${brand} ${modelName} Special Edition`;
        const catImgs = productImages[cat] || [];
        const thumbnail = getRandom(catImgs) || 'https://picsum.photos/400/400';


        allProducts.push({
             name: name,
             slug: slugify(name + '-' + Math.random().toString(36).substring(7)),
             category: cat,
             brand: brand,
             price: getRandomInRange(priceRanges[cat][tier]),
             description: 'Phiên bản đặc biệt giới hạn.',
             shortDescription: 'Phiên bản đặc biệt.',
             stock: 10,
             thumbnail: thumbnail,
             isActive: true
        });

    }
    
    if (allProducts.length > 100) {
        allProducts.length = 100;
    }

    return allProducts;
};

const runSeed = async () => {
    try {
        await connectDB();
        console.log('🗑️  Đang xóa dữ liệu sản phẩm cũ...');
        await Product.deleteMany({});
        
        console.log('🌱 Đang tạo 100 sản phẩm mới với ảnh thật...');
        const products = finalGenerate();
        
        await Product.insertMany(products);
        
        console.log('✅ Đã tạo thành công 100 sản phẩm với ảnh thật!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
};

runSeed();
