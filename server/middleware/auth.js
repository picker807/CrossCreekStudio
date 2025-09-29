const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const mongoose = require('mongoose'); 

exports.authMiddleware = async (req, res, next) => {
  console.log('All headers:', req.headers);
  const authHeader = req.get('Authorization');
  console.log('Authorization header:', authHeader);
  
  if (!authHeader) {
    console.error('Access denied. No token provided.');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    console.error('Access denied. Invalid token format.');
    return res.status(401).json({error: 'Access denied. Invalid token format.'});
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    req.admin = {
      id: decoded.id,
      role: decoded.role
    };
   

    const simplifiedReq = {
      headers: req.headers,
      admin: req.admin,
      originalUrl: req.originalUrl,
      method: req.method,
      query: req.query,
      body: req.body
    };
    next();

  } catch (error) {
    console.error('Invalid token', error.message);

    return res.status(400).json({ error: 'Invalid token' });
  }
};

exports.superAdminMiddleware = (req, res, next) => {
  //console.log('Role in superAdminMiddleware:', req.admin.role);
  if (req.admin.role !== 'superadmin') {
    return res.status(403).send('Access denied. Super admin privileges required.');
  }
  next();
};