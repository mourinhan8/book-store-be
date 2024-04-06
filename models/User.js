const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  point: {
    type: Number,
    default: 0
  },
  role: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true,
});

module.exports = User = mongoose.model('user', UserSchema);
