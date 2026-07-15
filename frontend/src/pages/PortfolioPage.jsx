import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchPortfolio } from '../redux/slices/portfolioSlice';
import { Briefcase, TrendingUp, TrendingDown, RefreshCw, ShoppingCart, Landmark } from 'lucide-react';

const PortfolioPage = () => {
  const dispatch = useDispatch();
  const { portfolio, isLoading } = useSelector((state) => state.portfolio);

  useEffect(() => {
    dispatch(fetchPortfolio());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchPortfolio());
  };

  return (
    <div className="container-fluid p-0 animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0" style={{ color: 'var(--text-primary)' }}>My Portfolio</h2>
          <p className="text-muted small m-0" style={{ color: 'var(--text-secondary)' }}>
            Real-time calculations of your virtual holding returns
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          className="btn btn-premium-outline d-flex align-items-center gap-2"
          disabled={isLoading}
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
        >
          <RefreshCw size={16} className={isLoading ? 'spinner-border spinner-border-sm border-0' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {portfolio && (
        <>
          {/* Detailed Statistics Cards */}
          <div className="row g-4 mb-4">
            <div className="col-12 col-md-4">
              <div className="sb-card p-4 text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <span className="small text-muted d-block" style={{ color: 'var(--text-secondary)' }}>Current Equity Value</span>
                <h2 className="fw-extrabold my-2 text-primary" style={{ color: 'var(--accent-color)' }}>
                  ₹{portfolio.currentEquity?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h2>
                <span className="small text-muted" style={{ color: 'var(--text-muted)' }}>Value of your held stocks</span>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="sb-card p-4 text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <span className="small text-muted d-block" style={{ color: 'var(--text-secondary)' }}>Total Cost Basis</span>
                <h2 className="fw-extrabold my-2 text-light" style={{ color: 'var(--text-primary)' }}>
                  ₹{portfolio.investedAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h2>
                <span className="small text-muted" style={{ color: 'var(--text-muted)' }}>Total cash spent buying stocks</span>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="sb-card p-4 text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <span className="small text-muted d-block" style={{ color: 'var(--text-secondary)' }}>Net Profit / Loss</span>
                <h2 className={`fw-extrabold my-2 ${portfolio.unrealizedProfitLoss >= 0 ? 'price-up' : 'price-down'}`}>
                  ₹{portfolio.unrealizedProfitLoss >= 0 ? '+' : ''}
                  {portfolio.unrealizedProfitLoss?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h2>
                <span className={`small fw-semibold ${portfolio.unrealizedProfitLoss >= 0 ? 'price-up' : 'price-down'}`}>
                  {portfolio.investedAmount > 0 
                    ? `${((portfolio.unrealizedProfitLoss / portfolio.investedAmount) * 100).toFixed(2)}%`
                    : '0.00%'}
                </span>
              </div>
            </div>
          </div>

          {/* Holdings Grid */}
          <div className="row g-4 mb-4">
            <div className="col-12 col-lg-8">
              <div className="sb-card p-4 h-100" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <h5 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>Securities Holdings Ledger</h5>
                
                {portfolio.holdings && portfolio.holdings.length > 0 ? (
                  <div className="sb-table-container">
                    <table className="sb-table">
                      <thead>
                        <tr>
                          <th>Asset</th>
                          <th>Sector</th>
                          <th>Quantity</th>
                          <th>Avg Buy Price</th>
                          <th>Current Price</th>
                          <th>Cost Basis</th>
                          <th>Current Value</th>
                          <th>Gain / Loss</th>
                        </tr>
                      </thead>
                      <tbody>
                        {portfolio.holdings.map((h, i) => {
                          const isUp = h.gainLoss >= 0;
                          return (
                            <tr key={i}>
                              <td>
                                <Link to={`/stock/${h.stockId}`} className="text-decoration-none d-flex align-items-center gap-3">
                                  <div className="stock-logo-circle bg-white text-dark">{h.symbol.slice(0, 2)}</div>
                                  <div>
                                    <span className="fw-bold d-block text-light" style={{ color: 'var(--text-primary)' }}>{h.symbol}</span>
                                    <span className="small text-muted" style={{ color: 'var(--text-muted)' }}>{h.companyName}</span>
                                  </div>
                                </Link>
                              </td>
                              <td>
                                <span className="small text-secondary" style={{ color: 'var(--text-secondary)' }}>{h.sector}</span>
                              </td>
                              <td className="fw-semibold">{h.quantity}</td>
                              <td>₹{h.averagePrice.toFixed(2)}</td>
                              <td>
                                <span className="fw-semibold">₹{h.currentPrice.toFixed(2)}</span>
                              </td>
                              <td>₹{h.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              <td className="fw-bold">₹{h.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              <td>
                                <div className={isUp ? 'price-up fw-semibold' : 'price-down fw-semibold'}>
                                  {isUp ? '+' : ''}₹{h.gainLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                                <span className={`small d-inline-flex align-items-center gap-0.5 ${isUp ? 'badge-up' : 'badge-down'}`} style={{ padding: '0.15rem 0.4rem', fontSize: '0.75rem' }}>
                                  {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                  {isUp ? '+' : ''}{h.gainLossPercent.toFixed(2)}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-5 text-muted border border-dashed rounded-3 h-100 d-flex flex-column align-items-center justify-content-center" style={{ color: 'var(--text-muted)', borderStyle: 'dashed !important', borderColor: 'var(--border-color) !important' }}>
                    <Briefcase size={48} className="mb-3 text-muted opacity-50" />
                    <h5 className="fw-bold">No holdings found</h5>
                    <p className="small mb-4">You have not bought any shares yet. Visit the markets page to make your first virtual trade.</p>
                    <Link to="/trade" className="btn btn-premium btn-sm">
                      <ShoppingCart size={16} />
                      <span>Browse Stocks</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="sb-card p-4 h-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <h5 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>Linked Bank Account</h5>
                {portfolio.bankName ? (
                  <div className="d-flex flex-column gap-3 my-auto">
                    <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ backgroundColor: 'rgba(0, 208, 156, 0.03)', border: '1px solid var(--border-color)' }}>
                      <Landmark size={28} className="text-success" />
                      <div>
                        <span className="fw-bold d-block text-light">{portfolio.bankName}</span>
                        <span className="small text-muted">Active Sandbox Gateway</span>
                      </div>
                    </div>
                    
                    <div className="d-flex flex-column gap-2 mt-2">
                      <div className="d-flex justify-content-between border-bottom border-color pb-2">
                        <span className="small text-muted">Account Number</span>
                        <span className="small fw-semibold text-light">•••• •••• {portfolio.accountNumber?.slice(-4)}</span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom border-color pb-2">
                        <span className="small text-muted">IFSC Code</span>
                        <span className="small fw-semibold text-light">{portfolio.ifscCode}</span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom border-color pb-2">
                        <span className="small text-muted">Total Cash Deposited</span>
                        <span className="small fw-semibold text-success">₹{portfolio.totalDeposited?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-5 my-auto text-muted" style={{ color: 'var(--text-muted)' }}>
                    <Landmark size={40} className="mb-3 opacity-30" />
                    <p className="small m-0">No bank account linked to your sandbox yet. Click "Add Money" in the navbar to connect a mock account and fund your wallet!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PortfolioPage;
