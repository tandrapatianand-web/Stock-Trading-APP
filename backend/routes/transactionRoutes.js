const express = require('express');
const router = express.Router();
const { getTransactions } = require('../controllers/tradeController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getTransactions);

module.exports = router;
