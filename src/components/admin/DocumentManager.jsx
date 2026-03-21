import React, { useState } from 'react';
import adminApi from '../../services/adminApi';
import DataTable from '../common/DataTable';
import ConfirmationModal from '../common/ConfirmationModal';
import { formatKES, formatDate } from '../../utils/formatters';

const DocumentManager = ({ documents, categories, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    isFree: false,
    price: '',
    file: null
  });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: checked, price: checked ? '0' : form.price });
    } else {
      setForm({ ...form, [name]: value });
    }
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        setError('File too large. Max size 100MB');
        e.target.value = null;
        return;
      }
      setForm({ ...form, file });
    }
    setError('');
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: '',
      description: '',
      category: categories[0]?._id || '',
      isFree: false,
      price: '',
      file: null
    });
    setError('');
    setUploadProgress(0);
    setShowModal(true);
  };

  const openEdit = (doc) => {
    setEditing(doc);
    setForm({
      title: doc.title,
      description: doc.description || '',
      category: doc.category?._id || doc.category,
      isFree: doc.isFree,
      price: doc.price,
      file: null
    });
    setError('');
    setUploadProgress(0);
    setShowModal(true);
  };

  const validateForm = () => {
    if (!form.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!form.category) {
      setError('Category is required');
      return false;
    }
    if (!form.isFree && (!form.price || parseFloat(form.price) <= 0)) {
      setError('Price must be greater than 0 for paid items');
      return false;
    }
    if (!editing && !form.file) {
      setError('File is required for new documents');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setError('');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('title', form.title.trim());
    formData.append('description', form.description || '');
    formData.append('category', form.category);
    formData.append('isFree', form.isFree);
    formData.append('price', form.isFree ? 0 : parseFloat(form.price));
    if (form.file) formData.append('file', form.file);

    try {
      if (editing) {
        await adminApi.put(`/documents/${editing._id}`, formData, {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percent);
            }
          }
        });
        alert('Document updated!');
      } else {
        await adminApi.post('/documents', formData, {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percent);
            }
          }
        });
        alert('Document uploaded!');
      }
      onRefresh();
      setShowModal(false);
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    try {
      await adminApi.delete(`/documents/${deleteTarget._id}`);
      alert('Document deleted');
      onRefresh();
      setDeleteTarget(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { header: 'Title', accessor: 'title' },
    { header: 'Category', accessor: (row) => row.category?.name || 'N/A' },
    {
      header: 'Price',
      accessor: (row) => row.isFree ? 'FREE' : formatKES(row.price)
    },
    { header: 'Downloads', accessor: 'downloadCount' },
    { header: 'Created', accessor: (row) => formatDate(row.createdAt) },
    {
      header: 'Actions',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-primary" style={{ padding: '4px 12px' }} onClick={() => openEdit(row)}>Edit</button>
          <button className="btn btn-danger" style={{ padding: '4px 12px' }} onClick={() => setDeleteTarget(row)}>Delete</button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px' }}>Documents</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Upload Document</button>
      </div>

      <DataTable columns={columns} data={documents} />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Document' : 'Upload New Document'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {error && <div style={{ backgroundColor: '#fed7d7', padding: '12px', borderRadius: '8px', marginBottom: '20px', color: '#c53030' }}>{error}</div>}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: '#48bb78', transition: 'width 0.3s' }} />
                  </div>
                  <p style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>Uploading: {uploadProgress}%</p>
                </div>
              )}
              <div className="form-group">
                <label>Title *</label>
                <input type="text" className="form-control" name="title" value={form.title} onChange={handleInputChange} disabled={loading} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows="3" name="description" value={form.description} onChange={handleInputChange} disabled={loading} />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select className="form-control" name="category" value={form.category} onChange={handleInputChange} disabled={loading || categories.length === 0}>
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" name="isFree" checked={form.isFree} onChange={handleInputChange} disabled={loading} />
                  Free Document
                </label>
              </div>
              {!form.isFree && (
                <div className="form-group">
                  <label>Price (KES) *</label>
                  <input type="number" className="form-control" name="price" value={form.price} onChange={handleInputChange} placeholder="e.g., 500" min="1" step="1" disabled={loading} />
                </div>
              )}
              <div className="form-group">
                <label>File {!editing && '*'}</label>
                <input type="file" className="form-control" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt,.rtf,.odt" disabled={loading} />
                {editing && !form.file && <small style={{ color: '#718096' }}>Leave empty to keep current file</small>}
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="btn" onClick={() => setShowModal(false)} disabled={loading}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || categories.length === 0}>
                  {loading ? (uploadProgress > 0 && uploadProgress < 100 ? `Uploading ${uploadProgress}%` : 'Saving...') : (editing ? 'Update' : 'Upload')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Document"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
      />
    </div>
  );
};

export default DocumentManager;