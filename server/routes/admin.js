const sequenceGenerator = require('./sequence');
const Admin = require('../models/admin');
var express = require('express');
var router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const admins = await Admin.find({});
    res.status(200).json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get admin by id
router.get('/:id', async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    res.status(200).json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Create new admin
router.post('/', async (req, res) => {
  const maxAdminId = await sequenceGenerator.nextId("admin");
  const admin = new Admin({
    ...req.body,
    id: maxAdminId.toString()
  });
  try {
    const newAdmin = await admin.save();
    res.status(201).json(newAdmin);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update admin
router.put('/:id', async (req, res) => {
  try {
    const updatedAdmin = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedAdmin) return res.status(404).json({ message: 'Admin not found' });
    res.json(updatedAdmin);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete admin
router.delete('/:id', async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json({ message: 'Admin deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;