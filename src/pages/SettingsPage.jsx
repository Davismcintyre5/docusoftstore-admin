import React, { useState, useEffect } from 'react';
import adminApi from '../services/adminApi';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    businessName: 'DocuSoft Store',
    businessPhoneNumber: '0768784909',
    whatsappNumber: '0768784909',
    enableSTKPush: true,
    enableManualPayment: true,
    paymentInstructions: 'Send money to {businessNumber} via M-Pesa, then upload screenshot',
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/settings');
      console.log('Settings loaded:', data);
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to load settings. Using defaults.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings({
        ...settings,
        [parent]: {
          ...settings[parent],
          [child]: value
        }
      });
    } else if (type === 'checkbox') {
      setSettings({ ...settings, [name]: checked });
    } else {
      setSettings({ ...settings, [name]: value });
    }
  };

  const handleHoursChange = (day, value) => {
    setSettings({
      ...settings,
      businessHours: { 
        ...settings.businessHours, 
        [day]: value 
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const { data } = await adminApi.put('/admin/settings', settings);
      console.log('Settings saved:', data);
      
      setMessage({ 
        type: 'success', 
        text: '✅ Settings saved successfully! Changes are now live across all pages.' 
      });
      
      // Update localStorage for immediate sync
      localStorage.setItem('businessSettings', JSON.stringify({
        businessName: data.businessName,
        businessPhoneNumber: data.businessPhoneNumber,
        whatsappNumber: data.whatsappNumber,
        enableSTKPush: data.enableSTKPush,
        enableManualPayment: data.enableManualPayment,
        paymentInstructions: data.paymentInstructions,
        businessHours: data.businessHours
      }));
      
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: data }));
      
      // Force refresh settings to ensure sync
      setTimeout(() => {
        fetchSettings();
      }, 500);
      
    } catch (error) {
      console.error('Failed to save settings', error);
      setMessage({ 
        type: 'error', 
        text: '❌ Failed to save settings: ' + (error.response?.data?.message || 'Unknown error') 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner" style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading settings...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>⚙️ Settings</h1>
        <p style={styles.subtitle}>Configure your store settings - changes sync instantly across all pages</p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div style={message.type === 'success' ? styles.successMessage : styles.errorMessage}>
          {message.text}
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Business Information */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>🏢 Business Information</h2>
            <p style={styles.cardSubtitle}>Basic information about your store</p>
          </div>
          
          <div style={styles.cardBody}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Business Name</label>
              <input
                type="text"
                name="businessName"
                value={settings.businessName || ''}
                onChange={handleChange}
                style={styles.input}
                placeholder="e.g., DocuSoft Store"
              />
              <small style={styles.helpText}>This name appears throughout the store</small>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Business M-Pesa Number</label>
                <input
                  type="text"
                  name="businessPhoneNumber"
                  value={settings.businessPhoneNumber || ''}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g., 0768784909"
                />
                <small style={styles.helpText}>Customers send money to this number</small>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>WhatsApp Number</label>
                <input
                  type="text"
                  name="whatsappNumber"
                  value={settings.whatsappNumber || ''}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g., 0768784909"
                />
                <small style={styles.helpText}>For customer support chat</small>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>💰 Payment Settings</h2>
            <p style={styles.cardSubtitle}>Configure payment options</p>
          </div>
          
          <div style={styles.cardBody}>
            <div style={styles.checkboxGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="enableSTKPush"
                  checked={settings.enableSTKPush || false}
                  onChange={handleChange}
                  style={styles.checkbox}
                />
                <span style={styles.checkboxText}>
                  <strong>Enable STK Push (Autogenerated)</strong>
                  <span style={styles.checkboxHelp}>Customers receive payment prompt on their phone</span>
                </span>
              </label>
            </div>

            <div style={styles.checkboxGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="enableManualPayment"
                  checked={settings.enableManualPayment || false}
                  onChange={handleChange}
                  style={styles.checkbox}
                />
                <span style={styles.checkboxText}>
                  <strong>Enable Manual Payment (Send to Owner)</strong>
                  <span style={styles.checkboxHelp}>Customers send money manually and upload screenshot</span>
                </span>
              </label>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Payment Instructions</label>
              <textarea
                name="paymentInstructions"
                value={settings.paymentInstructions || ''}
                onChange={handleChange}
                style={styles.textarea}
                rows="4"
                placeholder="Instructions for manual payments..."
              />
              <small style={styles.helpText}>
                Use {'{businessNumber}'} to automatically insert the business phone number
              </small>
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>⏰ Business Hours</h2>
            <p style={styles.cardSubtitle}>When are you available for support?</p>
          </div>
          
          <div style={styles.cardBody}>
            <div style={styles.hoursGrid}>
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                <div key={day} style={styles.hoursRow}>
                  <label style={styles.hoursLabel}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </label>
                  <input
                    type="text"
                    value={settings.businessHours?.[day] || ''}
                    onChange={(e) => handleHoursChange(day, e.target.value)}
                    style={styles.hoursInput}
                    placeholder="e.g., 9am-5pm or Closed"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={styles.buttonContainer}>
          <button 
            type="submit" 
            style={saving ? styles.savingButton : styles.saveButton}
            disabled={saving}
          >
            {saving ? (
              <>
                <span style={styles.buttonSpinner}></span>
                Saving Changes...
              </>
            ) : (
              '💾 Save Settings'
            )}
          </button>
        </div>
      </form>

      {/* Settings Preview Card */}
      <div style={styles.previewCard}>
        <h3 style={styles.previewTitle}>🔍 Current Settings Preview</h3>
        <div style={styles.previewGrid}>
          <div style={styles.previewItem}>
            <span style={styles.previewLabel}>Business Name:</span>
            <span style={styles.previewValue}>{settings.businessName || 'Not set'}</span>
          </div>
          <div style={styles.previewItem}>
            <span style={styles.previewLabel}>M-Pesa Number:</span>
            <span style={styles.previewValue}>{settings.businessPhoneNumber || 'Not set'}</span>
          </div>
          <div style={styles.previewItem}>
            <span style={styles.previewLabel}>WhatsApp:</span>
            <span style={styles.previewValue}>{settings.whatsappNumber || 'Not set'}</span>
          </div>
          <div style={styles.previewItem}>
            <span style={styles.previewLabel}>STK Push:</span>
            <span style={settings.enableSTKPush ? styles.previewEnabled : styles.previewDisabled}>
              {settings.enableSTKPush ? '✅ Enabled' : '❌ Disabled'}
            </span>
          </div>
          <div style={styles.previewItem}>
            <span style={styles.previewLabel}>Manual Payment:</span>
            <span style={settings.enableManualPayment ? styles.previewEnabled : styles.previewDisabled}>
              {settings.enableManualPayment ? '✅ Enabled' : '❌ Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px',
    backgroundColor: '#fff',
    borderRadius: '12px'
  },
  spinner: {
    margin: '0 auto 20px',
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    color: '#718096'
  },
  header: {
    marginBottom: '30px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#718096'
  },
  successMessage: {
    backgroundColor: '#c6f6d5',
    color: '#22543d',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px',
    borderLeft: '4px solid #48bb78',
    fontWeight: '500'
  },
  errorMessage: {
    backgroundColor: '#fed7d7',
    color: '#c53030',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px',
    borderLeft: '4px solid #fc8181',
    fontWeight: '500'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  cardHeader: {
    padding: '20px 24px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0'
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '4px'
  },
  cardSubtitle: {
    fontSize: '14px',
    color: '#718096'
  },
  cardBody: {
    padding: '24px'
  },
  formGroup: {
    marginBottom: '20px',
    flex: 1
  },
  formRow: {
    display: 'flex',
    gap: '20px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'all 0.3s',
    outline: 'none',
    ':focus': {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
    }
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'all 0.3s',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    ':focus': {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
    }
  },
  helpText: {
    display: 'block',
    fontSize: '12px',
    color: '#a0aec0',
    marginTop: '4px'
  },
  checkboxGroup: {
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    cursor: 'pointer'
  },
  checkbox: {
    width: '20px',
    height: '20px',
    marginTop: '2px',
    cursor: 'pointer',
    accentColor: '#667eea'
  },
  checkboxText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  checkboxHelp: {
    fontSize: '13px',
    color: '#718096',
    fontWeight: 'normal'
  },
  hoursGrid: {
    display: 'grid',
    gap: '12px'
  },
  hoursRow: {
    display: 'grid',
    gridTemplateColumns: '120px 1fr',
    alignItems: 'center',
    gap: '12px'
  },
  hoursLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4a5568',
    textTransform: 'capitalize'
  },
  hoursInput: {
    padding: '8px 12px',
    border: '2px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'all 0.3s',
    outline: 'none',
    ':focus': {
      borderColor: '#667eea'
    }
  },
  buttonContainer: {
    textAlign: 'center',
    marginTop: '20px'
  },
  saveButton: {
    padding: '14px 32px',
    backgroundColor: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 2px 4px rgba(72, 187, 120, 0.3)',
    ':hover': {
      backgroundColor: '#38a169',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 8px rgba(72, 187, 120, 0.4)'
    }
  },
  savingButton: {
    padding: '14px 32px',
    backgroundColor: '#a0aec0',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'not-allowed',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px'
  },
  buttonSpinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    display: 'inline-block'
  },
  previewCard: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#ebf8ff',
    borderRadius: '12px',
    border: '2px dashed #4299e1'
  },
  previewTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2c5282',
    marginBottom: '16px'
  },
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  previewItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  previewLabel: {
    fontSize: '12px',
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  previewValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2d3748'
  },
  previewEnabled: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#48bb78'
  },
  previewDisabled: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#fc8181'
  }
};

export default SettingsPage;