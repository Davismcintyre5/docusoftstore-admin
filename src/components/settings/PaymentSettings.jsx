import React, { useState } from 'react';

const PaymentSettings = ({ settings, onSave, saving }) => {
  const [form, setForm] = useState({ ...settings });

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Payment Settings</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" name="enableSTKPush" checked={form.enableSTKPush} onChange={handleChange} />
            Enable STK Push (M-Pesa)
          </label>
        </div>
        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" name="enableManualPayment" checked={form.enableManualPayment} onChange={handleChange} />
            Enable Manual Payment (Screenshot Upload)
          </label>
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
      </form>
    </div>
  );
};

export default PaymentSettings;