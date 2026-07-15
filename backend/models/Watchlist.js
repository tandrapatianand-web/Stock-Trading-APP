const mongoose = require('mongoose');

let WatchlistModel;

if (global.useMockDb) {
  WatchlistModel = require('../config/mockDb').Watchlist;
} else {
  const watchlistSchema = new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
      },
      stocks: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Stock'
        }
      ]
    },
    {
      timestamps: true
    }
  );

  WatchlistModel = mongoose.model('Watchlist', watchlistSchema);
}

module.exports = {
  countDocuments: (q) => global.useMockDb ? require('../config/mockDb').Watchlist.countDocuments(q) : WatchlistModel.countDocuments(q),
  find: (q) => global.useMockDb ? require('../config/mockDb').Watchlist.find(q) : WatchlistModel.find(q),
  findOne: (q) => global.useMockDb ? require('../config/mockDb').Watchlist.findOne(q) : WatchlistModel.findOne(q),
  findById: (id) => global.useMockDb ? require('../config/mockDb').Watchlist.findById(id) : WatchlistModel.findById(id),
  create: (data) => global.useMockDb ? require('../config/mockDb').Watchlist.create(data) : WatchlistModel.create(data),
  insertMany: (items) => global.useMockDb ? require('../config/mockDb').Watchlist.insertMany(items) : WatchlistModel.insertMany(items),
  findByIdAndUpdate: (id, u) => global.useMockDb ? require('../config/mockDb').Watchlist.findByIdAndUpdate(id, u) : WatchlistModel.findByIdAndUpdate(id, u),
  distinct: (f) => global.useMockDb ? require('../config/mockDb').Watchlist.distinct(f) : WatchlistModel.distinct(f),
  deleteOne: (q) => global.useMockDb ? require('../config/mockDb').Watchlist.deleteOne(q) : WatchlistModel.deleteOne(q),
  deleteMany: (q) => global.useMockDb ? require('../config/mockDb').Watchlist.deleteMany(q) : WatchlistModel.deleteMany(q)
};
