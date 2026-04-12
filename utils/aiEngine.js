

const Product = require('../models/Product');
const {
    BUILD_TEMPLATES,
    COMPATIBILITY_RULES,
    PURPOSE_DICTIONARY,
    PRIORITY_ORDERS,
    PERFORMANCE_SCORES,
    AI_RESPONSES
} = require('./trainingData');

const PC_PARTS = ['cpu', 'gpu', 'ram', 'storage', 'motherboard', 'psu', 'case'];
const PART_LABELS = {
    cpu: 'Bộ xử lý (CPU)',
    gpu: 'Card đồ họa (GPU)',
    ram: 'Bộ nhớ RAM',
    storage: 'Ổ cứng',
    motherboard: 'Bo mạch chủ',
    psu: 'Nguồn (PSU)',
    case: 'Vỏ case'
};

const STOPWORDS_VI = new Set([
    'tôi', 'cần', 'muốn', 'một', 'có', 'và', 'cho', 'với', 'để',
    'của', 'là', 'được', 'các', 'này', 'đó', 'như', 'hay', 'hoặc',
    'thì', 'mà', 'vì', 'nên', 'bị', 'ở', 'từ', 'đến', 'theo',
    'về', 'lại', 'ra', 'vào', 'lên', 'xuống', 'trong', 'ngoài',
    'trên', 'dưới', 'khi', 'nếu', 'thế', 'đây', 'bạn', 'em', 'anh',
    'chị', 'rất', 'quá', 'hơn', 'nhất', 'cũng', 'đã', 'sẽ', 'đang',
    'còn', 'không', 'những', 'nhưng', 'tuy', 'mặc', 'dù', 'hết',
    'lắm', 'nhiều', 'ít', 'vài', 'máy', 'tính', 'máy tính', 'pc',
    'bộ', 'con', 'cái', 'chiếc', 'giúp', 'giùm', 'hộ', 'cho mình'
]);

