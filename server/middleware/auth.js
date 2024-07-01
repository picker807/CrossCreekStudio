const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

exports.authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  if (!token) {
    return res.status(401).send('Access denied. No token provided.');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).send('Access denied. Invalid token.');
    }
    req.admin = admin;
    next();
  } catch (error) {
    res.status(400).send('Invalid token');
  }
};