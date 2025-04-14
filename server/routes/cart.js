const express = require('express');
const router = express.Router();
const { addToCart, updateCart, removeFromCart, getCart, clearCart, checkoutCart } = require('../controllers/cartController');

router.post   ('/add'     , addToCart );
router.post   ('/update'  , updateCart);
router.post   ('/remove'  , removeFromCart);
router.post   ('/checkout', checkoutCart);
router.get    ('/'        , getCart   );
router.delete ('/'        , clearCart );

module.exports = router;