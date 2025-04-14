const mongoose = require('mongoose');
const Sequence = require('../models/sequence');

const sequenceGenerator = {
  // Initialize with the existing single sequence document
  async init() {
    try {
      const sequence = await Sequence.findOne({}).exec();
      if (!sequence) {
        // Only create if none exists (one-time setup)
        const newSequence = new Sequence({
          maxEventId: 0,
          maxGalleryId: 0,
          maxAdminId: 0,
          maxOrderId: 0,
          maxProductId: 0,
        });
        await newSequence.save();
        this.sequenceId = newSequence._id;
        //console.log('Created initial Sequence document with _id:', this.sequenceId);
      } else {
        this.sequenceId = sequence._id;
        //console.log('Using existing Sequence _id:', this.sequenceId);
      }
    } catch (err) {
      //console.error('Error initializing SequenceGenerator:', err);
      throw err;
    }
  },

  async nextId(collectionType) {
    if (!this.sequenceId) await this.init();

    const fieldMap = {
      'events': 'maxEventId',
      'galleries': 'maxGalleryId',
      'admin': 'maxAdminId',
      'orders': 'maxOrderId',
      'products': 'maxProductId',
    };

    const field = fieldMap[collectionType];
    if (!field) throw new Error(`Invalid collection type: ${collectionType}`);

    const sequenceDoc = await Sequence.findOneAndUpdate(
      { _id: this.sequenceId }, // Use the existing _id
      { $inc: { [field]: 1 } },
      { new: true, returnDocument: 'after' } // No upsert—rely on existing doc
    );

    if (!sequenceDoc) {
      throw new Error('Sequence document not found—run init or check DB');
    }

    const nextId = sequenceDoc[field];
    //console.log(`Generated ${collectionType} ID: ${nextId}`);
    return nextId.toString();
  },

  // Sync with existing data
  async syncWithCollection(collectionType, model) {
    if (!this.sequenceId) await this.init();

    const field = {
      'events': 'maxEventId',
      'galleries': 'maxGalleryId',
      'admin': 'maxAdminId',
      'orders': 'maxOrderId',
      'products': 'maxProductId',
    }[collectionType];

    const maxDoc = await model.findOne().sort({ id: -1 }).exec();
    if (maxDoc) {
      const maxId = parseInt(maxDoc.id) || 0;
      const currentSeq = await Sequence.findOne({ _id: this.sequenceId });
      if (maxId > (currentSeq[field] || 0)) {
        await Sequence.updateOne(
          { _id: this.sequenceId },
          { $set: { [field]: maxId } }
        );
        //console.log(`Synced ${collectionType} to ${maxId}`);
      }
    }
  },

  async getCurrentSequence() {
    if (!this.sequenceId) await this.init();
    const seq = await Sequence.findOne({ _id: this.sequenceId });
    return seq ? seq.toObject() : null;
  },
};

module.exports = sequenceGenerator;

// Initialize on startup
sequenceGenerator.init().catch(err => console.error('Sequence init failed:', err));