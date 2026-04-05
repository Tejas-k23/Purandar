import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Pencil, PlusSquare, Star, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';
import DataTable from '../../components/admin/DataTable';
import ToggleSwitch from '../../components/common/ToggleSwitch';
import projectService from '../../services/projectService';
import { formatCompactPrice } from '../../utils/formatPrice';
import { hasCompanyContact } from '../../config/companyContact';

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [busyId, setBusyId] = useState('');

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

  const toggleContactMode = async (projectId, nextValue) => {
    const project = projects.find((item) => item._id === projectId);
    if (!project) return;

    const currentMode = project.contactDisplayMode || (project.useCustomContactDetails ? 'custom' : 'original');
    const nextMode = nextValue
      ? 'original'
      : currentMode !== 'original'
        ? currentMode
        : (hasCompanyContact ? 'company' : 'custom');

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

  const setContactMode = async (projectId, nextMode) => {
    const project = projects.find((item) => item._id === projectId);
    if (!project) return;

    const currentMode = project.contactDisplayMode || (project.useCustomContactDetails ? 'custom' : 'original');
    if (currentMode === nextMode) return;

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

  const deleteProject = async (projectId) => {
    if (!window.confirm('Delete this project permanently?')) return;
    setBusyId(`${projectId}:delete`);
    await projectService.remove(projectId);
    await load();
    setBusyId('');
  };

  const featuredCount = useMemo(() => projects.filter((item) => item.featuredOnHome).length, [projects]);

  return (
    <div className="admin-page">
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
            { key: 'price', label: 'Price', render: (row) => `${formatCompactPrice((row.startingPrice || 0) * (row.priceUnit === 'Crore' ? 10000000 : 100000))} - ${formatCompactPrice((row.endingPrice || 0) * (row.priceUnit === 'Crore' ? 10000000 : 100000))}` },
            {
              key: 'contactDisplay',
              label: 'Show Real Contact',
              render: (row) => {
                const mode = row.contactDisplayMode || (row.useCustomContactDetails ? 'custom' : 'original');
                const checked = mode === 'original';
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
                        className="admin-secondary-btn admin-secondary-btn-inline"
                        disabled={busyId === `${row._id}:contact`}
                        onClick={() => setContactMode(row._id, 'custom')}
                      >
                        Use custom contact
                      </button>
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
                  <a href={`/projects/${row.slug || row._id}`} target="_blank" rel="noreferrer" className="admin-secondary-btn admin-secondary-btn-inline"><Eye className="w-4 h-4" /> View</a>
                  <Link to={`/admin/add-project?edit=${row._id}`} className="admin-secondary-btn admin-secondary-btn-inline"><Pencil className="w-4 h-4" /> Edit</Link>
                  <button type="button" className={`admin-secondary-btn admin-secondary-btn-inline admin-feature-btn ${row.featuredOnHome ? 'is-featured' : ''}`} onClick={() => toggleFeatured(row._id, !row.featuredOnHome)} disabled={busyId === `${row._id}:featured`}>
                    <Star className="w-4 h-4" /> {row.featuredOnHome ? 'Unfeature' : 'Feature'}
                  </button>
                  <button type="button" className="admin-danger-btn" onClick={() => deleteProject(row._id)} disabled={busyId === `${row._id}:delete`}><Trash2 className="w-4 h-4" /> Delete</button>
                </div>
              ),
            },
          ]}
          rows={projects.map((item) => ({ ...item, id: item._id }))}
        />
      </div>
    </div>
  );
}
