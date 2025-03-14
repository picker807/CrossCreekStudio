// controllers/checkoutController.js
const Cart = require('../models/cart');
const Order = require('../models/order');
const User = require('../models/user');
const Event = require('../models/event');
const sequenceGenerator = require('../routes/sequence');

const checkoutController = {
  completeCheckout: async (req, res) => {
    console.time('completeCheckout');
    const { cartId, paymentId, shippingAddress, paypalDetails } = req.body;
    console.timeLog('completeCheckout', 'Starting...');

    try {
      const cart = await Cart.findOne({ cartId });
      if (!cart) {
        console.timeEnd('completeCheckout');
        return res.status(404).send('Cart not found');
      }
      console.timeLog('completeCheckout', 'Cart found');

      // Process event attendees
      for (const cartItem of cart.items) {
        if (cartItem.events && cartItem.events.length > 0) {
          for (const event of cartItem.events) {
            const dbEvent = await Event.findById(event.eventId);
            if (!dbEvent) continue;
            console.timeLog('completeCheckout', `Event ${event.eventId} found`);

            const attendeeIds = [];
            for (const enrollee of event.enrollees) {
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
                console.timeLog('completeCheckout', `User ${compositeKey} created`);
              }
              attendeeIds.push(user._id);
            }
            dbEvent.attendees = [...new Set([...dbEvent.attendees, ...attendeeIds])];
            await dbEvent.save();
            console.timeLog('completeCheckout', `Event ${event.eventId} updated`);
          }
        }
      }

      const hasProducts = cart.items.some(item => item.products && item.products.length > 0);
      const customerEmail = hasProducts && shippingAddress.contactEmail
        ? shippingAddress.contactEmail
        : paypalDetails?.payer?.email_address || cart.items[0]?.events[0]?.enrollees[0]?.email || 'unknown@example.com';
      const orderNumber = await sequenceGenerator.nextId("orders");


      const order = new Order({
        orderNumber: orderNumber,
        cartId,
        userId: cart.userId || null,
        email: customerEmail,
        items: cart.items,
        shippingAddress: shippingAddress ? {
          street: shippingAddress.street,
          city: shippingAddress.city,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country
        } : {}, // Empty if no products
        paymentId,
        total: paypalDetails.purchase_units[0].amount.value,
        date: paypalDetails.create_time,
        status: 'pending'
      });
      await order.save();
      console.timeLog('completeCheckout', 'Order saved');

      await Cart.deleteOne({ cartId: cartId });
      console.timeLog('completeCheckout', 'Cart deleted');

      console.timeEnd('completeCheckout');

      console.log('Sending orderNumber:', order.orderNumber);
      res.json({ orderNumber: order.orderNumber });

    } catch (error) {
      console.error('Checkout error:', error);
      console.timeEnd('completeCheckout');
      res.status(500).send('Server error');
    }
  }
};

module.exports = checkoutController;