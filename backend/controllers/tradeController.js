const Portfolio = require('../models/Portfolio');
const Stock = require('../models/Stock');
const Transaction = require('../models/Transaction');

// @desc    Buy shares of a stock
// @route   POST /api/trade/buy
// @access  Private
const buyStock = async (req, res, next) => {
  const { stockId, quantity } = req.body;

  try {
    const qty = Number(quantity);
    if (!qty || qty <= 0 || !Number.isInteger(qty)) {
      res.status(400);
      throw new Error('Quantity must be a positive integer');
    }

    const stock = await Stock.findById(stockId);
    if (!stock) {
      res.status(404);
      throw new Error('Stock not found');
    }

    const portfolio = await Portfolio.findOne({ user: req.user._id });
    if (!portfolio) {
      res.status(404);
      throw new Error('Portfolio not found');
    }

    const price = stock.currentPrice;
    const totalCost = qty * price;

    // Validate balance
    if (portfolio.availableBalance < totalCost) {
      res.status(400);
      throw new Error(`Insufficient funds. Required: ₹${totalCost.toFixed(2)}, Available: ₹${portfolio.availableBalance.toFixed(2)}`);
    }

    // Process trade: Deduct cash balance
    portfolio.availableBalance -= totalCost;

    // Update holdings
    const holdingIndex = portfolio.holdings.findIndex(
      (h) => h.stock.toString() === stockId.toString()
    );

    if (holdingIndex >= 0) {
      // Existing holding - update average price and quantity
      const existing = portfolio.holdings[holdingIndex];
      const newQty = existing.quantity + qty;
      const newAvg = (existing.quantity * existing.averagePrice + qty * price) / newQty;

      portfolio.holdings[holdingIndex].quantity = newQty;
      portfolio.holdings[holdingIndex].averagePrice = parseFloat(newAvg.toFixed(4));
    } else {
      // New holding
      portfolio.holdings.push({
        stock: stock._id,
        symbol: stock.symbol,
        quantity: qty,
        averagePrice: price
      });
    }

    await portfolio.save();

    // Create transaction record
    const transaction = await Transaction.create({
      user: req.user._id,
      stock: stock._id,
      symbol: stock.symbol,
      type: 'buy',
      quantity: qty,
      price: price,
      total: totalCost
    });

    res.status(201).json({
      success: true,
      message: `Successfully bought ${qty} shares of ${stock.symbol}`,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sell shares of a stock
// @route   POST /api/trade/sell
// @access  Private
const sellStock = async (req, res, next) => {
  const { stockId, quantity } = req.body;

  try {
    const qty = Number(quantity);
    if (!qty || qty <= 0 || !Number.isInteger(qty)) {
      res.status(400);
      throw new Error('Quantity must be a positive integer');
    }

    const stock = await Stock.findById(stockId);
    if (!stock) {
      res.status(404);
      throw new Error('Stock not found');
    }

    const portfolio = await Portfolio.findOne({ user: req.user._id });
    if (!portfolio) {
      res.status(404);
      throw new Error('Portfolio not found');
    }

    const holdingIndex = portfolio.holdings.findIndex(
      (h) => h.stock.toString() === stockId.toString()
    );

    if (holdingIndex === -1) {
      res.status(400);
      throw new Error(`You do not hold shares of ${stock.symbol}`);
    }

    const holding = portfolio.holdings[holdingIndex];

    // Validate quantity
    if (holding.quantity < qty) {
      res.status(400);
      throw new Error(`Insufficient shares. You hold ${holding.quantity} shares, but tried to sell ${qty}`);
    }

    const price = stock.currentPrice;
    const revenue = qty * price;

    // Process trade: Add cash balance
    portfolio.availableBalance += revenue;

    // Update holdings
    if (holding.quantity === qty) {
      // Remove holding if all shares sold
      portfolio.holdings.splice(holdingIndex, 1);
    } else {
      // Decrement quantity
      portfolio.holdings[holdingIndex].quantity -= qty;
    }

    await portfolio.save();

    // Create transaction record
    const transaction = await Transaction.create({
      user: req.user._id,
      stock: stock._id,
      symbol: stock.symbol,
      type: 'sell',
      quantity: qty,
      price: price,
      total: revenue
    });

    res.status(201).json({
      success: true,
      message: `Successfully sold ${qty} shares of ${stock.symbol}`,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's transactions (with search, sort, and pagination)
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const { search, type, page = 1, limit = 10 } = req.query;

    const query = {};

    // Only fetch for current user, unless admin is requesting (admin routes are handled separately or auth matches)
    query.user = req.user._id;

    if (search) {
      query.symbol = { $regex: search, $options: 'i' };
    }

    if (type && type !== 'All') {
      query.type = type;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      },
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  buyStock,
  sellStock,
  getTransactions
};
