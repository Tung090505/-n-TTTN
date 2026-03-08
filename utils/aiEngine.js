/**
 * ============================================
 * utils/aiEngine.js - AI ENGINE XÂY CẤU HÌNH PC
 * ============================================
 * Hệ thống AI gợi ý cấu hình máy tính thông minh.
 * 
 * Các thuật toán sử dụng:
 *   1. TF-IDF (Term Frequency - Inverse Document Frequency) → Phân tích văn bản
 *   2. Cosine Similarity → Đo độ tương đồng giữa mô tả và sản phẩm
 *   3. Weighted Scoring → Chấm điểm đa tiêu chí
 *   4. Compatibility Matrix → Kiểm tra tương thích phần cứng
 *   5. Greedy Optimization → Tối ưu phân bổ ngân sách
 * 
 * Dữ liệu training: Đọc từ trainingData.js + sản phẩm trong MongoDB
 */

const Product = require('../models/Product');
const {
    BUILD_TEMPLATES,
    COMPATIBILITY_RULES,
    PURPOSE_DICTIONARY,
    PRIORITY_ORDERS,
    PERFORMANCE_SCORES,
    AI_RESPONSES
} = require('./trainingData');

// ============================================
// CÁC LINH KIỆN CẦN CHO MỘT BỘ PC
// ============================================
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

// ============================================
// THUẬT TOÁN 1: TF-IDF - PHÂN TÍCH VĂN BẢN
// ============================================

/**
 * Tách câu thành các từ (tokenize) và chuẩn hóa
 * Loại bỏ stopwords tiếng Việt
 */
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

/**
 * Tính TF (Term Frequency) - Tần suất xuất hiện của từ trong văn bản
 */
function computeTF(tokens) {
    const tf = {};
    const totalTokens = tokens.length;
    if (totalTokens === 0) return tf;

    tokens.forEach(token => {
        tf[token] = (tf[token] || 0) + 1;
    });

    // Chuẩn hóa: chia cho tổng số từ
    Object.keys(tf).forEach(token => {
        tf[token] = tf[token] / totalTokens;
    });

    return tf;
}

/**
 * Tính IDF (Inverse Document Frequency) từ tập documents
 * IDF = log(N / df) với N = tổng documents, df = số documents chứa từ đó
 */
function computeIDF(documents) {
    const idf = {};
    const N = documents.length;
    const df = {}; // Document frequency

    documents.forEach(doc => {
        const uniqueTokens = new Set(doc);
        uniqueTokens.forEach(token => {
            df[token] = (df[token] || 0) + 1;
        });
    });

    Object.keys(df).forEach(token => {
        idf[token] = Math.log(N / df[token]) + 1; // +1 để smooth
    });

    return idf;
}

/**
 * Tính TF-IDF vector cho một document
 */
function computeTFIDF(tokens, idf) {
    const tf = computeTF(tokens);
    const tfidf = {};

    Object.keys(tf).forEach(token => {
        tfidf[token] = tf[token] * (idf[token] || 1);
    });

    return tfidf;
}

// ============================================
// THUẬT TOÁN 2: COSINE SIMILARITY
// ============================================

/**
 * Tính Cosine Similarity giữa 2 vector TF-IDF
 * cosine(A, B) = (A · B) / (||A|| * ||B||)
 */
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

// ============================================
// THUẬT TOÁN 3: PHÂN TÍCH MÔ TẢ NGƯỜI DÙNG
// (Dùng TF-IDF + Weighted Keywords)
// ============================================

/**
 * Phân tích mô tả người dùng bằng TF-IDF kết hợp PURPOSE_DICTIONARY
 * Trả về: mục đích, ngân sách, ưu tiên, confidence score
 */
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
            'lap-trinh': 20000000, 'hoc-tap': 15000000, 'da-nang': 20000000
        };
        result.budget = defaultBudgets[result.purpose];
    }

    // --- Bước 4: Xác định tier theo ngân sách ---
    if (result.budget <= 12000000) result.budgetTier = 'entry';
    else if (result.budget <= 25000000) result.budgetTier = 'mid';
    else if (result.budget <= 40000000) result.budgetTier = 'high';
    else result.budgetTier = 'ultra';

    // --- Bước 5: Xác định ưu tiên ---
    if (text.match(/mạnh|cao cấp|high.?end|hiệu năng cao|flagship/)) {
        result.priorities.push('performance');
    }
    if (text.match(/rẻ|tiết kiệm|giá rẻ|bình dân|budget|phải chăng/)) {
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

    // --- Bước 6: Chọn câu trả lời AI ---
    const responses = AI_RESPONSES.analysis[result.purpose] || AI_RESPONSES.analysis['hoc-tap'];
    result.aiResponse = responses[Math.floor(Math.random() * responses.length)];

    return result;
}

