const mongoose = require('mongoose');

let PortfolioModel;

if (global.useMockDb) {
  PortfolioModel = require('../config/mockDb').Portfolio;
} else {
  const holdingSchema = new mongoose.Schema({
    stock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stock',
      required: true
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative']
    },
    averagePrice: {
      type: Number,
      required: true,
      min: [0, 'Average price cannot be negative']
    }
  }, { _id: false });

  const portfolioSchema = new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
      },
      availableBalance: {
        type: Number,
        default: 0,
        min: [0, 'Available balance cannot be negative']
      },
      totalDeposited: {
        type: Number,
        default: 0
      },
      bankName: {
        type: String,
        default: ''
      },
      accountNumber: {
        type: String,
        default: ''
      },
      ifscCode: {
        type: String,
        default: ''
      },
      investedAmount: {
        type: Number,
        default: 0,
        min: [0, 'Invested amount cannot be negative']
      },
      profitLoss: {
        type: Number,
        default: 0
      },
      holdings: [holdingSchema]
    },
    {
      timestamps: true
    }
  );

  PortfolioModel = mongoose.model('Portfolio', portfolioSchema);
}

module.exports = {
  countDocuments: (q) => global.useMockDb ? require('../config/mockDb').Portfolio.countDocuments(q) : PortfolioModel.countDocuments(q),
  find: (q) => global.useMockDb ? require('../config/mockDb').Portfolio.find(q) : PortfolioModel.find(q),
  findOne: (q) => global.useMockDb ? require('../config/mockDb').Portfolio.findOne(q) : PortfolioModel.findOne(q),
  findById: (id) => global.useMockDb ? require('../config/mockDb').Portfolio.findById(id) : PortfolioModel.findById(id),
  create: (data) => global.useMockDb ? require('../config/mockDb').Portfolio.create(data) : PortfolioModel.create(data),
  insertMany: (items) => global.useMockDb ? require('../config/mockDb').Portfolio.insertMany(items) : PortfolioModel.insertMany(items),
  findByIdAndUpdate: (id, u) => global.useMockDb ? require('../config/mockDb').Portfolio.findByIdAndUpdate(id, u) : PortfolioModel.findByIdAndUpdate(id, u),
  distinct: (f) => global.useMockDb ? require('../config/mockDb').Portfolio.distinct(f) : PortfolioModel.distinct(f),
  deleteOne: (q) => global.useMockDb ? require('../config/mockDb').Portfolio.deleteOne(q) : PortfolioModel.deleteOne(q),
  deleteMany: (q) => global.useMockDb ? require('../config/mockDb').Portfolio.deleteMany(q) : PortfolioModel.deleteMany(q)
};
