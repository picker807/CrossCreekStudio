const Cart = require('../models/cart');
const Event = require('../models/event');
const Product = require('../models/product');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const cartController = {
  addToCart: [
    body('events').optional().isArray(),
    body('products').optional().isArray(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
      let cartId = req.headers['x-cart-id'];
      let cart = cartId ? await Cart.findOne({ cartId }) : null;
      if (!cart) {
        cartId = uuidv4();
        cart = new Cart({ cartId, items: [{ events: [], products: [] }] });
      }
  
      const { events = [], products = [] } = req.body;
  
      // Convert event sequence IDs to _ids
      const eventItems = await Promise.all(
        events.map(async ({ eventId, quantity, enrollees = [] }) => {
          const event = await Event.findOne({ id: eventId });
          if (!event) throw new Error(`Event ${eventId} not found`);
          return {
            eventId: event._id,
            quantity: quantity !== undefined ? quantity : enrollees.length,
            enrollees
          };
        })
      );
  
      // Convert product sequence IDs to _ids
      const productItems = await Promise.all(
        products.map(async ({ productId, quantity }) => {
          const product = await Product.findOne({ id: productId });
          if (!product) throw new Error(`Product ${productId} not found`);
          return {
            productId: product._id,
            quantity
          };
        })
      );
  
      if (eventItems.length === 0 && productItems.length === 0) {
        return res.status(400).json({ message: 'No valid events or products provided' });
      }
  
      // Ensure items[0] exists
      if (!cart.items.length) {
        cart.items.push({ events: [], products: [] });
      }
  
      // Append to the existing items[0] arrays
      if (eventItems.length > 0) {
        cart.items[0].events.push(...eventItems);
      }
      if (productItems.length > 0) {
        cart.items[0].products.push(...productItems);
      }
  
      cart.updatedAt = new Date();
      await cart.save();
      res.set('X-Cart-ID', cartId);
      const populatedCart = await Cart.findOne({ cartId })
        .populate('items.events.eventId', 'id name date price location')
        .populate('items.products.productId', 'id name price');
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
  
    // Populate the references
    const populatedCart = await Cart.findOne({ cartId })
      .populate('items.events.eventId')
      .populate('items.products.productId');
  
    // Flatten the structure
    const flatCart = {
      cartId: populatedCart.cartId,
      items: populatedCart.items.map(item => ({
        events: item.events.map(event => ({
          ...event.eventId.toObject(), // Spread Event fields
          quantity: event.quantity,
          enrollees: event.enrollees
        })),
        products: item.products.map(product => ({
          ...product.productId.toObject(), // Spread Product fields
          quantity: product.quantity
        }))
      })),
      createdAt: populatedCart.createdAt,
      updatedAt: populatedCart.updatedAt,
      expiresAt: populatedCart.expiresAt,
      __v: populatedCart.__v
    };
  
    console.log('Flattened cart:', JSON.stringify(flatCart, null, 2));
    res.json(flatCart);
  },

  clearCart: async (req, res) => {
    const cartId = req.headers['x-cart-id'];
    if (cartId) await Cart.deleteOne({ cartId });
    res.sendStatus(204);
  }
};

module.exports = cartController;