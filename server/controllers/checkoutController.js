// controllers/checkoutController.js
const Cart = require('../models/cart');
const Order = require('../models/order');
const User = require('../models/user');
const Event = require('../models/event');
const Setting = require('../models/setting');
const sequenceGenerator = require('../routes/sequence');

const checkoutController = {

  getTaxRate: async (req, res) => {
    try {
      const taxRateDoc = await Setting.findOne({ key: 'salesTaxRate' }) || { value: 0.08 };
      res.json({ taxRate: taxRateDoc.value });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getShippingRate: async (req, res) => {
    try {
      const shippingRateDoc = await Setting.findOne({ key: 'shippingRatePerItem' }) || { value: 5.00 };
      res.json({ shippingRate: shippingRateDoc.value });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  completeCheckout: async (req, res) => {
    console.time('completeCheckout');
    console.log("Checkout Request Body: ", JSON.stringify(req.body, null, 2));
    const { cartId, paymentId, shippingAddress, paypalDetails, cartItems, email } = req.body;
    const { events, products } = cartItems;
    console.timeLog('completeCheckout', 'Starting...');

    try {
      const orderNumber = await sequenceGenerator.nextId("orders");
      const taxRate = req.body.taxRate; // From verifyCart
      const shippingRate = req.body.shippingRate; // From verifyCart
      let total = 0;
      let salesTax = 0;
      let shipping = 0;

      // Map cartItems to Order schema format
      const items = [{
        events: events.map(event => ({
          eventId: event._id,
          pricePaid: event.pricePaid,
          enrollees: event.enrollees
        })),
        products: products.map(product => ({
          productId: product._id,
          quantity: product.quantity,
          pricePaid: product.pricePaid
        }))
      }];

      // Process event attendees
      for (const event of events) {
        const dbEvent = await Event.findById(event._id);
        if (!dbEvent) {
          console.warn(`Event ${event._id} not found during checkout`);
          continue;
        }
        console.timeLog('completeCheckout', `Event ${event._id} found`);

        const attendeeIds = [];
for (const enrollee of event.enrollees || []) {
  const compositeKey = `${enrollee.firstName?.toLowerCase()}_${enrollee.lastName?.toLowerCase()}_${enrollee.email?.toLowerCase()}`;
  let user = await User.findOne({ compositeKey });
  if (!user) {
    user = new User({
      firstName: enrollee.firstName || '',
      lastName: enrollee.lastName || '',
      email: enrollee.email || '',
      phone: enrollee.phone || '',
      compositeKey,
    });
    await user.save();
    console.timeLog('completeCheckout', `User ${compositeKey} created with _id ${user._id}`);
  }
  attendeeIds.push(user._id);
}
dbEvent.attendees = [...new Set([...(dbEvent.attendees || []), ...attendeeIds])];
await dbEvent.save();
console.timeLog('completeCheckout', `Event ${event._id} updated`);
        console.timeLog('completeCheckout', `Event ${event.eventId} updated`);
      }
        
      // Calculate totals
      events.forEach(event => total += event.pricePaid * (event.enrollees.length || 1));
      products.forEach(product => {
        const subtotal = product.pricePaid * product.quantity;
        total += subtotal;
        salesTax += subtotal * taxRate;
        shipping += product.quantity * shippingRate;
      });
      total += salesTax + shipping;

      const hasProducts = items.some(item => item.products && item.products.length > 0);
      const customerEmail = hasProducts && shippingAddress.contactEmail
        ? shippingAddress.contactEmail
        : paypalDetails?.payer?.email_address;
      //const orderNumber = await sequenceGenerator.nextId("orders");


      const order = new Order({
        orderNumber,
        cartId,
        userId: paypalDetails.payer?.payer_info?.payer_id || null,
        email: customerEmail,
        items,
        shippingAddress,
        paymentId,
        total,
        salesTax,
        shipping,
        taxRate,
        shippingRate,
        date: paypalDetails.create_time,
        status: 'pending'
      });
      await order.save();
      console.timeLog('completeCheckout', 'Order saved');

      await Cart.deleteOne({ cartId: cartId });
      console.timeLog('completeCheckout', 'Cart deleted');

      console.timeEnd('completeCheckout');

      console.log('Sending orderNumber:', order.orderNumber);
      res.json({ orderNumber });

    } catch (error) {
      console.error('Checkout error:', error);
      console.timeEnd('completeCheckout');
      res.status(500).send('Server error');
    }
  }
};

module.exports = checkoutController;