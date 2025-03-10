const express = require('express');
const router = express.Router();
const { addToCart, updateCart, removeFromCart, getCart, clearCart } = require('../controllers/cartController');

router.post   ('/add'   , addToCart );
router.post   ('/update', updateCart);
router.post   ('/remove', removeFromCart);
router.get    ('/'      , getCart   );
router.delete ('/'      , clearCart );

module.exports = router;