import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const SidebarLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Layout Area */}
      <div className="d-flex flex-column flex-grow-1" style={{ minWidth: 0 }}>
        {/* Sticky Top Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Dynamic Inner Page */}
        <main className="main-content">
          {children}
        </main>
      </div>

      {/* Overlay backdrop when mobile sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-50 z-2 d-lg-none"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default SidebarLayout;
