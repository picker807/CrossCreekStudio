// models/cart.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const cartSchema = new mongoose.Schema({
  cartId: { type: String, unique: true, required: true, default: uuidv4 },
  userId: { type: String, index: true, sparse: true },
  items: [{
    _id: false,
    events: [{
      _id: false,
      eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
      quantity: { type: Number, required: true, min: 1 },
      enrollees: [{
        _id: false,
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true }
      }]
    }],
    products: [{
      _id: false,
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, min: 1 }
    }]
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now, index: true },
  expiresAt: { type: Date, expires: '30d', default: () => Date.now() + 30 * 24 * 60 * 60 * 1000 }
});

module.exports = mongoose.model('Cart', cartSchema, 'carts');