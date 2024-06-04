const sequenceGenerator = require('./sequence');
const Gallery = require('../models/gallery');
var express = require('express');
var router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const galleries = await Gallery.find({});
    res.status(200).json(galleries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get gallery by ID
router.get('/:id', async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    res.status(200).json(gallery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Create new gallery
router.post('/', async (req, res) => {
  const maxGalleryId = await sequenceGenerator.nextId("galleries");
  const event = new Gallery({
    ...req.body,
    id: maxGalleryId.toString()
  });
  try {
    const newgallery = await gallery.save();
    res.status(201).json(newGallery);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update gallery
router.put('/:id', async (req, res) => {
  try {
    const updatedGallery = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedGallery) return res.status(404).json({ message: 'Gallery item not found' });
    res.json(updatedGallery);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete gallery
router.delete('/:id', async (req, res) => {
  try {
    const gallery = await Gallery.findByIdAndDelete(req.params.id);
    if (!gallery) return res.status(404).json({ message: 'Gallery item not found' });
    res.json({ message: 'Gallery item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;