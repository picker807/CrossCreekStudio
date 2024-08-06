const sequenceGenerator = require('./sequence');
const Gallery = require('../models/gallery');
var express = require('express');
var router = express.Router();
const { BlobServiceClient } = require('@azure/storage-blob');
const { ClientSecretCredential } = require('@azure/identity');
const multer = require('multer');
const upload = multer();
require('dotenv').config();

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

// Upload Image File
router.post('/upload', upload.single('file'), async (req, res) => {

  const credential = new ClientSecretCredential(
    process.env.AZURE_TENANT_ID,
    process.env.AZURE_CLIENT_ID,
    process.env.AZURE_CLIENT_SECRET
  );
  
  const blobServiceClient = new BlobServiceClient(
    `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
    credential
  );

  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  const containerClient = blobServiceClient.getContainerClient('images');
  const blockBlobClient = containerClient.getBlockBlobClient(file.originalname);

  try {
    await blockBlobClient.uploadData(file.buffer);
    const imageUrl = `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/images/${file.originalname}`;
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Error uploading file to Azure Blob Storage:', error);
    res.status(500).send('Error uploading file.');
  }
});

module.exports = router;