import React, { useState, useEffect } from 'react';
import adminApi from '../services/adminApi';
import DataTable from '../components/common/DataTable';
import ConfirmationModal from '../components/common/ConfirmationModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/categories');
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async () => {
    if (!form.name.trim()) return alert('Category name required');
    setSaving(true);
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
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminApi.delete(`/categories/${deleteTarget._id}`);
      alert('Category deleted');
      setDeleteTarget(null);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name', searchable: true },
    { header: 'Description', accessor: (row) => row.description || '-' },
    { header: 'Slug', accessor: 'slug' },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-2">
          <button onClick={() => { setEditing(row); setForm({ name: row.name, description: row.description || '' }); setShowModal(true); }} className="p-1.5 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"><Edit size={16} /></button>
          <button onClick={() => setDeleteTarget(row)} className="p-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200"><Trash2 size={16} /></button>
        </div>
      )
    }
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', description: '' }); setShowModal(true); }} className="btn-primary inline-flex items-center gap-2"><Plus size={16} /> Add Category</button>
      </div>
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <h3 className="font-semibold">All Categories</h3>
          <button onClick={fetchCategories} className="p-2 rounded-lg hover:bg-gray-100"><RefreshCw size={16} /></button>
        </div>
        <div className="card-body">
          <DataTable columns={columns} data={categories} searchable searchPlaceholder="Search categories..." />
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Category' : 'Add Category'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body space-y-4">
              <div><label className="label">Name *</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={saving} /></div>
              <div><label className="label">Description</label><textarea className="input" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} disabled={saving} /></div>
              <div className="flex justify-end gap-3"><button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button><button onClick={handleSubmit} className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button></div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Category" message={`Delete "${deleteTarget?.name}"? This may affect items in this category.`} />
    </div>
  );
};

export default CategoriesPage;