// controllers/productController.js
const Product = require('../models/product');

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
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      res.json(product);
    } catch (err) {
      console.error('Error fetching product:', err);
      res.status(500).json({ message: err.message });
    }
  },

  // Admin: Create a new product
  createProduct: async (req, res) => {
    try {
      const { name, price, stock, description, images } = req.body;
      const product = new Product({
        name,
        price,
        stock,
        description,
        images // Array of Cloudflare URLs
      });
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
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
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
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      res.json({ message: 'Product deleted' });
    } catch (err) {
      console.error('Error deleting product:', err);
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = productController;