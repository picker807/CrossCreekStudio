const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Spring', 'Summer', 'Winter', 'Fall'], 
    required: true 
  }
});

const Gallery = mongoose.model('Gallery', GallerySchema, 'galleries');

module.exports = Gallery;