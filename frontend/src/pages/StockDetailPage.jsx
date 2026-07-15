import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStockDetail, clearCurrentStock } from '../redux/slices/stockSlice';
import { fetchPortfolio, buyStockOrder, sellStockOrder, clearTradeMessages } from '../redux/slices/portfolioSlice';
import { fetchWatchlist, addToWatchlist, removeFromWatchlist } from '../redux/slices/watchlistSlice';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Heart, 
  ShoppingBag, 
  BadgePercent,
  Coins,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'react-toastify';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StockDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentStock, isDetailLoading } = useSelector((state) => state.stocks);
  const { portfolio, isTrading, successMessage, error: tradeError } = useSelector((state) => state.portfolio);
  const { watchlist } = useSelector((state) => state.watchlist);

  const [tradeQuantity, setTradeQuantity] = useState('');
  const [tradeType, setTradeType] = useState('buy'); // 'buy' or 'sell'

  useEffect(() => {
    dispatch(fetchStockDetail(id));
    dispatch(fetchPortfolio());
    dispatch(fetchWatchlist());

    return () => {
      dispatch(clearCurrentStock());
      dispatch(clearTradeMessages());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      setTradeQuantity('');
      dispatch(clearTradeMessages());
      dispatch(fetchStockDetail(id)); // Reload details for history changes
    }
    if (tradeError) {
      toast.error(tradeError);
      dispatch(clearTradeMessages());
    }
  }, [successMessage, tradeError, dispatch, id]);

  if (isDetailLoading || !currentStock) {
    return (
      <div className="d-flex flex-column gap-3 py-4 text-light">
        <div className="skeleton" style={{ height: '60px', width: '200px' }}></div>
        <div className="skeleton" style={{ height: '350px', width: '100%' }}></div>
        <div className="row g-4 mt-2">
          <div className="col-md-6 skeleton" style={{ height: '180px' }}></div>
          <div className="col-md-6 skeleton" style={{ height: '180px' }}></div>
        </div>
      </div>
    );
  }

  // Calculate high, low, open, close from history
  const history = currentStock.historicalPrices || [];
  const prices = history.map((h) => h.price);
  const high = prices.length > 0 ? Math.max(...prices) : currentStock.currentPrice;
  const low = prices.length > 0 ? Math.min(...prices) : currentStock.currentPrice;
  const open = prices.length > 0 ? prices[0] : currentStock.currentPrice;
  const close = currentStock.currentPrice;

  // Render chart data
  const chartData = {
    labels: history.map((h) => new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
    datasets: [{
      label: `${currentStock.symbol} Price (₹)`,
      data: prices,
      borderColor: currentStock.change >= 0 ? '#00d09c' : '#eb5b3c',
      backgroundColor: currentStock.change >= 0 ? 'rgba(0, 208, 156, 0.05)' : 'rgba(235, 91, 60, 0.05)',
      fill: true,
      tension: 0.15,
      pointRadius: 2,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'var(--bg-secondary)',
        titleColor: 'var(--text-primary)',
        bodyColor: 'var(--text-secondary)',
        borderColor: 'var(--border-color)',
        borderWidth: 1
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: 'var(--text-secondary)', maxTicksLimit: 8 } },
      y: { grid: { color: 'var(--border-color)' }, ticks: { color: 'var(--text-secondary)' } }
    }
  };

  // Watchlist status
  const watched = watchlist.some((item) => item._id === currentStock._id);
  const handleWatchlistToggle = () => {
    if (watched) {
      dispatch(removeFromWatchlist(currentStock._id))
        .unwrap()
        .then(() => toast.info('Removed from watchlist'))
        .catch((err) => toast.error(err));
    } else {
      dispatch(addToWatchlist(currentStock._id))
        .unwrap()
        .then(() => toast.success('Added to watchlist'))
        .catch((err) => toast.error(err));
    }
  };

  // User holdings info
  const userHolding = portfolio?.holdings?.find(
    (h) => h.stockId.toString() === currentStock._id.toString()
  );
  const quantityHeld = userHolding ? userHolding.quantity : 0;
  const avgCostBasis = userHolding ? userHolding.averagePrice : 0;

  // Trading validations
  const qty = Number(tradeQuantity);
  const estimatedCost = qty * currentStock.currentPrice;
  const isUp = currentStock.change >= 0;

  const handleTradeSubmit = (e) => {
    e.preventDefault();
    if (!qty || qty <= 0) {
      toast.warning('Please enter a positive quantity');
      return;
    }

    if (tradeType === 'buy') {
      if (portfolio.availableBalance < estimatedCost) {
        toast.error('Insufficient cash balance');
        return;
      }
      dispatch(buyStockOrder({ stockId: currentStock._id, quantity: qty }));
    } else {
      if (quantityHeld < qty) {
        toast.error(`You only hold ${quantityHeld} shares`);
        return;
      }
      dispatch(sellStockOrder({ stockId: currentStock._id, quantity: qty }));
    }
  };

  return (
    <div className="container-fluid p-0 animate-fade-in">
      {/* Back navigation */}
      <Link to="/trade" className="text-decoration-none small fw-semibold d-inline-flex align-items-center gap-2 mb-4" style={{ color: 'var(--text-secondary)' }}>
        <ArrowLeft size={16} />
        <span>Back to Directory</span>
      </Link>

      {/* Header Profile Title row */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="stock-logo-circle bg-white text-dark fs-3" style={{ width: '56px', height: '56px' }}>
            {currentStock.symbol.slice(0, 2)}
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h2 className="fw-bold m-0" style={{ color: 'var(--text-primary)' }}>{currentStock.companyName}</h2>
              <span className="badge bg-secondary-subtle text-light fw-bold px-2 py-1 fs-6" style={{ color: 'var(--text-primary)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                {currentStock.symbol}
              </span>
            </div>
            <p className="text-muted small m-0" style={{ color: 'var(--text-secondary)' }}>
              {currentStock.sector} &bull; {currentStock.industry}
            </p>
          </div>
        </div>

        {/* Real-time price summary card */}
        <div className="d-flex align-items-center gap-4">
          <div className="text-md-end">
            <h2 className="fw-extrabold m-0" style={{ color: 'var(--text-primary)' }}>
              ₹{currentStock.currentPrice.toFixed(2)}
            </h2>
            <div className="d-flex align-items-center gap-2 justify-content-md-end mt-1">
              <span className={isUp ? 'price-up fw-semibold' : 'price-down fw-semibold'}>
                {isUp ? '+' : ''}₹{currentStock.change.toFixed(2)}
              </span>
              <span className={isUp ? 'badge-up' : 'badge-down'}>
                {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isUp ? '+' : ''}{currentStock.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>

          <button
            onClick={handleWatchlistToggle}
            className="btn btn-premium-outline p-3 rounded-3 border-color"
            style={{ color: watched ? 'var(--danger-color)' : 'var(--text-secondary)' }}
            title={watched ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <Heart size={20} fill={watched ? 'var(--danger-color)' : 'none'} stroke={watched ? 'var(--danger-color)' : 'currentColor'} />
          </button>
        </div>
      </div>

      {/* Visual Chart */}
      <div className="sb-card p-4 mb-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <h5 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>Historical Price Action (30D)</h5>
        <div style={{ height: '350px' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Statistics and Trade Panel Grid */}
      <div className="row g-4">
        {/* Key statistics */}
        <div className="col-lg-6">
          <div className="sb-card p-4 h-100" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <h5 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>Key Market Metrics</h5>
            <div className="row g-3">
              {[
                { label: 'Open Price', value: `₹${open.toFixed(2)}` },
                { label: 'Previous Close', value: `₹${close.toFixed(2)}` },
                { label: '30D High Range', value: `₹${high.toFixed(2)}`, color: 'text-success' },
                { label: '30D Low Range', value: `₹${low.toFixed(2)}`, color: 'text-danger' },
                { label: 'Market Cap', value: `₹${(currentStock.marketCap / 1e7).toLocaleString(undefined, { maximumFractionDigits: 0 })} Cr` },
                { label: 'Trading Volume', value: currentStock.volume.toLocaleString() },
              ].map((stat, idx) => (
                <div key={idx} className="col-6 border-bottom border-color pb-3 last-no-border">
                  <span className="small text-muted d-block" style={{ color: 'var(--text-secondary)' }}>{stat.label}</span>
                  <span className={`fw-bold fs-6 ${stat.color || ''}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trading System Box */}
        <div className="col-lg-6">
          <div className="sb-card p-4 h-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <h5 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Simulated Execution Desk</h5>
            
            {/* Holdings Summary */}
            <div className="d-flex justify-content-between p-3 rounded-3 mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
              <div>
                <span className="small text-muted d-block" style={{ color: 'var(--text-secondary)' }}>Portfolio Holdings</span>
                <span className="fw-bold text-light" style={{ color: 'var(--text-primary)' }}>{quantityHeld} shares</span>
              </div>
              {quantityHeld > 0 && (
                <div className="text-end">
                  <span className="small text-muted d-block" style={{ color: 'var(--text-secondary)' }}>Avg Cost Basis</span>
                  <span className="fw-bold text-light" style={{ color: 'var(--text-primary)' }}>₹{avgCostBasis.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Buy / Sell Tabs */}
            <div className="d-flex mb-3 rounded-3 overflow-hidden p-1" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
              <button
                className={`btn flex-grow-1 border-0 fw-semibold rounded-3 py-2 ${tradeType === 'buy' ? 'bg-success text-white' : 'text-secondary'}`}
                onClick={() => setTradeType('buy')}
                style={{ backgroundColor: tradeType === 'buy' ? 'var(--success-color)' : 'transparent', color: tradeType === 'buy' ? '#fff' : 'var(--text-secondary)' }}
              >
                Buy Order
              </button>
              <button
                className={`btn flex-grow-1 border-0 fw-semibold rounded-3 py-2 ${tradeType === 'sell' ? 'bg-danger text-white' : 'text-secondary'}`}
                onClick={() => setTradeType('sell')}
                disabled={quantityHeld <= 0}
                style={{ 
                  backgroundColor: tradeType === 'sell' ? 'var(--danger-color)' : 'transparent', 
                  color: tradeType === 'sell' ? '#fff' : 'var(--text-secondary)',
                  opacity: quantityHeld <= 0 ? 0.4 : 1
                }}
              >
                Sell Order
              </button>
            </div>

            {/* Trading Form */}
            <form onSubmit={handleTradeSubmit} className="flex-grow-1 d-flex flex-column">
              <div className="sb-input-group mb-3">
                <label className="sb-label">Order Quantity (Shares)</label>
                <input
                  type="number"
                  placeholder="0"
                  min="1"
                  step="1"
                  value={tradeQuantity}
                  onChange={(e) => setTradeQuantity(e.target.value)}
                  className="sb-input"
                  required
                />
              </div>

              {/* Price Details */}
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="small text-muted" style={{ color: 'var(--text-secondary)' }}>Market Price</span>
                  <span className="fw-semibold">₹{currentStock.currentPrice.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between border-top border-color pt-2 fw-bold text-light" style={{ color: 'var(--text-primary)' }}>
                  <span>Estimated Total</span>
                  <span>₹{estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Execute Trade Button */}
              <button
                type="submit"
                disabled={isTrading || !tradeQuantity || Number(tradeQuantity) <= 0}
                className={`btn w-100 justify-content-center py-2 mt-auto text-white`}
                style={{ 
                  background: tradeType === 'buy' ? 'var(--success-color)' : 'var(--danger-color)',
                  opacity: (!tradeQuantity || Number(tradeQuantity) <= 0 || isTrading) ? 0.6 : 1,
                  border: 'none',
                  fontWeight: '600',
                  borderRadius: '12px'
                }}
              >
                {isTrading 
                  ? 'Transacting...' 
                  : tradeType === 'buy' 
                    ? `Execute Buy` 
                    : `Execute Sell`
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetailPage;
