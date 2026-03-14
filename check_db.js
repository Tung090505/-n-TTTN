const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function checkData() {
    await mongoose.connect(process.env.MONGODB_URI);
    const macs = await Product.find({ 
        $or: [
            { name: /macbook/i },
            { brand: /apple/i },
            { category: /laptop/i }
        ]
    }).select('name brand category price salePrice isActive stock');
    
    console.log('--- LAPTOP PRODUCTS IN DB ---');
    console.log(JSON.stringify(macs, null, 2));
    process.exit(0);
}

checkData();
