import React, { useState, useEffect } from 'react';
import adminApi from '../services/adminApi';
import BusinessSettings from '../components/settings/BusinessSettings';
import PaymentSettings from '../components/settings/PaymentSettings';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/settings');
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedSettings) => {
    setSaving(true);
    try {
      const { data } = await adminApi.put('/settings', updatedSettings);
      setSettings(data);
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>Settings</h1>
      <div style={{ display: 'grid', gap: '24px' }}>
        <BusinessSettings settings={settings} onSave={handleSave} saving={saving} />
        <PaymentSettings settings={settings} onSave={handleSave} saving={saving} />
      </div>
    </div>
  );
};

export default SettingsPage;