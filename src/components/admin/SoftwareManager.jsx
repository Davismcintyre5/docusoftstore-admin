import React, { useState } from 'react';
import adminApi from '../../services/adminApi';
import DataTable from '../common/DataTable';
import ConfirmationModal from '../common/ConfirmationModal';
import { formatKES, formatDate } from '../../utils/helpers';

const SoftwareManager = ({ software, categories, onRefresh }) => {
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
      // Check file size (500MB max for software)
      if (file.size > 500 * 1024 * 1024) {
        setError('File too large. Max size 500MB');
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

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description || '',
      category: item.category?._id || item.category,
      isFree: item.isFree,
      price: item.price,
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
      setError('File is required for new software');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      let fileUrl = null;

      // If a file is selected, upload it to GitHub
      if (form.file) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', form.file);

        const uploadResponse = await adminApi.post('/upload/github', uploadFormData, {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percent);
            }
          },
          timeout: 600000,
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        fileUrl = uploadResponse.data.url;
      }

      // Prepare the item data
      const itemData = {
        title: form.title.trim(),
        description: form.description,
        category: form.category,
        isFree: form.isFree,
        price: form.isFree ? 0 : parseFloat(form.price),
        fileUrl, // store GitHub URL
      };

      if (editing) {
        await adminApi.put(`/software/${editing._id}`, itemData);
        alert('Software updated successfully!');
      } else {
        await adminApi.post('/software', itemData);
        alert('Software uploaded successfully!');
      }

      onRefresh();
      setShowModal(false);
    } catch (error) {
      console.error('Operation failed:', error);
      
      let errorMessage = '';
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Upload timeout. Please try again.';
      } else if (error.response?.status === 413) {
        errorMessage = 'File too large for GitHub (max 2GB).';
      } else if (error.response) {
        errorMessage = error.response.data?.message || `Error ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Cannot connect to server.';
      } else {
        errorMessage = error.message || 'Upload failed';
      }
      
      setError(errorMessage);
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    try {
      await adminApi.delete(`/software/${deleteTarget._id}`);
      alert('Software deleted successfully!');
      onRefresh();
      setDeleteTarget(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed');
    }
  };

  // Helper to format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / 1024 / 1024;
    return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(2)} MB`;
  };

  const columns = [
    { header: 'Title', accessor: 'title' },
    { header: 'Category', accessor: (row) => row.category?.name || 'N/A' },
    {
      header: 'Price',
      accessor: (row) => row.isFree ? 
        <span style={{ color: '#48bb78', fontWeight: '600' }}>FREE</span> : 
        <span style={{ fontWeight: '600' }}>{formatKES(row.price)}</span>
    },
    { header: 'Downloads', accessor: (row) => row.downloadCount || 0 },
    { header: 'Created', accessor: (row) => formatDate(row.createdAt) },
    {
      header: 'Actions',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-primary" 
            style={{ padding: '4px 12px', fontSize: '12px', minHeight: '32px' }} 
            onClick={() => openEdit(row)}
          >
            ✏️ Edit
          </button>
          <button 
            className="btn btn-danger" 
            style={{ padding: '4px 12px', fontSize: '12px', minHeight: '32px' }} 
            onClick={() => setDeleteTarget(row)}
          >
            🗑️ Delete
          </button>
        </div>
      )
    }
  ];

  // Stats summary
  const totalSoftware = software.length;
  const freeCount = software.filter(s => s.isFree).length;
  const paidCount = software.filter(s => !s.isFree).length;
  const totalDownloads = software.reduce((sum, s) => sum + (s.downloadCount || 0), 0);

  return (
    <div>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        background: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: 0, color: '#2d3748' }}>Software Management</h1>
          <p style={{ fontSize: '14px', color: '#718096', marginTop: '4px' }}>
            {totalSoftware} items • {freeCount} free • {paidCount} paid • {totalDownloads} total downloads
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} style={{ minHeight: '44px' }}>
          + Upload Software
        </button>
      </div>

      {/* Stats Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <span style={{ fontSize: '32px' }}>💻</span>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#2d3748' }}>{totalSoftware}</div>
            <div style={{ fontSize: '13px', color: '#718096' }}>Total Software</div>
          </div>
        </div>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <span style={{ fontSize: '32px' }}>🎁</span>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#2d3748' }}>{freeCount}</div>
            <div style={{ fontSize: '13px', color: '#718096' }}>Free Software</div>
          </div>
        </div>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <span style={{ fontSize: '32px' }}>⬇️</span>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#2d3748' }}>{totalDownloads}</div>
            <div style={{ fontSize: '13px', color: '#718096' }}>Total Downloads</div>
          </div>
        </div>
      </div>

      {/* Software Table */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <DataTable columns={columns} data={software} />
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
            <div className="modal-header">
              <h3>{editing ? '✏️ Edit Software' : '📦 Upload New Software'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {error && (
                <div style={{ 
                  backgroundColor: '#fed7d7', 
                  color: '#c53030', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  marginBottom: '20px',
                  fontSize: '14px'
                }}>
                  ❌ {error}
                </div>
              )}
              
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${uploadProgress}%`, 
                      height: '100%', 
                      backgroundColor: '#48bb78', 
                      transition: 'width 0.3s' 
                    }} />
                  </div>
                  <p style={{ fontSize: '12px', color: '#718096', marginTop: '8px', textAlign: 'center' }}>
                    Uploading: {uploadProgress}%
                  </p>
                </div>
              )}

              <div className="form-group">
                <label>Title <span style={{ color: '#f56565' }}>*</span></label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Adobe Photoshop"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  rows="4"
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Describe your software..."
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Category <span style={{ color: '#f56565' }}>*</span></label>
                <select
                  className="form-control"
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  disabled={loading || categories.length === 0}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <small style={{ color: '#ed8936', display: 'block', marginTop: '4px' }}>
                    ⚠️ No categories found. Please create a category first.
                  </small>
                )}
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="isFree"
                    checked={form.isFree}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <span>This software is <strong>FREE</strong></span>
                </label>
              </div>

              {!form.isFree && (
                <div className="form-group">
                  <label>Price (KES) <span style={{ color: '#f56565' }}>*</span></label>
                  <input
                    type="number"
                    className="form-control"
                    name="price"
                    value={form.price}
                    onChange={handleInputChange}
                    placeholder="e.g., 5000"
                    min="1"
                    step="1"
                    disabled={loading}
                    required
                  />
                  <small style={{ color: '#718096' }}>Price in Kenyan Shillings (KES)</small>
                </div>
              )}

              <div className="form-group">
                <label>
                  Software File {!editing && <span style={{ color: '#f56565' }}>*</span>}
                  {editing && <span style={{ color: '#718096', fontSize: '12px' }}> (Leave empty to keep current)</span>}
                </label>
                <input
                  type="file"
                  className="form-control"
                  onChange={handleFileChange}
                  accept=".zip,.rar,.exe,.msi,.dmg,.pkg,.appimage,.deb"
                  disabled={loading}
                />
                {!editing && (
                  <small style={{ color: '#718096', display: 'block', marginTop: '4px' }}>
                    Supported formats: ZIP, RAR, EXE, MSI, DMG, PKG, AppImage, DEB (Max: 500MB)
                  </small>
                )}
                {editing && !form.file && editing.fileInfo && (
                  <small style={{ color: '#718096', display: 'block', marginTop: '4px' }}>
                    Current file: {editing.fileInfo.originalName} ({(editing.fileInfo.size / 1024 / 1024).toFixed(2)} MB)
                  </small>
                )}
                {editing && form.file && (
                  <small style={{ color: '#48bb78', display: 'block', marginTop: '4px' }}>
                    New file selected: {form.file.name} ({(form.file.size / 1024 / 1024).toFixed(2)} MB)
                  </small>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                  className="btn"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
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
                  onClick={handleSubmit}
                  disabled={loading || categories.length === 0}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    opacity: (loading || categories.length === 0) ? 0.5 : 1
                  }}
                >
                  {loading ? (uploadProgress > 0 && uploadProgress < 100 ? `Uploading ${uploadProgress}%` : 'Saving...') : (editing ? 'Update Software' : 'Upload Software')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Software"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default SoftwareManager;