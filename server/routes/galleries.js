const galleryController = require('../controllers/galleryController')
var express = require('express');
var router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { authMiddleware } = require('../middleware/auth');

router.post('/upload', upload.single('file'), authMiddleware, galleryController.uploadImage);
router.get('/:id', galleryController.getGalleryItemById);
router.get('/', galleryController.getAllGalleryItems);
router.post('/', galleryController.createGalleryItem);
router.put('/:id', galleryController.updateGalleryItem);
router.delete('/:id', galleryController.deleteGalleryItem);


module.exports = router;