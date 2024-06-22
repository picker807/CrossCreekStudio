const express = require('express');
const { authMiddleware } = require('../../src/app/core/middleware/auth');
const adminController = require('../controllers/adminController');
const router = express.Router();

router.get('/', authMiddleware, adminController.getAllAdmins);
router.get('/:id', authMiddleware, adminController.getAdminById);
router.post('/', authMiddleware, adminController.createAdmin);
router.put('/:id', authMiddleware, adminController.updateAdmin);
router.delete('/:id', authMiddleware, adminController.deleteAdmin);
router.post('/login', adminController.login);

module.exports = router;