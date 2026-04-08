import React, { useState, useEffect } from 'react';
import adminApi from '../services/adminApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Users, FileText, Monitor, ShoppingCart, CreditCard, TrendingUp } from 'lucide-react';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await adminApi.get('/admin/stats');
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error) return <div className="card p-8 text-center text-red-600">{error}</div>;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Documents', value: stats?.totalDocuments || 0, icon: FileText, color: 'bg-green-500' },
    { label: 'Software', value: stats?.totalSoftware || 0, icon: Monitor, color: 'bg-orange-500' },
    { label: 'Completed Orders', value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'bg-purple-500' },
    { label: 'Pending Payments', value: stats?.pendingPayments || 0, icon: CreditCard, color: 'bg-red-500' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back to your admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="card p-4 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{card.value.toLocaleString()}</p>
              </div>
              <div className={`${card.color} p-3 rounded-full text-white`}>
                <card.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Placeholder - can be extended */}
      <div className="mt-8 card">
        <div className="card-header">
          <h3 className="font-semibold flex items-center gap-2"><TrendingUp size={18} /> Quick Overview</h3>
        </div>
        <div className="card-body">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Monitor your store's performance from this dashboard. Use the sidebar to manage users, content, payments, and settings.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;