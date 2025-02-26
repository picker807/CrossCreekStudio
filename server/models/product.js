// models/product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id:    { type: String, required: true },
  name:  { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, min: 0 },
  description: String,
  images: [{ type: String }], // Cloudflare URLs
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema, 'products');