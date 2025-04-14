const express = require('express');
const { authMiddleware, superAdminMiddleware } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const router = express.Router();

// Authentication routes
router.post('/login', adminController.login);
router.post('/logout', authMiddleware, adminController.logout);
router.get('/auth-status', adminController.checkAuthStatus);

// Specific routes for the currently authenticated admin
router.get('/current', authMiddleware, adminController.getCurrentAdmin);
router.patch('/change-password', authMiddleware, adminController.changePassword);

// get all orders
/* router.get('/orders', authMiddleware, adminController.getOrders); */

// Admin management routes (protected by auth and super admin middleware)
router.get('/:id', authMiddleware, superAdminMiddleware, adminController.getAdminById);
router.get('/', authMiddleware, superAdminMiddleware, adminController.getAllAdmins);
router.post('/', authMiddleware, superAdminMiddleware, adminController.createAdmin);
router.put('/:id', authMiddleware, superAdminMiddleware, adminController.updateAdmin);
router.patch('/:id', authMiddleware, superAdminMiddleware, adminController.updateAdmin);
router.delete('/:id', authMiddleware, superAdminMiddleware, adminController.deleteAdmin);

// Order management routes (protected by auth only—assume all admins can view/update)

//router.put('/orders/:id/status', authMiddleware, adminController.updateOrderStatus);

module.exports = router;