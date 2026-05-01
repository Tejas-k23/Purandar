import React, { useEffect, useMemo, useState } from 'react';
import { Download, FileDown, Trash2 } from 'lucide-react';
import adminService from '../../services/adminService';
import AdminHeader from '../../components/admin/AdminHeader';
import DataTable from '../../components/admin/DataTable';
import Loader from '../../components/common/Loader';
import ConfirmModal from '../../components/common/ConfirmModal';

const escapeCsv = (value) => {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const downloadBlob = (content, filename, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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
    try {
      const response = await adminService.getUsers();
      setUsers(response.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(() => users.map((user) => ({ ...user, id: user._id })), [users]);

  const exportExcel = () => {
    const header = ['Name', 'Phone', 'Email', 'Role', 'Status', 'Joined'];
    const body = users.map((user) => [
      user.name,
      user.phone || '',
      user.email,
      user.role,
      user.isActive ? 'Active' : 'Inactive',
      new Date(user.createdAt).toLocaleDateString('en-IN'),
    ].map(escapeCsv).join(','));

    downloadBlob([header.join(','), ...body].join('\n'), 'admin-users.csv', 'text/csv;charset=utf-8;');
  };

  const exportPdf = () => {
    const rowsHtml = users.map((user) => `
      <tr>
        <td>${user.name}</td>
        <td>${user.phone || '-'}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>${user.isActive ? 'Active' : 'Inactive'}</td>
      </tr>
    `).join('');

    const popup = window.open('', '_blank', 'width=1000,height=700');
    if (!popup) return;

    popup.document.write(`
      <html>
        <head>
          <title>Admin Users</title>
          <style>
            body{font-family:Arial,sans-serif;padding:24px;color:var(--navy-blue)}
            h1{margin-bottom:8px}
            p{color:var(--gray-600);margin-bottom:20px}
            table{width:100%;border-collapse:collapse}
            th,td{border:1px solid var(--gray-300);padding:10px;text-align:left;font-size:13px}
            th{background:var(--warm-white)}
          </style>
        </head>
        <body>
          <h1>Purandar Prime Properties Admin Users</h1>
          <p>Total users: ${users.length}</p>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  if (loading) return <Loader label="Loading users..." />;

  return (
    <div className="admin-page">
      <AdminHeader
        title="Users"
        subtitle="View all registered users with their phone numbers and export the list for operations use."
        actions={
          <>
            <button type="button" className="admin-secondary-btn" onClick={exportExcel}><Download className="w-4 h-4" /> Excel</button>
            <button type="button" className="admin-primary-btn" onClick={exportPdf}><FileDown className="w-4 h-4" /> PDF</button>
          </>
        }
      />

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

      <div className="admin-panel-card">
        <DataTable
          emptyMessage="No users found."
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'phone', label: 'Phone', render: (row) => row.phone || '-' },
            { key: 'email', label: 'Email' },
            { key: 'role', label: 'Role', render: (row) => <span className="admin-table-badge">{row.role}</span> },
            { key: 'status', label: 'Status', render: (row) => <span className={`admin-table-badge ${row.isActive ? 'success' : 'muted'}`}>{row.isActive ? 'Active' : 'Inactive'}</span> },
            { key: 'createdAt', label: 'Joined', render: (row) => new Date(row.createdAt).toLocaleDateString('en-IN') },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <button
                  type="button"
                  className="admin-danger-btn admin-icon-btn"
                  onClick={() => openConfirm({
                    title: 'Delete user?',
                    message: `This will permanently delete ${row.name || 'this user'} and remove their listings.`,
                    confirmText: 'Delete',
                    tone: 'danger',
                    onConfirm: async () => {
                      await adminService.deleteUser(row._id);
                      await load();
                    },
                  })}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ),
            },
          ]}
          rows={rows}
        />
      </div>
    </div>
  );
}

