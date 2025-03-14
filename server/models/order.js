// models/order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, required: true },
  cartId: { type: String, required: true },
  userId: { type: String }, // Optional for guest checkout
  email: { type: String, required: true },
  items: [{
    _id: false,
    events: [{
      _id: false,
      eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
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
  shippingAddress: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  paymentId: { type: String, required: true },
  total: { type: String, required: true },
  date:  { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'completed', 'canceled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Order', orderSchema, 'orders');