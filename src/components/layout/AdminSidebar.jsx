import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import adminApi from '../../services/adminApi';

const AdminSidebar = () => {
  const [businessName, setBusinessName] = useState('DocuSoft Store');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await adminApi.get('/settings');
        setBusinessName(data.businessName || 'DocuSoft Store');
      } catch (error) {
        console.error('Failed to fetch settings', error);
      }
    };
    fetchSettings();
  }, []);

  // Close mobile sidebar when navigating
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Handle window resize - close mobile sidebar on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/categories', label: 'Categories', icon: '📋' },
    { path: '/documents', label: 'Documents', icon: '📄' },
    { path: '/software', label: 'Software', icon: '💻' },
    { path: '/payments', label: 'Payments', icon: '💰' },
    { path: '/orders', label: 'Orders', icon: '🛒' },
    { path: '/users', label: 'Users', icon: '👥' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobile = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button 
        className="sidebar-toggle-btn"
        onClick={toggleMobile}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div 
          className="sidebar-overlay"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          {!collapsed && (
            <>
              <div className="sidebar-title">{businessName}</div>
              <div className="sidebar-subtitle">Admin Panel</div>
            </>
          )}
          <button 
            className="sidebar-toggle" 
            onClick={toggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>
        <ul className="sidebar-nav">
          {navItems.map(item => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => isActive ? 'active' : ''}
                onClick={() => setMobileOpen(false)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
        {!collapsed && (
          <div className="sidebar-footer">
            <div className="sidebar-version">v1.0.0</div>
          </div>
        )}
      </aside>
    </>
  );
};

export default AdminSidebar;