import React, { useState, useEffect } from 'react';
import adminApi from '../services/adminApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Save, Building, CreditCard, Clock, FileText as FileTextIcon } from 'lucide-react';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    businessName: 'DocuSoft Store',
    businessPhoneNumber: '0768784909',
    whatsappNumber: '0768784909',
    contactEmail: 'support@docusoft.com',
    address: 'Nairobi, Kenya',
    facebook: '',
    twitter: '',
    instagram: '',
    enableSTKPush: true,
    enableManualPayment: true,
    paymentInstructions: 'Send money to {businessNumber} via M-Pesa, then upload screenshot',
    requireTermsAcceptance: true,
    termsAndConditions: { content: '', lastUpdated: null },
    privacyPolicy: { content: '', lastUpdated: null },
    businessHours: {
      monday: '9am-5pm',
      tuesday: '9am-5pm',
      wednesday: '9am-5pm',
      thursday: '9am-5pm',
      friday: '9am-5pm',
      saturday: 'Closed',
      sunday: 'Closed'
    }
  });
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/settings');
      setSettings(prev => ({ ...prev, ...data }));
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setSettings(prev => ({ ...prev, [name]: checked }));
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleHoursChange = (day, value) => {
    setSettings(prev => ({ ...prev, businessHours: { ...prev.businessHours, [day]: value } }));
  };

  const handleTermsChange = (e) => {
    setSettings(prev => ({ ...prev, termsAndConditions: { ...prev.termsAndConditions, content: e.target.value } }));
  };

  const handlePrivacyChange = (e) => {
    setSettings(prev => ({ ...prev, privacyPolicy: { ...prev.privacyPolicy, content: e.target.value } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const payload = { ...settings };
      await adminApi.put('/admin/settings', payload);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      // Dispatch event for real‑time sync to all client tabs
      window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: payload }));
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const tabs = [
    { id: 'general', label: 'General', icon: Building },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'hours', label: 'Business Hours', icon: Clock },
    { id: 'legal', label: 'Legal', icon: FileTextIcon },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Configure your store settings</p>
      </div>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition ${
              activeTab === tab.id
                ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-body space-y-6">
            {/* General Tab */}
            {activeTab === 'general' && (
              <>
                <div>
                  <label className="label">Business Name</label>
                  <input name="businessName" className="input" value={settings.businessName} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Business Phone Number</label>
                    <input name="businessPhoneNumber" className="input" value={settings.businessPhoneNumber} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="label">WhatsApp Number</label>
                    <input name="whatsappNumber" className="input" value={settings.whatsappNumber} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Contact Email</label>
                    <input name="contactEmail" className="input" value={settings.contactEmail} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="label">Physical Address</label>
                    <input name="address" className="input" value={settings.address} onChange={handleChange} />
                  </div>
                </div>
                <div className="border-t pt-4 mt-2">
                  <h3 className="font-semibold mb-3">Social Media Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">Facebook URL</label>
                      <input name="facebook" className="input" value={settings.facebook || ''} onChange={handleChange} placeholder="https://facebook.com/yourpage" />
                    </div>
                    <div>
                      <label className="label">Twitter URL</label>
                      <input name="twitter" className="input" value={settings.twitter || ''} onChange={handleChange} placeholder="https://twitter.com/yourhandle" />
                    </div>
                    <div>
                      <label className="label">Instagram URL</label>
                      <input name="instagram" className="input" value={settings.instagram || ''} onChange={handleChange} placeholder="https://instagram.com/yourhandle" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Payment Tab */}
            {activeTab === 'payment' && (
              <>
                <div className="flex items-center gap-3">
                  <input type="checkbox" name="enableSTKPush" checked={settings.enableSTKPush} onChange={handleChange} />
                  <label>Enable STK Push (Auto-generated)</label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" name="enableManualPayment" checked={settings.enableManualPayment} onChange={handleChange} />
                  <label>Enable Manual Payment</label>
                </div>
                <div>
                  <label className="label">Payment Instructions</label>
                  <textarea name="paymentInstructions" rows="4" className="input" value={settings.paymentInstructions} onChange={handleChange} />
                  <p className="text-xs text-gray-500 mt-1">Use {'{businessNumber}'} to insert business phone number</p>
                </div>
              </>
            )}

            {/* Hours Tab */}
            {activeTab === 'hours' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(settings.businessHours).map(([day, hours]) => (
                  <div key={day}>
                    <label className="label capitalize">{day}</label>
                    <input className="input" value={hours} onChange={(e) => handleHoursChange(day, e.target.value)} />
                  </div>
                ))}
              </div>
            )}

            {/* Legal Tab */}
            {activeTab === 'legal' && (
              <>
                <div className="flex items-center gap-3">
                  <input type="checkbox" name="requireTermsAcceptance" checked={settings.requireTermsAcceptance} onChange={handleChange} />
                  <label>Require Terms & Privacy acceptance on registration</label>
                </div>
                <div>
                  <label className="label">Terms & Conditions</label>
                  <textarea className="input font-mono text-sm" rows="8" value={settings.termsAndConditions?.content || ''} onChange={handleTermsChange} />
                </div>
                <div>
                  <label className="label">Privacy Policy</label>
                  <textarea className="input font-mono text-sm" rows="8" value={settings.privacyPolicy?.content || ''} onChange={handlePrivacyChange} />
                </div>
              </>
            )}
          </div>
          <div className="card-footer bg-gray-50 dark:bg-gray-800/50 flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2">
              <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;