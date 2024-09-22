const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  firstName: { type: String, required: true, maxlength: 50 },
  lastName: { type: String, required: true, maxlength: 50 },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    maxlength: 100,
    validate: {
      validator: function(v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  phone: { type: String, required: true },
  compositeKey: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('User', UserSchema, 'users');