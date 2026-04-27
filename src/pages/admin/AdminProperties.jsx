import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Home, Pencil, Power, Star, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import AdminHeader from '../../components/admin/AdminHeader';
import DataTable from '../../components/admin/DataTable';
import Loader from '../../components/common/Loader';
import ToggleSwitch from '../../components/common/ToggleSwitch';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatCompactPrice } from '../../utils/formatPrice';
import { hasCompanyContact } from '../../config/companyContact';

const hasCompleteCustomContact = (property = {}) => (
  Boolean(
    property.displaySellerName?.trim()
    && property.displaySellerPhone?.trim()
    && property.displaySellerEmail?.trim(),
  )
);

export default function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [contactEditorId, setContactEditorId] = useState('');
  const [contactDrafts, setContactDrafts] = useState({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [confirmDialog, setConfirmDialog] = useState(null);

  const closeConfirm = () => setConfirmDialog(null);
  const openConfirm = (payload) => setConfirmDialog({ ...payload, busy: false });
  const handleConfirm = async () => {
    const action = confirmDialog?.onConfirm;
    if (!action) return;
    setConfirmDialog((current) => (current ? { ...current, busy: true } : current));
    try {
      await action();
    } finally {
      setConfirmDialog(null);
    }
  };

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
    let moderationMessage = '';
    if (status === 'rejected') {
      moderationMessage = window.prompt('Enter rejection reason for the user:')?.trim() || '';
      if (!moderationMessage) return;
    }
    setBusyId(`${propertyId}:${status}`);
    try {
      await adminService.updatePropertyStatus(propertyId, status, moderationMessage);
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
    } catch {
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
    const canSwitchToCustom = hasCompleteCustomContact(property);
    const nextMode = nextValue
      ? 'original'
      : currentMode !== 'original'
        ? currentMode
        : 'custom';

    if (!nextValue && !canSwitchToCustom) {
      openContactEditor(property);
      return;
    }

    setBusyId(`${propertyId}:contact`);
    setProperties((current) => current.map((item) => (
      item._id === propertyId
        ? { ...item, contactDisplayMode: nextMode, useOriginalSellerContact: nextMode === 'original' }
        : item
    )));

    try {
      const response = await adminService.updateProperty(propertyId, {
        contactDisplayMode: nextMode,
        useOriginalSellerContact: nextMode === 'original',
      });
      if (response.data?.data) {
        setProperties((current) => current.map((item) =>
          item._id === propertyId ? response.data.data : item
        ));
      }
    } catch (_error) {
      const errorMessage = _error.response?.data?.message || _error.message || 'Failed to update contact mode';
      setProperties((current) => current.map((item) => (
        item._id === propertyId ? { ...item, contactDisplayMode: currentMode, useOriginalSellerContact: currentMode === 'original' } : item
      )));

      alert(`Error: ${errorMessage}`);
    } finally {
      setBusyId('');
    }
  };

  const openContactEditor = (property) => {
    setContactEditorId(property._id);
    setContactDrafts((current) => ({
      ...current,
      [property._id]: {
        displaySellerName: property.displaySellerName || '',
        displaySellerPhone: property.displaySellerPhone || '',
        displaySellerEmail: property.displaySellerEmail || '',
      },
    }));
  };

  const updateContactDraft = (propertyId, field, value) => {
    setContactDrafts((current) => ({
      ...current,
      [propertyId]: {
        ...(current[propertyId] || {}),
        [field]: value,
      },
    }));
  };

  const validateCustomContact = (draft) => {
    const name = draft.displaySellerName?.trim() || '';
    const phone = draft.displaySellerPhone?.trim() || '';
    const email = draft.displaySellerEmail?.trim() || '';

    if (!name) return 'Seller name is required';
    if (!phone) return 'Phone number is required';
    if (!email) return 'Email is required';

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address (e.g., contact@example.com)';
    }

    // Validate phone - at least 10 digits
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      return 'Phone number must contain at least 10 digits';
    }

    return null;
  };

  const saveCustomContact = async (propertyId) => {
    const draft = contactDrafts[propertyId];
    if (!draft) return;

    // Validate all fields
    const validationError = validateCustomContact(draft);
    if (validationError) {
      alert(validationError);
      return;
    }

    setBusyId(`${propertyId}:contact-edit`);
    const previousProperty = properties.find((item) => item._id === propertyId);

    setProperties((current) => current.map((item) => (
      item._id === propertyId
        ? {
          ...item,
          contactDisplayMode: 'custom',
          useOriginalSellerContact: false,
          displaySellerName: draft.displaySellerName,
          displaySellerPhone: draft.displaySellerPhone,
          displaySellerEmail: draft.displaySellerEmail,
        }
        : item
    )));

    try {
      const response = await adminService.updateProperty(propertyId, {
        contactDisplayMode: 'custom',
        useOriginalSellerContact: false,
        displaySellerName: draft.displaySellerName,
        displaySellerPhone: draft.displaySellerPhone,
        displaySellerEmail: draft.displaySellerEmail,
      });

      // Update with response data to ensure consistency
      if (response.data?.data) {
        setProperties((current) => current.map((item) =>
          item._id === propertyId ? response.data.data : item
        ));
      }

      setContactEditorId('');
      setContactDrafts((current) => {
        const next = { ...current };
        delete next[propertyId];
        return next;
      });
    } catch (_error) {
      // Revert to previous state on error
      if (previousProperty) {
        setProperties((current) => current.map((item) =>
          item._id === propertyId ? previousProperty : item
        ));
      }

      // Extract detailed error message from response
      const errorMessage = _error.response?.data?.message || _error.message || 'Failed to save custom contact';

      alert(`Error: ${errorMessage}`);
    } finally {
      setBusyId('');
    }
  };

  const setContactMode = async (propertyId, nextMode) => {
    const property = properties.find((item) => item._id === propertyId);
    if (!property) return;

    const currentMode = property.contactDisplayMode || (property.useOriginalSellerContact === false ? 'custom' : 'original');
    if (currentMode === nextMode) return;
    if (nextMode === 'custom' && !hasCompleteCustomContact(property)) {
      openContactEditor(property);
      return;
    }

    setBusyId(`${propertyId}:contact`);
    setProperties((current) => current.map((item) => (
      item._id === propertyId
        ? { ...item, contactDisplayMode: nextMode, useOriginalSellerContact: nextMode === 'original' }
        : item
    )));

    try {
      const response = await adminService.updateProperty(propertyId, {
        contactDisplayMode: nextMode,
        useOriginalSellerContact: nextMode === 'original',
      });

      if (response.data?.data) {
        setProperties((current) => current.map((item) => (
          item._id === propertyId ? response.data.data : item
        )));
      }
    } catch (_error) {
      setProperties((current) => current.map((item) => (
        item._id === propertyId
          ? { ...item, contactDisplayMode: currentMode, useOriginalSellerContact: currentMode === 'original' }
          : item
      )));
      const errorMessage = _error.response?.data?.message || _error.message || 'Failed to update contact mode';

      alert(`Error: ${errorMessage}`);
    } finally {
      setBusyId('');
    }
  };

  const deleteProperty = (propertyId, title) => {
    openConfirm({
      title: 'Delete property?',
      message: `This will permanently delete ${title ? `"${title}"` : 'this property'} and its media.`,
      confirmText: 'Delete',
      tone: 'danger',
      onConfirm: async () => {
        setBusyId(`${propertyId}:delete`);
        try {
          await adminService.deleteProperty(propertyId);
          await load();
        } finally {
          setBusyId('');
        }
      },
    });
  };

  const confirmArchive = (propertyId, title) => {
    openConfirm({
      title: 'Archive property?',
      message: `${title ? `"${title}"` : 'This property'} will be hidden from public listings until re-approved.`,
      confirmText: 'Archive',
      tone: 'danger',
      onConfirm: async () => {
        await updateStatus(propertyId, 'archived');
      },
    });
  };

  const featuredCount = useMemo(() => properties.filter((property) => property.featuredOnHome).length, [properties]);
  const filteredProperties = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const filtered = properties.filter((property) => {
      if (statusFilter !== 'all' && property.status !== statusFilter) return false;
      if (!needle) return true;
      const haystack = [
        property.title,
        property.propertyType,
        property.locality,
        property.city,
        property.owner?.name,
        property.userName,
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(needle);
    });

    const sorted = [...filtered];
    if (sortBy === 'name-asc') {
      sorted.sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')));
    } else if (sortBy === 'name-desc') {
      sorted.sort((a, b) => String(b.title || '').localeCompare(String(a.title || '')));
    } else if (sortBy === 'price-asc') {
      sorted.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else {
      sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return sorted;
  }, [properties, search, statusFilter, sortBy]);

  if (loading) return <Loader label="Loading properties..." />;

  return (
    <div className="admin-page">
      <ConfirmModal
        open={!!confirmDialog}
        title={confirmDialog?.title}
        message={confirmDialog?.message}
        confirmText={confirmDialog?.confirmText}
        cancelText={confirmDialog?.cancelText}
        onConfirm={handleConfirm}
        onClose={closeConfirm}
        tone={confirmDialog?.tone || 'danger'}
        showCancel={confirmDialog?.showCancel !== false}
        busy={confirmDialog?.busy}
      />
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
        <div className="admin-filter-row" style={{ marginBottom: '0.85rem' }}>
          <div className="admin-filter-group">
            <span className="admin-filter-label">Search</span>
            <input
              className="admin-filter-input"
              type="text"
              placeholder="Search by title, type, city..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="admin-filter-group">
            <span className="admin-filter-label">Status</span>
            <select className="admin-filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="archived">Archived</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="admin-filter-group">
            <span className="admin-filter-label">Sort</span>
            <select className="admin-filter-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="newest">Newest</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="price-asc">Price Low-High</option>
              <option value="price-desc">Price High-Low</option>
            </select>
          </div>
        </div>
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
                const isEditing = contactEditorId === row._id;
                const draft = contactDrafts[row._id] || {};
                return (
                  <div className="admin-cell-stack">
                    <ToggleSwitch
                      checked={checked}
                      onChange={(value) => toggleContactMode(row._id, value)}
                      label="Toggle real seller details"
                      disabled={busyId === `${row._id}:contact`}
                    />
                    {!checked ? (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="admin-secondary-btn admin-secondary-btn-inline admin-contact-cta"
                          disabled={busyId === `${row._id}:contact` || mode === 'custom'}
                          onClick={() => {
                            setContactMode(row._id, 'custom');
                            if (!hasCompleteCustomContact(row)) {
                              openContactEditor(row);
                            }
                          }}
                        >
                          Use custom contact
                        </button>
                        {hasCompanyContact ? (
                          <button
                            type="button"
                            className="admin-secondary-btn admin-secondary-btn-inline admin-contact-cta"
                            disabled={busyId === `${row._id}:contact` || mode === 'company'}
                            onClick={() => setContactMode(row._id, 'company')}
                          >
                            Use company contact
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                    {mode === 'company' ? (
                      <span className="admin-cell-subtitle">Website is currently showing the company contact for this property.</span>
                    ) : null}
                    {mode === 'custom' ? (
                      <button
                        type="button"
                        className="admin-secondary-btn admin-secondary-btn-inline admin-contact-cta"
                        onClick={() => openContactEditor(row)}
                        disabled={busyId === `${row._id}:contact`}
                      >
                        {row.displaySellerName || row.displaySellerPhone || row.displaySellerEmail ? 'Edit custom contact' : 'Add custom contact'}
                      </button>
                    ) : null}
                    {isEditing ? (
                      <div className="admin-contact-editor">
                        <input
                          className="admin-contact-input"
                          type="text"
                          placeholder="Name"
                          value={draft.displaySellerName || ''}
                          onChange={(event) => updateContactDraft(row._id, 'displaySellerName', event.target.value)}
                        />
                        <input
                          className="admin-contact-input"
                          type="tel"
                          placeholder="Phone"
                          value={draft.displaySellerPhone || ''}
                          onChange={(event) => updateContactDraft(row._id, 'displaySellerPhone', event.target.value)}
                        />
                        <input
                          className="admin-contact-input"
                          type="email"
                          placeholder="Email"
                          value={draft.displaySellerEmail || ''}
                          onChange={(event) => updateContactDraft(row._id, 'displaySellerEmail', event.target.value)}
                        />
                        <div className="admin-contact-actions">
                          <button
                            type="button"
                            className="admin-primary-btn admin-primary-btn-inline"
                            onClick={() => saveCustomContact(row._id)}
                            disabled={busyId === `${row._id}:contact-edit`}
                          >
                            {busyId === `${row._id}:contact-edit` ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            className="admin-secondary-btn admin-secondary-btn-inline"
                            onClick={() => setContactEditorId('')}
                            disabled={busyId === `${row._id}:contact-edit`}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              },
            },
            {
              key: 'visible',
              label: 'Visible',
              render: (row) => (
                <ToggleSwitch
                  checked={row.status === 'approved'}
                  onChange={(value) => (value ? updateStatus(row._id, 'approved') : confirmArchive(row._id, row.title))}
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
                  <a
                    href={`/property/${row._id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-secondary-btn admin-secondary-btn-inline admin-icon-btn"
                    title="View property"
                    aria-label="View property"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                  <Link
                    to={`/admin/properties/form?edit=${row._id}`}
                    className="admin-secondary-btn admin-secondary-btn-inline admin-icon-btn"
                    title="Edit property"
                    aria-label="Edit property"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    className={`admin-secondary-btn admin-secondary-btn-inline admin-feature-btn admin-icon-btn ${row.featuredOnHome ? 'is-featured' : ''}`}
                    disabled={busyId === `${row._id}:featured` || row.status !== 'approved'}
                    onClick={() => toggleFeatured(row._id, row.featuredOnHome)}
                    title={row.featuredOnHome ? 'Remove from featured' : 'Feature on home'}
                    aria-label={row.featuredOnHome ? 'Remove from featured' : 'Feature on home'}
                  >
                    {busyId === `${row._id}:featured` ? <span className="admin-inline-spinner" aria-hidden="true"></span> : <Star className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    className="admin-primary-btn admin-primary-btn-inline admin-icon-btn"
                    disabled={busyId === `${row._id}:approved`}
                    onClick={() => updateStatus(row._id, 'approved')}
                    title="Show listing"
                    aria-label="Show listing"
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="admin-danger-btn admin-icon-btn"
                    disabled={busyId === `${row._id}:archived`}
                    onClick={() => confirmArchive(row._id, row.title)}
                    title="Hide listing"
                    aria-label="Hide listing"
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="admin-danger-btn admin-icon-btn"
                    disabled={busyId === `${row._id}:delete`}
                    onClick={() => deleteProperty(row._id, row.title)}
                    title="Delete property"
                    aria-label="Delete property"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ),
            },
          ]}
          rows={filteredProperties.map((property) => ({ ...property, id: property._id }))}
        />
      </div>
    </div>
  );
}
