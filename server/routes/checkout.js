const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');

router.post('/complete', checkoutController.completeCheckout);
router.get('/tax-rate', checkoutController.getTaxRate);
router.get('/shipping-rate', checkoutController.getShippingRate);

module.exports = router;