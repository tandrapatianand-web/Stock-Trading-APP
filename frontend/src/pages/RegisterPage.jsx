import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register, clearError } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';
import { TrendingUp, User, Mail, Lock } from 'lucide-react';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { name, email, password, confirmPassword } = formData;

  useEffect(() => {
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

    if (!name || !email || !password || !confirmPassword) {
      toast.warning('Please enter all required fields');
      return;
    }

    if (password.length < 6) {
      toast.warning('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    dispatch(register({ name, email, password }));
  };

  return (
    <div 
      className="d-flex justify-content-center align-items-center min-vh-100 p-3"
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, var(--bg-primary) 70%)',
      }}
    >
      <div className="sb-card p-4 glass-panel border-color w-100 animate-fade-in" style={{ maxWidth: '460px' }}>
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center rounded-3 p-2 mb-2" style={{ backgroundColor: 'rgba(99,102,241,0.1)' }}>
            <TrendingUp size={36} className="text-primary" style={{ color: 'var(--accent-color)' }} />
          </div>
          <h3 className="fw-bold m-0" style={{ color: 'var(--text-primary)' }}>Create Sandbox</h3>
          <p className="text-muted small" style={{ color: 'var(--text-muted)' }}>Get $100,000 in virtual trading capital</p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="sb-input-group">
            <label className="sb-label">Full Name</label>
            <div className="position-relative">
              <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
                <User size={18} />
              </span>
              <input
                type="text"
                name="name"
                value={name}
                onChange={onChange}
                placeholder="Enter your name"
                className="sb-input ps-5"
                required
              />
            </div>
          </div>

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

          <div className="sb-input-group">
            <label className="sb-label">Password (Min 6 characters)</label>
            <div className="position-relative">
              <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
                <Lock size={18} />
              </span>
              <input
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                placeholder="Create password"
                className="sb-input ps-5"
                required
              />
            </div>
          </div>

          <div className="sb-input-group mb-4">
            <label className="sb-label">Confirm Password</label>
            <div className="position-relative">
              <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
                <Lock size={18} />
              </span>
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={onChange}
                placeholder="Repeat password"
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
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-4 border-top border-color pt-3">
          <p className="m-0 small text-muted" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="fw-semibold text-decoration-none" style={{ color: 'var(--accent-color)' }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
