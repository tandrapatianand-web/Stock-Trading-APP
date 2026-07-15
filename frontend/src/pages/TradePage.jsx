import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchStocks } from '../redux/slices/stockSlice';
import { fetchWatchlist, addToWatchlist, removeFromWatchlist } from '../redux/slices/watchlistSlice';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Heart, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  Eye
} from 'lucide-react';
import { toast } from 'react-toastify';

const TradePage = () => {
  const dispatch = useDispatch();
  const { stocks, sectors, pagination, isLoading } = useSelector((state) => state.stocks);
  const { watchlist } = useSelector((state) => state.watchlist);

  // Search, filter, sorting, and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [sortOption, setSortOption] = useState('symbol:asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Debounced search trigger
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      dispatch(fetchStocks({
        search: searchTerm,
        sector: selectedSector,
        sort: sortOption,
        page: currentPage
      }));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, searchTerm, selectedSector, sortOption, currentPage]);

  useEffect(() => {
    dispatch(fetchWatchlist());
  }, [dispatch]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setCurrentPage(newPage);
    }
  };

  const handleSectorChange = (e) => {
    setSelectedSector(e.target.value);
    setCurrentPage(1); // Reset page on filter
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1); // Reset page on sort
  };

  // Watchlist helper check
  const isInWatchlist = (stockId) => {
    return watchlist.some(item => item._id === stockId);
  };

  const handleWatchlistToggle = (stockId) => {
    if (isInWatchlist(stockId)) {
      dispatch(removeFromWatchlist(stockId))
        .unwrap()
        .then(() => toast.info('Removed from watchlist'))
        .catch((err) => toast.error(err));
    } else {
      dispatch(addToWatchlist(stockId))
        .unwrap()
        .then(() => toast.success('Added to watchlist'))
        .catch((err) => toast.error(err));
    }
  };

  return (
    <div className="container-fluid p-0 animate-fade-in">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold m-0" style={{ color: 'var(--text-primary)' }}>Stocks Directory</h2>
          <p className="text-muted small m-0" style={{ color: 'var(--text-secondary)' }}>
            Search, analyze, and trade simulated financial markets
          </p>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="sb-card p-3 mb-4 d-flex flex-column flex-md-row gap-3 align-items-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        {/* Search */}
        <div className="position-relative flex-grow-1 w-100">
          <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
            <Search size={18} />
          </span>
          <input
            type="text"
            className="sb-input ps-5"
            placeholder="Search symbol or company name (e.g. AAPL, Apple)..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {/* Sector and Sort dropdowns */}
        <div className="d-flex w-100 w-md-auto gap-3">
          <div className="d-flex align-items-center gap-2 flex-grow-1">
            <SlidersHorizontal size={16} className="text-muted" />
            <select
              className="sb-input py-2"
              value={selectedSector}
              onChange={handleSectorChange}
              style={{ minWidth: '130px' }}
            >
              <option value="All">All Sectors</option>
              {sectors.map((s, idx) => (
                <option key={idx} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <select
            className="sb-input py-2 flex-grow-1"
            value={sortOption}
            onChange={handleSortChange}
            style={{ minWidth: '150px' }}
          >
            <option value="symbol:asc">Symbol (A-Z)</option>
            <option value="symbol:desc">Symbol (Z-A)</option>
            <option value="currentPrice:desc">Price (High to Low)</option>
            <option value="currentPrice:asc">Price (Low to High)</option>
            <option value="changePercent:desc">Gainers first</option>
            <option value="changePercent:asc">Losers first</option>
          </select>
        </div>
      </div>

      {/* Stocks Table */}
      <div className="sb-card p-4 mb-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        {isLoading ? (
          <div className="d-flex flex-column gap-3 py-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="skeleton" style={{ height: '50px', width: '100%' }}></div>
            ))}
          </div>
        ) : stocks && stocks.length > 0 ? (
          <>
            <div className="sb-table-container">
              <table className="sb-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Ticker</th>
                    <th>Price</th>
                    <th>Change</th>
                    <th>Change %</th>
                    <th>Market Cap</th>
                    <th>Volume</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock) => {
                    const isUp = stock.change >= 0;
                    const watched = isInWatchlist(stock._id);
                    return (
                      <tr key={stock._id}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="stock-logo-circle bg-white text-dark">{stock.symbol.slice(0, 2)}</div>
                            <div>
                              <span className="fw-bold d-block text-light" style={{ color: 'var(--text-primary)' }}>{stock.companyName}</span>
                              <span className="small text-muted" style={{ color: 'var(--text-muted)' }}>{stock.sector}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-secondary-subtle text-light fw-bold" style={{ color: 'var(--text-primary)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                            {stock.symbol}
                          </span>
                        </td>
                        <td className="fw-bold">₹{stock.currentPrice.toFixed(2)}</td>
                        <td className={isUp ? 'price-up fw-semibold' : 'price-down fw-semibold'}>
                          {isUp ? '+' : ''}₹{stock.change.toFixed(2)}
                        </td>
                        <td>
                          <span className={isUp ? 'badge-up' : 'badge-down'}>
                            {isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </span>
                        </td>
                        <td>₹{(stock.marketCap / 1e7).toLocaleString(undefined, { maximumFractionDigits: 0 })} Cr</td>
                        <td>{stock.volume.toLocaleString()}</td>
                        <td className="text-end">
                          <div className="d-inline-flex gap-2">
                            {/* Watchlist Toggle */}
                            <button
                              onClick={() => handleWatchlistToggle(stock._id)}
                              className="btn btn-premium-outline p-2 border-color"
                              style={{ color: watched ? 'var(--danger-color)' : 'var(--text-secondary)' }}
                              title={watched ? 'Remove from watchlist' : 'Add to watchlist'}
                            >
                              <Heart size={16} fill={watched ? 'var(--danger-color)' : 'none'} stroke={watched ? 'var(--danger-color)' : 'currentColor'} />
                            </button>
                            {/* Details Action */}
                            <Link
                              to={`/stock/${stock._id}`}
                              className="btn btn-premium p-2"
                              title="Trade / Detailed stats"
                            >
                              <Eye size={16} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-4 border-top border-color pt-3">
                <span className="small text-muted" style={{ color: 'var(--text-muted)' }}>
                  Showing Page {pagination.page} of {pagination.pages} ({pagination.total} stocks)
                </span>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-premium-outline py-2 px-3 d-flex align-items-center justify-content-center"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    className="btn btn-premium-outline py-2 px-3 d-flex align-items-center justify-content-center"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.pages}
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-5 text-muted" style={{ color: 'var(--text-muted)' }}>
            No stocks found matching the search filters. Try adjusting keywords.
          </div>
        )}
      </div>
    </div>
  );
};

export default TradePage;
