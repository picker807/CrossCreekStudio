// controllers/checkoutController.js
const Cart = require('../models/cart');
const Order = require('../models/order');
const User = require('../models/user');
const Event = require('../models/event');
const sequenceGenerator = require('../routes/sequence');

const checkoutController = {
  completeCheckout: async (req, res) => {
    const { cartId, paymentId, shippingAddress } = req.body;
    const cart = await Cart.findOne({ cartId });
    if (!cart) return res.status(404).send('Cart not found');

    for (const item of cart.items) {
      if (item.type === 'event' && item.enrollees && item.enrollees.length > 0) {
        const event = await Event.findById(item.eventId);
        if (!event) continue;

        const attendeeIds = [];
        for (const enrollee of item.enrollees) {
          const compositeKey = `${enrollee.firstName.toLowerCase()}_${enrollee.lastName.toLowerCase()}_${enrollee.email.toLowerCase()}`;
          let user = await User.findOne({ compositeKey });
          if (!user) {
            const nextId = await sequenceGenerator.nextId('users');
            user = new User({
              id: nextId.toString(),
              firstName: enrollee.firstName,
              lastName: enrollee.lastName,
              email: enrollee.email,
              phone: enrollee.phone,
              compositeKey
            });
            await user.save();
          }
          attendeeIds.push(user._id);
        }
        event.attendees = [...new Set([...event.attendees, ...attendeeIds])];
        await event.save();
      }
    }

    const order = new Order({
      cartId,
      items: cart.items,
      shippingAddress,
      paymentId,
      status: 'pending'
    });
    await order.save();
    await Cart.deleteOne({ cartId });
    res.json(order);
  }
};

module.exports = checkoutController;