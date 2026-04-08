import React, { useState, useEffect } from 'react';
import adminApi from '../services/adminApi';
import SoftwareManager from '../components/admin/SoftwareManager';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SoftwarePage = () => {
  const [software, setSoftware] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [softRes, catsRes] = await Promise.all([
        adminApi.get('/software'),
        adminApi.get('/categories')
      ]);
      setSoftware(softRes.data);
      setCategories(catsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <LoadingSpinner />;

  return <SoftwareManager software={software} categories={categories} onRefresh={fetchData} />;
};

export default SoftwarePage;