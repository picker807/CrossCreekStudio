var Sequence = require('../models/sequence');

var maxEventId;
var maxGalleryId;
var maxUserId;
var maxAdminId;
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

      console.log('Sequence ID:', this.sequenceId);
      console.log('Max Event ID:', this.maxEventId);
      console.log('Max Gallery ID:', this.maxGalleryId);
      console.log('Max User ID:', this.maxUserId);
      console.log('Max Admin ID:', this.maxAdminId);
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
      default:
        throw new Error('Invalid collection type');
    }

    await Sequence.updateOne({ _id: this.sequenceId }, { $set: updateObject });
    return nextId.toString();
  }
};

module.exports = sequenceGenerator;