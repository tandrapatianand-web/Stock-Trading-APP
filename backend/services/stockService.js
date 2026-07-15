const Stock = require('../models/Stock');

const DEFAULT_STOCKS = [
  { symbol: 'RELIANCE', companyName: 'Reliance Industries Ltd.', sector: 'Energy', industry: 'Oil & Gas—Refining & Marketing', currentPrice: 2450.50, marketCap: 16500000000000, volume: 6200000, logo: 'https://logo.clearbit.com/relianceindustries.com' },
  { symbol: 'TCS', companyName: 'Tata Consultancy Services Ltd.', sector: 'Technology', industry: 'Information Technology Services', currentPrice: 3920.10, marketCap: 14300000000000, volume: 1500000, logo: 'https://logo.clearbit.com/tcs.com' },
  { symbol: 'HDFCBANK', companyName: 'HDFC Bank Limited', sector: 'Financial Services', industry: 'Banks—Diversified', currentPrice: 1560.80, marketCap: 11800000000000, volume: 9200000, logo: 'https://logo.clearbit.com/hdfcbank.com' },
  { symbol: 'INFY', companyName: 'Infosys Limited', sector: 'Technology', industry: 'Information Technology Services', currentPrice: 1480.40, marketCap: 6100000000000, volume: 3800000, logo: 'https://logo.clearbit.com/infosys.com' },
  { symbol: 'ICICIBANK', companyName: 'ICICI Bank Limited', sector: 'Financial Services', industry: 'Banks—Diversified', currentPrice: 1120.20, marketCap: 7800000000000, volume: 7500000, logo: 'https://logo.clearbit.com/icicibank.com' },
  { symbol: 'HINDUNILVR', companyName: 'Hindustan Unilever Limited', sector: 'Consumer Defensive', industry: 'Household & Personal Products', currentPrice: 2450.30, marketCap: 5700000000000, volume: 800000, logo: 'https://logo.clearbit.com/hul.co.in' },
  { symbol: 'ITC', companyName: 'ITC Limited', sector: 'Consumer Defensive', industry: 'Tobacco & FMCG', currentPrice: 420.90, marketCap: 5200000000000, volume: 12000000, logo: 'https://logo.clearbit.com/itcportal.com' },
  { symbol: 'SBIN', companyName: 'State Bank of India', sector: 'Financial Services', industry: 'Banks—Diversified', currentPrice: 830.40, marketCap: 7400000000000, volume: 14000000, logo: 'https://logo.clearbit.com/sbi.co.in' },
  { symbol: 'BHARTIARTL', companyName: 'Bharti Airtel Limited', sector: 'Communication Services', industry: 'Telecom Services', currentPrice: 1340.50, marketCap: 7600000000000, volume: 2800000, logo: 'https://logo.clearbit.com/airtel.in' },
  { symbol: 'LT', companyName: 'Larsen & Toubro Limited', sector: 'Industrials', industry: 'Engineering & Construction', currentPrice: 3560.20, marketCap: 4800000000000, volume: 1100000, logo: 'https://logo.clearbit.com/larsentoubro.com' },
  { symbol: 'KOTAKBANK', companyName: 'Kotak Mahindra Bank Limited', sector: 'Financial Services', industry: 'Banks—Diversified', currentPrice: 1720.60, marketCap: 3400000000000, volume: 1800000, logo: 'https://logo.clearbit.com/kotak.com' },
  { symbol: 'AXISBANK', companyName: 'Axis Bank Limited', sector: 'Financial Services', industry: 'Banks—Diversified', currentPrice: 1210.30, marketCap: 3700000000000, volume: 3200000, logo: 'https://logo.clearbit.com/axisbank.com' },
  { symbol: 'HCLTECH', companyName: 'HCL Technologies Limited', sector: 'Technology', industry: 'Information Technology Services', currentPrice: 1320.80, marketCap: 3500000000000, volume: 2200000, logo: 'https://logo.clearbit.com/hcltech.com' },
  { symbol: 'ASIANPAINT', companyName: 'Asian Paints Limited', sector: 'Consumer Defensive', industry: 'Specialty Chemicals', currentPrice: 2890.50, marketCap: 2700000000000, volume: 900000, logo: 'https://logo.clearbit.com/asianpaints.com' },
  { symbol: 'MARUTI', companyName: 'Maruti Suzuki India Limited', sector: 'Consumer Cyclical', industry: 'Auto Manufacturers', currentPrice: 12100.00, marketCap: 3600000000000, volume: 400000, logo: 'https://logo.clearbit.com/marutisuzuki.com' },
  { symbol: 'SUNPHARMA', companyName: 'Sun Pharmaceutical Industries Limited', sector: 'Healthcare', industry: 'Drug Manufacturers—General', currentPrice: 1490.15, marketCap: 3500000000000, volume: 1500000, logo: 'https://logo.clearbit.com/sunpharma.com' }
];

