import React, { useState } from 'react';
import adminApi from '../../services/adminApi';
import { formatKES, formatDate } from '../../utils/helpers';

const PaymentVerificationList = ({ payments, onRefresh }) => {
  const [processingId, setProcessingId] = useState(null);

  const handleApprove = async (id) => {
    if (!window.confirm('✅ Approve this payment? Order will be created.')) return;
    setProcessingId(id);
    try {
      await adminApi.post(`/admin/approve-payment/${id}`);
      alert('✅ Payment approved and order created!');
      onRefresh();
    } catch (error) {
      alert(error.response?.data?.message || 'Approval failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Reason for rejection (optional):');
    if (reason === null) return;
    setProcessingId(id);
    try {
      await adminApi.post(`/admin/reject-payment/${id}`, { reason });
      alert('❌ Payment rejected');
      onRefresh();
    } catch (error) {
      alert(error.response?.data?.message || 'Rejection failed');
    } finally {
      setProcessingId(null);
    }
  };

  if (payments.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
        <h3>No pending payments</h3>
        <p>All manual payments have been processed.</p>
        <button className="btn btn-primary" onClick={onRefresh}>Refresh</button>
      </div>
    );
  }

  return (
    <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <div className="table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>User</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Item</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Amount</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Payment Confirmation</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Actions</th>
              </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment._id}>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
                  <div>
                    <strong>{payment.user?.name || 'Unknown'}</strong>
                    <div style={{ fontSize: '12px', color: '#718096' }}>{payment.user?.email}</div>
                    <div style={{ fontSize: '12px', color: '#718096' }}>{payment.user?.phone}</div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
                  <div>{payment.itemTitle}</div>
                  <div style={{ fontSize: '12px', color: '#718096' }}>{payment.itemType}</div>
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontWeight: '600' }}>
                  {formatKES(payment.amount)}
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontSize: '13px' }}>
                  {formatDate(payment.createdAt)}
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', maxWidth: '300px', wordBreak: 'break-word' }}>
                  {payment.metadata?.paymentConfirmation ? (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{payment.metadata.paymentConfirmation}</div>
                  ) : (
                    <span style={{ color: '#a0aec0', fontSize: '12px' }}>No confirmation provided</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-success"
                      style={{ padding: '6px 12px', backgroundColor: '#48bb78' }}
                      onClick={() => handleApprove(payment._id)}
                      disabled={processingId === payment._id}
                    >
                      {processingId === payment._id ? '...' : '✓ Approve'}
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '6px 12px', backgroundColor: '#f56565' }}
                      onClick={() => handleReject(payment._id)}
                      disabled={processingId === payment._id}
                    >
                      ✗ Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentVerificationList;