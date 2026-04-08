import React, { useEffect, useMemo, useState } from 'react';
import { Mail, MessageSquareMore } from 'lucide-react';
import { Link } from 'react-router-dom';
import userService from '../../services/userService';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import './MyEnquiries.css';

const formatLeadType = (leadType) => {
  if (leadType === 'seller_detail') return 'Seller Details';
  if (leadType === 'whatsapp') return 'WhatsApp';
  return 'Enquiry';
};

export default function MyEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await userService.getMyEnquiries();
        setEnquiries(response.data.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const rows = useMemo(() => enquiries.map((item) => ({
    ...item,
    id: item._id,
    source: item.project ? 'Project' : (item.property ? 'Property' : 'Lead'),
  })), [enquiries]);

  if (loading) return <Loader label="Loading your enquiries..." />;

  return (
    <div className="profile-page my-enquiries-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Enquiries</h1>
          <p className="page-subtitle">Track your enquiries and seller-detail requests.</p>
        </div>
      </div>

      {!rows.length ? (
        <EmptyState title="No enquiries yet." description="Your enquiries will appear here once you contact a property or project." />
      ) : (
        <div className="my-enquiries-list">
          {rows.map((row) => {
            const target = row.property?.title || row.project?.projectName || 'Listing';
            const link = row.property
              ? `/property/${row.property._id}`
              : row.project
                ? `/projects/${row.project.slug || row.project._id}`
                : '#';
            return (
              <article key={row.id} className="my-enquiry-card">
                <div className="my-enquiry-header">
                  <div className="my-enquiry-title">
                    <span className="my-enquiry-badge">{row.source}</span>
                    <Link to={link} className="my-enquiry-link">{target}</Link>
                  </div>
                  <span className={`my-enquiry-status ${row.status || 'new'}`}>{row.status || 'new'}</span>
                </div>
                <div className="my-enquiry-meta">
                  <span className="my-enquiry-type"><MessageSquareMore size={14} /> {formatLeadType(row.leadType)}</span>
                  <span className="my-enquiry-date">{new Date(row.createdAt).toLocaleString('en-IN')}</span>
                </div>
                <p className="my-enquiry-message">{row.message || 'No message provided.'}</p>
                <div className="my-enquiry-contact">
                  <span><Mail size={14} /> {row.email || row.user?.email || '-'}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
