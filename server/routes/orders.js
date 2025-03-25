const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const mongoose = require('mongoose');
const { authMiddleware } = require('../middleware/auth');


// GET /api/orders/:orderNumber - Fetch a single order by orderNumber
router.get('/:orderNumber', async (req, res) => {
  try {
    const orderNumber = req.params.orderNumber;
    console.log("orderController orderNumber: ", orderNumber);
    const order = await Order.findOne({ orderNumber: orderNumber })
    .populate({
      path: 'items.events.eventId',
      select: 'name date location price images',
      populate: { 
        path: 'images',
        select: 'imageUrl'
      }
    })
    .populate('items.products.productId', 'name price images');

    if (!order) return res.status(404).send('Order not found');

    console.log('Full order:', JSON.stringify(order.toObject(), null, 2));
    res.json(order);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// GET /api/orders - Fetch all orders (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.events.eventId', 'id name date location')
      .populate('items.products.productId', 'id name');
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:orderNumber - Update an order by orderNumber (actually _id in this case) (admin only)
router.put('/:orderNumber', authMiddleware, async (req, res) => {
  try {
    const { orderNumber} = req.params;
    const updateData = req.body.$set || req.body;
    const objectId = new mongoose.Types.ObjectId(orderNumber);
    const updatedOrder = await Order.findByIdAndUpdate(
      objectId,
      updateData,
      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;