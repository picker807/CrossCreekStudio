const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  firstName: { type: String, required: true, maxlength: 50 },
  lastName: { type: String, required: true, maxlength: 50 },
  email: { 
    type: String, 
    required: true, 
    maxlength: 100,
    match: /^[^\s@]+@[^\s@]+$/,
  },
  phone: { type: String, required: true },
  compositeKey: { type: String, required: true, unique: true } // "firstname_lastname_email"
});

module.exports = mongoose.model('User', UserSchema, 'users');