import React, { useEffect, useMemo, useState } from 'react';
import { FileDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import AdminHeader from '../../components/admin/AdminHeader';
import DataTable from '../../components/admin/DataTable';
import Loader from '../../components/common/Loader';

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

const formatLeadType = (leadType) => {
  if (leadType === 'seller_detail') return 'Seller Details';
  if (leadType === 'whatsapp') return 'WhatsApp';
  return 'Enquiry';
};

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leadFilter, setLeadFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await adminService.getEnquiries();
        setEnquiries(response.data.data || []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const rows = useMemo(() => enquiries.map((item) => ({ ...item, id: item._id })), [enquiries]);

  const filteredRows = useMemo(() => rows.filter((row) => {
    const leadMatch = leadFilter === 'all' || row.leadType === leadFilter;
    const source = row.project ? 'project' : (row.property ? 'property' : 'unknown');
    const sourceMatch = sourceFilter === 'all' || source === sourceFilter;
    return leadMatch && sourceMatch;
  }), [rows, leadFilter, sourceFilter]);

  const exportCsv = () => {
    const header = ['Type', 'User Name', 'User Phone', 'User Email', 'Message', 'Property/Project', 'Status', 'Created'];
    const body = enquiries.map((item) => [
      formatLeadType(item.leadType),
      item.user?.name || item.name || '',
      item.user?.phone || item.phone || '',
      item.user?.email || item.email || '',
      item.message || '',
      item.property?.title || item.project?.projectName || '-',
      item.status || 'new',
      new Date(item.createdAt).toLocaleString('en-IN'),
    ].map(escapeCsv).join(','));

    downloadBlob([header.join(','), ...body].join('\n'), 'admin-enquiries.csv', 'text/csv;charset=utf-8;');
  };

  if (loading) return <Loader label="Loading enquiries..." />;

  return (
    <div className="admin-page">
      <AdminHeader
        title="Enquiries"
        subtitle="View users who requested seller details and general enquiries."
        actions={(
          <button type="button" className="admin-primary-btn" onClick={exportCsv}>
            <FileDown className="w-4 h-4" /> Export CSV
          </button>
        )}
      />

      <div className="admin-panel-card" style={{ marginBottom: 16 }}>
        <div className="admin-filter-row">
          <div className="admin-filter-group">
            <span className="admin-filter-label">Type</span>
            <div className="admin-filter-chips">
              {['all', 'seller_detail', 'whatsapp', 'enquiry'].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`admin-filter-chip ${leadFilter === value ? 'active' : ''}`}
                  onClick={() => setLeadFilter(value)}
                >
                  {value === 'all' ? 'All' : formatLeadType(value)}
                </button>
              ))}
            </div>
          </div>
          <div className="admin-filter-group">
            <span className="admin-filter-label">Source</span>
            <div className="admin-filter-chips">
              {['all', 'property', 'project'].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`admin-filter-chip ${sourceFilter === value ? 'active' : ''}`}
                  onClick={() => setSourceFilter(value)}
                >
                  {value === 'all' ? 'All' : value.charAt(0).toUpperCase() + value.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-panel-card">
        <DataTable
          emptyMessage="No enquiries found."
          columns={[
            { key: 'leadType', label: 'Type', render: (row) => <span className="admin-table-badge">{formatLeadType(row.leadType)}</span> },
            { key: 'userName', label: 'User', render: (row) => row.user?.name || row.name || '-' },
            { key: 'userPhone', label: 'Phone', render: (row) => row.user?.phone || row.phone || '-' },
            { key: 'userEmail', label: 'Email', render: (row) => row.user?.email || row.email || '-' },
            { key: 'message', label: 'Message', render: (row) => row.message || '-' },
            {
              key: 'target',
              label: 'Property/Project',
              render: (row) => {
                if (row.property) {
                  return <Link to={`/property/${row.property._id}`} className="admin-table-link">{row.property.title || 'Property'}</Link>;
                }
                if (row.project) {
                  const slug = row.project.slug || row.project._id;
                  return <Link to={`/projects/${slug}`} className="admin-table-link">{row.project.projectName || 'Project'}</Link>;
                }
                return '-';
              },
            },
            { key: 'status', label: 'Status', render: (row) => <span className={`admin-table-badge ${row.status === 'closed' ? 'muted' : 'success'}`}>{row.status}</span> },
            { key: 'createdAt', label: 'Created', render: (row) => new Date(row.createdAt).toLocaleString('en-IN') },
          ]}
          rows={filteredRows}
        />
      </div>
    </div>
  );
}
