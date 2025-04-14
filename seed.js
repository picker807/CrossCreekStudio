// seed.js
require('dotenv').config();

const mongoose = require('mongoose');
const Product = require('./server/models/product');
mongoose.connect(process.env.MONGODB_URI);
const seed = async () => {
  await Product.create([
    { id: '1', name: 'Paint Kit', price: 15.99, stock: 10, images: ['https://example.com/kit.jpg'] },
    { id: '2', name: 'Brush Set', price: 9.99, stock: 20 }
  ]);
  console.log('Seeded');
  mongoose.disconnect();
};
seed();