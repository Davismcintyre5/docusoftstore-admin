import React, { useState } from 'react';
import adminApi from '../../services/adminApi';
import ImageViewer from '../common/ImageViewer';
import { formatKES, formatDate } from '../../utils/helpers';

const PaymentVerificationList = ({ payments, onRefresh }) => {
  const [processingId, setProcessingId] = useState(null);
  const [viewImage, setViewImage] = useState(null);
  const [imageError, setImageError] = useState(null);

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

  // Construct full image URL
  const getImageUrl = (screenshotUrl) => {
    if (!screenshotUrl) return null;
    // If it's already a full URL, return it
    if (screenshotUrl.startsWith('http')) return screenshotUrl;
    // Otherwise, prepend the base URL (without /api)
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${screenshotUrl}`;
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
    <>
      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>User</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Item</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Amount</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Screenshot</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => {
                const imageUrl = getImageUrl(payment.screenshotUrl);
                return (
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
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontWeight: '600', color: '#2d3748' }}>
                      {formatKES(payment.amount)}
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontSize: '13px' }}>
                      {formatDate(payment.createdAt)}
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
                      {payment.screenshotUrl ? (
                        <button
                          onClick={() => setViewImage(imageUrl)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            minHeight: '32px',
                            backgroundColor: '#4299e1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          📸 View Screenshot
                        </button>
                      ) : (
                        <span style={{ color: '#a0aec0', fontSize: '12px' }}>No file</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            minHeight: '32px',
                            backgroundColor: '#48bb78',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleApprove(payment._id)}
                          disabled={processingId === payment._id}
                        >
                          {processingId === payment._id ? '...' : '✓ Approve'}
                        </button>
                        <button
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            minHeight: '32px',
                            backgroundColor: '#f56565',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleReject(payment._id)}
                          disabled={processingId === payment._id}
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {viewImage && (
        <ImageViewer 
          url={viewImage} 
          onClose={() => setViewImage(null)} 
        />
      )}
    </>
  );
};

export default PaymentVerificationList;