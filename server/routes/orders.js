const express = require('express');
const router = express.Router();
const Order = require('../models/order');

router.get('/:orderNumber', async (req, res) => {
  try {
    const orderNumber = req.params.orderNumber;
    console.log("orderController orderNumber: ", orderNumber)
    const order = await Order.findOne({orderNumber: orderNumber})
      .populate('items.events.eventId', 'name date location price')
      .populate('items.products.productId', 'name price');

    if (!order) return res.status(404).send('Order not found');

    console.log('Full order:', JSON.stringify(order.toObject(), null, 2));
    res.json(order);

  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;