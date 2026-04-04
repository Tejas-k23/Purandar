import React from 'react';

export default function StatsCard({ label, value, tone = 'var(--navy-blue)', accent = 'default' }) {
  return (
    <article className={`admin-stat-card admin-stat-card-${accent}`}>
      <div className="admin-stat-label">{label}</div>
      <div className="admin-stat-value" style={{ color: tone }}>{value}</div>
    </article>
  );
}

