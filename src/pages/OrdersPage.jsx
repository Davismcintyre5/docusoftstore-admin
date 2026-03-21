import React, { useState, useEffect } from 'react';
import adminApi from '../services/adminApi';
import DataTable from '../components/common/DataTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatKES, formatDate } from '../utils/formatters';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await adminApi.get('/orders/all');
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const columns = [
    { header: 'Order ID', accessor: (row) => row._id.slice(-8) },
    { header: 'User', accessor: (row) => row.user?.name || 'N/A' },
    { header: 'Items', accessor: (row) => row.items.length },
    { header: 'Total', accessor: (row) => formatKES(row.totalAmount) },
    { header: 'Status', accessor: (row) => <span style={{ padding: '4px 12px', borderRadius: '20px', backgroundColor: '#c6f6d5', color: '#22543d' }}>{row.status}</span> },
    { header: 'Payment Method', accessor: 'paymentMethod' },
    { header: 'Date', accessor: (row) => formatDate(row.createdAt) },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>Orders</h1>
      <DataTable columns={columns} data={orders} />
    </div>
  );
};

export default OrdersPage;