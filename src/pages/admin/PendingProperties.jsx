import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import adminService from '../../services/adminService';
import AdminHeader from '../../components/admin/AdminHeader';
import DataTable from '../../components/admin/DataTable';
import Loader from '../../components/common/Loader';
import { formatCompactPrice } from '../../utils/formatPrice';

export default function PendingProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const response = await adminService.getProperties({ status: 'pending' });
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
    setBusyId(propertyId + status);
    try {
      await adminService.updatePropertyStatus(propertyId, status, moderationMessage);
      await load();
    } finally {
      setBusyId('');
    }
  };

  if (loading) return <Loader label="Loading pending properties..." />;

  return (
    <div className="admin-page">
      <AdminHeader title="Property Approval" subtitle="Approve or reject listings submitted by users and agents." />

      <div className="admin-panel-card">
        <div className="admin-panel-head">
          <div>
            <h2 className="admin-panel-title">Pending Listings</h2>
            <p className="admin-panel-subtitle">Each property is reviewed before becoming visible on the public site.</p>
          </div>
          <div className="admin-hero-pill">{properties.length} waiting</div>
        </div>

        <DataTable
          emptyMessage="No pending properties right now."
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
              label: 'Owner',
              render: (row) => (
                <div className="admin-cell-stack">
                  <div>{row.owner?.name || row.userName}</div>
                  <div className="admin-cell-subtitle">{row.owner?.email}</div>
                </div>
              ),
            },
            { key: 'price', label: 'Price', render: (row) => formatCompactPrice(row.price) },
            { key: 'createdAt', label: 'Submitted', render: (row) => new Date(row.createdAt).toLocaleDateString('en-IN') },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <div className="admin-action-row">
                  <a href={`/property/${row._id}`} target="_blank" rel="noreferrer" className="admin-secondary-btn admin-secondary-btn-inline">
                    <ExternalLink className="w-4 h-4" /> Preview
                  </a>
                  <button className="admin-primary-btn admin-primary-btn-inline" disabled={busyId === row._id + 'approved'} onClick={() => updateStatus(row._id, 'approved')}>
                    {busyId === row._id + 'approved' ? 'Approving...' : 'Approve'}
                  </button>
                  <button className="admin-danger-btn" disabled={busyId === row._id + 'rejected'} onClick={() => updateStatus(row._id, 'rejected')}>
                    {busyId === row._id + 'rejected' ? 'Rejecting...' : 'Reject'}
                  </button>
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
