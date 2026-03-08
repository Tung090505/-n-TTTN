/**
 * ============================================
 * controllers/aiController.js - CONTROLLER AI BUILD PC
 * ============================================
 * Xử lý các request liên quan đến tính năng
 * AI tự động gợi ý cấu hình máy tính.
 */

const {
    buildPCFromDescription,
    suggestRemainingParts,
    getAllPartsForSelection,
    PC_PARTS,
    PART_LABELS
} = require('../utils/aiEngine');
const { PURPOSE_DICTIONARY } = require('../utils/trainingData');

// ============================================
// RENDER TRANG BUILD PC
// ============================================
exports.getBuildPC = async (req, res, next) => {
    try {
        // Lấy danh sách sản phẩm cho Hybrid Mode dropdown
        const allParts = await getAllPartsForSelection();

        res.render('build-pc', {
            title: 'Xây dựng cấu hình PC | TechStore',
            allParts,
            purposes: PURPOSE_DICTIONARY,
            partLabels: PART_LABELS,
            pcParts: PC_PARTS
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// API: AI MODE - SINH CẤU HÌNH TỪ MÔ TẢ
// ============================================
exports.aiBuildPC = async (req, res, next) => {
    try {
        const { description } = req.body;

        if (!description || description.trim().length < 5) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập mô tả nhu cầu sử dụng (ít nhất 5 ký tự).'
            });
        }

        const result = await buildPCFromDescription(description);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('AI Build PC Error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại.'
        });
    }
};

// ============================================
// API: HYBRID MODE - GỢI Ý LINH KIỆN CÒN LẠI
// ============================================
exports.suggestParts = async (req, res, next) => {
    try {
        const { selectedParts, purpose, budget } = req.body;

        if (!selectedParts || Object.keys(selectedParts).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn ít nhất 1 linh kiện.'
            });
        }

        const totalBudget = budget ? parseInt(budget) : 20000000;
        const result = await suggestRemainingParts(selectedParts, purpose, totalBudget);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Suggest Parts Error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi gợi ý linh kiện. Vui lòng thử lại.'
        });
    }
};
