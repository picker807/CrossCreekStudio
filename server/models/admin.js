const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { 
    type: String, 
    required: true,
    maxlength: 50},
  email: { 
    type: String, 
    required: true,
    maxlength: 100, 
    unique: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  password: { 
    type: String, 
    required: true,
    maxlength: 50,
    validate: {
      validator: function(v) {
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        return passwordRegex.test(v);
      },
      message: props => 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number'
    }
  },
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

adminSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

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