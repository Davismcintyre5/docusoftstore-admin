import React, { useState } from 'react';
import { formatDate } from '../../utils/helpers';

const TermsSettings = ({ settings, onSave, saving }) => {
  const [form, setForm] = useState({
    termsAndConditions: settings?.termsAndConditions?.content || 'Default Terms and Conditions. Please update these in admin settings.',
    privacyPolicy: settings?.privacyPolicy?.content || 'Default Privacy Policy. Please update these in admin settings.',
    requireTermsAcceptance: settings?.requireTermsAcceptance !== undefined ? settings.requireTermsAcceptance : true
  });

  const handleTermsChange = (e) => {
    setForm({ ...form, termsAndConditions: e.target.value });
  };

  const handlePrivacyChange = (e) => {
    setForm({ ...form, privacyPolicy: e.target.value });
  };

  const handleRequireTermsChange = (e) => {
    setForm({ ...form, requireTermsAcceptance: e.target.checked });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      termsAndConditions: form.termsAndConditions,
      privacyPolicy: form.privacyPolicy,
      requireTermsAcceptance: form.requireTermsAcceptance
    });
  };

  const termsLastUpdated = settings?.termsAndConditions?.lastUpdated;
  const privacyLastUpdated = settings?.privacyPolicy?.lastUpdated;

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>📜 Terms & Conditions</h2>
      
      <div className="form-group">
        <label>Require Acceptance on Registration</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="checkbox"
            checked={form.requireTermsAcceptance}
            onChange={handleRequireTermsChange}
          />
          <span>Users must accept Terms & Conditions and Privacy Policy when registering</span>
        </div>
        <small style={{ color: '#718096', display: 'block', marginTop: '4px' }}>
          If disabled, users can register without explicit acceptance
        </small>
      </div>
      
      <div className="form-group">
        <label>Terms & Conditions Content</label>
        <textarea
          className="form-control"
          rows="12"
          value={form.termsAndConditions}
          onChange={handleTermsChange}
          placeholder="Enter your Terms & Conditions here..."
        />
        {termsLastUpdated && (
          <small style={{ color: '#718096', display: 'block', marginTop: '4px' }}>
            Last updated: {formatDate(termsLastUpdated)}
          </small>
        )}
      </div>
      
      <div className="form-group">
        <label>Privacy Policy Content</label>
        <textarea
          className="form-control"
          rows="12"
          value={form.privacyPolicy}
          onChange={handlePrivacyChange}
          placeholder="Enter your Privacy Policy here..."
        />
        {privacyLastUpdated && (
          <small style={{ color: '#718096', display: 'block', marginTop: '4px' }}>
            Last updated: {formatDate(privacyLastUpdated)}
          </small>
        )}
      </div>
      
      <button type="submit" className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
        {saving ? 'Saving...' : 'Save Terms & Conditions'}
      </button>
    </div>
  );
};

export default TermsSettings;