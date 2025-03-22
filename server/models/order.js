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
      pricePaid: { type: Number, required: true },
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
      quantity: { type: Number, required: true, min: 1 },
      pricePaid: { type: Number, required: true }
    }]
  }],
  shippingAddress: {
    fullName: { type: String },
    street1: { type: String },
    street2: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
    country: { type: String },
  },
  paymentId: { type: String, required: true },
  total: { type: Number, default: 0 },
  salesTax: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0 },
  shippingRate: { type: Number, default: 0 },
  date:  { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'completed', 'canceled'],
    default: 'pending'
  },
  trackingNumber: { type: String, required: false },
  carrier: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema, 'orders');