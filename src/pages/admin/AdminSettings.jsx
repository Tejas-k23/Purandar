import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import { getSettings, updateSettings } from '../../services/subscriptionService';
import './AdminSettings.css';

export default function AdminSettings() {
  const [settings, setSettings] = useState({ isPricingActive: false, launchDate: null });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data } = await getSettings();
      setSettings(data.data || { isPricingActive: false, launchDate: null });
    } catch (error) {
      setMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(settings);
      setMessage('Settings updated successfully');
    } catch (error) {
      setMessage('Failed to update settings');
    }
  };

  return (
    <div className="admin-settings">
      <AdminHeader title="Pricing Settings" subtitle="Control pricing and subscription features" />

      {message && (
        <div className="admin-message">
          <AlertCircle className="w-4 h-4" />
          {message}
        </div>
      )}

      <div className="admin-content">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="admin-form-card admin-form-card-wide">
            <form onSubmit={handleSubmit}>
              <div className="form-group form-group-checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="isPricingActive"
                    checked={settings.isPricingActive}
                    onChange={handleChange}
                  />
                  Enable Pricing (Allow users to purchase plans)
                </label>
              </div>

              <div className="form-group">
                <label>Launch Date (Optional)</label>
                <input
                  type="datetime-local"
                  name="launchDate"
                  value={settings.launchDate ? new Date(settings.launchDate).toISOString().slice(0, 16) : ''}
                  onChange={handleChange}
                />
                <small>If set, pricing will auto-enable on this date</small>
              </div>

              <div className="settings-info">
                <p>
                  <strong>Current Status:</strong> {settings.isPricingActive ? '✅ Pricing Active' : '⏸️ Pricing Disabled'}
                </p>
              </div>

              <div className="form-actions">
                <button type="submit" className="admin-primary-btn">
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
