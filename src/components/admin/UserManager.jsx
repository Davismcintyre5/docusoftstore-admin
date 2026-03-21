import React, { useState } from 'react';
import adminApi from '../../services/adminApi';
import DataTable from '../common/DataTable';
import ConfirmationModal from '../common/ConfirmationModal';
import { formatDate, getInitials, stringToColor } from '../../utils/helpers';

const UserManager = ({ users, onRefresh }) => {
  const [processingId, setProcessingId] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;
    setProcessingId(selectedUser._id);
    try {
      await adminApi.put(`/admin/users/${selectedUser._id}/role`, { role: newRole });
      alert('User role updated successfully!');
      onRefresh();
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update role');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    setProcessingId(userId);
    try {
      await adminApi.put(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      alert(`User ${action}d successfully!`);
      onRefresh();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    } finally {
      setProcessingId(null);
    }
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const columns = [
    {
      header: 'User',
      accessor: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: stringToColor(row.email || row.name),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '600',
            fontSize: '16px'
          }}>
            {getInitials(row.name)}
          </div>
          <div>
            <div style={{ fontWeight: '600', color: '#2d3748' }}>{row.name}</div>
            <div style={{ fontSize: '12px', color: '#718096' }}>{row.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Phone',
      accessor: (row) => row.phone || 'N/A'
    },
    {
      header: 'Role',
      accessor: (row) => (
        <button
          className="btn"
          style={{
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            backgroundColor: row.role === 'admin' ? '#fef3c7' : '#e6f7ff',
            color: row.role === 'admin' ? '#b45309' : '#1e429f',
            border: 'none',
            cursor: 'pointer',
            minHeight: '32px'
          }}
          onClick={() => openRoleModal(row)}
          disabled={processingId === row._id}
        >
          {row.role === 'admin' ? '👑 Admin' : '👤 User'}
        </button>
      )
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span style={{
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          backgroundColor: row.isActive ? '#c6f6d5' : '#fed7d7',
          color: row.isActive ? '#22543d' : '#c53030'
        }}>
          {row.isActive ? '✅ Active' : '❌ Inactive'}
        </span>
      )
    },
    {
      header: 'Joined',
      accessor: (row) => formatDate(row.createdAt)
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <button
          className="btn"
          style={{
            padding: '6px 12px',
            backgroundColor: row.isActive ? '#f56565' : '#48bb78',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            minWidth: '80px',
            minHeight: '32px'
          }}
          onClick={() => handleToggleStatus(row._id, row.isActive)}
          disabled={processingId === row._id}
        >
          {processingId === row._id ? '...' : (row.isActive ? 'Deactivate' : 'Activate')}
        </button>
      )
    }
  ];

  // Stats summary
  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const activeCount = users.filter(u => u.isActive).length;

  return (
    <div>
      {/* Stats Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#2d3748' }}>{totalUsers}</div>
          <div style={{ fontSize: '14px', color: '#718096' }}>Total Users</div>
        </div>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#2d3748' }}>{adminCount}</div>
          <div style={{ fontSize: '14px', color: '#718096' }}>Admins</div>
        </div>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#2d3748' }}>{activeCount}</div>
          <div style={{ fontSize: '14px', color: '#718096' }}>Active Users</div>
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#2d3748' }}>All Users</h3>
        <DataTable columns={columns} data={users} />
      </div>

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Change User Role</h3>
              <button className="modal-close" onClick={() => setShowRoleModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '16px', color: '#2d3748', marginBottom: '20px' }}>
                Change role for <strong>{selectedUser.name}</strong>
              </p>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  backgroundColor: newRole === 'user' ? '#f7fafc' : 'white'
                }}>
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={newRole === 'user'}
                    onChange={(e) => setNewRole(e.target.value)}
                  />
                  <span style={{ fontSize: '14px', color: '#4a5568' }}>👤 User (regular customer)</span>
                </label>
                
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  backgroundColor: newRole === 'admin' ? '#f7fafc' : 'white'
                }}>
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={newRole === 'admin'}
                    onChange={(e) => setNewRole(e.target.value)}
                  />
                  <span style={{ fontSize: '14px', color: '#4a5568' }}>👑 Admin (full access)</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  className="btn"
                  onClick={() => setShowRoleModal(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#e2e8f0',
                    color: '#4a5568',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleRoleChange}
                  disabled={processingId === selectedUser._id}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    opacity: processingId === selectedUser._id ? 0.5 : 1
                  }}
                >
                  {processingId === selectedUser._id ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;