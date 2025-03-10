const Cart = require('../models/cart');
const Event = require('../models/event');
const Product = require('../models/product');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

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

      try {
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

         // Consolidate events
         eventItems.forEach(newEvent => {
          const existingEvent = cart.items[0].events.find(e => e.eventId.toString() === newEvent.eventId.toString());
          if (existingEvent) {
            existingEvent.quantity += newEvent.quantity;
            existingEvent.enrollees = [...existingEvent.enrollees, ...newEvent.enrollees];
          } else {
            cart.items[0].events.push(newEvent);
          }
        });

        // Consolidate products
        productItems.forEach(newProduct => {
          const existingProduct = cart.items[0].products.find(p => p.productId.toString() === newProduct.productId.toString());
          if (existingProduct) {
            existingProduct.quantity += newProduct.quantity;
          } else {
            cart.items[0].products.push(newProduct);
          }
        });

        //cart.updatedAt = new Date();
        await cart.save();

        // Populate cart
        const populatedCart = await Cart.findOne({ cartId })
          .populate({
            path: 'items.events.eventId',
            select: 'id name date price location images',
            populate: { path: 'images', model: 'Gallery' }
          })
          .populate('items.products.productId', 'id name price images');

          const response = {
            cartId: cart.cartId,
            items: [{
              events: populatedCart.items[0].events.map(event => {
                const eventData = event.eventId.toObject ? event.eventId.toObject() : event.eventId;
                return {
                  _id: eventData._id.toString(),
                  eventId: eventData.id,
                  name: eventData.name,
                  date: eventData.date,
                  price: eventData.price,
                  location: eventData.location,
                  images: eventData.images || [],
                  quantity: event.quantity,
                  enrollees: event.enrollees || []
                };
              }),
              products: populatedCart.items[0].products.map(product => {
                const productData = product.productId.toObject ? product.productId.toObject() : product.productId;
                return {
                  _id: productData._id.toString(),
                  productId: productData.id,
                  name: productData.name,
                  price: productData.price,
                  images: productData.images || [],
                  quantity: product.quantity
                };
              })
            }],
            removedItems: []
          };
  
          console.log('Response from addToCart:', JSON.stringify(response, null, 2));
          res.set('X-Cart-ID', cartId);
          res.json(response);
        } catch (error) {
          console.error('Error in addToCart:', error);
          res.status(400).json({ message: error.message });
        }
      }
    ],

  getCart: async (req, res) => {
    try{
      const cartId = req.headers['x-cart-id'];
      if (!cartId) return res.status(400).json({ message: 'No cart ID provided' });

      let cart = await Cart.findOne({ cartId });
      if (!cart) {
        cart = new Cart({ cartId, items: [{ events: [], products: [] }] });
        await cart.save();
      }

      // Populate events and products
      const populatedCart = await Cart.findOne({ cartId })
        .populate({
          path: 'items.events.eventId',
          select: 'id name date price location images',
          populate: { path: 'images', model: 'Gallery' }
        })
        .populate('items.products.productId', 'id name price images');

      //console.log('Populated cart:', JSON.stringify(populatedCart, null, 2));
  
    const removedItems = [];
    const updatedItems = cart.items.map(item => {
      const validEvents = item.events.filter(event => {
        if (!event.eventId) {
          removedItems.push({ type: 'event', id: event.eventId, reason: 'Event no longer exists' });
          return false;
        }
        if (new Date(event.eventId.date) < new Date()) {
          removedItems.push({ type: 'event', id: event.eventId.id, reason: 'Event date has passed' });
          return false;
        }
        return true;
      });
  
      const validProducts = item.products.filter(product => {
        if (!product.productId) {
          removedItems.push({ type: 'product', id: product.productId, reason: 'Product no longer exists' });
          return false;
        }
        return true;
      });
  
      return {
        events: validEvents.map(event => ({
          eventId: event.eventId._id, // ObjectId for DB
          quantity: event.quantity,
          enrollees: event.enrollees
        })),
        products: validProducts.map(product => ({
          productId: product.productId._id,
          quantity: product.quantity
        }))
      };
    });
  
    // Only save if items changed
    const originalItems = JSON.stringify(cart.items);
    const newItems = JSON.stringify(updatedItems);
    //console.log("Original Items: ", originalItems);
    //console.log("NewItems: ", newItems);
    if (originalItems !== newItems) {
      cart.items = updatedItems;
      await cart.save();
    }
  
    const response = {
      cartId: cart.cartId,
      items: [{
        events: populatedCart.items[0].events.map(event => {
          const eventData = event.eventId.toObject ? event.eventId.toObject() : event.eventId;
          return {
            _id: eventData._id.toString(),
            eventId: eventData.id,
            name: eventData.name,
            date: eventData.date,
            price: eventData.price,
            location: eventData.location,
            images: eventData.images || [],
            quantity: event.quantity,
            enrollees: event.enrollees || []
          };
        }),
        products: populatedCart.items[0].products.map(product => {
          const productData = product.productId.toObject ? product.productId.toObject() : product.productId;
          return {
            _id: productData._id.toString(),
            productId: productData.id,
            name: productData.name,
            price: productData.price,
            images: productData.images || [],
            quantity: product.quantity
          };
        })
      }],
      removedItems: []
    };

    //console.log('Response from getCart:', JSON.stringify(response, null, 2));
    res.set('X-Cart-ID', cartId);
    res.json(response);
  } catch (error) {
    console.error('Error in getCart:', error);
    res.status(500).json({ message: 'Server error fetching cart' });
  }
},

  checkoutCart: async (req, res) => {
    const cartId = req.headers['x-cart-id'];
    const cart = await Cart.findOne({ cartId: cartId },)
      .populate({
        path: 'items.events.eventId',
        populate: { path: 'images', model: 'Gallery' }
      })
      .populate('items.products.productId');
  
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
  
    // No cleaning or saving here—just validation
    const invalidItems = [];
    const validItems = cart.items.map(item => {
      const events = [];
      item.events.forEach(event => {
        if (!event.eventId) {
          invalidItems.push({ item: { events: [{ ...event, eventId: null }], products: [] }, reason: 'Event no longer exists' });
        } else if (new Date(event.eventId.date) < new Date()) {
          invalidItems.push({ item: { events: [event.eventId.toObject()], products: [] }, reason: 'Event date has passed' });
        } else {
          events.push({
            ...event.eventId.toObject(),
            quantity: event.quantity,
            enrollees: event.enrollees
          });
        }
      });
  
      const products = [];
      item.products.forEach(product => {
        if (!product.productId) {
          invalidItems.push({ item: { events: [], products: [{ ...product, productId: null }] }, reason: 'Product no longer exists' });
        } else {
          products.push({
            ...product.productId.toObject(),
            quantity: product.quantity
          });
        }
      });
  
      // Merge valid items (optional, could skip if getCart already merged)
      // const eventMap = new Map();
      // events.forEach(event => {
      //   const eventId = event._id.toString();
      //   if (eventMap.has(eventId)) {
      //     const existing = eventMap.get(eventId);
      //     existing.quantity += event.quantity;
      //     existing.enrollees = [...existing.enrollees, ...event.enrollees];
      //   } else {
      //     eventMap.set(eventId, event);
      //   }
      // });
  
      // const productMap = new Map();
      // products.forEach(product => {
      //   const productId = product._id.toString();
      //   if (productMap.has(productId)) {
      //     const existing = productMap.get(productId);
      //     existing.quantity += product.quantity;
      //   } else {
      //     productMap.set(productId, product);
      //   }
      // });
  
      return {
        events: Array.from(eventMap.values()),
        products: Array.from(productMap.values())
      };
    });
  
    if (invalidItems.length > 0) {
      return res.status(400).json({ validItems: [], invalidItems });
    }
  
    const checkoutResponse = {
      validItems,
      invalidItems: [],
      cartId: cart.cartId
      
    };
    res.json(checkoutResponse);
  },

  updateCart: async (req, res) => {
    try {
      const { cartId, items } = req.body;
      if (!cartId) return res.status(400).json({ error: 'cartId is required' });
  
      const updatedCart = await Cart.findOneAndUpdate(
        { cartId: cartId },
        { items },
        { new: true, runValidators: true }
      );
  
      if (!updatedCart) return res.status(404).json({ error: 'Cart not found' });
      res.json(updatedCart);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  removeFromCart: async (req, res) => {
    try {
      const { cartId, itemId, type } = req.body;
      if (!cartId || !itemId || !type) return res.status(400).json({ error: 'cartId, itemId, and type are required' });
  
      const objectId = new mongoose.Types.ObjectId(itemId);
  
      const updateQuery = type === 'event'
        ? { $pull: { 'items.0.events': { eventId: objectId } } }
        : { $pull: { 'items.0.products': { productId: objectId } } };
  
      const updatedCart = await Cart.findOneAndUpdate(
        { cartId: cartId },
        updateQuery,
        { new: true }
      );
  
      if (!updatedCart) return res.status(404).json({ error: 'Cart not found' });
      res.json(updatedCart);
    } catch (error) {
      console.error('Remove error:', error.message);
      res.status(500).json({ error: error.message });
    }
  },

  clearCart: async (req, res) => {
    const cartId = req.headers['x-cart-id'];
    if (cartId) await Cart.deleteOne({ cartId: cartId },);
    res.sendStatus(204);
  }
};

module.exports = cartController;