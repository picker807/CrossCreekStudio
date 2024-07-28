const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['superadmin', 'admin'],
    default: 'admin',
  },
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

adminSchema.methods.toJSON = function() {
  const admin = this.toObject();
  delete admin.password;
  delete admin.__v;
  return admin;
};

adminSchema.statics.findByIdWithFullAccess = function(id) {
  return this.findById(id);
};

module.exports = mongoose.model('Admin', adminSchema, 'admin');