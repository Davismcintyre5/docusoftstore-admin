import React, { useState, useEffect } from 'react';
import adminApi from '../services/adminApi';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('📊 Fetching dashboard stats...');
        const { data } = await adminApi.get('/admin/stats');
        console.log('✅ Stats received:', data);
        setStats(data);
      } catch (error) {
        console.error('❌ Failed to fetch stats:', error);
        setError(error.response?.data?.message || error.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  if (error) {
    return (
      <div style={{ 
        background: 'white', 
        padding: '40px', 
        borderRadius: '12px', 
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h3 style={{ color: '#c53030', marginBottom: '8px' }}>Error Loading Dashboard</h3>
        <p style={{ color: '#718096' }}>{error}</p>
        <button 
          className="btn btn-primary" 
          onClick={() => window.location.reload()}
          style={{ marginTop: '16px' }}
        >
          Retry
        </button>
      </div>
    );
  }

  const statItems = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: '#4299e1' },
    { label: 'Documents', value: stats?.totalDocuments || 0, icon: '📄', color: '#48bb78' },
    { label: 'Software', value: stats?.totalSoftware || 0, icon: '💻', color: '#ed8936' },
    { label: 'Orders', value: stats?.totalOrders || 0, icon: '🛒', color: '#9f7aea' },
    { label: 'Pending Payments', value: stats?.pendingPayments || 0, icon: '💰', color: '#f56565' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>Dashboard</h1>
      <div className="stats-grid">
        {statItems.map((item, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-icon">{item.icon}</div>
            <div>
              <div className="stat-value">{item.value.toLocaleString()}</div>
              <div className="stat-label">{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;