const sequenceGenerator = require('./sequence');
const Gallery = require('../models/gallery');
var express = require('express');
var router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const category = req.query.category;
    let galleries;

    if (category) {
      galleries = await Gallery.find({ category });
    } else {
      galleries = await Gallery.find();
    }

    res.json({ galleries });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Get gallery by ID
router.get('/:id', async (req, res) => {
  try {
    const galleryItem = await Gallery.findOne({ id: req.params.id });
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    res.json(galleryItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Create new gallery
router.post('/', async (req, res) => {
  const maxGalleryId = await sequenceGenerator.nextId("galleries");
  const gallery = new Gallery({
    ...req.body,
    id: maxGalleryId.toString()
  });
  try {
    const newGallery = await gallery.save();
    res.status(201).json(newGallery);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update gallery
router.put('/:id', async (req, res) => {
  //console.log('req.body in router.put: ', req.body);
  try {
    const updatedGallery = await Gallery.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!updatedGallery) return res.status(404).json({ message: 'Gallery item not found' });
    res.json(updatedGallery);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete gallery
router.delete('/:id', async (req, res) => {
  try {
    const gallery = await Gallery.findOneAndDelete({ id: req.params.id });
    if (!gallery) return res.status(404).json({ message: 'Gallery item not found' });
    res.json({ message: 'Gallery item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;