const mongoose = require('mongoose');
const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Number, required: true },
  description: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

SettingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Setting', SettingSchema, 'settings');