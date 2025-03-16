var Sequence = require('../models/sequence');

var maxEventId;
var maxGalleryId;
var maxUserId;
var maxAdminId;
var maxOrderId;
var maxProductId;
var sequenceId = null;

const sequenceGenerator = {
  async init() {
    try {
      const sequence = await Sequence.findOne({}).exec();
      if (!sequence) {
        throw new Error('Sequence not found');
      }
      this.sequenceId = sequence._id;
      this.maxEventId = sequence.maxEventId;
      this.maxGalleryId = sequence.maxGalleryId;
      this.maxUserId = sequence.maxUserId;
      this.maxAdminId = sequence.maxAdminId;
      this.maxOrderId = sequence.maxOrderId;
      this.maxProductId = sequence.maxProductId;

    } catch (err) {
      console.error('Error initializing SequenceGenerator:', err);
      throw err;
    }
  },

  async nextId(collectionType) {
    // Ensure the generator is initialized
    if (!this.sequenceId) {
      await this.init();
    }

    let updateObject = {};
    let nextId;

    switch (collectionType) {
      case 'events':
        nextId = ++this.maxEventId;
        updateObject = { maxEventId: this.maxEventId };
        break;
      case 'galleries':
        nextId = ++this.maxGalleryId;
        updateObject = { maxGalleryId: this.maxGalleryId };
        break;
      case 'users':
        nextId = ++this.maxUserId;
        updateObject = { maxUserId: this.maxUserId };
        break;
      case 'admin':
        nextId = ++this.maxAdminId;
        updateObject = { maxAdminId: this.maxAdminId };
        break;
      case 'orders':
        nextId = ++this.maxOrderId;
        updateObject = { maxOrderId: this.maxOrderId };
        break;
      case 'products':
        nextId = ++this.maxProductId;
        updateObject = { maxProductId: this.maxProductId };
        break;
      default:
        throw new Error('Invalid collection type');
    }

    await Sequence.updateOne({ _id: this.sequenceId }, { $set: updateObject });
    return nextId.toString();
  }
};

module.exports = sequenceGenerator;