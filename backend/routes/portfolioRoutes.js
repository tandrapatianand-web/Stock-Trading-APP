const express = require('express');
const router = express.Router();
const { getPortfolio, addFunds } = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getPortfolio);
router.post('/add-funds', protect, addFunds);

module.exports = router;
