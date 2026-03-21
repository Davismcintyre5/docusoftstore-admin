import React, { useState } from 'react';
import adminApi from '../../services/adminApi';
import ImageViewer from '../common/ImageViewer';
import { formatKES, formatDate } from '../../utils/helpers';

const PaymentVerificationList = ({ payments, onRefresh }) => {
  const [processingId, setProcessingId] = useState(null);
  const [viewImage, setViewImage] = useState(null);

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

  // FORCED LOCALHOST - ALWAYS USE LOCAL DEVELOPMENT SERVER
  const getImageUrl = (screenshotUrl) => {
    if (!screenshotUrl) return null;
    
    console.log('Raw screenshotUrl from database:', screenshotUrl);
    
    // If it's already a localhost URL, return it
    if (screenshotUrl.includes('localhost:5000')) {
      return screenshotUrl;
    }
    
    // Extract just the path part (everything after the domain)
    let path = screenshotUrl;
    
    // Remove any domain if present
    if (screenshotUrl.includes('docusoftserver.pxxl.click')) {
      path = screenshotUrl.replace(/https?:\/\/docusoftserver\.pxxl\.click/, '');
    } else if (screenshotUrl.includes('http://') || screenshotUrl.includes('https://')) {
      // If it's some other absolute URL, extract the path
      const urlObj = new URL(screenshotUrl);
      path = urlObj.pathname + urlObj.search;
    }
    
    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    // Always use localhost for development
    const finalUrl = `http://localhost:5000${cleanPath}`;
    console.log('Final URL (forced localhost):', finalUrl);
    
    return finalUrl;
  };

  if (payments.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
        <h3 style={{ marginBottom: '8px', color: '#2d3748' }}>No pending payments</h3>
        <p style={{ color: '#718096', marginBottom: '20px' }}>All manual payments have been processed.</p>
        <button 
          className="btn btn-primary" 
          onClick={onRefresh}
          style={{
            padding: '10px 20px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          🔄 Refresh
        </button>
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
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontSize: '13px', fontWeight: '600' }}>User</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontSize: '13px', fontWeight: '600' }}>Item</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontSize: '13px', fontWeight: '600' }}>Amount</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontSize: '13px', fontWeight: '600' }}>Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontSize: '13px', fontWeight: '600' }}>Screenshot</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontSize: '13px', fontWeight: '600' }}>Actions</th>
                </tr>
            </thead>
            <tbody>
              {payments.map(payment => {
                const imageUrl = getImageUrl(payment.screenshotUrl);
                return (
                  <tr key={payment._id}>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
                      <div>
                        <strong style={{ color: '#2d3748' }}>{payment.user?.name || 'Unknown'}</strong>
                        <div style={{ fontSize: '12px', color: '#718096' }}>{payment.user?.email}</div>
                        <div style={{ fontSize: '12px', color: '#718096' }}>{payment.user?.phone}</div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: '500', color: '#2d3748' }}>{payment.itemTitle}</div>
                      <div style={{ fontSize: '12px', color: '#718096' }}>{payment.itemType}</div>
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontWeight: '600', color: '#2d3748' }}>
                      {formatKES(payment.amount)}
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontSize: '13px', color: '#718096' }}>
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
                            gap: '4px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#3182ce'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#4299e1'}
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
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            opacity: processingId === payment._id ? 0.5 : 1
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#38a169'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#48bb78'}
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
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            opacity: processingId === payment._id ? 0.5 : 1
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#e53e3e'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#f56565'}
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