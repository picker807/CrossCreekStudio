const Admin = require('../models/admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({});
    //console.log("Admins from server: ", admins);
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
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.checkAuthStatus = async (req, res) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  if (!token) {
    return res.json({ isAuthenticated: false });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.json({ isAuthenticated: false });
    }
    res.json({ isAuthenticated: true });
  } catch (error) {
    res.json({ isAuthenticated: false });
  }
};

exports.logout = (req, res) => {
  res.status(200).json({ message: 'Logout successful' });
};

/* exports.logout = (req, res) => {
  // Clear the authentication cookie
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });

  // Optionally, destroy the session if you're using session-based authentication
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ message: 'Failed to log out' });
      }
      res.status(200).json({ message: 'Logout successful' });
    });
  } else {
    res.status(200).json({ message: 'Logout successful' });
  }
}; */