import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, clearError } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';
import { TrendingUp, Mail, Lock } from 'lucide-react';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;

  useEffect(() => {
    // If logged in, send to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }

    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [isAuthenticated, error, navigate, dispatch]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning('Please enter all credentials');
      return;
    }

    dispatch(login({ email, password }));
  };

  return (
    <div 
      className="d-flex justify-content-center align-items-center min-vh-100 p-3"
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, var(--bg-primary) 70%)',
      }}
    >
      <div className="sb-card p-4 glass-panel border-color w-100 animate-fade-in" style={{ maxWidth: '440px' }}>
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center rounded-3 p-2 mb-2" style={{ backgroundColor: 'rgba(99,102,241,0.1)' }}>
            <TrendingUp size={36} className="text-primary" style={{ color: 'var(--accent-color)' }} />
          </div>
          <h3 className="fw-bold m-0" style={{ color: 'var(--text-primary)' }}>SB Stocks</h3>
          <p className="text-muted small" style={{ color: 'var(--text-muted)' }}>Login to practice virtual trading</p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="sb-input-group">
            <label className="sb-label">Email Address</label>
            <div className="position-relative">
              <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
                <Mail size={18} />
              </span>
              <input
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                placeholder="Enter your email"
                className="sb-input ps-5"
                required
              />
            </div>
          </div>

          <div className="sb-input-group mb-4">
            <label className="sb-label">Password</label>
            <div className="position-relative">
              <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
                <Lock size={18} />
              </span>
              <input
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                placeholder="Enter password"
                className="sb-input ps-5"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-premium w-100 justify-content-center py-2"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying Credentials...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-4 border-top border-color pt-3">
          <p className="m-0 small text-muted" style={{ color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="fw-semibold text-decoration-none" style={{ color: 'var(--accent-color)' }}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
