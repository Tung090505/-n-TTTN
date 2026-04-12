
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../db');

const check = async () => {
    await connectDB();
    const products = await Product.find({}).limit(10).select('name thumbnail');
    console.log(JSON.stringify(products, null, 2));
    process.exit(0);
};

check();
