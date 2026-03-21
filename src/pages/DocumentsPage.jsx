import React, { useState, useEffect } from 'react';
import adminApi from '../services/adminApi';
import DocumentManager from '../components/admin/DocumentManager';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docsRes, catsRes] = await Promise.all([
        adminApi.get('/documents'),
        adminApi.get('/categories')
      ]);
      setDocuments(docsRes.data);
      setCategories(catsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return <DocumentManager documents={documents} categories={categories} onRefresh={fetchData} />;
};

export default DocumentsPage;