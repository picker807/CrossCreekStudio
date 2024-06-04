const mongoose = require('mongoose');

const sequenceSchema = mongoose.Schema({
  "maxEventId": { type: Number },
  "maxUserId": { type: Number },
  "maxGalleryId": { type: Number },
  "maxAdminId": { type: Number }
});

module.exports = mongoose.model('Sequence', sequenceSchema, 'sequence');