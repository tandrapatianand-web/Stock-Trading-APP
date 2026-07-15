import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  ShieldCheck, 
  BarChart3, 
  Zap, 
  Layers, 
  Users 
} from 'lucide-react';
import '../App.css';

const LandingPage = () => {
  const features = [
    { icon: Zap, title: 'Real-time Price Engine', desc: 'Simulated pricing engine updates stock values every 15 seconds so you practice on live-like charts.' },
    { icon: ShieldCheck, title: 'Zero Financial Risk', desc: 'Get ₹1,00,000 in virtual trading capital to test strategies, learn dynamics, and build confidence.' },
    { icon: BarChart3, title: 'Advanced Charting', desc: 'Interactive visual growth portfolios and pricing graphs powered by Chart.js.' },
    { icon: Layers, title: 'Watchlist Tracking', desc: 'Curate list of target companies and monitor fluctuations from a streamlined control room.' },
    { icon: Users, title: 'Admin Controls', desc: 'Includes secure administrator controls for managing users, editing listings, and viewing global volume ledger.' },
    { icon: TrendingUp, title: 'Detailed Performance Ledger', desc: 'Export full transaction histories to CSV formats for external accounting and strategy mapping.' },
  ];

  return (
    <div className="landing-page d-flex flex-column text-light">
      {/* Landing Navbar */}
      <header className="glass-panel border-bottom border-color py-3 px-4 px-md-5 d-flex justify-content-between align-items-center sticky-top">
        <div className="d-flex align-items-center gap-2">
          <TrendingUp className="text-primary" size={28} style={{ color: 'var(--accent-color)' }} />
          <span className="fs-4 fw-bold nav-logo">SB Stocks</span>
        </div>
        <div className="d-flex gap-3">
          <Link to="/login" className="btn btn-premium-outline px-4 py-2 border-0">Sign In</Link>
          <Link to="/register" className="btn btn-premium px-4 py-2">Get Started</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container my-auto py-5 px-4 px-md-5">
        <div className="row align-items-center g-5">
          <div className="col-lg-6 text-center text-lg-start animate-fade-in">
            <span className="badge badge-up mb-3 text-uppercase tracking-wider">Virtual Trading Platform</span>
            <h1 className="display-4 fw-extrabold mb-4" style={{ letterSpacing: '-1.5px', lineHeight: '1.2' }}>
              Master the Stock Market with <br />
              <span className="text-primary" style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Zero Capital Risk
              </span>
            </h1>
            <p className="lead text-secondary-emphasis mb-4 fs-5" style={{ color: 'var(--text-secondary)' }}>
              Practice day-trading, buy long-term growth shares, and track mock-portfolio returns using a realistic simulated ledger. Powered by virtual INR.
            </p>
            <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3">
              <Link to="/register" className="btn btn-premium px-5 py-3 fs-6">
                Open Sandbox Account
              </Link>
              <Link to="/login" className="btn btn-premium-outline px-5 py-3 fs-6" style={{ borderColor: 'var(--border-color)' }}>
                Demo Sign In
              </Link>
            </div>
          </div>

          <div className="col-lg-6 d-flex justify-content-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="sb-card p-4 glass-panel border-color w-100" style={{ maxWidth: '500px' }}>
              <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-color pb-3">
                <div>
                  <h5 className="m-0 fw-bold">Live Market Simulation</h5>
                  <span className="small text-muted" style={{ color: 'var(--text-muted)' }}>Real-time updates active</span>
                </div>
                <div className="badge-up">+2.45% Today</div>
              </div>

              {/* Sample stock rows */}
              <div className="d-flex flex-column gap-3">
                {[
                  { sym: 'RELIANCE', name: 'Reliance Industries Ltd.', price: 2450.50, chg: '+1.45%', up: true },
                  { sym: 'TCS', name: 'Tata Consultancy Services Ltd.', price: 3920.10, chg: '-0.32%', up: false },
                  { sym: 'SBIN', name: 'State Bank of India', price: 830.40, chg: '+2.80%', up: true },
                ].map((s, idx) => (
                  <div key={idx} className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="stock-logo-circle bg-white text-dark">{s.sym.slice(0,2)}</div>
                      <div>
                        <span className="fw-bold d-block">{s.sym}</span>
                        <span className="small text-muted">{s.name}</span>
                      </div>
                    </div>
                    <div className="text-end">
                      <span className="fw-semibold d-block">₹{s.price.toFixed(2)}</span>
                      <span className={s.up ? 'price-up small' : 'price-down small'}>{s.chg}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container py-5 px-4 px-md-5 border-top border-color">
        <h2 className="text-center fw-bold mb-5 fs-2">Platform Capabilities</h2>
        <div className="row g-4">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div key={idx} className="col-md-6 col-lg-4">
                <div className="sb-card h-100 accent-top">
                  <div 
                    className="rounded-3 p-3 d-inline-flex mb-3" 
                    style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-color)' }}
                  >
                    <Icon size={24} />
                  </div>
                  <h4 className="fw-bold mb-2 fs-5">{f.title}</h4>
                  <p className="text-muted small m-0" style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-4 border-top border-color text-center text-muted small" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
        <p className="m-0">&copy; 2026 SB Stocks Paper Trading. Built for simulation and learning. No real funds are involved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
