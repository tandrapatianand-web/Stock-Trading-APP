import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout and Route guards
import SidebarLayout from './layouts/SidebarLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TradePage from './pages/TradePage';
import StockDetailPage from './pages/StockDetailPage';
import PortfolioPage from './pages/PortfolioPage';
import WatchlistPage from './pages/WatchlistPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

// Import bootstrap CSS grid
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  // Synchronize CSS class theme on initial load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const root = document.documentElement;
    if (savedTheme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Out-of-Session routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Session layout routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <SidebarLayout>
                <DashboardPage />
              </SidebarLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/trade" 
          element={
            <ProtectedRoute>
              <SidebarLayout>
                <TradePage />
              </SidebarLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/stock/:id" 
          element={
            <ProtectedRoute>
              <SidebarLayout>
                <StockDetailPage />
              </SidebarLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/portfolio" 
          element={
            <ProtectedRoute>
              <SidebarLayout>
                <PortfolioPage />
              </SidebarLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/watchlist" 
          element={
            <ProtectedRoute>
              <SidebarLayout>
                <WatchlistPage />
              </SidebarLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/transactions" 
          element={
            <ProtectedRoute>
              <SidebarLayout>
                <TransactionHistoryPage />
              </SidebarLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <SidebarLayout>
                <ProfilePage />
              </SidebarLayout>
            </ProtectedRoute>
          } 
        />

        {/* Admin Dashboard */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminRoute>
                <SidebarLayout>
                  <AdminDashboardPage />
                </SidebarLayout>
              </AdminRoute>
            </ProtectedRoute>
          } 
        />

        {/* 404 handler */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>

      {/* Global Alert System */}
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        theme="dark" 
        hideProgressBar={false} 
        newestOnTop 
        closeOnClick 
        pauseOnHover 
        draggable 
      />
    </Router>
  );
}

export default App;
