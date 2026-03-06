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
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'minPrice', 'maxPrice'];
        excludedFields.forEach(field => delete queryObj[field]);

        // Chuyển đổi operators: gte -> $gte, lte -> $lte...
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in|nin)\b/g, match => `$${match}`);

        const filters = JSON.parse(queryStr);

        // --- Lọc theo khoảng giá ---
        // Ưu tiên dùng finalPrice (salePrice nếu có, ngược lại dùng price)
        if (this.queryString.minPrice || this.queryString.maxPrice) {
            const priceFilter = {};
            if (this.queryString.minPrice) priceFilter.$gte = parseFloat(this.queryString.minPrice);
            if (this.queryString.maxPrice) priceFilter.$lte = parseFloat(this.queryString.maxPrice);

            // Lọc theo salePrice hoặc price
            filters.$or = [
                { salePrice: priceFilter },
                { salePrice: null, price: priceFilter },
            ];
        }

        // --- Luôn chỉ hiển thị sản phẩm đang active ---
        filters.isActive = true;

        // --- Lọc tồn kho (nếu yêu cầu) ---
        if (this.queryString.inStock === 'true') {
            filters.stock = { $gt: 0 };
        }

        // --- Lọc thông số kỹ thuật (specifications) ---
        // URL: ?spec_cores=8&spec_socket=AM5
        // -> Lọc specifications.cores = 8 và specifications.socket = 'AM5'
        Object.keys(this.queryString).forEach(key => {
            if (key.startsWith('spec_')) {
                const specField = key.replace('spec_', '');
                filters[`specifications.${specField}`] = this.queryString[key];
                delete filters[key];
            }
        });

        // --- Lọc theo thương hiệu (cho phép nhiều thương hiệu) ---
        // URL: ?brand=Intel,AMD
        if (this.queryString.brand) {
            const brands = this.queryString.brand.split(',').map(b => b.trim());
            if (brands.length > 1) {
                filters.brand = { $in: brands };
            } else {
                filters.brand = { $regex: new RegExp(brands[0], 'i') }; // Case-insensitive
            }
        }

        this.query = this.query.find(filters);
        return this; // Return this để chain methods
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
