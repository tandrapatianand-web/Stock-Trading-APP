import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, Sun, Moon, Landmark, Plus, X } from 'lucide-react';
import { fetchPortfolio, depositFunds } from '../redux/slices/portfolioSlice';
import { toast } from 'react-toastify';

const Navbar = ({ toggleSidebar }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { portfolio } = useSelector((state) => state.portfolio);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  // Add money states
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchPortfolio());
    }
  }, [dispatch, user]);

  // Pre-fill bank details if they already exist in portfolio
  useEffect(() => {
    if (portfolio) {
      if (portfolio.bankName) setBankName(portfolio.bankName);
      if (portfolio.accountNumber) setAccountNumber(portfolio.accountNumber);
      if (portfolio.ifscCode) setIfscCode(portfolio.ifscCode);
    }
  }, [portfolio]);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('light');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    } else {
      root.classList.remove('light');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    }
  };

  const handleAddMoneySubmit = async (e) => {
    e.preventDefault();
    const depAmt = Number(amount);
    if (!depAmt || depAmt <= 0) {
      toast.warning('Please enter a valid deposit amount');
      return;
    }

    if (!bankName || !accountNumber || !ifscCode) {
      toast.warning('Please fill in your mock bank details');
      return;
    }

    setIsSubmitting(true);
    dispatch(depositFunds({ amount: depAmt, bankName, accountNumber, ifscCode }))
      .unwrap()
      .then((msg) => {
        toast.success(msg || `Successfully deposited ₹${depAmt.toLocaleString()}!`);
        setShowAddMoneyModal(false);
        setAmount('');
      })
      .catch((err) => {
        toast.error(err);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleQuickPreset = (preset) => {
    setAmount(preset.toString());
  };

  return (
    <header 
      className="glass-panel border-bottom border-color d-flex justify-content-between align-items-center py-3 px-4 position-sticky top-0 z-2"
      style={{ backgroundColor: 'var(--bg-secondary)', height: '70px' }}
    >
      <div className="d-flex align-items-center gap-3">
        {/* Toggle button for Sidebar on mobile */}
        <button 
          className="btn text-light p-0 border-0 d-lg-none" 
          onClick={toggleSidebar}
          style={{ color: 'var(--text-primary)' }}
        >
          <Menu size={24} />
        </button>
        <h4 className="m-0 fw-bold d-none d-sm-block" style={{ color: 'var(--text-primary)' }}>
          Welcome back, {user ? user.name.split(' ')[0] : 'Trader'}!
        </h4>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Cash Balance Widget and Add Money */}
        {portfolio && (
          <div className="d-flex align-items-center gap-2">
            <div 
              className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 border border-color"
              style={{ backgroundColor: 'var(--bg-primary)' }}
            >
              <Landmark size={18} className="text-primary" style={{ color: 'var(--accent-color)' }} />
              <span className="small text-muted d-none d-md-inline" style={{ color: 'var(--text-secondary)' }}>Virtual Cash:</span>
              <span className="fw-bold text-success" style={{ color: 'var(--success-color)' }}>
                ₹{portfolio.availableBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            
            <button 
              className="btn btn-premium px-3 py-2 d-flex align-items-center gap-1.5"
              onClick={() => setShowAddMoneyModal(true)}
              style={{ fontSize: '0.85rem' }}
            >
              <Plus size={16} />
              <span className="d-none d-sm-inline">Add Money</span>
            </button>
          </div>
        )}

        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className="btn btn-premium-outline p-2 d-flex align-items-center justify-content-center"
          style={{ width: '40px', height: '40px', borderColor: 'var(--border-color)' }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun size={20} className="text-warning" />
          ) : (
            <Moon size={20} className="text-primary" style={{ color: 'var(--accent-color)' }} />
          )}
        </button>
      </div>

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-5"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
        >
          <div 
            className="sb-card p-4 glass-panel border-color w-100 animate-fade-in" 
            style={{ maxWidth: '480px', backgroundColor: 'var(--bg-secondary)' }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-color pb-3">
              <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
                <Landmark size={20} className="text-success" />
                <span>Link Bank & Deposit Funds</span>
              </h5>
              <button 
                onClick={() => setShowAddMoneyModal(false)}
                className="btn border-0 p-0 text-muted"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddMoneySubmit}>
              {/* Amount Input */}
              <div className="sb-input-group mb-3">
                <label className="sb-label">Deposit Amount (₹)</label>
                <input 
                  type="number"
                  placeholder="e.g. 50000"
                  className="sb-input text-light"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  required
                />
                
                {/* Preset Chips */}
                <div className="d-flex gap-2 mt-2 flex-wrap">
                  {[5000, 10000, 50000, 100000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleQuickPreset(preset)}
                      className="btn btn-premium-outline py-1 px-2.5"
                      style={{ fontSize: '0.75rem', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                    >
                      +₹{preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bank Details Header */}
              <div className="small fw-semibold text-muted text-uppercase mb-2 mt-4" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                Mock Bank Account Details
              </div>

              {/* Bank Name */}
              <div className="sb-input-group mb-3">
                <label className="sb-label">Bank Name</label>
                <select 
                  className="sb-input text-light"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                >
                  <option value="">-- Select Bank --</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="State Bank of India">State Bank of India (SBI)</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                </select>
              </div>

              <div className="row g-2 mb-4">
                {/* Account Number */}
                <div className="col-7 sb-input-group">
                  <label className="sb-label">Account Number</label>
                  <input 
                    type="password"
                    placeholder="999912345678"
                    className="sb-input text-light"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    pattern="[0-9]{9,18}"
                    title="Account number should be 9 to 18 digits"
                    required
                  />
                </div>
                {/* IFSC Code */}
                <div className="col-5 sb-input-group">
                  <label className="sb-label">IFSC Code</label>
                  <input 
                    type="text"
                    placeholder="HDFC0000123"
                    className="sb-input text-light text-uppercase"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    maxLength="11"
                    pattern="[A-Za-z]{4}[0][A-Za-z0-9]{6}"
                    title="IFSC should be 11 characters (e.g. HDFC0000123)"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn btn-premium w-100 py-2.5 justify-content-center"
              >
                {isSubmitting ? 'Processing Deposit...' : 'Link & Add Funds'}
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
