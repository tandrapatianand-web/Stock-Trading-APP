const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');
const Watchlist = require('../models/Watchlist');

// @desc    Get all users (with portfolio info)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    const usersWithPortfolios = [];

    for (const user of users) {
      const portfolio = await Portfolio.findOne({ user: user._id });
      const tradeCount = await Transaction.countDocuments({ user: user._id });
      usersWithPortfolios.push({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        balance: portfolio ? portfolio.availableBalance : 0,
        invested: portfolio ? portfolio.investedAmount : 0,
        tradeCount
      });
    }

    res.json({
      success: true,
      data: usersWithPortfolios
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Cannot delete admin users');
    }

    // Delete user
    await User.deleteOne({ _id: user._id });
    
    // Delete user dependencies
    await Portfolio.deleteOne({ user: user._id });
    await Watchlist.deleteOne({ user: user._id });
    await Transaction.deleteMany({ user: user._id });

    res.json({
      success: true,
      message: 'User and associated data removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin dashboard analytics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalTrades = await Transaction.countDocuments();

    // Calculate total trade volume
    const volumeResult = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalVolume: { $sum: '$total' }
        }
      }
    ]);
    const totalVolume = volumeResult.length > 0 ? volumeResult[0].totalVolume : 0;

    // Calculate top traded stocks (by count)
    const topTradedStocks = await Transaction.aggregate([
      {
        $group: {
          _id: '$symbol',
          count: { $sum: 1 },
          totalValue: { $sum: '$total' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $project: {
          symbol: '$_id',
          count: 1,
          totalValue: 1,
          _id: 0
        }
      }
    ]);

    // Calculate average portfolio value
    const portfolios = await Portfolio.find({});
    let totalPortfolioVal = 0;
    portfolios.forEach(p => {
      // Approximate value using recorded investedAmount + availableBalance
      totalPortfolioVal += (p.availableBalance + p.investedAmount);
    });
    const avgPortfolioValue = portfolios.length > 0 ? totalPortfolioVal / portfolios.length : 100000;

    // Recent system-wide transactions
    const recentTransactions = await Transaction.find({})
      .populate('user', 'name email')
      .sort({ timestamp: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalAdmins,
        totalTrades,
        totalVolume: parseFloat(totalVolume.toFixed(2)),
        avgPortfolioValue: parseFloat(avgPortfolioValue.toFixed(2)),
        topTradedStocks,
        recentTransactions
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  deleteUser,
  getDashboardAnalytics
};