// ============================================
// THUẬT TOÁN 4: TÌM BUILD TEMPLATE PHÙ HỢP NHẤT
// ============================================

/**
 * Tìm template phù hợp nhất dựa trên purpose + budget
 * Sử dụng Cosine Similarity giữa yêu cầu và template
 */
function findBestTemplate(purpose, budget) {
    let bestTemplate = null;
    let bestScore = -1;

    for (const template of BUILD_TEMPLATES) {
        if (template.purpose !== purpose) continue;

        let score = 0;

        // Check budget nằm trong khoảng
        if (budget >= template.budgetRange.min && budget <= template.budgetRange.max) {
            score += 50; // Match hoàn hảo
        } else {
            // Tính khoảng cách tới budget range (càng gần càng tốt)
            const midBudget = (template.budgetRange.min + template.budgetRange.max) / 2;
            const distance = Math.abs(budget - midBudget) / midBudget;
            score += Math.max(0, 30 - distance * 30);
        }

        if (score > bestScore) {
            bestScore = score;
            bestTemplate = template;
        }
    }

    // Fallback: nếu không tìm được template cho purpose, dùng generic
    if (!bestTemplate) {
        bestTemplate = BUILD_TEMPLATES.find(t => t.purpose === 'gaming' && t.tier === 'mid');
    }

    return bestTemplate;
}

// ============================================
// THUẬT TOÁN 5: WEIGHTED SCORING - CHẤM ĐIỂM SẢN PHẨM
// ============================================

/**
 * Chấm điểm sản phẩm dựa trên nhiều tiêu chí:
 * - Giá so với ngân sách (30%)
 * - Matching keywords với template (25%)
 * - Rating và số đánh giá (15%)
 * - Số lượng bán (10%)
 * - Performance score (15%)
 * - Khuyến mãi (5%)
 */
