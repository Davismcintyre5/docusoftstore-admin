import React, { useState } from 'react';
import adminApi from '../../services/adminApi';
import DataTable from '../common/DataTable';
import { getInitials, stringToColor } from '../../utils/helpers';
import { formatDate } from '../../utils/formatters';
import { Shield, User, Ban, CheckCircle, RefreshCw, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const UserManager = ({ users, onRefresh }) => {
  const [processingId, setProcessingId] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;
    setProcessingId(selectedUser._id);
    try {
      await adminApi.put(`/admin/users/${selectedUser._id}/role`, { role: newRole });
      toast.success('User role updated successfully!');
      onRefresh();
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setProcessingId(selectedUser._id);
    try {
      await adminApi.delete(`/admin/users/${selectedUser._id}`);
      toast.success('User deleted successfully!');
      onRefresh();
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
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
      toast.success(`User ${action}d successfully!`);
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setProcessingId(null);
    }
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
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
        <div className="flex gap-2">
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
          <button
            onClick={() => openDeleteModal(row)}
            disabled={processingId === row._id}
            className="px-3 py-1 rounded-lg text-sm bg-gray-600 hover:bg-gray-700 text-white transition disabled:opacity-50"
          >
            <Trash2 size={14} className="inline mr-1" /> Delete
          </button>
        </div>
      ),
    },
  ];

  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const activeCount = users.filter(u => u.isActive).length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalUsers}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Users</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{adminCount}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Admins</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeCount}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Active Users</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900 dark:text-white">All Users</h3>
          <button onClick={onRefresh} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <RefreshCw size={16} />
          </button>
        </div>
        <div className="p-6">
          <DataTable columns={columns} data={users} searchable searchPlaceholder="Search by name or email..." />
        </div>
      </div>

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowRoleModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change User Role</h3>
              <button onClick={() => setShowRoleModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Change role for <strong className="text-gray-900 dark:text-white">{selectedUser.name}</strong>
              </p>
              <div className="space-y-2 mb-6">
                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={newRole === 'user'}
                    onChange={(e) => setNewRole(e.target.value)}
                  />
                  <User size={16} /> <span>User (regular customer)</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition">
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
                <button onClick={() => setShowRoleModal(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 transition">
                  Cancel
                </button>
                <button onClick={handleRoleChange} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-red-600">Delete User</h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Trash2 size={24} className="text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedUser.name}</p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Are you sure you want to delete this user?
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mb-6">
                ⚠️ This action cannot be undone. All user data including orders and transactions will be permanently removed.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 transition">
                  Cancel
                </button>
                <button onClick={handleDeleteUser} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                  Delete User
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