import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPortfolio } from '../redux/slices/portfolioSlice';
import { User, Mail, Calendar, Key, ShieldCheck, Landmark } from 'lucide-react';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { portfolio } = useSelector((state) => state.portfolio);

  useEffect(() => {
    dispatch(fetchPortfolio());
  }, [dispatch]);

  return (
    <div className="container-fluid p-0 animate-fade-in">
      <div className="mb-4">
        <h2 className="fw-bold m-0" style={{ color: 'var(--text-primary)' }}>My Profile</h2>
        <p className="text-muted small m-0" style={{ color: 'var(--text-secondary)' }}>
          Manage your trading profile and account configurations
        </p>
      </div>

      <div className="row g-4">
        {/* User Info Card */}
        <div className="col-lg-6">
          <div className="sb-card p-4 h-100" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <h5 className="fw-bold mb-4 border-bottom border-color pb-3" style={{ color: 'var(--text-primary)' }}>Account Information</h5>
            
            {user && (
              <div className="d-flex flex-column gap-4">
                {/* Profile Circle Logo */}
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm fs-2"
                    style={{
                      width: '80px',
                      height: '80px',
                      background: 'var(--accent-gradient)'
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="fw-bold m-0" style={{ color: 'var(--text-primary)' }}>{user.name}</h4>
                    <span className="badge bg-secondary-subtle text-light fw-bold" style={{ color: 'var(--text-primary)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      {user.role === 'admin' ? 'SYSTEM ADMINISTRATOR' : 'SANDBOX TRADER'}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2.5 rounded-3 bg-body-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', color: 'var(--accent-color)' }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <span className="small text-muted d-block" style={{ color: 'var(--text-secondary)' }}>Email Address</span>
                    <span className="fw-semibold">{user.email}</span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div className="p-2.5 rounded-3 bg-body-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', color: 'var(--accent-color)' }}>
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <span className="small text-muted d-block" style={{ color: 'var(--text-secondary)' }}>Security Level</span>
                    <span className="fw-semibold">{user.role === 'admin' ? 'Root Administrator' : 'Standard Sandbox Account'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Capital stats */}
        <div className="col-lg-6">
          <div className="sb-card p-4 h-100" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <h5 className="fw-bold mb-4 border-bottom border-color pb-3" style={{ color: 'var(--text-primary)' }}>Paper Trading Summary</h5>

            {portfolio && (
              <div className="d-flex flex-column gap-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2.5 rounded-3 bg-body-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', color: 'var(--success-color)' }}>
                    <Landmark size={20} />
                  </div>
                  <div>
                    <span className="small text-muted d-block" style={{ color: 'var(--text-secondary)' }}>Available Virtual Funds</span>
                    <h5 className="fw-bold m-0 text-success" style={{ color: 'var(--success-color)' }}>
                      ₹{portfolio.availableBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h5>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div className="p-2.5 rounded-3 bg-body-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', color: 'var(--accent-color)' }}>
                    <Key size={20} />
                  </div>
                  <div>
                    <span className="small text-muted d-block" style={{ color: 'var(--text-secondary)' }}>Total Valuation</span>
                    <h5 className="fw-bold m-0 text-light" style={{ color: 'var(--text-primary)' }}>
                      ₹{portfolio.totalValue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h5>
                  </div>
                </div>

                <div className="p-3 rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
                  <span className="small text-muted d-block" style={{ color: 'var(--text-secondary)' }}>Trading System Disclaimer</span>
                  <p className="small text-muted m-0 mt-1" style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    SB Stocks is a paper trading platform intended for education, mock portfolio management practice, and API sandbox integrations. All security valuations and trades are simulated and carry zero real monetary exposure.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
