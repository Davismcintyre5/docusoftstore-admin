import React, { createContext, useState, useContext, useEffect } from 'react';
import adminApi from '../services/adminApi';

const AdminAuthContext = createContext();

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  useEffect(() => {
    if (token) {
      fetchAdmin();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchAdmin = async () => {
    try {
      const { data } = await adminApi.get('/auth/me');
      if (data.role === 'admin') {
        setAdmin(data);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Admin auth error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (newToken, userData) => {
    localStorage.setItem('adminToken', newToken);
    localStorage.setItem('adminUser', JSON.stringify(userData));
    setToken(newToken);
    setAdmin(userData);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setToken(null);
    setAdmin(null);
  };

  const value = {
    admin,
    token,
    login,
    logout,
    isAuthenticated: !!admin,
    loading
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};