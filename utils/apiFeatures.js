

class ApiFeatures {
    
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'minPrice', 'maxPrice', 'price'];
        excludedFields.forEach(field => delete queryObj[field]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in|nin)\b/g, match => `$${match}`);

        const filters = JSON.parse(queryStr);

        const minPrice = this.queryString.price?.gte || this.queryString.minPrice;
        const maxPrice = this.queryString.price?.lte || this.queryString.maxPrice;

        if (minPrice || maxPrice) {
            const priceFilter = {};
            if (minPrice) priceFilter.$gte = parseFloat(minPrice);
            if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);

            filters.$or = [
                { salePrice: priceFilter },
                { salePrice: null, price: priceFilter },
            ];
        }

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

    search() {
        if (this.queryString.search) {
            const searchTerm = this.queryString.search;

            this.query = this.query.find({
                $text: { $search: searchTerm }
            }, {
                score: { $meta: 'textScore' } 
            });
        }
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            
            this.query = this.query.select('-__v -reviews'); 
        }
        return this;
    }

    paginate() {
        const page = parseInt(this.queryString.page, 10) || 1;
        const limit = Math.min(
            parseInt(this.queryString.limit, 10) || 15,
            50 
        );
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        this.pagination = { page, limit, skip };

        return this;
    }
}

module.exports = ApiFeatures;
