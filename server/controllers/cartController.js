const Cart = require('../models/cart');
const Event = require('../models/event');
const Product = require('../models/product');
const Setting = require('../models/setting');
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
            items: {
              events: populatedCart.items[0].events.map(event => {
                const eventData = event.eventId.toObject ? event.eventId.toObject() : event.eventId;
                return {
                  //_id: eventData._id.toString(),
                  eventId: eventData.id,
                  name: eventData.name,
                  date: eventData.date,
                  price: eventData.price,
                  location: eventData.location,
                  images: eventData.images || [],
                  enrollees: event.enrollees || []
                };
              }),
              products: populatedCart.items[0].products.map(product => {
                const productData = product.productId.toObject ? product.productId.toObject() : product.productId;
                return {
                  //_id: productData._id.toString(),
                  productId: productData.id,
                  name: productData.name,
                  price: productData.price,
                  images: productData.images || [],
                  quantity: product.quantity
                };
              })
            },
            removedItems: []
          };
  
          //console.log('Response from addToCart:', JSON.stringify(response, null, 2));
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
  try {
    const cartId = req.headers['x-cart-id'];
    if (!cartId) return res.status(400).json({ message: 'No cart ID provided' });

    const cart = await Cart.findOne({ cartId })
      .populate({
        path: 'items.events.eventId',
        populate: { path: 'images', model: 'Gallery' }
      })
      .populate('items.products.productId');

    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const taxRateDoc = await Setting.findOne({ key: 'salesTaxRate' });
    const shippingRateDoc = await Setting.findOne({ key: 'shippingRatePerItem' });
    const taxRate = taxRateDoc.value;
    const shippingRate = shippingRateDoc.value;

    const invalidItems = [];
    const validEvents = [];
    const validProducts = [];
    let totalPrice = 0;
    let salesTax = 0;
    let shipping = 0;

    // Validate events
    cart.items[0].events.forEach(event => {
      if (!event.eventId) {
        invalidItems.push({ item: { id: event.eventId?.toString() || 'unknown' }, reason: 'Event no longer exists' });
      } else if (new Date(event.eventId.date) < new Date()) {
        invalidItems.push({ item: { id: event.eventId.id, name: event.eventId.name }, reason: 'Event date has passed' });
      } else {
        const pricePaid = event.eventId.price;
        const enrolleeCount = event.enrollees.length;
        totalPrice += pricePaid * enrolleeCount;
        validEvents.push({
          _id: event.eventId._id.toString(),
          id: event.eventId.id,
          name: event.eventId.name,
          date: event.eventId.date,
          price: event.eventId.price,
          pricePaid,
          location: event.eventId.location,
          images: event.eventId.images,
          enrollees: event.enrollees
        });
      }
    });

    // Validate products
    cart.items[0].products.forEach(product => {
      if (!product.productId) {
        invalidItems.push({ item: { id: product.productId?.toString() || 'unknown' }, reason: 'Product no longer exists' });
      /* } else if (product.productId.stock < product.quantity) {
        invalidItems.push({ item: { id: product.productId.id, name: product.productId.name }, reason: 'Insufficient stock' }); */
      } else {
        const pricePaid = product.productId.price; 
        const subtotal = pricePaid * product.quantity;
        totalPrice += subtotal;
        salesTax += subtotal * taxRate;
        shipping += product.quantity * shippingRate; 
        validProducts.push({
          _id: product.productId._id.toString(),
          id: product.productId.id,
          name: product.productId.name,
          price: product.productId.price,
          pricePaid,
          images: product.productId.images,
          quantity: product.quantity
        });
      }
    });

    totalPrice += salesTax + shipping;

    // Calculate total price
    /* const totalPrice = validEvents.reduce((sum, e) => sum + e.price * e.enrollees.length, 0) +
                      validProducts.reduce((sum, p) => sum + p.price * p.quantity, 0); */

    const cartVerificationResults = {
      validItems: {
        events: validEvents,
        products: validProducts
      },
      invalidItems,
      cartId: cart.cartId,
      totalPrice,
      salesTax,
      shipping,
      shippingRate,
      taxRate
    };

    // Always return valid items, even if there are invalid ones
    res.json(cartVerificationResults);
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ message: 'Server error during checkout', error: error.message });
  }
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