import React, { useState } from 'react';

const BusinessSettings = ({ settings, onSave, saving }) => {
  const [form, setForm] = useState({ ...settings });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Business Information</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Business Name</label>
          <input type="text" className="form-control" name="businessName" value={form.businessName || ''} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input type="tel" className="form-control" name="businessPhoneNumber" value={form.businessPhoneNumber || ''} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>WhatsApp Number</label>
          <input type="tel" className="form-control" name="whatsappNumber" value={form.whatsappNumber || ''} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Payment Instructions</label>
          <textarea className="form-control" rows="3" name="paymentInstructions" value={form.paymentInstructions || ''} onChange={handleChange} />
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
      </form>
    </div>
  );
};

export default BusinessSettings;