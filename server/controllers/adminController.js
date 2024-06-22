const Admin = require('../models/admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({});
    res.status(200).json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(mongoose.Types.ObjectId(req.params.id));
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.status(200).json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createAdmin = async (req, res) => {
  const admin = new Admin({
    ...req.body
  });
  try {
    const newAdmin = await admin.save();
    res.status(201).json(newAdmin);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const updatedAdmin = await Admin.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id), req.body, { new: true });
    if (!updatedAdmin) return res.status(404).json({ message: 'Admin not found' });
    res.json(updatedAdmin);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(mongoose.Types.ObjectId(req.params.id));
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json({ message: 'Admin deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin || !await bcrypt.compare(password, admin.password)) {
      return res.status(401).send('Invalid credentials');
    }
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({ token });
  } catch (error) {
    res.status(400).send(error.message);
  }
};