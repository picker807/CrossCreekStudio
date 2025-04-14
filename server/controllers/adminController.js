const Admin = require('../models/admin');
const Order = require('../models/order');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//const mongoose = require('mongoose');
const sequenceGenerator = require('../routes/sequence');

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
    const admin = await Admin.findOne({id: req.params.id});
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.status(200).json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCurrentAdmin = async (req, res) => {
  //console.log("start admin controller");
  try {

    const { id, role } = req.admin;

    const admin = await Admin.findOne( {id: id} );  //.select('name email role');

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json(admin);
  } catch (error) {
    //console.error('Error in getCurrentAdmin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const admin = await Admin.findOne({id: req.admin.id});
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    const { oldPassword, newPassword } = req.body;

    const isPasswordValid = await admin.comparePassword(oldPassword);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Incorrect old password' });
    }
    admin.password = newPassword;
    await admin.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createAdmin = async (req, res) => {

  const maxAdminId = await sequenceGenerator.nextId("admin");
  const admin = new Admin({
    ...req.body,
    id: maxAdminId.toString()
  });
  try {
    const newAdmin = await admin.save();
    res.status(201).json(newAdmin.toJSON());
  } catch (err) {
    console.error('Error creating admin:', err);
    res.status(400).json({ message: err.message });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const updatedAdmin = await Admin.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!updatedAdmin) return res.status(404).json({ message: 'Admin not found' });
    res.json(updatedAdmin);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedAdmin = await Admin.findOneAndUpdate(
      { id: id },
      { $set: req.body },
      { new: true, runValidators: true, context: 'query' }
    );

    if (!updatedAdmin) {
      //console.log('Admin not found');
      return res.status(404).json({ message: 'Admin not found' });
    }

    //console.log('Updated admin:', updatedAdmin);
    res.json({ message: 'Admin updated successfully', admin: updatedAdmin });
  } catch (err) {
    console.error('Error updating admin:', err);
    res.status(500).json({ message: 'An error occurred while updating the admin' });
  }
};


exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findOneAndDelete({ id: req.params.id });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json({ message: 'Admin deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body.credentials;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin || !await bcrypt.compare(password, admin.password)) {
      return res.status(401).send('Invalid email or password');
    }
    const token = jwt.sign({ id: admin.id.toString(), role: admin.role }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
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
    const admin = await Admin.findOne({id: decoded.id});
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

/* exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.eventId', 'name date location')
      .populate('items.productId', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: err.message });
  }
}; 

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('items.eventId', 'name date location')
     .populate('items.productId', 'name');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ message: err.message });
  }
}; */