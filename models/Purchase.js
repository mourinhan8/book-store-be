const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  fullName: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: true
  },
  phoneNumber: {
    type: String,
    require: true
  },
  address: {
    type: String,
    require: true
  },
  note: {
    type: String
  },
  books: [{
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'book',
    },
    quantity: {
      type: Number
    },
    price: {
      type: Number
    }
  }],
  status: {
    type: Number,
    default: 1 // 1: active, 2: cancel, 3: done
  },
  totalValue: {
    type: Number,
    require: true
  }
}, {
  timestamps: true,
});

module.exports = Purchase = mongoose.model('purchase', PurchaseSchema);
