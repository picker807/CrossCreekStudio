// routes/products.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, superAdminMiddleware } = require('../middleware/auth');

// Public routes (for storefront)
router.get('/', productController.getAllProducts); // Fetch all products for display
router.get('/:id', productController.getProductById); // Fetch single product details

// Admin routes (protected by auth and super admin middleware)
router.post('/', authMiddleware, superAdminMiddleware, productController.createProduct); // Add new product
router.put('/:id', authMiddleware, superAdminMiddleware, productController.updateProduct); // Edit product
router.delete('/:id', authMiddleware, superAdminMiddleware, productController.deleteProduct); // Delete product

module.exports = router;