// Helper to generate 30 days of historical prices
const generateHistory = (startPrice) => {
  const history = [];
  const now = new Date();
  let tempPrice = startPrice;
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    // Add minor random walks
    const change = (Math.random() - 0.49) * 0.04; // Slightly positive bias
    tempPrice = parseFloat((tempPrice * (1 + change)).toFixed(2));
    history.push({ date, price: tempPrice });
  }
  return history;
};

// Seed database with stocks if collection is empty
const seedStocks = async () => {
  try {
    const count = await Stock.countDocuments();
    if (count === 0) {
      console.log('Seeding initial stock database...');
      const stocksToInsert = DEFAULT_STOCKS.map(s => ({
        ...s,
        change: 0,
        changePercent: 0,
        historicalPrices: generateHistory(s.currentPrice)
      }));
      await Stock.insertMany(stocksToInsert);
      console.log('Stock database seeded successfully.');
    }
  } catch (error) {
    console.error('Error seeding stocks:', error.message);
  }
};

// Start price simulator that runs in the background
const startPriceSimulator = () => {
  console.log('Starting Stock Price Simulator Service...');
  // Runs every 15 seconds
  setInterval(async () => {
    try {
      const stocks = await Stock.find();
      for (const stock of stocks) {
        // Random change between -1.5% and +1.5%
        const percentChange = (Math.random() - 0.5) * 3; // e.g. from -1.5 to +1.5
        const currentPrice = stock.currentPrice;
        const newPrice = parseFloat((currentPrice * (1 + percentChange / 100)).toFixed(2));
        const change = parseFloat((newPrice - (stock.historicalPrices[stock.historicalPrices.length - 2]?.price || currentPrice)).toFixed(2));
        const changePercent = parseFloat(((change / (newPrice - change)) * 100).toFixed(2)) || 0;

        // Random volume updates
        const volChange = Math.floor((Math.random() - 0.5) * 50000);
        const newVolume = Math.max(10000, stock.volume + volChange);

        // Manage history: Add new price to history, limit history array size to 100 to avoid DB bloat
        let historicalPrices = [...stock.historicalPrices];
        const lastEntry = historicalPrices[historicalPrices.length - 1];
        const now = new Date();

        // If last entry was today (same minute/hour just update or append depending on simulated frequency)
        // Here we append a new entry and keep last 100 entries.
        historicalPrices.push({ date: now, price: newPrice });
        if (historicalPrices.length > 100) {
          historicalPrices.shift();
        }

        await Stock.findByIdAndUpdate(stock._id, {
          currentPrice: newPrice,
          change: parseFloat((newPrice - historicalPrices[0].price).toFixed(2)), // change since start of history
          changePercent: parseFloat((((newPrice - historicalPrices[0].price) / historicalPrices[0].price) * 100).toFixed(2)),
          volume: newVolume,
          historicalPrices
        });
      }
    } catch (error) {
      console.error('Error running price simulation:', error.message);
    }
  }, 15000);
};

module.exports = { seedStocks, startPriceSimulator };
