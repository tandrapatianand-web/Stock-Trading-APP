const mongoose = require('mongoose');

let TransactionModel;

if (global.useMockDb) {
  TransactionModel = require('../config/mockDb').Transaction;
} else {
  const transactionSchema = new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      stock: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
        required: false
      },
      symbol: {
        type: String,
        required: true,
        uppercase: true
      },
      type: {
        type: String,
        enum: ['buy', 'sell', 'deposit'],
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
      },
      price: {
        type: Number,
        required: true,
        min: [0.01, 'Price must be greater than 0']
      },
      total: {
        type: Number,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    },
    {
      timestamps: true
    }
  );

  TransactionModel = mongoose.model('Transaction', transactionSchema);
}

module.exports = {
  countDocuments: (q) => global.useMockDb ? require('../config/mockDb').Transaction.countDocuments(q) : TransactionModel.countDocuments(q),
  find: (q) => global.useMockDb ? require('../config/mockDb').Transaction.find(q) : TransactionModel.find(q),
  findOne: (q) => global.useMockDb ? require('../config/mockDb').Transaction.findOne(q) : TransactionModel.findOne(q),
  findById: (id) => global.useMockDb ? require('../config/mockDb').Transaction.findById(id) : TransactionModel.findById(id),
  create: (data) => global.useMockDb ? require('../config/mockDb').Transaction.create(data) : TransactionModel.create(data),
  insertMany: (items) => global.useMockDb ? require('../config/mockDb').Transaction.insertMany(items) : TransactionModel.insertMany(items),
  findByIdAndUpdate: (id, u) => global.useMockDb ? require('../config/mockDb').Transaction.findByIdAndUpdate(id, u) : TransactionModel.findByIdAndUpdate(id, u),
  distinct: (f) => global.useMockDb ? require('../config/mockDb').Transaction.distinct(f) : TransactionModel.distinct(f),
  deleteOne: (q) => global.useMockDb ? require('../config/mockDb').Transaction.deleteOne(q) : TransactionModel.deleteOne(q),
  deleteMany: (q) => global.useMockDb ? require('../config/mockDb').Transaction.deleteMany(q) : TransactionModel.deleteMany(q),
  aggregate: (pipeline) => global.useMockDb ? require('../config/mockDb').Transaction.aggregate(pipeline) : TransactionModel.aggregate(pipeline)
};
