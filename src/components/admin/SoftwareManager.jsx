import React, { useState } from 'react';
import adminApi from '../../services/adminApi';
import DataTable from '../common/DataTable';
import ConfirmationModal from '../common/ConfirmationModal';
import { formatKES, formatDate, formatFileSize } from '../../utils/formatters';
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react';

const SoftwareManager = ({ software, categories, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploadMethod, setUploadMethod] = useState('file');
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
    if (file && file.size > 500 * 1024 * 1024) {
      setError('File too large. Max size 500MB');
      e.target.value = null;
      return;
    }
    setForm({ ...form, file });
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

  const openEdit = (item) => {
    setEditing(item);
    setUploadMethod(item.fileUrl && !item.fileInfo ? 'url' : 'file');
    setForm({
      title: item.title,
      description: item.description || '',
      category: item.category?._id || item.category,
      isFree: item.isFree,
      price: item.price,
      file: null,
      externalUrl: item.fileUrl || ''
    });
    setError('');
    setUploadProgress(0);
    setShowModal(true);
  };

  const validateForm = () => {
    if (!form.title.trim()) { setError('Title is required'); return false; }
    if (!form.category) { setError('Category is required'); return false; }
    if (!form.isFree && (!form.price || parseFloat(form.price) <= 0)) {
      setError('Price must be >0 for paid items');
      return false;
    }
    if (!editing) {
      if (uploadMethod === 'file' && !form.file) { setError('File is required'); return false; }
      if (uploadMethod === 'url' && !form.externalUrl.trim()) { setError('External URL is required'); return false; }
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

    if (uploadMethod === 'file' && form.file) {
      formData.append('file', form.file);
    } else if (uploadMethod === 'url') {
      formData.append('fileUrl', form.externalUrl.trim());
    } else if (editing && editing.fileUrl) {
      formData.append('fileUrl', editing.fileUrl);
    }

    try {
      if (editing) {
        await adminApi.put(`/software/${editing._id}`, formData, {
          onUploadProgress: (e) => e.total && setUploadProgress(Math.round((e.loaded * 100) / e.total))
        });
        alert('Software updated!');
      } else {
        await adminApi.post('/software', formData, {
          onUploadProgress: (e) => e.total && setUploadProgress(Math.round((e.loaded * 100) / e.total))
        });
        alert('Software uploaded!');
      }
      onRefresh();
      setShowModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      alert(`❌ ${msg}`);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    try {
      await adminApi.delete(`/software/${deleteTarget._id}`);
      alert('Software deleted');
      onRefresh();
      setDeleteTarget(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { header: 'Title', accessor: 'title', searchable: true },
    { header: 'Category', accessor: (row) => row.category?.name || 'N/A' },
    { header: 'Type', accessor: (row) => row.fileUrl && !row.fileInfo ? '🔗 External' : '📦 Uploaded' },
    { header: 'Size', accessor: (row) => formatFileSize(row.fileInfo?.size) },
    { header: 'Price', accessor: (row) => row.isFree ? <span className="text-green-600 font-semibold">FREE</span> : formatKES(row.price) },
    { header: 'Downloads', accessor: (row) => row.downloadCount || 0 },
    { header: 'Created', accessor: (row) => formatDate(row.createdAt) },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="p-1.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 transition"><Edit size={16} /></button>
          <button onClick={() => setDeleteTarget(row)} className="p-1.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 transition"><Trash2 size={16} /></button>
        </div>
      )
    }
  ];

  const total = software.length;
  const freeCount = software.filter(s => s.isFree).length;
  const externalCount = software.filter(s => s.fileUrl && !s.fileInfo).length;
  const totalDownloads = software.reduce((s, i) => s + (i.downloadCount || 0), 0);

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Software Management</h1>
          <p className="text-sm text-gray-500">{total} items • {freeCount} free • {externalCount} external • {totalDownloads} downloads</p>
        </div>
        <button onClick={openCreate} className="btn-primary inline-flex items-center gap-2"><Plus size={16} /> Add Software</button>
      </div>

      <div className="card">
        <div className="card-header flex justify-between items-center">
          <h3 className="font-semibold">All Software</h3>
          <button onClick={onRefresh} className="p-2 rounded-lg hover:bg-gray-100"><RefreshCw size={16} /></button>
        </div>
        <div className="card-body">
          <DataTable columns={columns} data={software} searchable searchPlaceholder="Search software..." />
        </div>
      </div>

      {/* Modal Form - similar to DocumentManager but with software-specific accept types */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{editing ? 'Edit Software' : 'Add Software'}</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <div className="modal-body space-y-4">
              {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
              {uploadProgress > 0 && uploadProgress < 100 && (<div><div className="h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-green-600 transition-all" style={{ width: `${uploadProgress}%` }} /></div><p className="text-xs text-gray-500 mt-1">Uploading {uploadProgress}%</p></div>)}
              <div><label className="label">Title *</label><input name="title" className="input" value={form.title} onChange={handleInputChange} disabled={loading} /></div>
              <div><label className="label">Description</label><textarea name="description" rows="3" className="input" value={form.description} onChange={handleInputChange} disabled={loading} /></div>
              <div><label className="label">Category *</label><select name="category" className="input" value={form.category} onChange={handleInputChange} disabled={loading}><option value="">Select Category</option>{categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
              <div className="flex items-center gap-2"><input type="checkbox" name="isFree" checked={form.isFree} onChange={handleInputChange} disabled={loading} /><label>Free?</label></div>
              {!form.isFree && <div><label className="label">Price (KES)</label><input type="number" name="price" className="input" value={form.price} onChange={handleInputChange} min="1" /></div>}
              
              {!editing && (<div><label className="label">Upload Method</label><div className="flex gap-4"><label className="flex items-center gap-2"><input type="radio" value="file" checked={uploadMethod === 'file'} onChange={() => setUploadMethod('file')} /> Upload File</label><label className="flex items-center gap-2"><input type="radio" value="url" checked={uploadMethod === 'url'} onChange={() => setUploadMethod('url')} /> External URL</label></div></div>)}
              {uploadMethod === 'file' && <div><label className="label">File {!editing && '*'}</label><input type="file" className="input" onChange={handleFileChange} accept=".zip,.rar,.exe,.msi,.dmg,.pkg,.appimage,.deb" disabled={loading} /><small className="text-xs text-gray-500">Max 500MB</small></div>}
              {uploadMethod === 'url' && <div><label className="label">External URL {!editing && '*'}</label><input type="url" name="externalUrl" className="input" value={form.externalUrl} onChange={handleInputChange} placeholder="https://..." disabled={loading} /></div>}
              
              <div className="flex justify-end gap-3 pt-2"><button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button><button onClick={handleSubmit} className="btn-primary" disabled={loading}>{loading ? 'Saving...' : (editing ? 'Update' : 'Add')}</button></div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Software" message={`Delete "${deleteTarget?.title}"? This action cannot be undone.`} />
    </div>
  );
};

export default SoftwareManager;