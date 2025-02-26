const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');

router.post('/complete', checkoutController.completeCheckout);

module.exports = router;