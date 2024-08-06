const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const mongoose = require('mongoose'); 

exports.authMiddleware = async (req, res, next) => {
  //console.log('All headers:', req.headers);
  const authHeader = req.get('Authorization');
 // console.log('Authorization header:', authHeader);
  
  if (!authHeader) {
    console.error('Access denied. No token provided.');
    return res.status(401).send('Access denied. No token provided.');
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    console.error('Access denied. Invalid token.');
    return res.status(401).send('Access denied. Invalid token.');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //console.log('Decoded token:', decoded);

    //const id = decoded._id;
    //console.log('ID from token:', id);

    /* if (!isValidObjectId(id)) {
      console.error('Invalid ObjectId format:', id);
      return res.status(400).json({ message: 'Invalid token: malformed ID' });
    } */

    //const admin = await mongoose.connection.db.collection('admin').findOne( {_id: id} ).select('-password -__v');
    /* const objectId = new mongoose.Types.ObjectId(decoded.id);
     console.log(objectId); */
    req.admin = {
      id: decoded.id,
      role: decoded.role
    };
    //console.log("Admin found: ", admin);
    /* if (!admin) {
      console.error('Access denied. Invalid token. No admin');
      return res.status(401).send('Access denied. Invalid token.');
    } */
    //const adminObj = admin.toObject();

    // Remove sensitive fields
    //delete adminObj.password;
   // delete adminObj.__v;
    //adminObj._id = adminObj._id.toString();

    const simplifiedReq = {
      headers: req.headers,
      admin: req.admin,
      originalUrl: req.originalUrl,
      method: req.method,
      query: req.query,
      body: req.body
    };
    //console.log('Simplified Request Object:', safeStringify(simplifiedReq));
    next();

  } catch (error) {
    //console.error('Invalid token', error);
    next(error);
    res.status(400).json({ message: 'Invalid token' });
  }
};

exports.superAdminMiddleware = (req, res, next) => {
  //console.log('Role in superAdminMiddleware:', req.admin.role);
  if (req.admin.role !== 'superadmin') {
    return res.status(403).send('Access denied. Super admin privileges required.');
  }
  next();
};

/* function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
} */

function safeStringify(obj, indent = 2) {
  const cache = new Set();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        return '[Circular]';
      }
      cache.add(value);
    }
    return value;
  }, indent);
}