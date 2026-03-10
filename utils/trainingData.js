/**
 * ============================================
 * utils/trainingData.js - DỮ LIỆU HUẤN LUYỆN CHO AI ENGINE
 * ============================================
 * Chứa tất cả dữ liệu "training" cho hệ thống AI Build PC:
 * 
 * 1. Mẫu cấu hình PC (Build Templates)
 * 2. Ma trận tương thích linh kiện (Compatibility Matrix)
 * 3. Từ điển mục đích sử dụng (Purpose Dictionary)
 * 4. Bảng ưu tiên linh kiện theo mục đích
 * 
 * → AI Engine sẽ "học" từ dữ liệu này để gợi ý thông minh
 */

// ============================================
// 1. MẪU CẤU HÌNH PC (BUILD TEMPLATES)
// ============================================
// Đây là "kiến thức" của AI - mỗi template dạy AI biết
// cấu hình tốt cho từng mục đích + phân khúc giá
const BUILD_TEMPLATES = [
    // ========== GAMING BUILDS ==========
    {
        name: 'Gaming Entry (10-15 triệu)',
        purpose: 'gaming',
        tier: 'entry',
        budgetRange: { min: 10000000, max: 15000000 },
        idealSpecs: {
            cpu: { brands: ['Intel', 'AMD'], keywords: ['i5', 'Ryzen 5'], minCores: 6 },
            gpu: { brands: ['MSI', 'ASUS', 'Gigabyte'], keywords: ['RTX 3060', 'RTX 4060', 'RX 7600'], minVram: 8 },
            ram: { minCapacity: 16, type: ['DDR4', 'DDR5'], minSpeed: 3200 },
            storage: { minCapacity: 512, type: ['NVMe SSD', 'SSD'] },
            motherboard: { keywords: ['B660', 'B760', 'B550', 'B650'] },
            psu: { minWattage: 550 },
            case: { keywords: ['ATX', 'Mid Tower'] }
        },
        budgetAllocation: { cpu: 0.22, gpu: 0.32, ram: 0.08, storage: 0.10, motherboard: 0.13, psu: 0.08, case: 0.07 }
    },
    {
        name: 'Gaming Mid-Range (15-25 triệu)',
        purpose: 'gaming',
        tier: 'mid',
        budgetRange: { min: 15000000, max: 25000000 },
        idealSpecs: {
            cpu: { brands: ['Intel', 'AMD'], keywords: ['i5', 'i7', 'Ryzen 5', 'Ryzen 7'], minCores: 8 },
            gpu: { brands: ['MSI', 'ASUS', 'Gigabyte'], keywords: ['RTX 4060 Ti', 'RTX 4070', 'RX 7700 XT', 'RX 7800 XT'], minVram: 8 },
            ram: { minCapacity: 16, type: ['DDR4', 'DDR5'], minSpeed: 3600 },
            storage: { minCapacity: 1000, type: ['NVMe SSD'] },
            motherboard: { keywords: ['B760', 'B650', 'X670'] },
            psu: { minWattage: 650 },
            case: { keywords: ['ATX', 'Mid Tower'] }
        },
        budgetAllocation: { cpu: 0.20, gpu: 0.35, ram: 0.08, storage: 0.10, motherboard: 0.12, psu: 0.08, case: 0.07 }
    },
    {
        name: 'Gaming High-End (25-40 triệu)',
        purpose: 'gaming',
        tier: 'high',
        budgetRange: { min: 25000000, max: 40000000 },
        idealSpecs: {
            cpu: { brands: ['Intel', 'AMD'], keywords: ['i7', 'i9', 'Ryzen 7', 'Ryzen 9'], minCores: 12 },
            gpu: { brands: ['MSI', 'ASUS', 'Gigabyte'], keywords: ['RTX 4070 Ti', 'RTX 4080', 'RX 7900 XT'], minVram: 12 },
            ram: { minCapacity: 32, type: ['DDR5'], minSpeed: 5600 },
            storage: { minCapacity: 1000, type: ['NVMe SSD Gen4'] },
            motherboard: { keywords: ['Z790', 'X670E', 'B650E'] },
            psu: { minWattage: 750 },
            case: { keywords: ['ATX', 'Full Tower'] }
        },
        budgetAllocation: { cpu: 0.18, gpu: 0.38, ram: 0.08, storage: 0.09, motherboard: 0.12, psu: 0.08, case: 0.07 }
    },
    {
        name: 'Gaming Ultra (40+ triệu)',
        purpose: 'gaming',
        tier: 'ultra',
        budgetRange: { min: 40000000, max: 100000000 },
        idealSpecs: {
            cpu: { brands: ['Intel', 'AMD'], keywords: ['i9', 'Ryzen 9'], minCores: 16 },
            gpu: { brands: ['MSI', 'ASUS', 'Gigabyte'], keywords: ['RTX 4080 SUPER', 'RTX 4090', 'RX 7900 XTX'], minVram: 16 },
            ram: { minCapacity: 32, type: ['DDR5'], minSpeed: 6000 },
            storage: { minCapacity: 2000, type: ['NVMe SSD Gen4', 'NVMe SSD Gen5'] },
            motherboard: { keywords: ['Z790', 'X670E'] },
            psu: { minWattage: 850 },
            case: { keywords: ['Full Tower'] }
        },
        budgetAllocation: { cpu: 0.17, gpu: 0.40, ram: 0.07, storage: 0.09, motherboard: 0.12, psu: 0.08, case: 0.07 }
    },

    // ========== ĐỒ HỌA / RENDER BUILDS ==========
    {
        name: 'Đồ họa Entry (12-20 triệu)',
        purpose: 'do-hoa',
        tier: 'entry',
        budgetRange: { min: 12000000, max: 20000000 },
        idealSpecs: {
            cpu: { brands: ['Intel', 'AMD'], keywords: ['i5', 'Ryzen 5'], minCores: 6 },
            gpu: { brands: ['MSI', 'ASUS', 'Gigabyte'], keywords: ['RTX 3060', 'RTX 4060'], minVram: 8 },
            ram: { minCapacity: 16, type: ['DDR4', 'DDR5'], minSpeed: 3200 },
            storage: { minCapacity: 512, type: ['NVMe SSD'] },
            motherboard: { keywords: ['B660', 'B760', 'B550'] },
            psu: { minWattage: 550 },
            case: { keywords: ['ATX'] }
        },
        budgetAllocation: { cpu: 0.25, gpu: 0.28, ram: 0.12, storage: 0.12, motherboard: 0.10, psu: 0.07, case: 0.06 }
    },
    {
        name: 'Đồ họa Pro (20-35 triệu)',
        purpose: 'do-hoa',
        tier: 'mid',
        budgetRange: { min: 20000000, max: 35000000 },
        idealSpecs: {
            cpu: { brands: ['Intel', 'AMD'], keywords: ['i7', 'Ryzen 7', 'Ryzen 9'], minCores: 8 },
            gpu: { brands: ['MSI', 'ASUS', 'Gigabyte'], keywords: ['RTX 4070', 'RTX 4070 Ti'], minVram: 12 },
            ram: { minCapacity: 32, type: ['DDR5'], minSpeed: 5200 },
            storage: { minCapacity: 1000, type: ['NVMe SSD Gen4'] },
            motherboard: { keywords: ['B760', 'X670', 'B650'] },
            psu: { minWattage: 650 },
            case: { keywords: ['ATX', 'Mid Tower'] }
        },
        budgetAllocation: { cpu: 0.25, gpu: 0.30, ram: 0.13, storage: 0.12, motherboard: 0.08, psu: 0.06, case: 0.06 }
    },
    {
        name: 'Workstation (35+ triệu)',
        purpose: 'do-hoa',
        tier: 'high',
        budgetRange: { min: 35000000, max: 100000000 },
        idealSpecs: {
            cpu: { brands: ['Intel', 'AMD'], keywords: ['i9', 'Ryzen 9', 'Threadripper'], minCores: 12 },
            gpu: { brands: ['MSI', 'ASUS', 'Gigabyte'], keywords: ['RTX 4080', 'RTX 4090'], minVram: 16 },
            ram: { minCapacity: 64, type: ['DDR5'], minSpeed: 5600 },
            storage: { minCapacity: 2000, type: ['NVMe SSD Gen4'] },
            motherboard: { keywords: ['X670E', 'Z790'] },
            psu: { minWattage: 850 },
            case: { keywords: ['Full Tower'] }
        },
        budgetAllocation: { cpu: 0.23, gpu: 0.30, ram: 0.15, storage: 0.12, motherboard: 0.08, psu: 0.06, case: 0.06 }
    },

    // ========== VĂN PHÒNG BUILDS ==========
    {
        name: 'Văn phòng cơ bản (5-10 triệu)',
        purpose: 'van-phong',
        tier: 'entry',
        budgetRange: { min: 5000000, max: 10000000 },
        idealSpecs: {
            cpu: { brands: ['Intel', 'AMD'], keywords: ['i3', 'Ryzen 3', 'Pentium'], minCores: 4 },
            gpu: { brands: [], keywords: ['GT 1030', 'iGPU'], minVram: 2 },
            ram: { minCapacity: 8, type: ['DDR4'], minSpeed: 2666 },
            storage: { minCapacity: 256, type: ['SSD', 'NVMe SSD'] },
            motherboard: { keywords: ['H610', 'H510', 'A520'] },
            psu: { minWattage: 400 },
            case: { keywords: ['Micro ATX', 'Mini Tower'] }
        },
        budgetAllocation: { cpu: 0.28, gpu: 0.08, ram: 0.12, storage: 0.18, motherboard: 0.15, psu: 0.10, case: 0.09 }
    },
    {
        name: 'Văn phòng nâng cao (10-18 triệu)',
        purpose: 'van-phong',
        tier: 'mid',
        budgetRange: { min: 10000000, max: 18000000 },
        idealSpecs: {
            cpu: { brands: ['Intel', 'AMD'], keywords: ['i5', 'Ryzen 5'], minCores: 6 },
            gpu: { brands: [], keywords: ['iGPU', 'GT 1030', 'GTX 1650'], minVram: 2 },
            ram: { minCapacity: 16, type: ['DDR4', 'DDR5'], minSpeed: 3200 },
            storage: { minCapacity: 512, type: ['NVMe SSD'] },
            motherboard: { keywords: ['B660', 'B760', 'B550'] },
            psu: { minWattage: 450 },
            case: { keywords: ['ATX', 'Micro ATX'] }
        },
        budgetAllocation: { cpu: 0.30, gpu: 0.05, ram: 0.12, storage: 0.20, motherboard: 0.15, psu: 0.10, case: 0.08 }
    },

    // ========== LẬP TRÌNH BUILDS ==========
    {
        name: 'Lập trình (12-22 triệu)',
        purpose: 'lap-trinh',
        tier: 'mid',
        budgetRange: { min: 12000000, max: 22000000 },
        idealSpecs: {
            cpu: { brands: ['Intel', 'AMD'], keywords: ['i5', 'i7', 'Ryzen 5', 'Ryzen 7'], minCores: 6 },
            gpu: { brands: ['MSI', 'ASUS'], keywords: ['RTX 3060', 'RTX 4060', 'iGPU'], minVram: 6 },
            ram: { minCapacity: 16, type: ['DDR4', 'DDR5'], minSpeed: 3200 },
            storage: { minCapacity: 512, type: ['NVMe SSD'] },
            motherboard: { keywords: ['B660', 'B760', 'B550', 'B650'] },
            psu: { minWattage: 500 },
            case: { keywords: ['ATX', 'Mid Tower'] }
        },
        budgetAllocation: { cpu: 0.25, gpu: 0.15, ram: 0.18, storage: 0.17, motherboard: 0.12, psu: 0.07, case: 0.06 }
    },
    {
        name: 'Lập trình Pro / DevOps (22-35 triệu)',
        purpose: 'lap-trinh',
        tier: 'high',
        budgetRange: { min: 22000000, max: 35000000 },
        idealSpecs: {
            cpu: { brands: ['Intel', 'AMD'], keywords: ['i7', 'i9', 'Ryzen 7', 'Ryzen 9'], minCores: 8 },
            gpu: { brands: ['MSI', 'ASUS'], keywords: ['RTX 4060 Ti', 'RTX 4070'], minVram: 8 },
            ram: { minCapacity: 32, type: ['DDR5'], minSpeed: 5200 },
            storage: { minCapacity: 1000, type: ['NVMe SSD Gen4'] },
            motherboard: { keywords: ['B760', 'X670', 'B650'] },
            psu: { minWattage: 650 },
            case: { keywords: ['ATX', 'Mid Tower'] }
        },
        budgetAllocation: { cpu: 0.25, gpu: 0.18, ram: 0.18, storage: 0.15, motherboard: 0.10, psu: 0.07, case: 0.07 }
    },

    // ========== HỌC TẬP BUILDS ==========
    {
        name: 'Học tập cơ bản (7-12 triệu)',
        purpose: 'hoc-tap',
        tier: 'entry',
        budgetRange: { min: 7000000, max: 12000000 },
        idealSpecs: {
            cpu: { brands: ['Intel', 'AMD'], keywords: ['i3', 'i5', 'Ryzen 3', 'Ryzen 5'], minCores: 4 },
            gpu: { brands: [], keywords: ['iGPU', 'GT 1030'], minVram: 2 },
            ram: { minCapacity: 8, type: ['DDR4'], minSpeed: 2666 },
            storage: { minCapacity: 256, type: ['SSD', 'NVMe SSD'] },
            motherboard: { keywords: ['H610', 'B660', 'A520', 'B550'] },
            psu: { minWattage: 400 },
            case: { keywords: ['Micro ATX', 'Mini Tower'] }
        },
        budgetAllocation: { cpu: 0.27, gpu: 0.08, ram: 0.13, storage: 0.20, motherboard: 0.15, psu: 0.09, case: 0.08 }
    },
];

