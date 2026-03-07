/**
 * ============================================
 * utils/apiFeatures.js - BỘ LỌC NÂNG CAO
 * ============================================
 * Class xử lý Advanced Filtering cho MongoDB queries
 * Hỗ trợ: Lọc, Tìm kiếm, Sắp xếp, Chọn trường, Phân trang
 *
 * @example
 * // URL: /api/products?category=cpu&minPrice=2000000&maxPrice=10000000&brand=Intel&sort=-price&page=2
 * const features = new ApiFeatures(Product.find(), req.query)
 *   .filter()
 *   .search()
 *   .sort()
 *   .limitFields()
 *   .paginate();
 * const products = await features.query;
 */

class ApiFeatures {
    /**
     * @param {mongoose.Query} query - Mongoose query object (VD: Product.find())
     * @param {Object} queryString  - Query parameters từ URL (req.query)
     */
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    // ============================================
    // 1. LỌC SẢN PHẨM (FILTERING)
    // ============================================
    /**
     * Lọc sản phẩm theo các tiêu chí:
     * - Danh mục (category)
     * - Thương hiệu (brand)
     * - Khoảng giá (minPrice, maxPrice)
     * - Các thuộc tính kỹ thuật (specifications.*)
     * - Trạng thái (isActive, inStock...)
     *
     * Hỗ trợ MongoDB operators: gte, gt, lte, lt
     * URL: ?price[gte]=1000000&price[lte]=5000000
     */
    filter() {
        // Sao chép query string và loại bỏ các trường đặc biệt
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'minPrice', 'maxPrice', 'price'];
        excludedFields.forEach(field => delete queryObj[field]);

        // Chuyển đổi operators: gte -> $gte, lte -> $lte...
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in|nin)\b/g, match => `$${match}`);

        const filters = JSON.parse(queryStr);

        // --- 1. Lọc theo khoảng giá (Lấy từ price[gte] và price[lte]) ---
        // Ưu tiên dùng salePrice nếu có, ngược lại dùng price
        const minPrice = this.queryString.price?.gte || this.queryString.minPrice;
        const maxPrice = this.queryString.price?.lte || this.queryString.maxPrice;

        if (minPrice || maxPrice) {
            const priceFilter = {};
            if (minPrice) priceFilter.$gte = parseFloat(minPrice);
            if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);

            // Logic: (salePrice thỏa mãn) HOẶC (không có salePrice VÀ price thỏa mãn)
            filters.$or = [
                { salePrice: priceFilter },
                { salePrice: null, price: priceFilter },
            ];
        }

        // --- 2. Lọc theo thương hiệu (Xử lý cả mảng và chuỗi) ---
        if (this.queryString.brand) {
            let brands = this.queryString.brand;
            if (typeof brands === 'string') {
                brands = brands.split(',').map(b => b.trim());
            }

            if (Array.isArray(brands) && brands.length > 0) {
                if (brands.length > 1) {
                    filters.brand = { $in: brands };
                } else {
                    filters.brand = { $regex: new RegExp(brands[0], 'i') };
                }
            }
        }

        // --- 3. Lọc thông số kỹ thuật (specifications) ---
        Object.keys(this.queryString).forEach(key => {
            if (key.startsWith('spec_')) {
                const specField = key.replace('spec_', '');
                filters[`specifications.${specField}`] = this.queryString[key];
            }
        });

        // --- 4. Trạng thái mặc định ---
        filters.isActive = true;

        if (this.queryString.inStock === 'true') {
            filters.stock = { $gt: 0 };
        }

        this.query = this.query.find(filters);
        return this;
    }

    // ============================================
    // 2. TÌM KIẾM FULL-TEXT (SEARCH)
    // ============================================
    /**
     * Tìm kiếm theo từ khóa trong tên, mô tả và tags
     * URL: ?search=rtx 4070
     */
    search() {
        if (this.queryString.search) {
            const searchTerm = this.queryString.search;

            // Sử dụng MongoDB text search (cần tạo text index trước)
            this.query = this.query.find({
                $text: { $search: searchTerm }
            }, {
                score: { $meta: 'textScore' } // Điểm relevance
            });
        }
        return this;
    }

    // ============================================
    // 3. SẮP XẾP (SORTING)
    // ============================================
    /**
     * Sắp xếp kết quả theo các tiêu chí
     * URL: ?sort=price (tăng dần) | ?sort=-price (giảm dần)
     * Nhiều trường: ?sort=-rating,price
     * Mặc định: Sản phẩm mới nhất trước
     */
    sort() {
        if (this.queryString.sort) {
            // Chuyển "price,-rating" thành "price -rating" (MongoDB format)
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            // Mặc định: Mới nhất -> Cũ nhất
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    // ============================================
    // 4. CHỌN TRƯỜNG DỮ LIỆU (FIELD LIMITING)
    // ============================================
    /**
     * Chỉ trả về các trường cần thiết để tối ưu hiệu năng
     * URL: ?fields=name,price,thumbnail,rating
     * Luôn ẩn: __v (internal MongoDB field)
     */
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            // Ẩn trường __v mặc định
            this.query = this.query.select('-__v -reviews'); // Ẩn reviews để giảm data size
        }
        return this;
    }

    // ============================================
    // 5. PHÂN TRANG (PAGINATION)
    // ============================================
    /**
     * Phân trang kết quả
     * URL: ?page=2&limit=12
     * Mặc định: Trang 1, 12 sản phẩm/trang
     * Giới hạn tối đa: 50 sản phẩm/trang
     */
    paginate() {
        const page = parseInt(this.queryString.page, 10) || 1;
        const limit = Math.min(
            parseInt(this.queryString.limit, 10) || 12,
            50 // Giới hạn tối đa để chống abuse
        );
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        // Lưu pagination info để response
        this.pagination = { page, limit, skip };

        return this;
    }
}

module.exports = ApiFeatures;
