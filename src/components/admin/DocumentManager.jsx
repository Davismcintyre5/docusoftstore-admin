import React, { useState } from 'react';
import adminApi from '../../services/adminApi';
import DataTable from '../common/DataTable';
import ConfirmationModal from '../common/ConfirmationModal';
import { formatKES, formatDate } from '../../utils/helpers';

const DocumentManager = ({ documents, categories, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    isFree: false,
    price: '',
    file: null,
    externalUrl: ''
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
    setUploadMethod('file');
    setForm({
      title: '',
      description: '',
      category: categories[0]?._id || '',
      isFree: false,
      price: '',
      file: null,
      externalUrl: ''
    });
    setError('');
    setUploadProgress(0);
    setShowModal(true);
  };

  const openEdit = (doc) => {
    setEditing(doc);
    setUploadMethod(doc.fileUrl && !doc.fileInfo ? 'url' : 'file');
    setForm({
      title: doc.title,
      description: doc.description || '',
      category: doc.category?._id || doc.category,
      isFree: doc.isFree,
      price: doc.price,
      file: null,
      externalUrl: doc.fileUrl || ''
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
    if (!editing) {
      if (uploadMethod === 'file' && !form.file) {
        setError('File is required for new documents');
        return false;
      }
      if (uploadMethod === 'url' && !form.externalUrl.trim()) {
        setError('External URL is required');
        return false;
      }
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

      // If uploading a file, send to GitHub
      if (uploadMethod === 'file' && form.file) {
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
      } else if (uploadMethod === 'url') {
        fileUrl = form.externalUrl.trim();
      } else if (editing && editing.fileUrl) {
        fileUrl = editing.fileUrl; // keep existing URL when editing without changing file
      }

      const itemData = {
        title: form.title.trim(),
        description: form.description,
        category: form.category,
        isFree: form.isFree,
        price: form.isFree ? 0 : parseFloat(form.price),
        fileUrl
      };

      if (editing) {
        await adminApi.put(`/documents/${editing._id}`, itemData);
        alert('Document updated successfully!');
      } else {
        await adminApi.post('/documents', itemData);
        alert('Document uploaded successfully!');
      }

      onRefresh();
      setShowModal(false);
    } catch (error) {
      console.error('Operation failed:', error);
      let errorMessage = '';
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Upload timeout. Please try again.';
      } else if (error.response?.status === 413) {
        errorMessage = 'File too large for server. Use External URL option.';
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
      await adminApi.delete(`/documents/${deleteTarget._id}`);
      alert('Document deleted successfully!');
      onRefresh();
      setDeleteTarget(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / 1024 / 1024;
    return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(2)} MB`;
  };

  const columns = [
    { header: 'Title', accessor: 'title' },
    { header: 'Category', accessor: (row) => row.category?.name || 'N/A' },
    { header: 'Type', accessor: (row) => row.fileUrl ? '🔗 External' : '📄 Uploaded' },
    { header: 'Size', accessor: (row) => formatFileSize(row.fileInfo?.size) },
    {
      header: 'Price',
      accessor: (row) => row.isFree ? <span style={{ color: '#48bb78' }}>FREE</span> : formatKES(row.price)
    },
    { header: 'Downloads', accessor: (row) => row.downloadCount || 0 },
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

  const totalDocs = documents.length;
  const freeCount = documents.filter(d => d.isFree).length;
  const externalCount = documents.filter(d => d.fileUrl && !d.fileInfo).length;
  const totalDownloads = documents.reduce((sum, d) => sum + (d.downloadCount || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: 'white', padding: '24px', borderRadius: '12px' }}>
        <div>
          <h1>Document Management</h1>
          <p>{totalDocs} items • {freeCount} free • {externalCount} external • {totalDownloads} downloads</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Document</button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '20px' }}>
        <DataTable columns={columns} data={documents} />
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Document' : 'Add Document'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {error && <div style={{ background: '#fed7d7', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#48bb78' }} />
                  </div>
                  <p style={{ fontSize: '12px', marginTop: '4px' }}>Uploading: {uploadProgress}%</p>
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
                <select className="form-control" name="category" value={form.category} onChange={handleInputChange} disabled={loading}>
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Free?</label>
                <input type="checkbox" name="isFree" checked={form.isFree} onChange={handleInputChange} disabled={loading} />
              </div>
              {!form.isFree && (
                <div className="form-group">
                  <label>Price (KES) *</label>
                  <input type="number" className="form-control" name="price" value={form.price} onChange={handleInputChange} min="1" step="1" disabled={loading} />
                </div>
              )}

              {!editing && (
                <div className="form-group">
                  <label>Upload Method:</label>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <label><input type="radio" value="file" checked={uploadMethod === 'file'} onChange={() => setUploadMethod('file')} /> Upload File</label>
                    <label><input type="radio" value="url" checked={uploadMethod === 'url'} onChange={() => setUploadMethod('url')} /> External URL</label>
                  </div>
                </div>
              )}

              {uploadMethod === 'file' && (
                <div className="form-group">
                  <label>File {!editing && '*'}</label>
                  <input type="file" className="form-control" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.zip,.rar" disabled={loading} />
                  <small>Max 500MB. Supported: PDF, DOC, DOCX, TXT, RTF, ODT, ZIP, RAR</small>
                </div>
              )}

              {uploadMethod === 'url' && (
                <div className="form-group">
                  <label>External URL {!editing && '*'}</label>
                  <input type="url" className="form-control" name="externalUrl" value={form.externalUrl} onChange={handleInputChange} placeholder="https://github.com/.../download/file.zip" disabled={loading} />
                  <small>Paste a direct download link (e.g., GitHub Releases, Google Drive)</small>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button className="btn" onClick={() => setShowModal(false)} disabled={loading}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                  {loading ? (uploadProgress > 0 && uploadProgress < 100 ? `Uploading ${uploadProgress}%` : 'Saving...') : (editing ? 'Update' : 'Add')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Document" message={`Delete "${deleteTarget?.title}"?`} />
    </div>
  );
};

export default DocumentManager;