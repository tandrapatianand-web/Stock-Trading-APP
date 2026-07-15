import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchPortfolio, fetchTransactions } from '../redux/slices/portfolioSlice';
import { fetchStocks } from '../redux/slices/stockSlice';
import { 
  Line, 
  Doughnut 
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { 
  TrendingUp, 
  TrendingDown, 
  IndianRupee, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart as PieIcon,
  ChevronRight
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { portfolio, transactions, isLoading: isPortfolioLoading } = useSelector((state) => state.portfolio);
  const { stocks, isLoading: isStocksLoading } = useSelector((state) => state.stocks);

  useEffect(() => {
    dispatch(fetchPortfolio());
    dispatch(fetchTransactions({ limit: 5 }));
    dispatch(fetchStocks({ limit: 100 })); // Fetch all for sorting gainers/losers
  }, [dispatch]);

  // Derive Top Gainers, Losers, and Trending Stocks from state
  const sortedStocks = [...stocks];
  const topGainers = [...sortedStocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 3);
  const topLosers = [...sortedStocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 3);
  const trendingStocks = [...sortedStocks].sort((a, b) => b.volume - a.volume).slice(0, 3);

  // Loading state
  const isLoading = isPortfolioLoading || isStocksLoading;

  // Portfolio allocation chart data
  const allocationData = {
    labels: portfolio?.holdings?.length > 0 ? portfolio.holdings.map(h => h.symbol) : ['Cash Only'],
    datasets: [{
      label: 'Portfolio Allocation (₹)',
      data: portfolio?.holdings?.length > 0 ? portfolio.holdings.map(h => h.currentValue) : [portfolio?.availableBalance || 100000],
      backgroundColor: [
        '#6366f1', '#10b981', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6', '#3b82f6'
      ],
      borderWidth: 1,
      borderColor: 'var(--border-color)'
    }]
  };

  // Performance growth chart data (Simulated walk based on current balance)
  const balanceHistory = [];
  const labels = [];
  const startVal = 100000;
  const currentVal = portfolio?.totalValue || 100000;
  const diff = currentVal - startVal;
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString(undefined, { weekday: 'short' }));
    
    // Simulate minor steps
    const step = startVal + (diff / 6) * (6 - i) + (Math.random() - 0.5) * 1500;
    balanceHistory.push(parseFloat(step.toFixed(2)));
  }

  const performanceData = {
    labels,
    datasets: [{
      label: 'Net Balance Value (₹)',
      data: balanceHistory,
      borderColor: '#00d09c',
      backgroundColor: 'rgba(0, 208, 156, 0.1)',
      fill: true,
      tension: 0.3,
      pointRadius: 4,
      pointBackgroundColor: '#00d09c'
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: 'var(--text-secondary)' } },
      y: { grid: { color: 'var(--border-color)' }, ticks: { color: 'var(--text-secondary)' } }
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Header Summary Cards */}
      {portfolio && (
        <div className="row g-4 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="sb-card d-flex align-items-center justify-content-between p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div>
                <span className="small text-muted d-block" style={{ color: 'var(--text-secondary)' }}>Net Portfolio Value</span>
                <h3 className="fw-bold my-1" style={{ color: 'var(--text-primary)' }}>
                  ₹{portfolio.totalValue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h3>
                <span className={`small fw-semibold d-inline-flex align-items-center gap-1 ${portfolio.profitLoss >= 0 ? 'price-up' : 'price-down'}`}>
                  {portfolio.profitLoss >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {portfolio.profitLoss >= 0 ? '+' : ''}{portfolio.profitLossPercent?.toFixed(2)}%
                </span>
              </div>
              <div className="rounded-3 p-3 text-white" style={{ background: 'var(--accent-gradient)' }}>
                <IndianRupee size={24} />
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="sb-card d-flex align-items-center justify-content-between p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div>
                <span className="small text-muted d-block" style={{ color: 'var(--text-secondary)' }}>Today's Return</span>
                <h3 className="fw-bold my-1" style={{ color: 'var(--text-primary)' }}>
                  ₹{portfolio.unrealizedProfitLoss?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h3>
                <span className={`small fw-semibold ${portfolio.unrealizedProfitLoss >= 0 ? 'price-up' : 'price-down'}`}>
                  Unrealized P&L
                </span>
              </div>
              <div className="rounded-3 p-3 text-white" style={{ background: portfolio.unrealizedProfitLoss >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>
                <Activity size={24} />
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="sb-card d-flex align-items-center justify-content-between p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div>
                <span className="small text-muted d-block" style={{ color: 'var(--text-secondary)' }}>Available Balance</span>
                <h3 className="fw-bold my-1" style={{ color: 'var(--text-primary)' }}>
                  ₹{portfolio.availableBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h3>
                <span className="small text-muted" style={{ color: 'var(--text-muted)' }}>Ready to trade</span>
              </div>
              <div className="rounded-3 p-3" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)' }}>
                <LandmarkIcon size={24} />
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="sb-card d-flex align-items-center justify-content-between p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div>
                <span className="small text-muted d-block" style={{ color: 'var(--text-secondary)' }}>Total Investments</span>
                <h3 className="fw-bold my-1" style={{ color: 'var(--text-primary)' }}>
                  ₹{portfolio.investedAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h3>
                <span className="small text-muted" style={{ color: 'var(--text-muted)' }}>Held in securities</span>
              </div>
              <div className="rounded-3 p-3" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-color)' }}>
                <PieIcon size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Charts & Allocation Grid */}
      <div className="row g-4 mb-4">
        {/* Performance Chart */}
        <div className="col-lg-8">
          <div className="sb-card p-4 h-100" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <h5 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>Performance Growth (7D)</h5>
            <div style={{ height: '300px' }}>
              <Line data={performanceData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Sector Allocation */}
        <div className="col-lg-4">
          <div className="sb-card p-4 h-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <h5 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>Asset Allocation</h5>
            <div className="flex-grow-1 d-flex align-items-center justify-content-center" style={{ height: '220px', minHeight: '220px' }}>
              <Doughnut 
                data={allocationData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } }
                }} 
              />
            </div>
            {portfolio?.holdings?.length > 0 ? (
              <div className="mt-3 overflow-y-auto" style={{ maxHeight: '110px' }}>
                <div className="row g-2">
                  {portfolio.holdings.map((h, i) => (
                    <div key={i} className="col-6 d-flex align-items-center gap-2">
                      <span className="d-inline-block rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: allocationData.datasets[0].backgroundColor[i % 8] }}></span>
                      <span className="small text-truncate" style={{ color: 'var(--text-secondary)' }}>{h.symbol} ({((h.currentValue / portfolio.totalValue) * 100).toFixed(1)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted small mt-3" style={{ color: 'var(--text-muted)' }}>
                No active holdings. Cash is 100% of allocation.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Market Movers and Recent Transactions Grid */}
      <div className="row g-4">
        {/* Movers */}
        <div className="col-lg-6">
          <div className="sb-card p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <h5 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>Top Market Movers</h5>
            <div className="row g-3">
              {/* Gainers */}
              <div className="col-md-6 border-end border-color pe-md-3">
                <span className="small text-success fw-bold d-block mb-3 text-uppercase">Top Gainers</span>
                <div className="d-flex flex-column gap-2">
                  {topGainers.map((s, idx) => (
                    <Link to={`/stock/${s._id}`} key={idx} className="text-decoration-none d-flex justify-content-between align-items-center p-2 rounded-3 trending-card">
                      <div className="d-flex align-items-center gap-2">
                        <div className="stock-logo-circle bg-white text-dark small" style={{ width: '28px', height: '28px' }}>{s.symbol.slice(0, 2)}</div>
                        <span className="fw-bold small text-light" style={{ color: 'var(--text-primary)' }}>{s.symbol}</span>
                      </div>
                      <div className="text-end">
                        <span className="small fw-semibold d-block text-light" style={{ color: 'var(--text-primary)' }}>₹{s.currentPrice.toFixed(2)}</span>
                        <span className="price-up small d-inline-flex align-items-center gap-0.5"><ArrowUpRight size={10} />+{s.changePercent}%</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Losers */}
              <div className="col-md-6 ps-md-3">
                <span className="small text-danger fw-bold d-block mb-3 text-uppercase">Top Losers</span>
                <div className="d-flex flex-column gap-2">
                  {topLosers.map((s, idx) => (
                    <Link to={`/stock/${s._id}`} key={idx} className="text-decoration-none d-flex justify-content-between align-items-center p-2 rounded-3 trending-card">
                      <div className="d-flex align-items-center gap-2">
                        <div className="stock-logo-circle bg-white text-dark small" style={{ width: '28px', height: '28px' }}>{s.symbol.slice(0, 2)}</div>
                        <span className="fw-bold small text-light" style={{ color: 'var(--text-primary)' }}>{s.symbol}</span>
                      </div>
                      <div className="text-end">
                        <span className="small fw-semibold d-block text-light" style={{ color: 'var(--text-primary)' }}>₹{s.currentPrice.toFixed(2)}</span>
                        <span className="price-down small d-inline-flex align-items-center gap-0.5"><ArrowDownRight size={10} />{s.changePercent}%</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="col-lg-6">
          <div className="sb-card p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold m-0" style={{ color: 'var(--text-primary)' }}>Recent Activity</h5>
              <Link to="/transactions" className="text-decoration-none small fw-semibold d-inline-flex align-items-center gap-1" style={{ color: 'var(--accent-color)' }}>
                <span>See All</span>
                <ChevronRight size={14} />
              </Link>
            </div>
            {transactions.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {transactions.slice(0, 4).map((t, idx) => (
                  <div key={idx} className="d-flex justify-content-between align-items-center border-bottom border-color pb-3 last-no-border">
                    <div>
                      <span className="fw-bold d-block text-light" style={{ color: 'var(--text-primary)' }}>{t.symbol}</span>
                      <span className="text-muted small" style={{ color: 'var(--text-muted)' }}>
                        {new Date(t.timestamp).toLocaleDateString()} &bull; {t.type === 'buy' ? 'Bought' : 'Sold'} {t.quantity} shares
                      </span>
                    </div>
                    <div className="text-end">
                      <span className="fw-bold d-block text-light" style={{ color: 'var(--text-primary)' }}>₹{t.total.toFixed(2)}</span>
                      <span className={`small ${t.type === 'buy' ? 'text-warning' : 'text-success'}`} style={{ color: t.type === 'buy' ? '#ef4444' : 'var(--success-color)' }}>
                        {t.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted py-5" style={{ color: 'var(--text-muted)' }}>
                No recent transactions. Visit Markets to make your first trade.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Icon Fallback to avoid import failures
const LandmarkIcon = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="3" y1="21" x2="21" y2="21"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
    <polygon points="12 2 2 7 22 7 12 2"></polygon>
    <line x1="6" y1="21" x2="6" y2="10"></line>
    <line x1="10" y1="21" x2="10" y2="10"></line>
    <line x1="14" y1="21" x2="14" y2="10"></line>
    <line x1="18" y1="21" x2="18" y2="10"></line>
  </svg>
);

export default DashboardPage;
