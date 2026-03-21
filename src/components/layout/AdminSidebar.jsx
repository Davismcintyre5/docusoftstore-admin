import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import adminApi from '../../services/adminApi';

const AdminSidebar = () => {
  const [businessName, setBusinessName] = useState('DocuSoft Store');
  const [collapsed, setCollapsed] = useState(false);

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

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <>
            <div className="sidebar-title">{businessName}</div>
            <div className="sidebar-subtitle">Admin Panel</div>
          </>
        )}
        <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '→' : '←'}
        </button>
      </div>
      <ul className="sidebar-nav">
        {navItems.map(item => (
          <li key={item.path}>
            <NavLink to={item.path} className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="sidebar-icon">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default AdminSidebar;