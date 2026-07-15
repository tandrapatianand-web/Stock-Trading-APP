const mongoose = require('mongoose');

let StockModel;

if (global.useMockDb) {
  StockModel = require('../config/mockDb').Stock;
} else {
  const historicalPriceSchema = new mongoose.Schema({
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    price: {
      type: Number,
      required: true
    }
  }, { _id: false });

  const stockSchema = new mongoose.Schema(
    {
      symbol: {
        type: String,
        required: [true, 'Please add a stock symbol'],
        unique: true,
        trim: true,
        uppercase: true,
      },
      companyName: {
        type: String,
        required: [true, 'Please add a company name'],
      },
      sector: {
        type: String,
        required: [true, 'Please add a sector'],
      },
      industry: {
        type: String,
        required: [true, 'Please add an industry'],
      },
      currentPrice: {
        type: Number,
        required: [true, 'Please add a current price'],
      },
      change: {
        type: Number,
        default: 0,
      },
      changePercent: {
        type: Number,
        default: 0,
      },
      marketCap: {
        type: Number,
        required: true,
      },
      volume: {
        type: Number,
        required: true,
      },
      logo: {
        type: String,
        default: '',
      },
      historicalPrices: [historicalPriceSchema]
    },
    {
      timestamps: true,
    }
  );

  stockSchema.index({ symbol: 1 });
  stockSchema.index({ companyName: 'text', symbol: 'text' });

  StockModel = mongoose.model('Stock', stockSchema);
}

module.exports = {
  countDocuments: (q) => global.useMockDb ? require('../config/mockDb').Stock.countDocuments(q) : StockModel.countDocuments(q),
  find: (q) => global.useMockDb ? require('../config/mockDb').Stock.find(q) : StockModel.find(q),
  findOne: (q) => global.useMockDb ? require('../config/mockDb').Stock.findOne(q) : StockModel.findOne(q),
  findById: (id) => global.useMockDb ? require('../config/mockDb').Stock.findById(id) : StockModel.findById(id),
  create: (data) => global.useMockDb ? require('../config/mockDb').Stock.create(data) : StockModel.create(data),
  insertMany: (items) => global.useMockDb ? require('../config/mockDb').Stock.insertMany(items) : StockModel.insertMany(items),
  findByIdAndUpdate: (id, u) => global.useMockDb ? require('../config/mockDb').Stock.findByIdAndUpdate(id, u) : StockModel.findByIdAndUpdate(id, u),
  distinct: (f) => global.useMockDb ? require('../config/mockDb').Stock.distinct(f) : StockModel.distinct(f),
  deleteOne: (q) => global.useMockDb ? require('../config/mockDb').Stock.deleteOne(q) : StockModel.deleteOne(q),
  deleteMany: (q) => global.useMockDb ? require('../config/mockDb').Stock.deleteMany(q) : StockModel.deleteMany(q)
};
