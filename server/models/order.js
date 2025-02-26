// models/order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  cartId: { type: String, required: true }, // Links to completed cart
  userId: String, // Optional for guest checkout
  items: [{
    type: { type: String, enum: ['event', 'product'], required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    enrollees: [{ name: String }], // Only for events
    quantity: { type: Number, required: true, min: 1 }
  }],
  shippingAddress: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  paymentId: { type: String, required: true }, // From PayPal
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'completed', 'canceled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);