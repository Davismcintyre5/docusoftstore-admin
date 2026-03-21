import React, { useState, useEffect } from 'react';
import adminApi from '../services/adminApi';
import PaymentVerificationList from '../components/admin/PaymentVerificationList';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/pending-payments');
      setPayments(data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRefresh = () => {
    fetchPayments();
  };

  if (loading && payments.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px' }}>💰 Manual Payments Verification</h1>
        <button className="btn btn-primary" onClick={handleRefresh}>🔄 Refresh</button>
      </div>
      <PaymentVerificationList payments={payments} onRefresh={handleRefresh} />
    </div>
  );
};

export default PaymentsPage;