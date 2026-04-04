import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Home, Pencil, Power, Star, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import AdminHeader from '../../components/admin/AdminHeader';
import DataTable from '../../components/admin/DataTable';
import Loader from '../../components/common/Loader';
import ToggleSwitch from '../../components/common/ToggleSwitch';
import { formatCompactPrice } from '../../utils/formatPrice';
import { hasCompanyContact } from '../../config/companyContact';

export default function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const response = await adminService.getProperties();
      setProperties(response.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (propertyId, status) => {
    setBusyId(`${propertyId}:${status}`);
    try {
      await adminService.updatePropertyStatus(propertyId, status);
      await load();
    } finally {
      setBusyId('');
    }
  };

  const toggleFeatured = async (propertyId, currentValue) => {
    setBusyId(`${propertyId}:featured`);
    setProperties((current) => current.map((property) => (
      property._id === propertyId
        ? { ...property, featuredOnHome: !currentValue }
        : property
    )));

    try {
      await adminService.togglePropertyFeatured(propertyId, !currentValue);
    } catch (_error) {
      setProperties((current) => current.map((property) => (
        property._id === propertyId
          ? { ...property, featuredOnHome: currentValue }
          : property
      )));
    } finally {
      setBusyId('');
    }
  };

  const toggleContactMode = async (propertyId, nextValue) => {
    const property = properties.find((item) => item._id === propertyId);
    if (!property) return;

    const currentMode = property.contactDisplayMode || (property.useOriginalSellerContact === false ? 'custom' : 'original');
    const nextMode = nextValue
      ? 'original'
      : currentMode !== 'original'
        ? currentMode
        : (hasCompanyContact ? 'company' : 'custom');

    setBusyId(`${propertyId}:contact`);
    setProperties((current) => current.map((item) => (
      item._id === propertyId ? { ...item, contactDisplayMode: nextMode, useOriginalSellerContact: nextMode === 'original' } : item
    )));

    try {
      await adminService.updateProperty(propertyId, { contactDisplayMode: nextMode });
    } catch (_error) {
      setProperties((current) => current.map((item) => (
        item._id === propertyId ? { ...item, contactDisplayMode: currentMode, useOriginalSellerContact: currentMode === 'original' } : item
      )));
    } finally {
      setBusyId('');
    }
  };

  const deleteProperty = async (propertyId) => {
    const confirmed = window.confirm('Delete this property permanently?');
    if (!confirmed) return;

    setBusyId(`${propertyId}:delete`);
    try {
      await adminService.deleteProperty(propertyId);
      await load();
    } finally {
      setBusyId('');
    }
  };

  const featuredCount = useMemo(() => properties.filter((property) => property.featuredOnHome).length, [properties]);

  if (loading) return <Loader label="Loading properties..." />;

  return (
    <div className="admin-page">
      <AdminHeader
        title="All Properties"
        subtitle="Manage every listing, change visibility, edit records, and control which seller contact the website shows."
        actions={(
          <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
            <Link to="/admin/properties/form" className="admin-primary-btn">Add Property</Link>
            <div className="admin-hero-pill"><Home className="w-4 h-4" /> Featured on Home: {featuredCount}</div>
          </div>
        )}
      />

      <div className="admin-panel-card">
        <DataTable
          emptyMessage="No properties found."
          columns={[
            {
              key: 'title',
              label: 'Property',
              render: (row) => (
                <div className="admin-cell-stack">
                  <div className="admin-cell-title">{row.title}</div>
                  <div className="admin-cell-subtitle">{row.propertyType} • {[row.locality, row.city].filter(Boolean).join(', ')}</div>
                </div>
              ),
            },
            {
              key: 'owner',
              label: 'Owner / Seller',
              render: (row) => (
                <div className="admin-cell-stack">
                  <div>{row.owner?.name || row.userName}</div>
                  <div className="admin-cell-subtitle">Original: {row.owner?.phone || row.owner?.email || '-'}</div>
                  <div className="admin-cell-subtitle">
                    Display: {(() => {
                      const mode = row.contactDisplayMode || (row.useOriginalSellerContact === false ? 'custom' : 'original');
                      if (mode === 'company') return 'Company contact';
                      if (mode === 'custom') return `${row.displaySellerName || '-'} • ${row.displaySellerPhone || '-'} • ${row.displaySellerEmail || '-'}`;
                      return 'Original seller contact';
                    })()}
                  </div>
                </div>
              ),
            },
            { key: 'status', label: 'Status', render: (row) => <span className={`admin-table-badge ${row.status === 'approved' ? 'success' : row.status === 'archived' ? 'muted' : 'warning'}`}>{row.status}</span> },
            { key: 'price', label: 'Price', render: (row) => formatCompactPrice(row.price) },
            { key: 'featuredOnHome', label: 'Home', render: (row) => <span className={`admin-table-badge ${row.featuredOnHome ? 'success' : 'muted'}`}>{row.featuredOnHome ? 'Recommended' : 'Normal'}</span> },
            {
              key: 'contactDisplay',
              label: 'Show Real Seller Details',
              render: (row) => {
                const mode = row.contactDisplayMode || (row.useOriginalSellerContact === false ? 'custom' : 'original');
                const checked = mode === 'original';
                return (
                  <ToggleSwitch
                    checked={checked}
                    onChange={(value) => toggleContactMode(row._id, value)}
                    label="Toggle real seller details"
                    disabled={busyId === `${row._id}:contact`}
                  />
                );
              },
            },
            {
              key: 'visible',
              label: 'Visible',
              render: (row) => (
                <ToggleSwitch
                  checked={row.status === 'approved'}
                  onChange={(value) => updateStatus(row._id, value ? 'approved' : 'archived')}
                  label="Toggle property visibility"
                  disabled={busyId === `${row._id}:approved` || busyId === `${row._id}:archived`}
                />
              ),
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <div className="admin-action-row">
                  <a href={`/property/${row._id}`} target="_blank" rel="noreferrer" className="admin-secondary-btn admin-secondary-btn-inline"><Eye className="w-4 h-4" /> View</a>
                  <Link to={`/admin/properties/form?edit=${row._id}`} className="admin-secondary-btn admin-secondary-btn-inline"><Pencil className="w-4 h-4" /> Edit</Link>
                  <button
                    type="button"
                    className={`admin-secondary-btn admin-secondary-btn-inline admin-feature-btn ${row.featuredOnHome ? 'is-featured' : ''}`}
                    disabled={busyId === `${row._id}:featured` || row.status !== 'approved'}
                    onClick={() => toggleFeatured(row._id, row.featuredOnHome)}
                  >
                    {busyId === `${row._id}:featured` ? <span className="admin-inline-spinner" aria-hidden="true"></span> : <Star className="w-4 h-4" />}
                    {row.featuredOnHome ? 'Unfeature' : 'Feature'}
                  </button>
                  <button type="button" className="admin-primary-btn admin-primary-btn-inline" disabled={busyId === `${row._id}:approved`} onClick={() => updateStatus(row._id, 'approved')}><Power className="w-4 h-4" /> Show</button>
                  <button type="button" className="admin-danger-btn" disabled={busyId === `${row._id}:archived`} onClick={() => updateStatus(row._id, 'archived')}>Hide</button>
                  <button type="button" className="admin-danger-btn" disabled={busyId === `${row._id}:delete`} onClick={() => deleteProperty(row._id)}><Trash2 className="w-4 h-4" /> Delete</button>
                </div>
              ),
            },
          ]}
          rows={properties.map((property) => ({ ...property, id: property._id }))}
        />
      </div>
    </div>
  );
}
