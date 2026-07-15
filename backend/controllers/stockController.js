const Stock = require('../models/Stock');

// @desc    Get all stocks with filtering, search, sorting and pagination
// @route   GET /api/stocks
// @access  Public
const getStocks = async (req, res, next) => {
  try {
    const { search, sector, sort, page = 1, limit = 10 } = req.query;

    const query = {};

    // Search filter (text search on symbol or companyName)
    if (search) {
      query.$or = [
        { symbol: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }

    // Sector filter
    if (sector && sector !== 'All') {
      query.sector = sector;
    }

    // Sorting
    let sortQuery = {};
    if (sort) {
      const parts = sort.split(':');
      sortQuery[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      sortQuery.symbol = 1; // Default sort
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Stock.countDocuments(query);
    const stocks = await Stock.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum);

    // Get unique sectors for filter list
    const sectors = await Stock.distinct('sector');

    res.json({
      success: true,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      },
      sectors,
      data: stocks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single stock details
// @route   GET /api/stocks/:id
// @access  Public
const getStockById = async (req, res, next) => {
  try {
    const stock = await Stock.findById(req.params.id);

    if (stock) {
      res.json({
        success: true,
        data: stock
      });
    } else {
      res.status(404);
      throw new Error('Stock not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a stock (Admin only)
// @route   POST /api/stocks
// @access  Private/Admin
const createStock = async (req, res, next) => {
  const { symbol, companyName, sector, industry, currentPrice, marketCap, volume, logo } = req.body;

  try {
    const stockExists = await Stock.findOne({ symbol: symbol.toUpperCase() });

    if (stockExists) {
      res.status(400);
      throw new Error('Stock with this symbol already exists');
    }

    // Initialize with current price as first history point
    const historicalPrices = [{ date: new Date(), price: Number(currentPrice) }];

    const stock = await Stock.create({
      symbol: symbol.toUpperCase(),
      companyName,
      sector,
      industry,
      currentPrice: Number(currentPrice),
      marketCap: Number(marketCap),
      volume: Number(volume),
      logo: logo || `https://logo.clearbit.com/${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      historicalPrices
    });

    res.status(201).json({
      success: true,
      data: stock
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a stock (Admin only)
// @route   PUT /api/stocks/:id
// @access  Private/Admin
const updateStock = async (req, res, next) => {
  try {
    const stock = await Stock.findById(req.params.id);

    if (!stock) {
      res.status(404);
      throw new Error('Stock not found');
    }

    const { companyName, sector, industry, currentPrice, marketCap, volume, logo } = req.body;

    stock.companyName = companyName || stock.companyName;
    stock.sector = sector || stock.sector;
    stock.industry = industry || stock.industry;
    stock.marketCap = marketCap !== undefined ? Number(marketCap) : stock.marketCap;
    stock.volume = volume !== undefined ? Number(volume) : stock.volume;
    stock.logo = logo || stock.logo;

    if (currentPrice !== undefined && Number(currentPrice) !== stock.currentPrice) {
      const oldPrice = stock.currentPrice;
      const newPrice = Number(currentPrice);
      stock.currentPrice = newPrice;
      stock.change = parseFloat((newPrice - stock.historicalPrices[0].price).toFixed(2));
      stock.changePercent = parseFloat((((newPrice - stock.historicalPrices[0].price) / stock.historicalPrices[0].price) * 100).toFixed(2));
      
      // Append to history
      stock.historicalPrices.push({ date: new Date(), price: newPrice });
      if (stock.historicalPrices.length > 100) {
        stock.historicalPrices.shift();
      }
    }

    const updatedStock = await stock.save();

    res.json({
      success: true,
      data: updatedStock
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a stock (Admin only)
// @route   DELETE /api/stocks/:id
// @access  Private/Admin
const deleteStock = async (req, res, next) => {
  try {
    const stock = await Stock.findById(req.params.id);

    if (stock) {
      await Stock.deleteOne({ _id: stock._id });
      res.json({
        success: true,
        message: 'Stock removed successfully'
      });
    } else {
      res.status(404);
      throw new Error('Stock not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStocks,
  getStockById,
  createStock,
  updateStock,
  deleteStock
};
