import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchWatchlist, removeFromWatchlist } from '../redux/slices/watchlistSlice';
import { Heart, TrendingUp, TrendingDown, Eye, HelpCircle, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';

const WatchlistPage = () => {
  const dispatch = useDispatch();
  const { watchlist, isLoading } = useSelector((state) => state.watchlist);

  useEffect(() => {
    dispatch(fetchWatchlist());
  }, [dispatch]);

  const handleRemove = (stockId, symbol) => {
    dispatch(removeFromWatchlist(stockId))
      .unwrap()
      .then(() => toast.info(`Removed ${symbol} from watchlist`))
      .catch((err) => toast.error(err));
  };

  return (
    <div className="container-fluid p-0 animate-fade-in">
      <div className="mb-4">
        <h2 className="fw-bold m-0" style={{ color: 'var(--text-primary)' }}>Watchlist Hub</h2>
        <p className="text-muted small m-0" style={{ color: 'var(--text-secondary)' }}>
          Monitor your favorited assets and jump straight into trade executions
        </p>
      </div>

      <div className="sb-card p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        {isLoading ? (
          <div className="row g-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="col-md-4 skeleton" style={{ height: '150px' }}></div>
            ))}
          </div>
        ) : watchlist && watchlist.length > 0 ? (
          <div className="row g-4">
            {watchlist.map((stock) => {
              const isUp = stock.change >= 0;
              return (
                <div key={stock._id} className="col-12 col-md-6 col-lg-4">
                  <div className="sb-card p-3 h-100 d-flex flex-column border-color" style={{ backgroundColor: 'var(--bg-primary)' }}>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="stock-logo-circle bg-white text-dark small" style={{ width: '32px', height: '32px' }}>
                          {stock.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <span className="fw-bold d-block text-light" style={{ color: 'var(--text-primary)' }}>{stock.symbol}</span>
                          <span className="text-muted small text-truncate d-inline-block" style={{ color: 'var(--text-muted)', maxWidth: '120px' }}>
                            {stock.companyName}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(stock._id, stock.symbol)}
                        className="btn border-0 p-0 text-danger"
                        title="Remove from watchlist"
                      >
                        <Heart size={18} fill="var(--danger-color)" stroke="var(--danger-color)" />
                      </button>
                    </div>

                    <div className="my-auto py-2">
                      <h4 className="fw-extrabold m-0" style={{ color: 'var(--text-primary)' }}>
                        ₹{stock.currentPrice.toFixed(2)}
                      </h4>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <span className={isUp ? 'price-up fw-semibold small' : 'price-down fw-semibold small'}>
                          {isUp ? '+' : ''}₹{stock.change.toFixed(2)}
                        </span>
                        <span className={isUp ? 'badge-up' : 'badge-down'} style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>
                          {isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top border-color">
                      <span className="small text-muted" style={{ color: 'var(--text-muted)' }}>
                        MCap: ₹{(stock.marketCap / 1e7).toLocaleString(undefined, { maximumFractionDigits: 0 })} Cr
                      </span>
                      <Link
                        to={`/stock/${stock._id}`}
                        className="text-decoration-none small fw-semibold d-inline-flex align-items-center gap-1"
                        style={{ color: 'var(--accent-color)' }}
                      >
                        <span>Trade Stock</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-5 text-muted border border-dashed rounded-3" style={{ color: 'var(--text-muted)', borderStyle: 'dashed !important', borderColor: 'var(--border-color) !important' }}>
            <Heart size={48} className="mb-3 text-muted opacity-50" />
            <h5 className="fw-bold">Your watchlist is empty</h5>
            <p className="small mb-4">Favorite companies by clicking the heart button on the markets or details views.</p>
            <Link to="/trade" className="btn btn-premium btn-sm">
              <span>View Markets</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;
