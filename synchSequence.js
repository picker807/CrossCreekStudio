const mongoose = require('mongoose');
const User = require('./server/models/user');
const Event = require('./server/models/event');
const Order = require('./server/models/order');
const Gallery = require ('./server/models/gallery')
const Admin = require ('./server/models/admin')
const Product = require('./server/models/product')
const sequenceGenerator = require('./server/routes/sequence')

const mongoURI = 'mongodb+srv://pic18006:OC7pVlxy5OQiN9xq@cluster0.dfamm76.mongodb.net/CrossCreekCreates'

async function syncSequences() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    //console.log('Connected to MongoDB');

    await sequenceGenerator.syncWithCollection('users', User);
    await sequenceGenerator.syncWithCollection('events', Event); 
    await sequenceGenerator.syncWithCollection('orders', Order); 
    await sequenceGenerator.syncWithCollection('galleries', Gallery); 
    await sequenceGenerator.syncWithCollection('admin', Admin); 
    await sequenceGenerator.syncWithCollection('products', Product); 

    //console.log('All sequences synced successfully');
  } catch (err) {
    console.error('Error syncing sequences:', err.stack);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the sync
syncSequences();