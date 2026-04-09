import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import adminApi from '../services/adminApi';
import { Mail, Lock, LogIn, Eye, EyeOff, Shield, AlertCircle, LayoutDashboard, Users, CreditCard, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [businessName, setBusinessName] = useState('DocuSoft');
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBusinessName = async () => {
      try {
        const { data } = await adminApi.get('/settings');
        if (data.businessName) setBusinessName(data.businessName);
      } catch (error) {
        console.error('Failed to fetch business name', error);
      }
    };
    fetchBusinessName();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { data } = await adminApi.post('/auth/login', { email, password });
      if (data.user.role !== 'admin') {
        throw new Error('Access denied. Admin only.');
      }
      login(data.token, data.user);
      toast.success('Welcome back, Admin!');
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 p-4">
      <div className="flex flex-col md:flex-row max-w-5xl w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Left Side - Brand Section (Admin Focused) */}
        <div className="md:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <span className="text-xl font-bold">{businessName}</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">Admin Portal</h1>
            <p className="text-white/80 mb-8">Secure access to manage your store, users, payments, and content.</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <LayoutDashboard size={16} />
              </div>
              <div>
                <h4 className="font-semibold">Dashboard Analytics</h4>
                <p className="text-sm text-white/70">View real-time store statistics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Users size={16} />
              </div>
              <div>
                <h4 className="font-semibold">User Management</h4>
                <p className="text-sm text-white/70">Manage customers and admins</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <CreditCard size={16} />
              </div>
              <div>
                <h4 className="font-semibold">Payment Verification</h4>
                <p className="text-sm text-white/70">Approve or reject manual payments</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Settings size={16} />
              </div>
              <div>
                <h4 className="font-semibold">Store Settings</h4>
                <p className="text-sm text-white/70">Configure your business</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Login Form */}
        <div className="md:w-1/2 p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Administrator Login</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Enter your credentials to continue</p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="admin@docusoft.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Shield size={12} />
              <span>Secure Admin Access Only</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              DocuSoft Admin Panel v2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;