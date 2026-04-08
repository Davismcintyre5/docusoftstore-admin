import React, { useState, useEffect } from 'react';
import adminApi from '../services/adminApi';
import PaymentVerificationList from '../components/admin/PaymentVerificationList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { RefreshCw } from 'lucide-react';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/pending-payments');
      setPayments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manual Payments Verification</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Review and approve pending manual payments</p>
        </div>
        <button onClick={fetchPayments} className="btn-secondary inline-flex items-center gap-2"><RefreshCw size={16} /> Refresh</button>
      </div>
      <PaymentVerificationList payments={payments} onRefresh={fetchPayments} />
    </div>
  );
};

export default PaymentsPage;