const express = require('express');
const { BlobServiceClient } = require('@azure/storage-blob');
const { ClientSecretCredential } = require('@azure/identity');
const multer = require('multer');
const upload = multer();
require('dotenv').config();

const router = express.Router();

// Azure Blob Storage credentials
const credential = new ClientSecretCredential(
  process.env.AZURE_TENANT_ID,
  process.env.AZURE_CLIENT_ID,
  process.env.AZURE_CLIENT_SECRET
);

const blobServiceClient = new BlobServiceClient(
  `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
  credential
);

// API endpoint for file uploads
router.post('/api/upload', upload.single('file'), async (req, res) => {
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