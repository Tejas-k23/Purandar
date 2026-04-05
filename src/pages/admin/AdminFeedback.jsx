import React, { useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import DataTable from '../../components/admin/DataTable';
import Loader from '../../components/common/Loader';
import adminService from '../../services/adminService';

const formatRating = (rating = 0) => '★'.repeat(Number(rating) || 0);

export default function AdminFeedback() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const response = await adminService.getFeedback();
      setItems(response.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(() => items.map((item) => ({ ...item, id: item._id })), [items]);

  const filteredRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) => {
      const haystack = [
        row.project?.projectName,
        row.name,
        row.feedback,
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(needle);
    });
  }, [rows, search]);

  const deleteItem = async (feedbackId) => {
    const confirmed = window.confirm('Delete this feedback?');
    if (!confirmed) return;
    setBusyId(feedbackId);
    try {
      await adminService.deleteFeedback(feedbackId);
      await load();
    } finally {
      setBusyId('');
    }
  };

  if (loading) return <Loader label="Loading feedback..." />;

  return (
    <div className="admin-page">
      <AdminHeader
        title="Project Feedback"
        subtitle="All ratings and short reviews submitted for projects."
        actions={(
          <div className="admin-filter-group">
            <span className="admin-filter-label">Search</span>
            <input
              className="admin-filter-input"
              type="text"
              placeholder="Search by project, user, or feedback..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        )}
      />

      <div className="admin-panel-card">
        <DataTable
          emptyMessage="No feedback found."
          columns={[
            { key: 'project', label: 'Project', render: (row) => row.project?.projectName || 'Project' },
            { key: 'name', label: 'User', render: (row) => row.name || row.user?.name || '-' },
            { key: 'rating', label: 'Rating', render: (row) => <span className="admin-table-badge">{formatRating(row.rating)}</span> },
            { key: 'feedback', label: 'Feedback', render: (row) => row.feedback || '-' },
            { key: 'createdAt', label: 'Created', render: (row) => new Date(row.createdAt).toLocaleString('en-IN') },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <button
                  type="button"
                  className="admin-danger-btn admin-icon-btn"
                  onClick={() => deleteItem(row._id)}
                  disabled={busyId === row._id}
                  title="Delete feedback"
                  aria-label="Delete feedback"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ),
            },
          ]}
          rows={filteredRows}
        />
      </div>
    </div>
  );
}
