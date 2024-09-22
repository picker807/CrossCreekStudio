const mongoose = require('mongoose');
const slugify = require('slugify');
const crypto = require('crypto');

const EventSchema = new mongoose.Schema({
  id:          { type: String, required: true},
  name:        { type: String, required: true, maxlength: 100 },
  date:        { type: Date, required: true },
  location:    { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 2000 },
  price:       { type: Number, required: true, min: 0, max: 999 },
  attendees:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  images:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gallery' }],
  isPrivate:   { type: Boolean, default: false },
  slug:        { type: String, uique: true, sparse: true }
});


// Middleware to generate slug before saving
EventSchema.pre('save', async function(next) {
  if (this.isPrivate && !this.slug) {
    const dateString = this.date.toISOString().split('T')[0];
    const baseSlug = slugify(`${this.name}-${dateString}`, { lower: true, remove: /[()]/g });
    
    // Generate a random 6-digit hex string
    const randomHex = crypto.randomBytes(3).toString('hex');
    
    let slug = `${baseSlug}-${randomHex}`;
    let count = 1;
    
    // Ensure slug is unique
    while (await mongoose.models.Event.findOne({ slug })) {
      slug = `${baseSlug}-${randomHex}-${count++}`;
    }
    
    this.slug = slug;
  }
  next();
});
module.exports = mongoose.model('Event', EventSchema, 'events');
