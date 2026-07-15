import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div 
      className="d-flex flex-column justify-content-center align-items-center min-vh-100 p-3 text-light text-center"
      style={{
        background: 'var(--bg-primary)'
      }}
    >
      <div className="sb-card p-5 glass-panel border-color max-width-500 w-100 animate-fade-in" style={{ maxWidth: '500px' }}>
        <div className="d-inline-flex p-3 rounded-circle mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)' }}>
          <AlertTriangle size={48} />
        </div>
        <h1 className="display-5 fw-bold mb-2">404 - Page Not Found</h1>
        <p className="text-secondary mb-4 fs-6" style={{ color: 'var(--text-secondary)' }}>
          The link you requested is invalid, deleted, or you might not have the clearance credentials to view it.
        </p>
        <Link to="/dashboard" className="btn btn-premium justify-content-center py-2 px-4">
          <Home size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
