import React, { useState } from 'react';
import adminApi from '../../services/adminApi';
import ImageViewer from '../common/ImageViewer';
import { formatKES, formatDate } from '../../utils/formatters';
import { CheckCircle, XCircle, Image as ImageIcon, MessageCircle, RefreshCw } from 'lucide-react';

const PaymentVerificationList = ({ payments, onRefresh }) => {
  const [processingId, setProcessingId] = useState(null);
  const [viewImage, setViewImage] = useState(null);

  const handleApprove = async (id) => {
    if (!window.confirm('✅ Approve this payment? Order will be created automatically.')) return;
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

  // Build image URL - works for production
  const getImageUrl = (screenshotUrl) => {
    if (!screenshotUrl) return null;
    
    // Already a full URL
    if (screenshotUrl.startsWith('http://') || screenshotUrl.startsWith('https://')) {
      return screenshotUrl;
    }
    
    // Use production API URL
    const baseUrl = import.meta.env.VITE_API_URL || 'https://docusoftserver.pxxl.click';
    
    // Ensure proper formatting
    let cleanUrl = screenshotUrl;
    if (!cleanUrl.startsWith('/')) {
      cleanUrl = '/' + cleanUrl;
    }
    
    return `${baseUrl}${cleanUrl}`;
  };

  if (payments.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No pending payments</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">All manual payments have been processed.</p>
        <button 
          onClick={onRefresh} 
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Item</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Evidence</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {payments.map((payment) => {
              const hasScreenshot = !!payment.screenshotUrl;
              const hasMessage = payment.metadata?.paymentConfirmation;
              const imageUrl = getImageUrl(payment.screenshotUrl);

              return (
                <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white">{payment.user?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{payment.user?.email}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{payment.user?.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white">{payment.itemTitle}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{payment.itemType}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                    {formatKES(payment.amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(payment.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {hasScreenshot && (
                      <button
                        onClick={() => setViewImage(imageUrl)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 transition"
                      >
                        <ImageIcon size={12} /> View Screenshot
                      </button>
                    )}
                    {hasMessage && (
                      <div className="max-w-xs">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                          <MessageCircle size={12} /> Confirmation:
                        </div>
                        <div className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded break-words">
                          {payment.metadata.paymentConfirmation}
                        </div>
                      </div>
                    )}
                    {!hasScreenshot && !hasMessage && (
                      <span className="text-xs text-gray-400">No evidence</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(payment._id)}
                        disabled={processingId === payment._id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition disabled:opacity-50"
                      >
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(payment._id)}
                        disabled={processingId === payment._id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition disabled:opacity-50"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {viewImage && (
        <ImageViewer 
          url={viewImage} 
          onClose={() => setViewImage(null)} 
        />
      )}
    </div>
  );
};

export default PaymentVerificationList;