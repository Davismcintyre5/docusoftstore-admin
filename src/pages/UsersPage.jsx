import React, { useState, useEffect } from 'react';
import adminApi from '../services/adminApi';
import UserManager from '../components/admin/UserManager';
import LoadingSpinner from '../components/common/LoadingSpinner';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  if (loading) return <LoadingSpinner />;

  return <UserManager users={users} onRefresh={fetchUsers} />;
};

export default UsersPage;