// ============================================
// 2. MA TRẬN TƯƠNG THÍCH LINH KIỆN
// ============================================
// Dữ liệu này giúp AI kiểm tra các linh kiện có hoạt động
// cùng nhau được không (socket, RAM type, form factor...)
const COMPATIBILITY_RULES = {
    // CPU Socket ↔ Motherboard Socket
    socketMapping: {
        'LGA1700': ['B660', 'H670', 'B760', 'H770', 'Z690', 'Z790'],
        'LGA1200': ['B460', 'H470', 'B560', 'H570', 'Z490', 'Z590'],
        'AM5': ['B650', 'B650E', 'X670', 'X670E'],
        'AM4': ['B450', 'B550', 'X470', 'X570', 'A520'],
    },

    // RAM Type ↔ Motherboard/CPU
    ramCompatibility: {
        'DDR5': {
            sockets: ['LGA1700', 'AM5'],
            motherboards: ['B760', 'Z790', 'B650', 'B650E', 'X670', 'X670E']
        },
        'DDR4': {
            sockets: ['LGA1700', 'LGA1200', 'AM4', 'AM5'],
            motherboards: ['B660', 'H670', 'Z690', 'B460', 'H470', 'B560', 'Z490', 'Z590', 'B450', 'B550', 'X470', 'X570', 'A520', 'B650']
        }
    },

    // GPU Power Requirements → PSU wattage tối thiểu
    gpuPowerRequirements: {
        'GT 1030': 300,
        'GTX 1650': 350,
        'RTX 3060': 550,
        'RTX 4060': 550,
        'RTX 4060 Ti': 600,
        'RTX 4070': 650,
        'RTX 4070 Ti': 700,
        'RTX 4070 Ti SUPER': 700,
        'RTX 4080': 750,
        'RTX 4080 SUPER': 750,
        'RTX 4090': 850,
        'RX 7600': 550,
        'RX 7700 XT': 650,
        'RX 7800 XT': 700,
        'RX 7900 XT': 750,
        'RX 7900 XTX': 800,
    },

    // Form Factor compatibility
    formFactorRules: {
        'ATX': ['ATX', 'Full Tower', 'Mid Tower'],
        'Micro ATX': ['Micro ATX', 'Mid Tower', 'Mini Tower'],
        'Mini ITX': ['Mini ITX', 'Mini Tower'],
    }
};

