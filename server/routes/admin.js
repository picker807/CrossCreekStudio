const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const router = express.Router();

router.post('/login', adminController.login);
router.post('/logout', authMiddleware, adminController.logout);
router.get('/auth-status', adminController.checkAuthStatus);
router.get('/', authMiddleware, adminController.getAllAdmins);
router.get('/:id', authMiddleware, adminController.getAdminById);
router.post('/', authMiddleware, adminController.createAdmin);
router.put('/:id', authMiddleware, adminController.updateAdmin);
router.delete('/:id', authMiddleware, adminController.deleteAdmin);


module.exports = router;