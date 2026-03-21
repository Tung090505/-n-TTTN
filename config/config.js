

module.exports = {
    
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRE || '30d',
        cookieExpire: parseInt(process.env.JWT_COOKIE_EXPIRE) || 30, 
    },

    database: {
        uri: process.env.MONGO_URI || 'mongodb://localhost:27017/techstore',
    },

    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, 
        uploadPath: process.env.UPLOAD_PATH || './public/uploads',
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    },

    pagination: {
        defaultLimit: 12,   
        maxLimit: 50,        
    },

    categories: [
        'laptop',
        'pc',
        'cpu',
        'gpu',
        'ram',
        'storage',
        'motherboard',
        'psu',
        'case',
        'cooling',
        'monitor',
        'keyboard',
        'mouse',
        'headset',
    ],

    orderStatus: {
        PENDING: 'pending',       
        CONFIRMED: 'confirmed',     
        PROCESSING: 'processing',    
        SHIPPING: 'shipping',      
        DELIVERED: 'delivered',     
        CANCELLED: 'cancelled',     
        REFUNDED: 'refunded',      
    },

    paymentStatus: {
        UNPAID: 'unpaid',
        PAID: 'paid',
        REFUNDED: 'refunded',
        FAILED: 'failed',
    },

    paymentMethods: {
        COD: 'cod',            
        BANK: 'bank_transfer',  
        MOMO: 'momo',           
        VNPAY: 'vnpay',          
    },

    bcrypt: {
        saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
    },
};