// ============================================
// 3. TỪ ĐIỂN MỤC ĐÍCH SỬ DỤNG (MỞ RỘNG)
// ============================================
// Dạy AI nhận diện mục đích từ mô tả người dùng
// Mỗi từ khóa có trọng số (weight) khác nhau
const PURPOSE_DICTIONARY = {
    gaming: {
        label: 'Gaming',
        keywords: [
            { word: 'game', weight: 3 },
            { word: 'gaming', weight: 5 },
            { word: 'chơi game', weight: 5 },
            { word: 'fps', weight: 4 },
            { word: 'esport', weight: 4 },
            { word: 'stream', weight: 3 },
            { word: 'streaming', weight: 3 },
            { word: 'pubg', weight: 4 },
            { word: 'valorant', weight: 4 },
            { word: 'lol', weight: 3 },
            { word: 'league', weight: 3 },
            { word: 'gta', weight: 4 },
            { word: 'cyberpunk', weight: 4 },
            { word: 'giải trí', weight: 2 },
            { word: '4k', weight: 3 },
            { word: '2k', weight: 2 },
            { word: '144hz', weight: 3 },
            { word: '240hz', weight: 4 },
            { word: 'ray tracing', weight: 4 },
            { word: 'card đồ họa mạnh', weight: 4 },
            { word: 'gpu mạnh', weight: 4 },
            { word: 'vga', weight: 2 },
        ]
    },
    'do-hoa': {
        label: 'Đồ họa / Render',
        keywords: [
            { word: 'đồ họa', weight: 5 },
            { word: 'đồ hoạ', weight: 5 },
            { word: 'render', weight: 5 },
            { word: 'rendering', weight: 5 },
            { word: 'video', weight: 3 },
            { word: 'premiere', weight: 5 },
            { word: 'after effects', weight: 5 },
            { word: 'after effect', weight: 5 },
            { word: 'photoshop', weight: 4 },
            { word: 'blender', weight: 5 },
            { word: '3d', weight: 4 },
            { word: '3ds max', weight: 5 },
            { word: 'maya', weight: 5 },
            { word: 'cinema 4d', weight: 5 },
            { word: 'dựng phim', weight: 5 },
            { word: 'edit video', weight: 4 },
            { word: 'chỉnh sửa video', weight: 4 },
            { word: 'thiết kế', weight: 4 },
            { word: 'design', weight: 3 },
            { word: 'autocad', weight: 4 },
            { word: 'illustrator', weight: 4 },
            { word: 'lightroom', weight: 3 },
            { word: 'figma', weight: 3 },
            { word: 'sketchup', weight: 4 },
            { word: 'solidworks', weight: 5 },
            { word: 'revit', weight: 4 },
            { word: 'kiến trúc', weight: 4 },
            { word: 'animation', weight: 4 },
            { word: 'motion graphic', weight: 4 },
            { word: 'davinci', weight: 4 },
        ]
    },
    'van-phong': {
        label: 'Văn phòng',
        keywords: [
            { word: 'văn phòng', weight: 5 },
            { word: 'office', weight: 5 },
            { word: 'word', weight: 3 },
            { word: 'excel', weight: 3 },
            { word: 'powerpoint', weight: 3 },
            { word: 'email', weight: 3 },
            { word: 'làm việc', weight: 3 },
            { word: 'công ty', weight: 4 },
            { word: 'kế toán', weight: 4 },
            { word: 'hành chính', weight: 4 },
            { word: 'họp online', weight: 3 },
            { word: 'zoom', weight: 2 },
            { word: 'teams', weight: 2 },
            { word: 'google docs', weight: 3 },
            { word: 'lướt web', weight: 3 },
            { word: 'nhẹ nhàng', weight: 3 },
            { word: 'cơ bản', weight: 3 },
            { word: 'đơn giản', weight: 3 },
            { word: 'bền', weight: 2 },
            { word: 'ổn định', weight: 3 },
            { word: 'tiết kiệm điện', weight: 3 },
        ]
    },
    'lap-trinh': {
        label: 'Lập trình',
        keywords: [
            { word: 'lập trình', weight: 5 },
            { word: 'coding', weight: 5 },
            { word: 'code', weight: 4 },
            { word: 'developer', weight: 4 },
            { word: 'dev', weight: 3 },
            { word: 'visual studio', weight: 4 },
            { word: 'vscode', weight: 4 },
            { word: 'intellij', weight: 4 },
            { word: 'docker', weight: 5 },
            { word: 'kubernetes', weight: 5 },
            { word: 'web', weight: 2 },
            { word: 'backend', weight: 3 },
            { word: 'frontend', weight: 3 },
            { word: 'fullstack', weight: 4 },
            { word: 'app', weight: 2 },
            { word: 'phần mềm', weight: 3 },
            { word: 'programming', weight: 4 },
            { word: 'java', weight: 3 },
            { word: 'python', weight: 3 },
            { word: 'nodejs', weight: 3 },
            { word: 'machine learning', weight: 4 },
            { word: 'deep learning', weight: 5 },
            { word: 'ai', weight: 3 },
            { word: 'data science', weight: 4 },
            { word: 'database', weight: 3 },
            { word: 'compile', weight: 4 },
            { word: 'build', weight: 2 },
            { word: 'devops', weight: 4 },
            { word: 'máy ảo', weight: 4 },
            { word: 'virtual machine', weight: 4 },
            { word: 'android studio', weight: 4 },
            { word: 'xcode', weight: 4 },
        ]
    },
    'hoc-tap': {
        label: 'Học tập',
        keywords: [
            { word: 'học', weight: 3 },
            { word: 'học tập', weight: 5 },
            { word: 'sinh viên', weight: 5 },
            { word: 'học sinh', weight: 5 },
            { word: 'nghiên cứu', weight: 4 },
            { word: 'đại học', weight: 4 },
            { word: 'trường', weight: 3 },
            { word: 'bài tập', weight: 4 },
            { word: 'đồ án', weight: 4 },
            { word: 'luận văn', weight: 4 },
            { word: 'thi', weight: 3 },
            { word: 'ôn thi', weight: 4 },
            { word: 'online', weight: 2 },
            { word: 'e-learning', weight: 4 },
            { word: 'học online', weight: 4 },
        ]
    },
    'laptop': {
        label: 'Laptop',
        keywords: [
            { word: 'laptop', weight: 10 },
            { word: 'máy tính xách tay', weight: 10 },
            { word: 'macbook', weight: 10 },
            { word: 'mac', weight: 5 },
            { word: 'vivobook', weight: 8 },
            { word: 'thinkpad', weight: 8 },
            { word: 'legion', weight: 8 },
            { word: 'dell xps', weight: 8 },
            { word: 'văn phòng di động', weight: 6 },
            { word: 'mang đi', weight: 5 },
            { word: 'di chuyển', weight: 5 },
        ]
    }
};

