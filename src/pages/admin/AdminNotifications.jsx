import React, { useState } from 'react';
import AdminHeader from '../../components/admin/AdminHeader';
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
      setStatus(`Success. Delivered to ${successCount} device(s). ${formatCriteria()}`);
      setStatusKind('success');
      setTitle('');
      setBody('');
    } catch (error) {
      setStatus(error.message || 'Unable to send notification.');
      setStatusKind('error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="admin-page">
      <AdminHeader
        title="Notifications"
        subtitle="Send custom notifications to users, guests, or admins."
      />

      <div className="admin-panel-card" style={{ maxWidth: 720 }}>
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
