import React, { useState } from 'react';
import adminApi from '../../services/adminApi';
import DataTable from '../common/DataTable';
import ConfirmationModal from '../common/ConfirmationModal';
import { getInitials, stringToColor } from '../../utils/helpers';
import { formatDate } from '../../utils/formatters';
import { Shield, User, Ban, CheckCircle, RefreshCw } from 'lucide-react';

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
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
            style={{ backgroundColor: stringToColor(row.email || row.name) }}
          >
            {getInitials(row.name)}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{row.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{row.email}</div>
          </div>
        </div>
      ),
      searchable: true,
    },
    {
      header: 'Phone',
      accessor: (row) => row.phone || 'N/A',
    },
    {
      header: 'Role',
      accessor: (row) => (
        <button
          onClick={() => openRoleModal(row)}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition ${
            row.role === 'admin'
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
          }`}
        >
          {row.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
          {row.role === 'admin' ? 'Admin' : 'User'}
        </button>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
          row.isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {row.isActive ? <CheckCircle size={12} /> : <Ban size={12} />}
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Joined',
      accessor: (row) => formatDate(row.createdAt),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <button
          onClick={() => handleToggleStatus(row._id, row.isActive)}
          disabled={processingId === row._id}
          className={`px-3 py-1 rounded-lg text-sm transition ${
            row.isActive
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          } disabled:opacity-50`}
        >
          {processingId === row._id ? '...' : (row.isActive ? 'Deactivate' : 'Activate')}
        </button>
      ),
    },
  ];

  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const activeCount = users.filter(u => u.isActive).length;

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalUsers}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Users</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{adminCount}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Admins</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeCount}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Active Users</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <h3 className="font-semibold text-gray-900 dark:text-white">All Users</h3>
          <button onClick={onRefresh} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <RefreshCw size={16} />
          </button>
        </div>
        <div className="card-body">
          <DataTable columns={columns} data={users} searchable searchPlaceholder="Search by name or email..." />
        </div>
      </div>

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold">Change User Role</h3>
              <button className="modal-close" onClick={() => setShowRoleModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Change role for <strong>{selectedUser.name}</strong>
              </p>
              <div className="space-y-2 mb-6">
                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={newRole === 'user'}
                    onChange={(e) => setNewRole(e.target.value)}
                  />
                  <User size={16} /> <span>User (regular customer)</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={newRole === 'admin'}
                    onChange={(e) => setNewRole(e.target.value)}
                  />
                  <Shield size={16} /> <span>Admin (full access)</span>
                </label>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowRoleModal(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleRoleChange} className="btn-primary">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;