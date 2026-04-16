import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Pencil, PlusSquare, Star, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';
import DataTable from '../../components/admin/DataTable';
import ToggleSwitch from '../../components/common/ToggleSwitch';
import ConfirmModal from '../../components/common/ConfirmModal';
import projectService from '../../services/projectService';
import { formatCompactPrice } from '../../utils/formatPrice';
import { hasCompanyContact } from '../../config/companyContact';

const hasCompleteCustomContact = (project = {}) => (
  Boolean(
    project.customContactName?.trim()
    && project.customContactPhone?.trim()
    && project.customContactEmail?.trim(),
  )
);

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [busyId, setBusyId] = useState('');
  const [contactEditorId, setContactEditorId] = useState('');
  const [contactDrafts, setContactDrafts] = useState({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [confirmDialog, setConfirmDialog] = useState(null);
  const approvalStatuses = ['pending', 'approved', 'rejected', 'archived'];

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
    const response = await projectService.getAll({ includeHidden: true });
    setProjects(response.data.data.items || []);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleVisibility = async (projectId, visible) => {
    setBusyId(`${projectId}:visible`);
    await projectService.toggleVisibility(projectId, visible);
    await load();
    setBusyId('');
  };

  const toggleFeatured = async (projectId, featuredOnHome) => {
    setBusyId(`${projectId}:featured`);
    await projectService.toggleFeatured(projectId, featuredOnHome);
    await load();
    setBusyId('');
  };

  const updateApprovalStatus = async (projectId, status) => {
    let moderationMessage = '';
    if (status === 'rejected') {
      moderationMessage = window.prompt('Enter rejection reason for the user:')?.trim() || '';
      if (!moderationMessage) return;
    }
    setBusyId(`${projectId}:status:${status}`);
    await projectService.updateStatus(projectId, status, moderationMessage);
    await load();
    setBusyId('');
  };

  const toggleContactMode = async (projectId, nextValue) => {
    const project = projects.find((item) => item._id === projectId);
    if (!project) return;

    const currentMode = project.contactDisplayMode || (project.useCustomContactDetails ? 'custom' : 'original');
    const canSwitchToCustom = hasCompleteCustomContact(project);
    const nextMode = nextValue
      ? 'original'
      : currentMode !== 'original'
        ? currentMode
        : (hasCompanyContact ? 'company' : 'custom');

    if (!nextValue && nextMode === 'custom' && !canSwitchToCustom) {
      openContactEditor(project);
      return;
    }

    setBusyId(`${projectId}:contact`);
    setProjects((current) => current.map((item) => (
      item._id === projectId ? { ...item, contactDisplayMode: nextMode, useCustomContactDetails: nextMode === 'custom' } : item
    )));

    try {
      await projectService.update(projectId, { contactDisplayMode: nextMode, useCustomContactDetails: nextMode === 'custom' });
    } catch (_error) {
      setProjects((current) => current.map((item) => (
        item._id === projectId ? { ...item, contactDisplayMode: currentMode, useCustomContactDetails: currentMode === 'custom' } : item
      )));
    } finally {
      setBusyId('');
    }
  };

  const openContactEditor = (project) => {
    setContactEditorId(project._id);
    setContactDrafts((current) => ({
      ...current,
      [project._id]: {
        customContactName: project.customContactName || '',
        customContactPhone: project.customContactPhone || '',
        customContactEmail: project.customContactEmail || '',
      },
    }));
  };

  const updateContactDraft = (projectId, field, value) => {
    setContactDrafts((current) => ({
      ...current,
      [projectId]: {
        ...(current[projectId] || {}),
        [field]: value,
      },
    }));
  };

  const saveCustomContact = async (projectId) => {
    const draft = contactDrafts[projectId];
    if (!draft) return;
    setBusyId(`${projectId}:contact-edit`);
    setProjects((current) => current.map((item) => (
      item._id === projectId
        ? {
          ...item,
          contactDisplayMode: 'custom',
          useCustomContactDetails: true,
          customContactName: draft.customContactName,
          customContactPhone: draft.customContactPhone,
          customContactEmail: draft.customContactEmail,
        }
        : item
    )));

    try {
      await projectService.update(projectId, {
        contactDisplayMode: 'custom',
        useCustomContactDetails: true,
        customContactName: draft.customContactName,
        customContactPhone: draft.customContactPhone,
        customContactEmail: draft.customContactEmail,
      });
      setContactEditorId('');
    } catch (_error) {
      await load();
    } finally {
      setBusyId('');
    }
  };

  const setContactMode = async (projectId, nextMode) => {
    const project = projects.find((item) => item._id === projectId);
    if (!project) return;

    const currentMode = project.contactDisplayMode || (project.useCustomContactDetails ? 'custom' : 'original');
    if (currentMode === nextMode) return;
    if (nextMode === 'custom' && !hasCompleteCustomContact(project)) {
      openContactEditor(project);
      return;
    }

    setBusyId(`${projectId}:contact`);
    setProjects((current) => current.map((item) => (
      item._id === projectId ? { ...item, contactDisplayMode: nextMode, useCustomContactDetails: nextMode === 'custom' } : item
    )));

    try {
      await projectService.update(projectId, { contactDisplayMode: nextMode, useCustomContactDetails: nextMode === 'custom' });
    } catch (_error) {
      setProjects((current) => current.map((item) => (
        item._id === projectId ? { ...item, contactDisplayMode: currentMode, useCustomContactDetails: currentMode === 'custom' } : item
      )));
    } finally {
      setBusyId('');
    }
  };

  const deleteProject = (projectId, projectName) => {
    openConfirm({
      title: 'Delete project?',
      message: `This will permanently delete ${projectName ? `"${projectName}"` : 'this project'} and its media.`,
      confirmText: 'Delete',
      tone: 'danger',
      onConfirm: async () => {
        setBusyId(`${projectId}:delete`);
        try {
          await projectService.removeAdmin(projectId);
          await load();
        } finally {
          setBusyId('');
        }
      },
    });
  };

  const featuredCount = useMemo(() => projects.filter((item) => item.featuredOnHome).length, [projects]);
  const filteredProjects = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const filtered = projects.filter((project) => {
      if (statusFilter !== 'all' && project.projectStatus !== statusFilter) return false;
      if (!needle) return true;
      const haystack = [
        project.projectName,
        project.projectType,
        project.developerName,
        project.area,
        project.city,
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(needle);
    });

    const sorted = [...filtered];
    if (sortBy === 'name-asc') {
      sorted.sort((a, b) => String(a.projectName || '').localeCompare(String(b.projectName || '')));
    } else if (sortBy === 'name-desc') {
      sorted.sort((a, b) => String(b.projectName || '').localeCompare(String(a.projectName || '')));
    } else if (sortBy === 'price-asc') {
      sorted.sort((a, b) => Number(a.startingPrice || 0) - Number(b.startingPrice || 0));
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => Number(b.startingPrice || 0) - Number(a.startingPrice || 0));
    } else {
      sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return sorted;
  }, [projects, search, statusFilter, sortBy]);

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
        title="All Projects"
        subtitle="Manage project visibility, featured placement, and the contact information shown on project details pages."
        actions={(
          <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
            <Link to="/admin/add-project" className="admin-primary-btn"><PlusSquare className="w-4 h-4" /> Add Project</Link>
            <div className="admin-hero-pill">Featured Projects: {featuredCount}</div>
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
              placeholder="Search by project, developer, city..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="admin-filter-group">
            <span className="admin-filter-label">Status</span>
            <select className="admin-filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Under Construction">Under Construction</option>
              <option value="Ready to Move">Ready to Move</option>
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
          emptyMessage="No projects found."
          columns={[
            {
              key: 'projectName',
              label: 'Project',
              render: (row) => (
                <div className="admin-cell-stack">
                  <div className="admin-cell-title">{row.projectName}</div>
                  <div className="admin-cell-subtitle">{row.projectType} • {[row.area, row.city].filter(Boolean).join(', ')}</div>
                </div>
              ),
            },
            {
              key: 'developer',
              label: 'Developer / Contact',
              render: (row) => (
                <div className="admin-cell-stack">
                  <div>{row.developerName}</div>
                  <div className="admin-cell-subtitle">
                    Contact: {(() => {
                      const mode = row.contactDisplayMode || (row.useCustomContactDetails ? 'custom' : 'original');
                      if (mode === 'company') return 'Company contact';
                      if (mode === 'custom') return `${row.customContactName || '-'} - ${row.customContactPhone || '-'}`;
                      return `${row.contactPersonName || '-'} - ${row.phoneNumber || '-'}`;
                    })()}
                  </div>
                </div>
              ),
            },
            { key: 'status', label: 'Status', render: (row) => <span className="admin-table-badge success">{row.projectStatus}</span> },
            {
              key: 'approval',
              label: 'Approval',
              render: (row) => (
                <div className="admin-cell-stack">
                  <span className={`admin-table-badge ${row.status === 'approved' ? 'success' : row.status === 'rejected' ? 'danger' : row.status === 'archived' ? 'muted' : 'warning'}`}>
                    {row.status || 'pending'}
                  </span>
                  <select
                    className="admin-filter-select"
                    value={row.status || 'pending'}
                    onChange={(event) => updateApprovalStatus(row._id, event.target.value)}
                    disabled={busyId.startsWith(`${row._id}:status`)}
                  >
                    {approvalStatuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              ),
            },
            { key: 'price', label: 'Price', render: (row) => `${formatCompactPrice((row.startingPrice || 0) * (row.priceUnit === 'Crore' ? 10000000 : 100000))} - ${formatCompactPrice((row.endingPrice || 0) * (row.priceUnit === 'Crore' ? 10000000 : 100000))}` },
            {
              key: 'contactDisplay',
              label: 'Show Real Contact',
              render: (row) => {
                const mode = row.contactDisplayMode || (row.useCustomContactDetails ? 'custom' : 'original');
                const checked = mode === 'original';
                const isEditing = contactEditorId === row._id;
                const draft = contactDrafts[row._id] || {};
                return (
                  <div className="admin-cell-stack">
                    <ToggleSwitch
                      checked={checked}
                      onChange={(value) => toggleContactMode(row._id, value)}
                      label="Toggle real project contact"
                      disabled={busyId === `${row._id}:contact`}
                    />
                    {mode === 'company' ? (
                      <button
                        type="button"
                        className="admin-secondary-btn admin-secondary-btn-inline admin-contact-cta"
                        disabled={busyId === `${row._id}:contact`}
                        onClick={() => {
                          setContactMode(row._id, 'custom');
                          openContactEditor(row);
                        }}
                      >
                        Use custom contact
                      </button>
                    ) : null}
                    {mode === 'custom' ? (
                      <button
                        type="button"
                        className="admin-secondary-btn admin-secondary-btn-inline admin-contact-cta"
                        onClick={() => openContactEditor(row)}
                        disabled={busyId === `${row._id}:contact`}
                      >
                        {row.customContactName || row.customContactPhone || row.customContactEmail ? 'Edit custom contact' : 'Add custom contact'}
                      </button>
                    ) : null}
                    {isEditing ? (
                      <div className="admin-contact-editor">
                        <input
                          className="admin-contact-input"
                          type="text"
                          placeholder="Name"
                          value={draft.customContactName || ''}
                          onChange={(event) => updateContactDraft(row._id, 'customContactName', event.target.value)}
                        />
                        <input
                          className="admin-contact-input"
                          type="tel"
                          placeholder="Phone"
                          value={draft.customContactPhone || ''}
                          onChange={(event) => updateContactDraft(row._id, 'customContactPhone', event.target.value)}
                        />
                        <input
                          className="admin-contact-input"
                          type="email"
                          placeholder="Email"
                          value={draft.customContactEmail || ''}
                          onChange={(event) => updateContactDraft(row._id, 'customContactEmail', event.target.value)}
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
              render: (row) => <ToggleSwitch checked={row.visible !== false} onChange={(value) => toggleVisibility(row._id, value)} label="Toggle visibility" disabled={busyId === `${row._id}:visible`} />,
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <div className="admin-action-row">
                  <a
                    href={`/projects/${row.slug || row._id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-secondary-btn admin-secondary-btn-inline admin-icon-btn"
                    title="View project"
                    aria-label="View project"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                  <Link
                    to={`/admin/add-project?edit=${row._id}`}
                    className="admin-secondary-btn admin-secondary-btn-inline admin-icon-btn"
                    title="Edit project"
                    aria-label="Edit project"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    className={`admin-secondary-btn admin-secondary-btn-inline admin-feature-btn admin-icon-btn ${row.featuredOnHome ? 'is-featured' : ''}`}
                    onClick={() => toggleFeatured(row._id, !row.featuredOnHome)}
                    disabled={busyId === `${row._id}:featured` || row.status !== 'approved'}
                    title={row.featuredOnHome ? 'Remove from featured' : 'Feature on home'}
                    aria-label={row.featuredOnHome ? 'Remove from featured' : 'Feature on home'}
                  >
                    <Star className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="admin-danger-btn admin-icon-btn"
                    onClick={() => deleteProject(row._id, row.projectName)}
                    disabled={busyId === `${row._id}:delete`}
                    title="Delete project"
                    aria-label="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ),
            },
          ]}
          rows={filteredProjects.map((item) => ({ ...item, id: item._id }))}
        />
      </div>
    </div>
  );
}
