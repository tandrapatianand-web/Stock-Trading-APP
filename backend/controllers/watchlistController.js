const Watchlist = require('../models/Watchlist');
const Stock = require('../models/Stock');

// @desc    Get user's watchlist
// @route   GET /api/watchlist
// @access  Private
const getWatchlist = async (req, res, next) => {
  try {
    const watchlist = await Watchlist.findOne({ user: req.user._id }).populate({
      path: 'stocks',
      select: 'companyName currentPrice change changePercent sector logo volume marketCap'
    });

    if (!watchlist) {
      res.status(404);
      throw new Error('Watchlist not found');
    }

    res.json({
      success: true,
      data: watchlist.stocks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add stock to watchlist
// @route   POST /api/watchlist
// @access  Private
const addToWatchlist = async (req, res, next) => {
  const { stockId } = req.body;

  try {
    if (!stockId) {
      res.status(400);
      throw new Error('Stock ID is required');
    }

    const stock = await Stock.findById(stockId);
    if (!stock) {
      res.status(404);
      throw new Error('Stock not found');
    }

    const watchlist = await Watchlist.findOne({ user: req.user._id });
    if (!watchlist) {
      res.status(404);
      throw new Error('Watchlist not found');
    }

    // Check if stock is already in watchlist
    if (watchlist.stocks.includes(stockId)) {
      res.status(400);
      throw new Error('Stock already in watchlist');
    }

    watchlist.stocks.push(stockId);
    await watchlist.save();

    res.json({
      success: true,
      message: 'Stock added to watchlist',
      data: watchlist.stocks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove stock from watchlist
// @route   DELETE /api/watchlist/:id
// @access  Private
const removeFromWatchlist = async (req, res, next) => {
  try {
    const watchlist = await Watchlist.findOne({ user: req.user._id });
    if (!watchlist) {
      res.status(404);
      throw new Error('Watchlist not found');
    }

    const stockId = req.params.id;

    // Check if stock exists in watchlist
    const index = watchlist.stocks.indexOf(stockId);
    if (index === -1) {
      res.status(400);
      throw new Error('Stock not found in watchlist');
    }

    watchlist.stocks.splice(index, 1);
    await watchlist.save();

    res.json({
      success: true,
      message: 'Stock removed from watchlist',
      data: watchlist.stocks
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist
};
