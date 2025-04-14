const mongoose = require('mongoose');

const sequenceSchema = mongoose.Schema({
  "maxEventId": { type: Number },
  "maxUserId": { type: Number },
  "maxGalleryId": { type: Number },
  "maxAdminId": { type: Number },
  "maxOrderId": { type: Number },
  "maxProductId": { type: Number }
});

module.exports = mongoose.model('Sequence', sequenceSchema, 'sequence');