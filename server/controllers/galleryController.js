const sequenceGenerator = require('../routes/sequence');
const Gallery = require('../models/gallery');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require('dotenv').config();

const s3Client = new S3Client({
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  },
  region: 'auto',
  signatureVersion: 'v4',
});

/* async function uploadImage(bucketName, key, file) {
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: file,
  };
  
  const command = new PutObjectCommand(params);
  const uploadResponse = await s3Client.send(command);
  return uploadResponse;
} */

exports.getAllGalleryItems = async (req, res, next) => {
  try {
    const category = req.query.category;
    let galleries;

    if (category) {
      galleries = await Gallery.find({ category });
    } else {
      galleries = await Gallery.find();
    }
    //console.log("Gallery returned in server: ", galleries);
    res.json({ galleries });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get gallery by ID
exports.getGalleryItemById = async (req, res) => {
  try {
    const galleryItem = await Gallery.findOne({ id: req.params.id });
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    res.json(galleryItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Create new gallery
exports.createGalleryItem = async (req, res) => {
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
};

// Update gallery
exports.updateGalleryItem = async (req, res) => {
  //console.log('req.body in router.put: ', req.body);
  try {
    const updatedGallery = await Gallery.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!updatedGallery) return res.status(404).json({ message: 'Gallery item not found' });
    res.json(updatedGallery);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete gallery
exports.deleteGalleryItem = async (req, res) => {
  try {
    const gallery = await Gallery.findOneAndDelete({ id: req.params.id });
    if (!gallery) return res.status(404).json({ message: 'Gallery item not found' });
    res.json({ message: 'Gallery item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Upload Image File
exports.uploadImage = async (req, res) => {
  const file = req.file; // From multer
  const key = req.body.key; // Unique key for the file
  try {
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: key,
      Body: file.buffer,
    };
    const command = new PutObjectCommand(params);
    
    await s3Client.send(command);
    const imageUrl = `https://${process.env.R2_DEV_IDENTIFIER}.r2.dev/${key}`;
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading image' });
  }
};