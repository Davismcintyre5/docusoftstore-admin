import React, { useState, useEffect } from 'react';
import adminApi from '../services/adminApi';
import DataTable from '../components/common/DataTable';
import ConfirmationModal from '../components/common/ConfirmationModal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/categories');
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert('Category name is required');
      return;
    }
    try {
      if (editing) {
        await adminApi.put(`/categories/${editing._id}`, form);
        alert('Category updated');
      } else {
        await adminApi.post('/categories', form);
        alert('Category created');
      }
      setShowModal(false);
      setEditing(null);
      setForm({ name: '', description: '' });
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    try {
      await adminApi.delete(`/categories/${deleteTarget._id}`);
      alert('Category deleted');
      setDeleteTarget(null);
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Description', accessor: 'description' },
    { header: 'Slug', accessor: 'slug' },
    {
      header: 'Actions',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-primary" style={{ padding: '4px 12px' }} onClick={() => { setEditing(row); setForm({ name: row.name, description: row.description || '' }); setShowModal(true); }}>Edit</button>
          <button className="btn btn-danger" style={{ padding: '4px 12px' }} onClick={() => setDeleteTarget(row)}>Delete</button>
        </div>
      )
    }
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px' }}>Categories</h1>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ name: '', description: '' }); setShowModal(true); }}>+ Add Category</button>
      </div>

      <DataTable columns={columns} data={categories} />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Category' : 'Add Category'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSubmit}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
      />
    </div>
  );
};

export default CategoriesPage;