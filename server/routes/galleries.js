const galleryController = require('../controllers/galleryController')
var express = require('express');
var router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), galleryController.uploadImage);
router.get('/', galleryController.getAllGalleryItems);
router.post('/', galleryController.createGalleryItem);
router.get('/:id', galleryController.getGalleryItemById);
router.put('/:id', galleryController.updateGalleryItem);
router.delete('/:id', galleryController.deletegalleryitem);


module.exports = router;