// ============================================
// 4. BẢNG ƯU TIÊN LINH KIỆN THEO MỤC ĐÍCH
// ============================================
// Mỗi mục đích có thứ tự ưu tiên linh kiện khác nhau
// VD: Gaming → GPU là quan trọng nhất, Văn phòng → CPU + Storage
const PRIORITY_ORDERS = {
    gaming: ['gpu', 'cpu', 'ram', 'motherboard', 'storage', 'psu', 'case'],
    'do-hoa': ['cpu', 'gpu', 'ram', 'storage', 'motherboard', 'psu', 'case'],
    'van-phong': ['cpu', 'storage', 'ram', 'motherboard', 'psu', 'case', 'gpu'],
    'lap-trinh': ['cpu', 'ram', 'storage', 'gpu', 'motherboard', 'psu', 'case'],
    'hoc-tap': ['cpu', 'storage', 'ram', 'motherboard', 'psu', 'case', 'gpu'],
    'da-nang': ['cpu', 'gpu', 'ram', 'storage', 'motherboard', 'psu', 'case'],
};

// ============================================
// 5. THÔNG SỐ SO SÁNH HIỆU NĂNG (BENCHMARK DATA)
// ============================================
// Điểm hiệu năng tương đối để so sánh linh kiện cùng loại
const PERFORMANCE_SCORES = {
    cpu: {
        // Intel
        'i3-12100': 45, 'i3-13100': 48,
        'i5-12400': 60, 'i5-12600K': 68,
        'i5-13400': 63, 'i5-13600K': 72,
        'i5-14400': 65, 'i5-14600K': 75,
        'i7-12700': 75, 'i7-12700K': 78,
        'i7-13700': 80, 'i7-13700K': 83,
        'i7-14700': 82, 'i7-14700K': 85,
        'i9-13900K': 92, 'i9-14900K': 95,
        // AMD
        'Ryzen 3 3200G': 35, 'Ryzen 3 4100': 40,
        'Ryzen 5 5500': 55, 'Ryzen 5 5600': 58, 'Ryzen 5 5600X': 60,
        'Ryzen 5 7600': 68, 'Ryzen 5 7600X': 70,
        'Ryzen 7 5700X': 72, 'Ryzen 7 5800X': 75,
        'Ryzen 7 7700X': 82, 'Ryzen 7 7800X3D': 88,
        'Ryzen 9 5900X': 85, 'Ryzen 9 7900X': 90,
        'Ryzen 9 7950X': 95,
    },
    gpu: {
        'GT 1030': 10, 'GTX 1650': 30,
        'RTX 3060': 55, 'RTX 3060 Ti': 60,
        'RTX 4060': 62, 'RTX 4060 Ti': 70,
        'RTX 4070': 78, 'RTX 4070 SUPER': 82,
        'RTX 4070 Ti': 85, 'RTX 4070 Ti SUPER': 88,
        'RTX 4080': 90, 'RTX 4080 SUPER': 92,
        'RTX 4090': 100,
        'RX 7600': 55, 'RX 7700 XT': 72,
        'RX 7800 XT': 80, 'RX 7900 XT': 88,
        'RX 7900 XTX': 93,
    }
};

