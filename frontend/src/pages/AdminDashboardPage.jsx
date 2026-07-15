import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, deleteUser, fetchAdminStats, createStockAdmin, updateStockAdmin, deleteStockAdmin, clearAdminFlags } from '../redux/slices/adminSlice';
import { fetchStocks } from '../redux/slices/stockSlice';
import { 
  Users, 
  Trash2, 
  Plus, 
  Edit2, 
  BarChart3, 
  Landmark, 
  Activity, 
  FileSpreadsheet, 
  AlertCircle,
  XCircle,
  CheckCircle,
  Building
} from 'lucide-react';
import { toast } from 'react-toastify';

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const { users, stats, actionSuccess, error, isLoading } = useSelector((state) => state.admin);
  const { stocks } = useSelector((state) => state.stocks);

  // Tabs: 'analytics', 'users', 'stocks'
  const [activeTab, setActiveTab] = useState('analytics');

  // Stock Form State
  const [showStockForm, setShowStockForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [stockFormData, setStockFormData] = useState({
    symbol: '',
    companyName: '',
    sector: '',
    industry: '',
    currentPrice: '',
    marketCap: '',
    volume: ''
  });

  const { symbol, companyName, sector, industry, currentPrice, marketCap, volume } = stockFormData;

  useEffect(() => {
    dispatch(fetchAdminStats());
    dispatch(fetchUsers());
    dispatch(fetchStocks({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (actionSuccess) {
      toast.success(isEditing ? 'Stock updated successfully' : 'Stock created successfully');
      setShowStockForm(false);
      resetStockForm();
      dispatch(clearAdminFlags());
      dispatch(fetchStocks({ limit: 100 })); // Refresh list
      dispatch(fetchAdminStats()); // Refresh stats
    }
    if (error) {
      toast.error(error);
      dispatch(clearAdminFlags());
    }
  }, [actionSuccess, error, isEditing, dispatch]);

  const handleDeleteUser = (id, name) => {
    if (window.confirm(`Are you absolutely sure you want to delete user ${name}? This will wipe their portfolio, watchlist, and transaction logs permanently.`)) {
      dispatch(deleteUser(id))
        .unwrap()
        .then(() => toast.info(`Deleted user account: ${name}`))
        .catch((err) => toast.error(err));
    }
  };

  const handleDeleteStock = (id, symbol) => {
    if (window.confirm(`Are you sure you want to remove stock ${symbol} from the platform catalog?`)) {
      dispatch(deleteStockAdmin(id))
        .unwrap()
        .then(() => {
          toast.info(`Deleted stock: ${symbol}`);
          dispatch(fetchStocks({ limit: 100 }));
        })
        .catch((err) => toast.error(err));
    }
  };

  const handleStockFormSubmit = (e) => {
    e.preventDefault();

    if (!symbol || !companyName || !sector || !industry || !currentPrice || !marketCap || !volume) {
      toast.warning('Please enter all stock parameters');
      return;
    }

    const payload = {
      symbol: symbol.toUpperCase(),
      companyName,
      sector,
      industry,
      currentPrice: Number(currentPrice),
      marketCap: Number(marketCap),
      volume: Number(volume)
    };

    if (isEditing) {
      dispatch(updateStockAdmin({ id: editingId, stockData: payload }));
    } else {
      dispatch(createStockAdmin(payload));
    }
  };

  const handleEditClick = (stock) => {
    setIsEditing(true);
    setEditingId(stock._id);
    setStockFormData({
      symbol: stock.symbol,
      companyName: stock.companyName,
      sector: stock.sector,
      industry: stock.industry,
      currentPrice: stock.currentPrice,
      marketCap: stock.marketCap,
      volume: stock.volume
    });
    setShowStockForm(true);
  };

  const resetStockForm = () => {
    setIsEditing(false);
    setEditingId('');
    setStockFormData({
      symbol: '',
      companyName: '',
      sector: '',
      industry: '',
      currentPrice: '',
      marketCap: '',
      volume: ''
    });
  };

  return (
    <div className="container-fluid p-0 animate-fade-in text-light">
      <div className="mb-4">
        <h2 className="fw-bold m-0" style={{ color: 'var(--text-primary)' }}>Admin Control Room</h2>
        <p className="text-muted small m-0" style={{ color: 'var(--text-secondary)' }}>
          Manage global portfolios, system database catalogs, and monitor platform trades
        </p>
      </div>

      {/* Mode selectors */}
      <div className="d-flex border-bottom border-color mb-4">
        {[
          { id: 'analytics', label: 'Platform Stats', icon: BarChart3 },
          { id: 'users', label: 'Manage Accounts', icon: Users },
          { id: 'stocks', label: 'Manage Catalogs', icon: Building },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setShowStockForm(false); }}
              className={`btn border-0 rounded-0 px-4 py-3 fw-semibold transition-all d-flex align-items-center gap-2`}
              style={{
                color: activeTab === tab.id ? 'var(--accent-color)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-color)' : 'none',
                backgroundColor: 'transparent'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Panel Views */}
      {activeTab === 'analytics' && stats && (
        <div>
          {/* Summary Metric cards */}
          <div className="row g-4 mb-4">
            {[
              { label: 'Registered Traders', value: stats.totalUsers, icon: Users, color: 'bg-primary' },
              { label: 'System Trades Logged', value: stats.totalTrades, icon: Activity, color: 'bg-success' },
              { label: 'Accumulated Volume', value: `₹${stats.totalVolume?.toLocaleString()}`, icon: FileSpreadsheet, color: 'bg-warning' },
              { label: 'Average User Capital', value: `₹${stats.avgPortfolioValue?.toLocaleString()}`, icon: Landmark, color: 'bg-info' },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div key={idx} className="col-12 col-sm-6 col-xl-3">
                  <div className="sb-card d-flex align-items-center justify-content-between p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <div>
                      <span className="small text-muted d-block" style={{ color: 'var(--text-secondary)' }}>{card.label}</span>
                      <h3 className="fw-bold my-1" style={{ color: 'var(--text-primary)' }}>{card.value}</h3>
                    </div>
                    <div className="rounded-3 p-3 text-white" style={{ background: 'var(--accent-gradient)' }}>
                      <Icon size={24} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="row g-4">
            {/* Top traded stocks */}
            <div className="col-lg-5">
              <div className="sb-card p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <h5 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>Popular Catalogs Traded</h5>
                
                {stats.topTradedStocks && stats.topTradedStocks.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {stats.topTradedStocks.map((stock, i) => (
                      <div key={i} className="d-flex justify-content-between align-items-center border-bottom border-color pb-2 last-no-border">
                        <div className="d-flex align-items-center gap-3">
                          <div className="stock-logo-circle bg-white text-dark small" style={{ width: '28px', height: '28px' }}>{stock.symbol.slice(0, 2)}</div>
                          <span className="fw-bold">{stock.symbol}</span>
                        </div>
                        <div className="text-end">
                          <span className="small fw-semibold d-block">{stock.count} orders</span>
                          <span className="small text-muted" style={{ color: 'var(--text-muted)' }}>Vol: ₹{stock.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5 text-muted small" style={{ color: 'var(--text-muted)' }}>
                    No trades logged on system yet.
                  </div>
                )}
              </div>
            </div>

            {/* Global Recent trades activity audit */}
            <div className="col-lg-7">
              <div className="sb-card p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <h5 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>Global Order Ledger</h5>
                
                {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
                  <div className="sb-table-container">
                    <table className="sb-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Symbol</th>
                          <th>Order</th>
                          <th>Qty</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentTransactions.map((tx, idx) => (
                          <tr key={idx}>
                            <td className="small">
                              <span className="fw-bold d-block text-light" style={{ color: 'var(--text-primary)' }}>{tx.user?.name || 'Deleted'}</span>
                              <span className="text-muted text-truncate d-inline-block" style={{ color: 'var(--text-muted)', maxWidth: '140px' }}>{tx.user?.email}</span>
                            </td>
                            <td className="fw-bold">{tx.symbol}</td>
                            <td>
                              <span className={`small fw-semibold text-uppercase px-2 py-0.5 rounded ${tx.type === 'buy' ? 'text-danger bg-danger-subtle' : 'text-success bg-success-subtle'}`}
                                    style={{
                                      backgroundColor: tx.type === 'buy' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                      color: tx.type === 'buy' ? 'var(--danger-color)' : 'var(--success-color)',
                                      fontSize: '0.75rem'
                                    }}>
                                {tx.type}
                              </span>
                            </td>
                            <td>{tx.quantity}</td>
                            <td className="fw-bold">₹{tx.total?.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-5 text-muted small" style={{ color: 'var(--text-muted)' }}>
                    No orders logged on system yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="sb-card p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <h5 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>Trader User Accounts</h5>
          
          <div className="sb-table-container">
            <table className="sb-table">
              <thead>
                <tr>
                  <th>Trader Profile</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th>Virtual Cash</th>
                  <th>Trades Executed</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="stock-logo-circle bg-white text-dark small" style={{ width: '32px', height: '32px' }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="fw-bold d-block text-light" style={{ color: 'var(--text-primary)' }}>{u.name}</span>
                          <span className="small text-muted" style={{ color: 'var(--text-muted)' }}>{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge px-2 py-1 ${u.role === 'admin' ? 'bg-danger-subtle text-danger' : 'bg-secondary-subtle text-light'}`}
                            style={{
                              backgroundColor: u.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)',
                              color: u.role === 'admin' ? 'var(--danger-color)' : 'var(--text-secondary)'
                            }}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-secondary small" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="fw-bold text-success" style={{ color: 'var(--success-color)' }}>
                      ₹{u.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="fw-semibold">{u.tradeCount}</td>
                    <td className="text-end">
                      <button
                        onClick={() => handleDeleteUser(u._id, u.name)}
                        className="btn btn-premium-outline p-2 text-danger border-danger"
                        style={{ borderColor: 'rgba(239,68,68,0.3)', color: 'var(--danger-color)' }}
                        disabled={u.role === 'admin'} // Cannot delete self or admin
                        title="Delete User Account"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'stocks' && (
        <div className="row g-4">
          {/* Stock catalog lists */}
          <div className={showStockForm ? 'col-lg-7' : 'col-12'}>
            <div className="sb-card p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold m-0" style={{ color: 'var(--text-primary)' }}>Stocks Catalog</h5>
                {!showStockForm && (
                  <button 
                    onClick={() => { resetStockForm(); setShowStockForm(true); }}
                    className="btn btn-premium btn-sm"
                  >
                    <Plus size={16} />
                    <span>Add New Asset</span>
                  </button>
                )}
              </div>

              <div className="sb-table-container">
                <table className="sb-table">
                  <thead>
                    <tr>
                      <th>Ticker</th>
                      <th>Company</th>
                      <th>Sector</th>
                      <th>Price</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stocks.map((stock) => (
                      <tr key={stock._id}>
                        <td className="fw-bold">{stock.symbol}</td>
                        <td className="small text-truncate" style={{ maxWidth: '120px' }}>{stock.companyName}</td>
                        <td className="small text-muted">{stock.sector}</td>
                        <td className="fw-bold">₹{stock.currentPrice.toFixed(2)}</td>
                        <td className="text-end">
                          <div className="d-inline-flex gap-2">
                            <button
                              onClick={() => handleEditClick(stock)}
                              className="btn btn-premium-outline p-2 border-color"
                              title="Edit Details"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteStock(stock._id, stock.symbol)}
                              className="btn btn-premium-outline p-2 text-danger border-color"
                              title="Delete Asset"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Create/Edit Form panel */}
          {showStockForm && (
            <div className="col-lg-5 animate-fade-in">
              <div className="sb-card p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-color pb-3">
                  <h5 className="fw-bold m-0" style={{ color: 'var(--text-primary)' }}>
                    {isEditing ? `Edit Asset: ${symbol}` : 'Add New Security Asset'}
                  </h5>
                  <button
                    onClick={() => { setShowStockForm(false); resetStockForm(); }}
                    className="btn border-0 p-0 text-muted"
                  >
                    <XCircle size={20} />
                  </button>
                </div>

                <form onSubmit={handleStockFormSubmit}>
                  <div className="row g-2">
                    <div className="col-6 sb-input-group">
                      <label className="sb-label">Symbol (Ticker)</label>
                      <input
                        type="text"
                        placeholder="e.g. AMZN"
                        className="sb-input"
                        value={symbol}
                        onChange={(e) => setStockFormData({ ...stockFormData, symbol: e.target.value })}
                        disabled={isEditing} // Cannot edit symbol
                        required
                      />
                    </div>
                    <div className="col-6 sb-input-group">
                      <label className="sb-label">Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="100.00"
                        className="sb-input"
                        value={currentPrice}
                        onChange={(e) => setStockFormData({ ...stockFormData, currentPrice: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="sb-input-group">
                    <label className="sb-label">Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Amazon.com, Inc."
                      className="sb-input"
                      value={companyName}
                      onChange={(e) => setStockFormData({ ...stockFormData, companyName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2">
                    <div className="col-6 sb-input-group">
                      <label className="sb-label">Sector</label>
                      <input
                        type="text"
                        placeholder="e.g. Technology"
                        className="sb-input"
                        value={sector}
                        onChange={(e) => setStockFormData({ ...stockFormData, sector: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6 sb-input-group">
                      <label className="sb-label">Industry</label>
                      <input
                        type="text"
                        placeholder="e.g. Software"
                        className="sb-input"
                        value={industry}
                        onChange={(e) => setStockFormData({ ...stockFormData, industry: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-4">
                    <div className="col-6 sb-input-group">
                      <label className="sb-label">Market Capitalization (₹)</label>
                      <input
                        type="number"
                        placeholder="150000000000"
                        className="sb-input"
                        value={marketCap}
                        onChange={(e) => setStockFormData({ ...stockFormData, marketCap: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6 sb-input-group">
                      <label className="sb-label">Initial Volume</label>
                      <input
                        type="number"
                        placeholder="25000000"
                        className="sb-input"
                        value={volume}
                        onChange={(e) => setStockFormData({ ...stockFormData, volume: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-premium flex-grow-1 justify-content-center py-2"
                      disabled={isLoading}
                    >
                      {isEditing ? 'Save Changes' : 'Publish Asset'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowStockForm(false); resetStockForm(); }}
                      className="btn btn-premium-outline py-2 border-color"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
