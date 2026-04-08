import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, Bookmark, Building2, Clock3, MessageSquareMore, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import userService from '../../services/userService';
import propertyService from '../../services/propertyService';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import './Dashboard.css';

const formatDate = (value) => new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
}).format(new Date(value));

export default function Dashboard() {
  const { user, savedProperties } = useAuth();
  const [properties, setProperties] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [propertiesResponse, enquiriesResponse, statsResponse] = await Promise.all([
          userService.getMyProperties(),
          userService.getMyEnquiries(),
          propertyService.getMyStats(),
        ]);

        const data = propertiesResponse.data.data || [];
        const propertyList = Array.isArray(data) ? data : (data.properties || []);
        setProperties(propertyList);
        setEnquiries(enquiriesResponse.data.data || []);
        setStats(statsResponse.data.data || null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const sellerDetailLeads = useMemo(() => enquiries.filter((enquiry) => (
    enquiry.leadType === 'seller_detail' && String(enquiry.propertyOwner) === String(user?._id)
  )), [enquiries, user?._id]);

  const metrics = useMemo(() => {
    const liveListings = properties.filter((property) => property.status === 'approved').length;
    const pendingListings = properties.filter((property) => property.status === 'pending').length;
    const totalViews = stats?.totalViews || 0;
    const totalSellerLeads = stats?.sellerDetailLeads || 0;
    const newSellerLeads = stats?.newSellerDetailLeads || 0;

    return [
      {
        label: 'Property Views',
        value: totalViews,
        icon: TrendingUp,
        hint: 'Total detail-page views across your active listings',
      },
      {
        label: 'Leads',
        value: totalSellerLeads,
        icon: MessageSquareMore,
        hint: `${newSellerLeads} new seller-detail lead${newSellerLeads === 1 ? '' : 's'}`,
      },
      {
        label: 'Live Listings',
        value: liveListings,
        icon: Building2,
        hint: `${pendingListings} pending approval`,
      },
      {
        label: 'Saved',
        value: savedProperties.length,
        icon: Bookmark,
        hint: 'Properties you have bookmarked',
      },
    ];
  }, [properties, savedProperties.length, stats]);

  const recentSellerLeads = useMemo(() => sellerDetailLeads.slice(0, 5), [sellerDetailLeads]);

  if (loading) return <Loader label="Loading dashboard..." />;

  return (
    <div className="profile-page dashboard-page">
      <div className="dashboard-hero">
        <div>
          <p className="dashboard-eyebrow">Dashboard</p>
          <h1 className="page-title">Welcome back, {user?.name || 'User'}</h1>
          <p className="page-subtitle">Monitor listing views, seller-detail leads, and account activity from one place.</p>
        </div>
        <div className="dashboard-hero-actions">
          <Link to="/profile" className="profile-action-btn profile-action-btn-secondary">Edit Profile</Link>
          <Link to="/post-property" className="profile-action-btn profile-action-btn-primary">Post New Property</Link>
        </div>
      </div>

      <div className="dashboard-stats-grid">
        {metrics.map(({ label, value, icon: Icon, hint }) => (
          <article key={label} className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              <Icon className="w-5 h-5" />
            </div>
            <div className="dashboard-stat-value">{value}</div>
            <div className="dashboard-stat-label">{label}</div>
            <p className="dashboard-stat-hint">{hint}</p>
          </article>
        ))}
      </div>

      <div className="dashboard-content-grid">
        <section className="dashboard-panel">
          <div className="dashboard-panel-head">
            <div>
              <h2 className="dashboard-panel-title">Seller Detail Leads</h2>
              <p className="dashboard-panel-subtitle">Users who clicked the seller-details button on your listings.</p>
            </div>
            <span className="dashboard-inline-badge"><Clock3 className="w-4 h-4" /> Updated live</span>
          </div>

          {recentSellerLeads.length ? (
            <div className="dashboard-leads-list">
              {recentSellerLeads.map((lead) => (
                <article key={lead._id} className="dashboard-lead-card">
                  <div className="dashboard-lead-main">
                    <h3>{lead.property?.title || 'Property lead'}</h3>
                    <p>{lead.name} · {lead.email}</p>
                  </div>
                  <div className="dashboard-lead-meta">
                    <span className={`dashboard-status-badge ${lead.status}`}>{lead.status}</span>
                    <span>{formatDate(lead.createdAt)}</span>
                  </div>
                  <p className="dashboard-lead-message">Phone: {lead.phone || 'Not shared'} · Requested seller contact details.</p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="No seller-detail leads yet" description="When signed-in buyers request your contact details, they will appear here." />
          )}
        </section>

        <section className="dashboard-panel dashboard-panel-accent">
          <div className="dashboard-panel-head">
            <div>
              <h2 className="dashboard-panel-title">Quick Snapshot</h2>
              <p className="dashboard-panel-subtitle">A simple view of your listing momentum.</p>
            </div>
            <BarChart3 className="w-5 h-5" />
          </div>

          <div className="dashboard-snapshot-list">
            <div className="dashboard-snapshot-item">
              <span>Properties listed</span>
              <strong>{stats?.total || properties.length}</strong>
            </div>
            <div className="dashboard-snapshot-item">
              <span>Pending approvals</span>
              <strong>{stats?.pending || 0}</strong>
            </div>
            <div className="dashboard-snapshot-item">
              <span>Seller-detail leads</span>
              <strong>{stats?.sellerDetailLeads || 0}</strong>
            </div>
            <div className="dashboard-snapshot-item">
              <span>Total views</span>
              <strong>{stats?.totalViews || 0}</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}



