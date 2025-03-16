const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, configController.getConfig);
router.put('/', authMiddleware, configController.updateConfig);

module.exports = router;