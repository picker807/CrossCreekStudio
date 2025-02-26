// controllers/cartController.js
const Cart = require('../models/cart');
const Event = require('../models/event');
const Product = require('../models/product');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const cartController = {
  addToCart: [
    body('type').isIn(['event', 'product']),
    body('quantity').isInt({ min: 1 }),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      let cartId = req.headers['x-cart-id'];
      console.log('Received X-Cart-ID:', cartId);
      let cart = cartId ? await Cart.findOne({ cartId }) : null;
      if (!cart) {
        cartId = uuidv4();
        cart = new Cart({ cartId, items: [] });
      }

      const { type, eventId, productId, enrollees, quantity } = req.body;
      const item = { type, quantity };
      if (type === 'event') {
        item.eventId = eventId;
        item.enrollees = enrollees || [];
        item.quantity = enrollees ? enrollees.length : quantity;
      } else {
        item.productId = productId;
      }

      cart.items.push(item);
      cart.updatedAt = new Date();
      await cart.save();
      res.set('X-Cart-ID', cartId);
      const populatedCart = await Cart.findOne({ cartId })
        .populate('items.eventId', 'name date price location')
        .populate('items.productId', 'name price');
      res.json(populatedCart);
    }
  ],

  getCart: async (req, res) => {
    let cartId = req.headers['x-cart-id'];
    let cart = cartId ? await Cart.findOne({ cartId }) : null;
    if (!cart) {
      cartId = uuidv4();
      cart = new Cart({ cartId, items: [] });
      await cart.save();
      res.set('X-Cart-ID', cartId);
    }
    const populatedCart = await Cart.findOne({ cartId })
      .populate('items.eventId', 'name date price location')
      .populate('items.productId', 'name price');
    res.json(populatedCart || { cartId, items: [] });
  },

  clearCart: async (req, res) => {
    const cartId = req.headers['x-cart-id'];
    if (cartId) await Cart.deleteOne({ cartId });
    res.sendStatus(204);
  }
};

module.exports = cartController;