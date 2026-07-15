const Portfolio = require('../models/Portfolio');
const Stock = require('../models/Stock');

// @desc    Get user portfolio with real-time value calculations
// @route   GET /api/portfolio
// @access  Private
const getPortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user._id }).populate({
      path: 'holdings.stock',
      select: 'companyName currentPrice change changePercent sector logo'
    });

    if (!portfolio) {
      res.status(404);
      throw new Error('Portfolio not found');
    }

    let investedAmount = 0;
    let currentEquity = 0;
    const activeHoldings = [];

    // Recalculate each holding based on the latest current prices from populated Stock info
    for (const holding of portfolio.holdings) {
      const stockInfo = holding.stock;
      if (!stockInfo) continue; // Stock might have been deleted by admin

      const qty = holding.quantity;
      const avgPrice = holding.averagePrice;
      const currentPrice = stockInfo.currentPrice;

      const cost = qty * avgPrice;
      const value = qty * currentPrice;
      const gainLoss = value - cost;
      const gainLossPercent = cost > 0 ? (gainLoss / cost) * 100 : 0;

      investedAmount += cost;
      currentEquity += value;

      activeHoldings.push({
        stockId: stockInfo._id,
        symbol: holding.symbol,
        companyName: stockInfo.companyName,
        quantity: qty,
        averagePrice: parseFloat(avgPrice.toFixed(2)),
        currentPrice: currentPrice,
        change: stockInfo.change,
        changePercent: stockInfo.changePercent,
        sector: stockInfo.sector,
        logo: stockInfo.logo,
        totalCost: parseFloat(cost.toFixed(2)),
        currentValue: parseFloat(value.toFixed(2)),
        gainLoss: parseFloat(gainLoss.toFixed(2)),
        gainLossPercent: parseFloat(gainLossPercent.toFixed(2))
      });
    }

    const totalPortfolioValue = portfolio.availableBalance + currentEquity;
    // P&L based on actual money deposited
    const totalDeposited = portfolio.totalDeposited || 0;
    const totalProfitLoss = totalPortfolioValue - totalDeposited;
    const totalProfitLossPercent = totalDeposited > 0 ? (totalProfitLoss / totalDeposited) * 100 : 0;

    // Update the portfolio document in db
    portfolio.investedAmount = parseFloat(investedAmount.toFixed(2));
    portfolio.profitLoss = parseFloat((currentEquity - investedAmount).toFixed(2)); // Unrealized gain/loss
    await portfolio.save();

    res.json({
      success: true,
      data: {
        _id: portfolio._id,
        availableBalance: parseFloat(portfolio.availableBalance.toFixed(2)),
        investedAmount: parseFloat(investedAmount.toFixed(2)),
        currentEquity: parseFloat(currentEquity.toFixed(2)),
        totalValue: parseFloat(totalPortfolioValue.toFixed(2)),
        profitLoss: parseFloat(totalProfitLoss.toFixed(2)), // Net P&L since start
        profitLossPercent: parseFloat(totalProfitLossPercent.toFixed(2)),
        unrealizedProfitLoss: parseFloat(portfolio.profitLoss.toFixed(2)),
        totalDeposited: parseFloat(totalDeposited.toFixed(2)),
        bankName: portfolio.bankName || '',
        accountNumber: portfolio.accountNumber || '',
        ifscCode: portfolio.ifscCode || '',
        holdings: activeHoldings
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add funds to portfolio with mock bank details
// @route   POST /api/portfolio/add-funds
// @access  Private
const addFunds = async (req, res, next) => {
  const { amount, bankName, accountNumber, ifscCode } = req.body;

  try {
    const depositAmt = Number(amount);
    if (isNaN(depositAmt) || depositAmt <= 0) {
      res.status(400);
      throw new Error('Please enter a valid deposit amount');
    }

    const portfolio = await Portfolio.findOne({ user: req.user._id });
    if (!portfolio) {
      res.status(404);
      throw new Error('Portfolio not found');
    }

    // Initialize/Update bank details and available balance
    portfolio.availableBalance += depositAmt;
    portfolio.totalDeposited = (portfolio.totalDeposited || 0) + depositAmt;
    
    if (bankName) portfolio.bankName = bankName;
    if (accountNumber) portfolio.accountNumber = accountNumber;
    if (ifscCode) portfolio.ifscCode = ifscCode;

    await portfolio.save();

    // Create a transaction of type 'deposit'
    const Transaction = require('../models/Transaction');
    await Transaction.create({
      user: req.user._id,
      symbol: 'DEPOSIT',
      type: 'deposit',
      quantity: 1,
      price: depositAmt,
      total: depositAmt,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: `Successfully deposited ₹${depositAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })} into your sandbox wallet.`,
      data: {
        availableBalance: portfolio.availableBalance,
        totalDeposited: portfolio.totalDeposited,
        bankName: portfolio.bankName,
        accountNumber: portfolio.accountNumber,
        ifscCode: portfolio.ifscCode
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPortfolio,
  addFunds
};