function scoreProduct(product, budgetForPart, template, category, userTokens, idf) {
    const actualPrice = product.salePrice || product.price;
    let totalScore = 0;
    const scoreBreakdown = {};

    // --- 1. Price Score (30 điểm) ---
    const priceRatio = actualPrice / budgetForPart;
    let priceScore = 0;
    if (priceRatio >= 0.7 && priceRatio <= 1.0) {
        priceScore = 30; // Giá sát budget, tốt nhất
    } else if (priceRatio > 1.0 && priceRatio <= 1.3) {
        priceScore = 30 - (priceRatio - 1) * 50; // Hơi vượt budget
    } else if (priceRatio >= 0.5 && priceRatio < 0.7) {
        priceScore = 20; // Rẻ hơn budget nhiều
    } else if (priceRatio > 1.3) {
        priceScore = 5; // Quá đắt
    } else {
        priceScore = 10; // Quá rẻ
    }
    scoreBreakdown.price = Math.max(0, priceScore);
    totalScore += scoreBreakdown.price;

    // --- 2. Keyword Matching Score (25 điểm) ---
    let keywordScore = 0;
    if (template && template.idealSpecs[category]) {
        const idealSpec = template.idealSpecs[category];
        const productText = `${product.name} ${product.brand} ${JSON.stringify(product.specifications || {})}`.toLowerCase();

        // Check brand
        if (idealSpec.brands && idealSpec.brands.length > 0) {
            if (idealSpec.brands.some(b => productText.includes(b.toLowerCase()))) {
                keywordScore += 5;
            }
        }

        // Check keywords
        if (idealSpec.keywords) {
            const matchCount = idealSpec.keywords.filter(k => productText.includes(k.toLowerCase())).length;
            keywordScore += Math.min(matchCount * 5, 15);
        }

        // Check spec thresholds
        const specs = product.specifications || {};
        if (idealSpec.minCores && specs.cores >= idealSpec.minCores) keywordScore += 5;
        if (idealSpec.minVram && specs.vram >= idealSpec.minVram) keywordScore += 5;
        if (idealSpec.minCapacity && specs.capacity >= idealSpec.minCapacity) keywordScore += 5;
        if (idealSpec.minWattage && specs.wattage >= idealSpec.minWattage) keywordScore += 5;
    }
    scoreBreakdown.keyword = Math.min(keywordScore, 25);
    totalScore += scoreBreakdown.keyword;

    // --- 3. Rating Score (15 điểm) ---
    const ratingScore = (product.rating || 0) * 3; // 0-15
    scoreBreakdown.rating = Math.min(ratingScore, 15);
    totalScore += scoreBreakdown.rating;

    // --- 4. Popularity Score (10 điểm) ---
    const soldScore = Math.min((product.sold || 0) / 10, 10);
    scoreBreakdown.popularity = soldScore;
    totalScore += scoreBreakdown.popularity;

    // --- 5. Performance Score (15 điểm) ---
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

    // --- 6. TF-IDF Similarity với mô tả người dùng (bonus 5 điểm) ---
    if (userTokens && idf) {
        const productTokens = tokenize(`${product.name} ${product.description || ''} ${product.brand}`);
        const userVec = computeTFIDF(userTokens, idf);
        const productVec = computeTFIDF(productTokens, idf);
        const similarity = cosineSimilarity(userVec, productVec);
        scoreBreakdown.textSimilarity = similarity * 5;
        totalScore += scoreBreakdown.textSimilarity;
    }

    // --- 7. Sale Bonus (5 điểm) ---
    if (product.salePrice && product.salePrice < product.price) {
        const discount = ((product.price - product.salePrice) / product.price) * 100;
        scoreBreakdown.saleBonus = Math.min(discount / 10, 5);
        totalScore += scoreBreakdown.saleBonus;
    }

    return {
        score: Math.round(totalScore * 100) / 100,
        breakdown: scoreBreakdown,
        maxPossible: 100
    };
}

// ============================================
// THUẬT TOÁN 6: KIỂM TRA TƯƠNG THÍCH
// ============================================

/**
 * Kiểm tra tính tương thích giữa các linh kiện đã chọn
 * Trả về: { compatible: boolean, issues: [], warnings: [] }
 */
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

    // Check 1: CPU Socket ↔ Motherboard
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

    // Check 2: RAM Type ↔ Motherboard
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

    // Check 3: GPU Power ↔ PSU
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

    // Cập nhật status
    if (result.issues.length > 0) {
        result.compatible = false;
        result.message = AI_RESPONSES.compatibility.issue;
    } else if (result.warnings.length > 0) {
        result.message = AI_RESPONSES.compatibility.warning;
    }

    return result;
}

// ============================================
// HÀM TÌM SẢN PHẨM TỐT NHẤT (NÂNG CẤP)
// ============================================

/**
 * Tìm sản phẩm tốt nhất cho một category
 * Sử dụng Weighted Scoring + Template matching + TF-IDF
 */
