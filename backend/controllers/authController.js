const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Watchlist = require('../models/Watchlist');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'sbstocks_secret_jwt_key_2026_premium', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email');
    }

    // Determine role (first registered user can be admin, or check user input for role if in sandbox)
    // For simplicity, default is user, unless name starts with admin or email is admin@sbstocks.com
    let role = 'user';
    if (email === 'admin@sbstocks.com' || name.toLowerCase().includes('admin-master')) {
      role = 'admin';
    }

    const user = await User.create({
      name,
      email,
      password,
      role
    });

    if (user) {
      // Create empty portfolio with 0 virtual balance
      await Portfolio.create({
        user: user._id,
        availableBalance: 0,
        totalDeposited: 0,
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        investedAmount: 0,
        profitLoss: 0,
        holdings: []
      });

      // Create empty watchlist
      await Watchlist.create({
        user: user._id,
        stocks: []
      });

      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        }
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        }
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};