// ============================================
// 6. CÂU TRẢ LỜI AI (AI Response Templates)
// ============================================
// Các mẫu câu trả lời để AI "nói" tự nhiên hơn
const AI_RESPONSES = {
    analysis: {
        gaming: [
            'Tôi nhận thấy bạn cần một cấu hình gaming. GPU sẽ được ưu tiên cao nhất!',
            'Build gaming phải ưu tiên card đồ họa để đạt FPS tốt nhất.',
        ],
        'do-hoa': [
            'Cấu hình đồ họa cần CPU mạnh và RAM lớn để render mượt.',
            'Workstation đồ họa nên đầu tư vào CPU đa nhân và GPU chuyên dụng.',
        ],
        'van-phong': [
            'Cấu hình văn phòng ưu tiên ổn định, bền bỉ và tiết kiệm.',
            'PC văn phòng không cần card đồ họa rời, tập trung vào CPU và SSD.',
        ],
        'lap-trinh': [
            'Lập trình cần RAM lớn và CPU đa nhân để compile nhanh.',
            'Developer nên đầu tư vào RAM và SSD để chạy Docker/VM mượt.',
        ],
        'hoc-tap': [
            'Cấu hình học tập cần ổn định, đủ mạnh cho các tác vụ cơ bản.',
            'PC cho sinh viên nên cân bằng hiệu năng và ngân sách.',
        ],
    },
    compatibility: {
        perfect: '✅ Tất cả linh kiện hoàn toàn tương thích!',
        warning: '⚠️ Một số linh kiện có thể cần kiểm tra thêm tính tương thích.',
        issue: '❌ Phát hiện vấn đề tương thích, đã tự động điều chỉnh.',
    }
};

// ============================================
// EXPORTS
// ============================================
module.exports = {
    BUILD_TEMPLATES,
    COMPATIBILITY_RULES,
    PURPOSE_DICTIONARY,
    PRIORITY_ORDERS,
    PERFORMANCE_SCORES,
    AI_RESPONSES,
};