async function findBestProduct(category, budgetForPart, template, userTokens, idf, priorities = []) {
    // Lấy sản phẩm từ database
    const products = await Product.find({
        category: category,
        isActive: true,
        stock: { $gt: 0 }
    })
        .sort({ rating: -1, sold: -1 })
        .limit(50)
        .select('name slug thumbnail price salePrice rating numReviews stock sold brand specifications category description');

    if (products.length === 0) return null;

    // Chấm điểm từng sản phẩm
    const scoredProducts = products.map(product => {
        const scoring = scoreProduct(product, budgetForPart, template, category, userTokens, idf);

        // Bonus cho ưu tiên
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

    // Sắp xếp theo điểm giảm dần
    scoredProducts.sort((a, b) => b.score - a.score);

    // Trả về top 1
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

// ============================================
// AI MODE: SINH CẤU HÌNH TỪ MÔ TẢ (NÂNG CẤP)
// ============================================

async function buildPCFromDescription(description) {
    // Bước 1: Phân tích mô tả bằng TF-IDF + Weighted Keywords
    const analysis = analyzeDescription(description);

    // Bước 2: Tìm Build Template phù hợp nhất
    const template = findBestTemplate(analysis.purpose, analysis.budget);

    // Bước 3: Lấy allocation từ template (hoặc fallback)
    const allocation = template ? template.budgetAllocation : {
        cpu: 0.22, gpu: 0.25, ram: 0.13, storage: 0.13,
        motherboard: 0.12, psu: 0.08, case: 0.07
    };

    // Bước 4: Chuẩn bị TF-IDF cho text matching
    const userTokens = tokenize(description);

    // Xây dựng IDF corpus từ tất cả sản phẩm
    const allProducts = await Product.find({ isActive: true })
        .select('name description brand');
    const documents = allProducts.map(p => tokenize(`${p.name} ${p.description || ''} ${p.brand}`));
    documents.push(userTokens); // Thêm mô tả user vào corpus
    const idf = computeIDF(documents);

    // Bước 5: Tìm sản phẩm theo thứ tự ưu tiên
    const priorityOrder = PRIORITY_ORDERS[analysis.purpose] || PC_PARTS;
    const config = {};
    let totalPrice = 0;
    const unavailableParts = [];
    let remainingBudget = analysis.budget;

    for (const part of priorityOrder) {
        const budgetForPart = analysis.budget * allocation[part];

        const result = await findBestProduct(
            part, budgetForPart, template, userTokens, idf, analysis.priorities
        );

        if (result) {
            const actualPrice = result.product.salePrice || result.product.price;
            config[part] = {
                product: result.product,
                budgetAllocated: Math.round(budgetForPart),
                actualPrice: actualPrice,
                label: PART_LABELS[part],
                score: result.score,
                scoreBreakdown: result.breakdown,
                alternatives: result.alternatives || []
            };
            totalPrice += actualPrice;
            remainingBudget -= actualPrice;
        } else {
            unavailableParts.push({
                category: part,
                label: PART_LABELS[part],
                budgetAllocated: Math.round(budgetForPart)
            });
        }
    }

    // Bước 6: Kiểm tra tương thích
    const compatibility = checkCompatibility(config);

    // Bước 7: Tạo response
    return {
        success: true,
        analysis: {
            purpose: analysis.purpose,
            purposeLabel: analysis.purposeLabel,
            budget: analysis.budget,
            budgetTier: analysis.budgetTier,
            detectedKeywords: analysis.detectedKeywords,
            priorities: analysis.priorities,
            confidenceScore: analysis.confidenceScore,
            aiResponse: analysis.aiResponse,
            templateUsed: template ? template.name : 'Generic',
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

// ============================================
// HYBRID MODE: GỢI Ý TỪ LINH KIỆN ĐÃ CHỌN (NÂNG CẤP)
// ============================================

async function suggestRemainingParts(selectedParts, purpose = 'da-nang', totalBudget = 20000000) {
    const template = findBestTemplate(purpose, totalBudget);
    const allocation = template ? template.budgetAllocation : {
        cpu: 0.22, gpu: 0.25, ram: 0.13, storage: 0.13,
        motherboard: 0.12, psu: 0.08, case: 0.07
    };

    // Bước 1: Lấy sản phẩm đã chọn
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
                    score: 100 // User choice = max score
                };
                spentBudget += actualPrice;
            }
        }
    }

    // Bước 2: Build IDF corpus
    const allProducts = await Product.find({ isActive: true }).select('name description brand');
    const documents = allProducts.map(p => tokenize(`${p.name} ${p.description || ''} ${p.brand}`));
    const idf = computeIDF(documents);

    // Bước 3: Tìm sản phẩm cho các linh kiện còn lại
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

    // Bước 4: Gộp và check tương thích
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

// ============================================
// HÀM HỖ TRỢ
// ============================================

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

// ============================================
// EXPORTS
// ============================================
module.exports = {
    buildPCFromDescription,
    suggestRemainingParts,
    getProductsByCategory,
    getAllPartsForSelection,
    analyzeDescription,
    checkCompatibility,
    PC_PARTS,
    PART_LABELS,
    // Export để test riêng
    tokenize,
    computeTF,
    computeIDF,
    computeTFIDF,
    cosineSimilarity,
    scoreProduct,
    findBestTemplate,
};
