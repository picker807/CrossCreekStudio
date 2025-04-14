// controllers/productController.js
const Product = require('../models/product');
const sequenceGenerator = require('../routes/sequence');

const productController = {
  // Public: Get all products for storefront
  getAllProducts: async (req, res) => {
    try {
      const products = await Product.find().sort({ createdAt: -1 }); // Newest first
      res.json(products);
    } catch (err) {
      console.error('Error fetching products:', err);
      res.status(500).json({ message: err.message });
    }
  },

  // Public: Get single product by ID for storefront or cart verification
  getProductById: async (req, res) => {
    try {
      const product = await Product.findOne({ id: req.params.productId});
      if (!product) return res.status(404).json({ message: 'Product not found' });
      res.json(product);
    } catch (err) {
      console.error('Error fetching product:', err);
      res.status(500).json({ message: err.message });
    }
  },

  // Admin: Get all products (full data)
  getAllProductsAdmin: async (req, res) => {
    try {
      const products = await Product.find(); // Full data for admin
      res.json(products);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Admin: Create a new product
  createProduct: async (req, res) => {
    try {
      const { name, price, stock, description, images } = req.body;
      const maxProductId = await sequenceGenerator.nextId("products");
      //console.log('maxProductId:', maxProductId, 'type:', typeof maxProductId);
      const product = new Product({
        id: maxProductId,
        name,
        price,
        stock,
        description,
        images // Array of Cloudflare URLs
      });
      //console.log('Product to save:', product); 
      const newProduct = await product.save();
      res.status(201).json(newProduct);
    } catch (err) {
      console.error('Error creating product:', err);
      res.status(400).json({ message: err.message });
    }
  },

  // Admin: Update an existing product
  updateProduct: async (req, res) => {
    try {
      const { name, price, stock, description, images } = req.body;
      const updatedProduct = await Product.findOneAndUpdate(
        { id: req.params.productId },
        { name, price, stock, description, images, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
      res.json(updatedProduct);
    } catch (err) {
      console.error('Error updating product:', err);
      res.status(400).json({ message: err.message });
    }
  },

  // Admin: Delete a product
  deleteProduct: async (req, res) => {
    try {
      const product = await Product.findOneAndDelete({ id: req.params.productId });
      if (!product) return res.status(404).json({ message: 'Product not found' });
      res.json({ message: 'Product deleted' });
    } catch (err) {
      console.error('Error deleting product:', err);
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = productController;