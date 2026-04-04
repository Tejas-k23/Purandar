import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock3 } from 'lucide-react';
import adminService from '../../services/adminService';
import AdminHeader from '../../components/admin/AdminHeader';
import StatsCard from '../../components/admin/StatsCard';
import Loader from '../../components/common/Loader';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await adminService.getDashboard();
        setData(response.data.data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <Loader label="Loading admin dashboard..." />;

  return (
    <div className="admin-page">
      <AdminHeader
        title="Admin Dashboard"
        subtitle="Review platform health, moderation pressure, and listing activity from one place."
        actions={<Link to="/admin/properties/pending" className="admin-primary-btn">Open Approval Queue <ArrowRight className="w-4 h-4" /></Link>}
      />

      <section className="admin-stats-grid">
        <StatsCard label="Users" value={data?.totals?.users || 0} accent="blue" />
        <StatsCard label="Properties" value={data?.totals?.properties || 0} accent="slate" />
        <StatsCard label="Enquiries" value={data?.totals?.enquiries || 0} accent="violet" />
        <StatsCard label="Featured Homes" value={data?.totals?.featuredHomes || 0} accent="emerald" tone="var(--navy-blue)" />
        <StatsCard label="Pending Approval" value={data?.propertiesByStatus?.pending || 0} tone="var(--orange)" accent="amber" />
      </section>

      <section className="admin-hero-card">
        <div>
          <div className="admin-section-kicker"><Clock3 className="w-4 h-4" /> Moderation Queue</div>
          <h2 className="admin-section-title">Pending listings need a quick review before going live.</h2>
          <p className="admin-section-text">Keep the marketplace clean by approving complete listings and rejecting low-quality or incomplete submissions.</p>
        </div>
        <div className="admin-hero-meta">
          <div className="admin-hero-pill">Pending: {data?.propertiesByStatus?.pending || 0}</div>
          <div className="admin-hero-pill">Approved: {data?.propertiesByStatus?.approved || 0}</div>
          <div className="admin-hero-pill">Featured: {data?.totals?.featuredHomes || 0}</div>
        </div>
      </section>
    </div>
  );
}

