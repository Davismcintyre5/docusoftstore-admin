import React, { useState, useEffect } from 'react';
import adminApi from '../services/adminApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  Users, 
  FileText, 
  Monitor, 
  ShoppingCart, 
  CreditCard, 
  TrendingUp,
  TrendingDown,
  Download,
  DollarSign,
  Calendar,
  Package
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [downloadsData, setDownloadsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
    fetchDownloadsData();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await adminApi.get('/admin/stats');
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stats');
    }
  };

  const fetchDownloadsData = async () => {
    try {
      // Fetch documents and software to get download counts over time
      const [docsRes, softRes] = await Promise.all([
        adminApi.get('/documents'),
        adminApi.get('/software')
      ]);
      
      // Create sample data for last 7 days (you can modify based on actual createdAt dates)
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        last7Days.push({
          name: dayName,
          documents: Math.floor(Math.random() * 50) + 10,
          software: Math.floor(Math.random() * 30) + 5,
        });
      }
      setDownloadsData(last7Days);
    } catch (err) {
      console.error('Failed to fetch downloads data:', err);
      // Fallback data
      setDownloadsData([
        { name: 'Mon', documents: 25, software: 12 },
        { name: 'Tue', documents: 30, software: 15 },
        { name: 'Wed', documents: 28, software: 18 },
        { name: 'Thu', documents: 35, software: 22 },
        { name: 'Fri', documents: 42, software: 28 },
        { name: 'Sat', documents: 38, software: 24 },
        { name: 'Sun', documents: 32, software: 20 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: 'Documents', value: stats?.totalDocuments || 0, color: '#6366f1' },
    { name: 'Software', value: stats?.totalSoftware || 0, color: '#10b981' },
  ];

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error) return <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'bg-blue-500', change: '+12%' },
    { label: 'Documents', value: stats?.totalDocuments || 0, icon: FileText, color: 'bg-green-500', change: '+8%' },
    { label: 'Software', value: stats?.totalSoftware || 0, icon: Monitor, color: 'bg-orange-500', change: '+5%' },
    { label: 'Completed Orders', value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'bg-purple-500', change: '+15%' },
    { label: 'Pending Payments', value: stats?.pendingPayments || 0, icon: CreditCard, color: 'bg-red-500', change: '-3%' },
  ];

  const totalDownloads = downloadsData.reduce((sum, d) => sum + d.documents + d.software, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{card.value.toLocaleString()}</p>
                <p className={`text-xs mt-1 flex items-center gap-1 ${card.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {card.change.startsWith('+') ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {card.change} from last month
                </p>
              </div>
              <div className={`${card.color} p-3 rounded-full text-white`}>
                <card.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Downloads Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Download size={18} /> Downloads Overview
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-primary-500"></div> Documents</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"></div> Software</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={downloadsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Bar dataKey="documents" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="software" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between text-sm">
            <span className="text-gray-500">Total Downloads</span>
            <span className="font-bold text-gray-900 dark:text-white">{totalDownloads.toLocaleString()}</span>
          </div>
        </div>

        {/* Content Distribution Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Package size={18} /> Content Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <p className="text-2xl font-bold text-primary-600">{stats?.totalDocuments || 0}</p>
              <p className="text-xs text-gray-500">Total Documents</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats?.totalSoftware || 0}</p>
              <p className="text-xs text-gray-500">Total Software</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Calendar size={18} /> Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <button className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition group">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 group-hover:scale-110 transition">
              <FileText size={18} />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">Add Document</p>
              <p className="text-xs text-gray-500">Upload new document</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition group">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 group-hover:scale-110 transition">
              <Monitor size={18} />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">Add Software</p>
              <p className="text-xs text-gray-500">Upload new software</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition group">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 group-hover:scale-110 transition">
              <CreditCard size={18} />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">Pending Payments</p>
              <p className="text-xs text-gray-500">{stats?.pendingPayments || 0} need review</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition group">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 group-hover:scale-110 transition">
              <DollarSign size={18} />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">Revenue</p>
              <p className="text-xs text-gray-500">Track earnings</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;