function tokenize(text) {
    return text
        .toLowerCase()
        .normalize('NFC')
        .replace(/[^\w\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 1 && !STOPWORDS_VI.has(w));
}

function computeTF(tokens) {
    const tf = {};
    const totalTokens = tokens.length;
    if (totalTokens === 0) return tf;

    tokens.forEach(token => {
        tf[token] = (tf[token] || 0) + 1;
    });

    Object.keys(tf).forEach(token => {
        tf[token] = tf[token] / totalTokens;
    });

    return tf;
}

function computeIDF(documents) {
    const idf = {};
    const N = documents.length;
    const df = {}; 

    documents.forEach(doc => {
        const uniqueTokens = new Set(doc);
        uniqueTokens.forEach(token => {
            df[token] = (df[token] || 0) + 1;
        });
    });

    Object.keys(df).forEach(token => {
        idf[token] = Math.log(N / df[token]) + 1; 
    });

    return idf;
}

function computeTFIDF(tokens, idf) {
    const tf = computeTF(tokens);
    const tfidf = {};

    Object.keys(tf).forEach(token => {
        tfidf[token] = tf[token] * (idf[token] || 1);
    });

    return tfidf;
}

function cosineSimilarity(vecA, vecB) {
    const allKeys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    allKeys.forEach(key => {
        const a = vecA[key] || 0;
        const b = vecB[key] || 0;
        dotProduct += a * b;
        normA += a * a;
        normB += b * b;
    });

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (normA * normB);
}

function analyzeDescription(description) {
    const text = description.toLowerCase().trim();
    const tokens = tokenize(text);

    const result = {
        purpose: 'da-nang',
        purposeLabel: 'Đa năng',
        budget: null,
        budgetTier: 'mid',
        priorities: [],
        detectedKeywords: [],
        confidenceScore: 0,
        aiResponse: '',
        tokenCount: tokens.length
    };

    // --- Bước 1: Tính điểm cho từng mục đích dùng Weighted Keywords ---
    const purposeScores = {};

    for (const [purpose, data] of Object.entries(PURPOSE_DICTIONARY)) {
        let score = 0;
        const matchedKeywords = [];

        for (const { word, weight } of data.keywords) {
            // Kiểm tra cả cụm từ và từ đơn
            if (text.includes(word)) {
                score += weight;
                matchedKeywords.push({ word, weight });
            }
        }

        purposeScores[purpose] = { score, matchedKeywords };
    }

    // --- Bước 2: Chọn mục đích có điểm cao nhất ---
    let maxScore = 0;
    for (const [purpose, { score, matchedKeywords }] of Object.entries(purposeScores)) {
        if (score > maxScore) {
            maxScore = score;
            result.purpose = purpose;
            result.purposeLabel = PURPOSE_DICTIONARY[purpose].label;
            result.detectedKeywords = matchedKeywords.map(k => k.word);
        }
    }

    // Tính confidence score (0-100%)
    const maxPossibleScore = PURPOSE_DICTIONARY[result.purpose]?.keywords
        .reduce((sum, k) => sum + k.weight, 0) || 1;
    result.confidenceScore = Math.min(Math.round((maxScore / maxPossibleScore) * 100), 100);

    // --- Bước 3: Trích xuất ngân sách ---
    const budgetPatterns = [
        { regex: /(?:tầm|khoảng|cỡ)*\s*(\d+)\s*(?:triệu|tr\b|củ)/i, multiplier: 1000000 },
        { regex: /(?:budget|ngân sách|giá)\s*(?:tầm|khoảng|cỡ)*\s*(\d+)\s*(?:triệu|tr\b|củ|)/i, multiplier: 1000000 },
        { regex: /(\d+)\s*(?:triệu|tr\b|củ)/i, multiplier: 1000000 },
        { regex: /dưới\s*(\d+)\s*(?:triệu|tr\b|củ)/i, multiplier: 1000000 },
        { regex: /(\d+)[.,](\d{3})[.,](\d{3})/, multiplier: 1 },
    ];

    for (const { regex, multiplier } of budgetPatterns) {
        const match = text.match(regex);
        if (match) {
            // Lấy group đầu tiên bắt được số
            const numStr = match[1] || match[0];
            if (multiplier === 1) {
                result.budget = parseInt(numStr.replace(/[.,]/g, ''));
            } else {
                result.budget = parseInt(numStr) * multiplier;
            }
            break;
        }
    }

    // Ngân sách mặc định theo mục đích
    if (!result.budget) {
        const defaultBudgets = {
            gaming: 25000000, 'do-hoa': 30000000, 'van-phong': 12000000,
            'lap-trinh': 20000000, 'hoc-tap': 15000000, 'da-nang': 20000000,
            'laptop': 15000000
        };
        result.budget = defaultBudgets[result.purpose];
    }

    if (result.budget <= 12000000) result.budgetTier = 'entry';
    else if (result.budget <= 25000000) result.budgetTier = 'mid';
    else if (result.budget <= 40000000) result.budgetTier = 'high';
    else result.budgetTier = 'ultra';

    if (text.match(/mạnh|cao cấp|high.?end|hiệu năng cao|flagship|máy khỏe|cấu hình tốt/)) {
        result.priorities.push('performance');
    }
    if (text.match(/rẻ|tiết kiệm|giá rẻ|bình dân|budget|phải chăng|giá tốt/)) {
        result.priorities.push('budget-friendly');
    }
    if (text.match(/bền|ổn định|lâu dài|bảo hành|tin cậy/)) {
        result.priorities.push('reliability');
    }
    if (text.match(/đẹp|rgb|led|thẩm mỹ|cool|ngầu/)) {
        result.priorities.push('aesthetics');
    }
    if (text.match(/im|quiet|silent|yên tĩnh|êm|không ồn/)) {
        result.priorities.push('quiet');
    }

    const responses = AI_RESPONSES.analysis[result.purpose] || AI_RESPONSES.analysis['hoc-tap'];
    result.aiResponse = responses[Math.floor(Math.random() * responses.length)];

    const hardwarePatterns = [
        'rtx 4090', 'rtx 4080', 'rtx 4070', 'rtx 4060', 'rtx 40',
        'rtx 3090', 'rtx 3080', 'rtx 3070', 'rtx 3060', 'rtx 3050', 'rtx 30',
        'gtx 1660', 'gtx 1650', 'gtx 1050', 'gtx',
        'rx 7900', 'rx 7800', 'rx 7700', 'rx 7600', 'rx 7000',
        'rx 6900', 'rx 6800', 'rx 6700', 'rx 6600', 'rx 6000',
        'i9', 'i7', 'i5', 'i3',
        'ryzen 9', 'ryzen 7', 'ryzen 5', 'ryzen 3'
    ];
    result.detectedDeviceModels = [];
    hardwarePatterns.forEach(model => {
        if (text.includes(model)) {
            result.detectedDeviceModels.push(model);
        }
    });

    const brands = ['apple', 'macbook', 'asus', 'msi', 'gigabyte', 'hp', 'dell', 'acer', 'lenovo', 'razer', 'intel', 'amd', 'nvidia'];
    result.requestedBrands = [];
     brands.forEach(brand => {
        if (text.includes(brand)) {
            result.requestedBrands.push(brand);
        }
    });

    return result;
}

function findBestTemplate(purpose, budget) {
    let bestTemplate = null;
    let bestScore = -1;

    for (const template of BUILD_TEMPLATES) {
        if (template.purpose !== purpose) continue;

        let score = 0;

        if (budget >= template.budgetRange.min && budget <= template.budgetRange.max) {
            score += 50; 
        } else {
            
            const midBudget = (template.budgetRange.min + template.budgetRange.max) / 2;
            const distance = Math.abs(budget - midBudget) / midBudget;
            score += Math.max(0, 30 - distance * 30);
        }

        if (score > bestScore) {
            bestScore = score;
            bestTemplate = template;
        }
    }

    if (!bestTemplate) {
        bestTemplate = BUILD_TEMPLATES.find(t => t.purpose === 'gaming' && t.tier === 'mid');
    }

    return bestTemplate;
}

function scoreProduct(product, budgetForPart, template, category, userTokens, idf) {
    const actualPrice = product.salePrice || product.price;
    let totalScore = 0;
    const scoreBreakdown = {};

    const priceRatio = actualPrice / budgetForPart;
    let priceScore = 0;
    if (priceRatio >= 0.7 && priceRatio <= 1.0) {
        priceScore = 30; 
    } else if (priceRatio > 1.0 && priceRatio <= 1.3) {
        priceScore = 30 - (priceRatio - 1) * 50; 
    } else if (priceRatio >= 0.5 && priceRatio < 0.7) {
        priceScore = 20; 
    } else if (priceRatio > 1.3) {
        priceScore = 5; 
    } else {
        priceScore = 10; 
    }
    scoreBreakdown.price = Math.max(0, priceScore);
    totalScore += scoreBreakdown.price;

    let keywordScore = 0;
    if (template && template.idealSpecs[category]) {
        const idealSpec = template.idealSpecs[category];
        const productText = `${product.name} ${product.brand} ${JSON.stringify(product.specifications || {})}`.toLowerCase();

        if (idealSpec.brands && idealSpec.brands.length > 0) {
            if (idealSpec.brands.some(b => productText.includes(b.toLowerCase()))) {
                keywordScore += 5;
            }
        }

        if (idealSpec.keywords) {
            const matchCount = idealSpec.keywords.filter(k => productText.includes(k.toLowerCase())).length;
            keywordScore += Math.min(matchCount * 5, 15);
        }

        const specs = product.specifications || {};
        if (idealSpec.minCores && specs.cores >= idealSpec.minCores) keywordScore += 5;
        if (idealSpec.minVram && specs.vram >= idealSpec.minVram) keywordScore += 5;
        if (idealSpec.minCapacity && specs.capacity >= idealSpec.minCapacity) keywordScore += 5;
        if (idealSpec.minWattage && specs.wattage >= idealSpec.minWattage) keywordScore += 5;
    }
    scoreBreakdown.keyword = Math.min(keywordScore, 25);
    totalScore += scoreBreakdown.keyword;

    const ratingScore = (product.rating || 0) * 3; 
    scoreBreakdown.rating = Math.min(ratingScore, 15);
    totalScore += scoreBreakdown.rating;

    const soldScore = Math.min((product.sold || 0) / 10, 10);
    scoreBreakdown.popularity = soldScore;
    totalScore += scoreBreakdown.popularity;

    let perfScore = 0;
    if (PERFORMANCE_SCORES[category]) {
        const productText = product.name.toLowerCase();
        for (const [model, score] of Object.entries(PERFORMANCE_SCORES[category])) {
            if (productText.includes(model.toLowerCase())) {
                perfScore = (score / 100) * 15;
                break;
            }
        }
    }
    scoreBreakdown.performance = perfScore;
    totalScore += scoreBreakdown.performance;

    if (userTokens && idf) {
        const productTokens = tokenize(`${product.name} ${product.description || ''} ${product.brand}`);
        const userVec = computeTFIDF(userTokens, idf);
        const productVec = computeTFIDF(productTokens, idf);
        const similarity = cosineSimilarity(userVec, productVec);

        let brandBonus = 0;
        const userText = userTokens.join(' ');
        if (userText.includes(product.brand.toLowerCase())) {
            brandBonus = 15;
        } else if (product.brand.toLowerCase() === 'apple' && (userText.includes('macbook') || userText.includes('mac'))) {
            brandBonus = 15;
        }

        scoreBreakdown.textSimilarity = (similarity * 5) + brandBonus;
        totalScore += scoreBreakdown.textSimilarity;
    }

    if (product.salePrice && product.salePrice < product.price) {
        const discount = ((product.price - product.salePrice) / product.price) * 100;
        scoreBreakdown.saleBonus = Math.min(discount / 10, 5);
        totalScore += scoreBreakdown.saleBonus;
    }

    // --- Bonus đặc biệt: Khớp trực tiếp mã linh kiện người dùng yêu cầu ---
    if (userTokens && userTokens.length > 0) {
        const fullDesc = userTokens.join(' ').toLowerCase();
        let hardwareMatchBonus = 0;
        const productNameLower = product.name.toLowerCase();

        const hardwareModels = [
            'rtx 4090', 'rtx 4080', 'rtx 4070', 'rtx 4060', 'rtx 40',
            'rtx 3090', 'rtx 3080', 'rtx 3070', 'rtx 3060', 'rtx 30',
            'gtx 1660', 'gtx 1650', 'i9', 'i7', 'i5', 'i3',
            'ryzen 9', 'ryzen 7', 'ryzen 5', 'ryzen 3'
        ];

        for (const model of hardwareModels) {
            if (fullDesc.includes(model) && productNameLower.includes(model)) {
                hardwareMatchBonus = 50; // Bonus cực mạnh để ghi đè các yếu tố khác
                break;
            }
        }
        scoreBreakdown.hardwareMatch = hardwareMatchBonus;
        totalScore += hardwareMatchBonus;
    }

    return {
        score: Math.round(totalScore * 100) / 100,
        breakdown: scoreBreakdown,
        maxPossible: 100
    };
}

function checkCompatibility(config) {
    const result = {
        compatible: true,
        issues: [],
        warnings: [],
        message: AI_RESPONSES.compatibility.perfect
    };

    const parts = {};
    for (const [part, info] of Object.entries(config)) {
        parts[part] = info.product;
    }

    if (parts.cpu && parts.motherboard) {
        const cpuSpecs = parts.cpu.specifications || {};
        const mbText = parts.motherboard.name.toLowerCase();
        const cpuSocket = cpuSpecs.socket;

        if (cpuSocket && COMPATIBILITY_RULES.socketMapping[cpuSocket]) {
            const compatibleChipsets = COMPATIBILITY_RULES.socketMapping[cpuSocket];
            const hasMatch = compatibleChipsets.some(chip => mbText.includes(chip.toLowerCase()));
            if (!hasMatch) {
                result.warnings.push(
                    `Socket CPU (${cpuSocket}) có thể không tương thích với mainboard. Nên kiểm tra lại.`
                );
            }
        }
    }

    if (parts.ram && parts.motherboard) {
        const ramSpecs = parts.ram.specifications || {};
        const ramType = ramSpecs.type;
        const mbText = parts.motherboard.name.toLowerCase();

        if (ramType && COMPATIBILITY_RULES.ramCompatibility[ramType]) {
            const compatibleMBs = COMPATIBILITY_RULES.ramCompatibility[ramType].motherboards;
            const hasMatch = compatibleMBs.some(mb => mbText.includes(mb.toLowerCase()));
            if (!hasMatch) {
                result.warnings.push(
                    `RAM ${ramType} có thể không tương thích với mainboard. Nên kiểm tra lại.`
                );
            }
        }
    }

    if (parts.gpu && parts.psu) {
        const gpuName = parts.gpu.name;
        const psuSpecs = parts.psu.specifications || {};
        const psuWattage = psuSpecs.wattage || 0;

        for (const [gpuModel, requiredWattage] of Object.entries(COMPATIBILITY_RULES.gpuPowerRequirements)) {
            if (gpuName.toLowerCase().includes(gpuModel.toLowerCase())) {
                if (psuWattage > 0 && psuWattage < requiredWattage) {
                    result.warnings.push(
                        `GPU ${gpuModel} cần nguồn tối thiểu ${requiredWattage}W, PSU hiện tại chỉ ${psuWattage}W.`
                    );
                }
                break;
            }
        }
    }

    if (result.issues.length > 0) {
        result.compatible = false;
        result.message = AI_RESPONSES.compatibility.issue;
    } else if (result.warnings.length > 0) {
        result.message = AI_RESPONSES.compatibility.warning;
    }

    return result;
}

async function findBestProduct(category, budgetForPart, template, userTokens, idf, priorities = []) {
    
    const products = await Product.find({
        category: category,
        isActive: true,
        stock: { $gt: 0 }
    })
        .sort({ rating: -1, sold: -1 })
        .limit(50)
        .select('name slug thumbnail price salePrice rating numReviews stock sold brand specifications category description');

    if (products.length === 0) return null;

    const scoredProducts = products.map(product => {
        const scoring = scoreProduct(product, budgetForPart, template, category, userTokens, idf);

        if (priorities.includes('budget-friendly')) {
            const actualPrice = product.salePrice || product.price;
            if (actualPrice <= budgetForPart) scoring.score += 5;
        }
        if (priorities.includes('performance')) {
            scoring.score += (scoring.breakdown.performance || 0) * 0.3;
        }

        return {
            product,
            score: scoring.score,
            breakdown: scoring.breakdown,
            actualPrice: product.salePrice || product.price
        };
    });

    scoredProducts.sort((a, b) => b.score - a.score);

    const best = scoredProducts[0];
    return {
        product: best.product,
        score: best.score,
        breakdown: best.breakdown,
        alternatives: scoredProducts.slice(1, 4).map(s => ({
            product: s.product,
            score: s.score
        }))
    };
}

async function buildPCFromDescription(description) {
    // 1. Phân tích mô tả (Purpose, Budget, Priorities)
    const analysis = analyzeDescription(description);
    const userTokens = tokenize(description);

    // 2. Lấy templates và chuẩn bị IDF
    const template = findBestTemplate(analysis.purpose, analysis.budget);
    const allProducts = await Product.find({ isActive: true }).select('name description brand');
    const documents = allProducts.map(p => tokenize(`${p.name} ${p.description || ''} ${p.brand}`));
    documents.push(userTokens);
    const idf = computeIDF(documents);

    // 3. Xử lý trường hợp Laptop (Nếu được yêu cầu)
    const isLaptopRequested = analysis.purpose === 'laptop' ||
        description.toLowerCase().includes('laptop') ||
        description.toLowerCase().includes('macbook') ||
        description.toLowerCase().includes('máy tính xách tay');

    if (isLaptopRequested) {
        const result = await findBestProduct(
            'laptop', analysis.budget, template, userTokens, idf, analysis.priorities
        );

        if (result) {
            const actualPrice = result.product.salePrice || result.product.price;
            return {
                success: true,
                isLaptop: true,
                analysis: {
                    ...analysis,
                    aiResponse: 'Tôi đã tìm thấy mẫu laptop tối ưu nhất cho nhu cầu của bạn:',
                },
                config: {
                    laptop: {
                        product: result.product,
                        budgetAllocated: analysis.budget,
                        actualPrice: actualPrice,
                        label: 'Laptop',
                        score: result.score,
                        scoreBreakdown: result.breakdown,
                        alternatives: result.alternatives || []
                    }
                },
                totalPrice: actualPrice,
                budgetDifference: analysis.budget - actualPrice,
                partsCount: 1,
                totalParts: 1
            };
        }
        return {
            success: false,
            message: `Rất tiếc, TechStore hiện không có mẫu Laptop nào phù hợp với ngân sách ${analysis.budget.toLocaleString('vi-VN')}đ. Hãy thử tăng ngân sách hoặc chuyển sang PC để bàn.`
        };
    }

    // 4. LOGIC BUILD PC THÔNG MINH (Dynamic Budget Rollover)
    const config = {};
    let totalPrice = 0;
    const unavailableParts = [];
    const priorityOrder = PRIORITY_ORDERS[analysis.purpose] || PC_PARTS;
    
    // Phân bổ ngân sách ban đầu từ template
    const allocation = template ? { ...template.budgetAllocation } : {
        cpu: 0.22, gpu: 0.25, ram: 0.13, storage: 0.13,
        motherboard: 0.12, psu: 0.08, case: 0.07
    };

    // Ngân sách còn lại thực tế
    let actualRemainingBudget = analysis.budget;

    for (let i = 0; i < priorityOrder.length; i++) {
        const part = priorityOrder[i];
        
        // Tính % trọng số còn lại của các linh kiện chưa chọn
        const remainingParts = priorityOrder.slice(i);
        const totalWeightRemaining = remainingParts.reduce((sum, p) => sum + (allocation[p] || 0.1), 0);
        
        // Ngân sách dự kiến cho linh kiện này (dựa trên % trọng số trong số tiền CÒN LẠI)
        const myWeight = (allocation[part] || 0.1) / totalWeightRemaining;
        let budgetForThisPart = actualRemainingBudget * myWeight;

        // "THAM LAM": Với GPU/CPU trong Gaming/Đồ họa, cho phép lấn sang ngân sách khác một chút nếu cần
        if (['gpu', 'cpu'].includes(part) && (analysis.purpose === 'gaming' || analysis.purpose === 'do-hoa')) {
            budgetForThisPart *= 1.15; // Ưu tiên linh kiện lõi mạnh hơn
        }

        const result = await findBestProduct(
            part, budgetForThisPart, template, userTokens, idf, analysis.priorities
        );

        if (result) {
            const actualPrice = result.product.salePrice || result.product.price;
            config[part] = {
                product: result.product,
                budgetAllocated: Math.round(budgetForThisPart),
                actualPrice: actualPrice,
                label: PART_LABELS[part],
                score: result.score,
                scoreBreakdown: result.breakdown,
                alternatives: result.alternatives || []
            };
            totalPrice += actualPrice;
            actualRemainingBudget -= actualPrice;
        } else {
            unavailableParts.push({
                category: part,
                label: PART_LABELS[part],
                budgetAllocated: Math.round(budgetForThisPart)
            });
        }
    }

    // 5. Kiểm tra tương tính và trả về
    const compatibility = checkCompatibility(config);
    
    // Nếu vượt ngân sách quá 10%, thử "cảnh báo" hoặc gợi ý
    const isOverBudget = totalPrice > analysis.budget * 1.1;

    return {
        success: true,
        analysis: {
            ...analysis,
            aiResponse: isOverBudget 
                ? 'Tôi đã tối ưu hiệu năng tối đa, mặc dù có hơi vượt ngân sách một chút nhưng đây là cấu hình đáng tiền nhất:' 
                : analysis.aiResponse,
        },
        config,
        unavailableParts,
        compatibility,
        totalPrice,
        budgetDifference: analysis.budget - totalPrice,
        partsCount: Object.keys(config).length,
        totalParts: PC_PARTS.length
    };
}

async function suggestRemainingParts(selectedParts, purpose = 'da-nang', totalBudget = 20000000) {
    const template = findBestTemplate(purpose, totalBudget);
    const allocation = template ? template.budgetAllocation : {
        cpu: 0.22, gpu: 0.25, ram: 0.13, storage: 0.13,
        motherboard: 0.12, psu: 0.08, case: 0.07
    };

    const selectedProducts = {};
    let spentBudget = 0;

    for (const [part, productId] of Object.entries(selectedParts)) {
        if (productId && PC_PARTS.includes(part)) {
            const product = await Product.findById(productId)
                .select('name slug thumbnail price salePrice rating numReviews stock sold brand specifications category description');
            if (product) {
                const actualPrice = product.salePrice || product.price;
                selectedProducts[part] = {
                    product,
                    actualPrice,
                    label: PART_LABELS[part],
                    isSelected: true,
                    score: 100 
                };
                spentBudget += actualPrice;
            }
        }
    }

    const allProducts = await Product.find({ isActive: true }).select('name description brand');
    const documents = allProducts.map(p => tokenize(`${p.name} ${p.description || ''} ${p.brand}`));
    const idf = computeIDF(documents);

    const remainingBudget = Math.max(totalBudget - spentBudget, 0);
    const missingParts = PC_PARTS.filter(part => !selectedProducts[part]);
    const totalMissingWeight = missingParts.reduce((sum, part) => sum + (allocation[part] || 0.1), 0);

    const suggestedProducts = {};
    const unavailableParts = [];
    let suggestedTotal = 0;

    for (const part of missingParts) {
        const partWeight = (allocation[part] || 0.1) / totalMissingWeight;
        const budgetForPart = remainingBudget * partWeight;

        const result = await findBestProduct(part, budgetForPart, template, null, idf);

        if (result) {
            const actualPrice = result.product.salePrice || result.product.price;
            suggestedProducts[part] = {
                product: result.product,
                actualPrice,
                budgetAllocated: Math.round(budgetForPart),
                label: PART_LABELS[part],
                isSelected: false,
                score: result.score,
                alternatives: result.alternatives || []
            };
            suggestedTotal += actualPrice;
        } else {
            unavailableParts.push({
                category: part,
                label: PART_LABELS[part],
                budgetAllocated: Math.round(budgetForPart)
            });
        }
    }

    const fullConfig = { ...selectedProducts, ...suggestedProducts };
    const compatibility = checkCompatibility(fullConfig);
    const totalPrice = spentBudget + suggestedTotal;

    return {
        success: true,
        purpose,
        purposeLabel: PURPOSE_DICTIONARY[purpose]?.label || 'Đa năng',
        totalBudget,
        spentBudget,
        remainingBudget,
        config: fullConfig,
        compatibility,
        selectedCount: Object.keys(selectedProducts).length,
        suggestedCount: Object.keys(suggestedProducts).length,
        unavailableParts,
        totalPrice,
        budgetDifference: totalBudget - totalPrice,
        templateUsed: template ? template.name : 'Generic',
    };
}

async function getProductsByCategory(category) {
    return await Product.find({ category, isActive: true, stock: { $gt: 0 } })
        .sort({ rating: -1, sold: -1 })
        .limit(50)
        .select('name slug thumbnail price salePrice rating brand specifications');
}

async function getAllPartsForSelection() {
    const result = {};
    for (const part of PC_PARTS) {
        result[part] = {
            label: PART_LABELS[part],
            products: await getProductsByCategory(part)
        };
    }
    return result;
}

module.exports = {
    buildPCFromDescription,
    suggestRemainingParts,
    getProductsByCategory,
    getAllPartsForSelection,
    analyzeDescription,
    checkCompatibility,
    PC_PARTS,
    PART_LABELS,
    
    tokenize,
    computeTF,
    computeIDF,
    computeTFIDF,
    cosineSimilarity,
    scoreProduct,
    findBestTemplate,
};
