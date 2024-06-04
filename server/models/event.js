const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  id: {type: String, required: true},
  name: { type: String, required: true },
  date: { type: Date, required: true },
  isVirtual: { type: Boolean, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gallery' }]
});

module.exports = mongoose.model('Event', EventSchema, 'events');
