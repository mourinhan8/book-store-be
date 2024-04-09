const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  author: {
    type: String,
    required: true
  },
  stock: {
    type: String,
    default: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  coverImg: {
    type: String,
    required: true
  },
  tag: {
    type: String
  },
  status: {
    type: Number,
    default: 1,
  }
}, {
  timestamps: true
});

BookSchema.index({ title: 'text' });

module.exports = Book = mongoose.model('book', BookSchema);
