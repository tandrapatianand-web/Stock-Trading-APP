const express = require('express');
const router = express.Router();
const { getStocks, getStockById, createStock, updateStock, deleteStock } = require('../controllers/stockController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getStocks)
  .post(protect, admin, createStock);

router.route('/:id')
  .get(getStockById)
  .put(protect, admin, updateStock)
  .delete(protect, admin, deleteStock);

module.exports = router;
