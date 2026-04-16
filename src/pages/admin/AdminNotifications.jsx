import React, { useEffect, useState } from 'react';
import AdminHeader from '../../components/admin/AdminHeader';
import ToggleSwitch from '../../components/common/ToggleSwitch';
import adminService from '../../services/adminService';

const intents = ['sell', 'rent'];
const audiences = [
  { label: 'All Users', value: 'users' },
  { label: 'Admins', value: 'admins' },
  { label: 'Guests', value: 'guests' },
  { label: 'Everyone', value: 'all' },
];

export default function AdminNotifications() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('users');
  const [city, setCity] = useState('');
  const [intent, setIntent] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [status, setStatus] = useState('');
  const [statusKind, setStatusKind] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [deviceCount, setDeviceCount] = useState(0);
  const [deviceBreakdown, setDeviceBreakdown] = useState({});
  const [isToggling, setIsToggling] = useState(false);

  const loadNotificationState = async () => {
    const [settingsResponse, devicesResponse] = await Promise.all([
      adminService.getNotificationSettings(),
      adminService.getNotificationDevices(),
    ]);
    const settings = settingsResponse.data?.data || {};
    const devices = devicesResponse.data?.data || [];
    setNotificationsEnabled(settings.notificationsEnabled !== false);
    setDeviceCount(settings.totalDevices ?? devices.length);
    setDeviceBreakdown(settings.byRole || {});
  };

  useEffect(() => {
    loadNotificationState().catch(() => {
      setStatus('Unable to load notification settings.');
      setStatusKind('error');
    });
  }, []);

  const audienceLabel = audiences.find((item) => item.value === audience)?.label || 'All Users';
  const formatCriteria = () => {
    const cityLabel = city.trim() ? city.trim() : 'Any';
    const intentLabel = intent.trim() ? intent.trim() : 'Any';
    const propertyTypeLabel = propertyType.trim() ? propertyType.trim() : 'Any';
    return `Audience: ${audienceLabel} • City: ${cityLabel} • Intent: ${intentLabel} • Property Type: ${propertyTypeLabel}`;
  };

  const submit = async (event) => {
    event.preventDefault();
    setStatus('');
    setStatusKind('');
    if (!title.trim() || !body.trim()) {
      setStatus('Title and message are required.');
      setStatusKind('error');
      return;
    }

    setIsSending(true);
    try {
      const response = await adminService.sendNotification({
        title: title.trim(),
        body: body.trim(),
        audience,
        criteria: {
          city: city.trim(),
          intent: intent.trim(),
          propertyType: propertyType.trim(),
        },
      });
      const successCount = response.data?.data?.successCount ?? 0;
      const totalDevicesMatched = response.data?.data?.totalDevices ?? 0;
      const disabled = response.data?.data?.disabled === true;
      if (disabled) {
        setStatus('Notifications are disabled by admin.');
        setStatusKind('error');
      } else {
        setStatus(`Success. Delivered to ${successCount} device(s) out of ${totalDevicesMatched} registered device(s). ${formatCriteria()}`);
        setStatusKind('success');
      }
      setTitle('');
      setBody('');
      await loadNotificationState();
    } catch (error) {
      setStatus(error.message || 'Unable to send notification.');
      setStatusKind('error');
    } finally {
      setIsSending(false);
    }
  };

  const handleToggle = async (checked) => {
    setIsToggling(true);
    setStatus('');
    setStatusKind('');
    try {
      const response = await adminService.updateNotificationSettings(checked);
      const nextEnabled = response.data?.data?.notificationsEnabled !== false;
      setNotificationsEnabled(nextEnabled);
      setStatus(nextEnabled ? 'Notifications are ON for custom broadcasts.' : 'Notifications are OFF for custom broadcasts.');
      setStatusKind(nextEnabled ? 'success' : 'error');
      await loadNotificationState();
    } catch (error) {
      setStatus(error.message || 'Unable to update notification setting.');
      setStatusKind('error');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="admin-page">
      <AdminHeader
        title="Notifications"
        subtitle="Send custom notifications to users, guests, or admins."
      />

      <div className="admin-panel-card" style={{ maxWidth: 720 }}>
        <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
          <div className="admin-filter-row" style={{ alignItems: 'center' }}>
            <div className="admin-filter-group">
              <span className="admin-filter-label">Custom Notifications</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <ToggleSwitch
                  checked={notificationsEnabled}
                  onChange={handleToggle}
                  label="Toggle custom notifications"
                  disabled={isToggling}
                />
                <span>{notificationsEnabled ? 'ON' : 'OFF'}</span>
              </div>
            </div>
            <div className="admin-filter-group">
              <span className="admin-filter-label">Registered Devices</span>
              <div>{deviceCount}</div>
            </div>
          </div>
          <p style={{ margin: 0, color: '#475467' }}>
            Users: {deviceBreakdown.user || 0} | Agents: {deviceBreakdown.agent || 0} | Guests: {deviceBreakdown.guest || 0} | Admins: {deviceBreakdown.admin || 0}
          </p>
        </div>
        <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
          <div className="admin-form-row">
            <label className="admin-filter-label" htmlFor="notify-title">Title</label>
            <input
              id="notify-title"
              className="admin-filter-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Notification title"
            />
          </div>
          <div className="admin-form-row">
            <label className="admin-filter-label" htmlFor="notify-body">Message</label>
            <textarea
              id="notify-body"
              className="admin-filter-input"
              rows={4}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Write a short message..."
            />
          </div>
          <div className="admin-filter-row">
            <div className="admin-filter-group">
              <span className="admin-filter-label">Audience</span>
              <select className="admin-filter-select" value={audience} onChange={(event) => setAudience(event.target.value)}>
                {audiences.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
            <div className="admin-filter-group">
              <span className="admin-filter-label">City (optional)</span>
              <input
                className="admin-filter-input"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Pune, Saswad..."
              />
            </div>
          </div>
          <div className="admin-filter-row">
            <div className="admin-filter-group">
              <span className="admin-filter-label">Intent (optional)</span>
              <select className="admin-filter-select" value={intent} onChange={(event) => setIntent(event.target.value)}>
                <option value="">Any</option>
                {intents.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className="admin-filter-group">
              <span className="admin-filter-label">Property Type (optional)</span>
              <input
                className="admin-filter-input"
                value={propertyType}
                onChange={(event) => setPropertyType(event.target.value)}
                placeholder="Apartment, Plot..."
              />
            </div>
          </div>
          <button type="submit" className="admin-primary-btn" disabled={isSending}>
            {isSending ? 'Sending...' : 'Send Notification'}
          </button>
          {status ? (
            <p style={{ margin: 0, color: statusKind === 'error' ? '#b42318' : '#067647' }}>
              {status}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
