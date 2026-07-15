import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Briefcase, 
  Eye, 
  History, 
  User, 
  ShieldAlert, 
  LogOut,
  X 
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/trade', label: 'Markets', icon: TrendingUp },
    { path: '/portfolio', label: 'Portfolio', icon: Briefcase },
    { path: '/watchlist', label: 'Watchlist', icon: Eye },
    { path: '/transactions', label: 'Transactions', icon: History },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  // Add admin panel if role is admin
  if (user && user.role === 'admin') {
    navItems.push({ path: '/admin', label: 'Admin Panel', icon: ShieldAlert });
  }

  return (
    <aside 
      className={`glass-panel border-end border-color d-flex flex-column position-fixed top-0 start-0 h-100 transition-all z-3 app-sidebar ${isOpen ? 'show' : ''}`}
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-secondary)'
      }}
    >
      {/* Sidebar Header */}
      <div className="p-4 d-flex justify-content-between align-items-center border-bottom border-color">
        <NavLink to="/dashboard" className="text-decoration-none d-flex align-items-center gap-2">
          <TrendingUp className="text-primary" size={28} style={{ color: 'var(--accent-color)' }} />
          <span className="fs-4 fw-bold text-light" style={{ color: 'var(--text-primary)' }}>
            SB <span className="text-primary" style={{ color: 'var(--accent-color)' }}>Stocks</span>
          </span>
        </NavLink>
        <button 
          className="btn d-lg-none text-light p-0 border-0" 
          onClick={toggleSidebar}
          style={{ color: 'var(--text-primary)' }}
        >
          <X size={24} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow-1 px-3 py-4 overflow-y-auto">
        <ul className="list-unstyled d-flex flex-column gap-2 m-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 992) toggleSidebar();
                  }}
                  className={({ isActive }) => 
                    `d-flex align-items-center gap-3 px-3 py-3 rounded-3 text-decoration-none transition-all ${
                      isActive 
                        ? 'text-white' 
                        : 'text-secondary-emphasis'
                    }`
                  }
                  style={({ isActive }) => ({
                    background: isActive ? 'var(--accent-gradient)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    fontWeight: isActive ? '600' : '500'
                  })}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Session Footer */}
      <div className="p-4 border-top border-color d-flex flex-column gap-3">
        {user && (
          <div className="d-flex align-items-center gap-3">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
              style={{
                width: '40px',
                height: '40px',
                background: 'var(--accent-gradient)'
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h6 className="m-0 text-truncate fw-semibold" style={{ color: 'var(--text-primary)' }}>{user.name}</h6>
              <span className="text-muted d-block text-truncate small" style={{ color: 'var(--text-muted)' }}>
                {user.role === 'admin' ? 'Administrator' : 'Trader'}
              </span>
            </div>
          </div>
        )}
        <button 
          onClick={handleLogout}
          className="btn btn-premium-outline w-100 justify-content-center py-2 text-danger border-danger"
          style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: 'var(--danger-color)' }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
