import React from 'react';
import { Bed, Bath, Ruler, CalendarDays } from 'lucide-react';

export default function PropertyStatsBar({ property = {} }) {
  const stats = [
    ...(property.bedrooms ? [{ icon: Bed, label: 'Bedrooms', value: property.bedrooms }] : []),
    ...(property.bathrooms ? [{ icon: Bath, label: 'Bathrooms', value: property.bathrooms }] : []),
    { icon: Ruler, label: 'Area', value: `${property.totalArea || property.plotArea || property.carpetArea || '-'} ${property.areaUnit || 'sq.ft'}` },
    { icon: CalendarDays, label: 'Availability', value: property.availability || property.propertyAge || 'Ready' },
  ];

  return (
    <div className="pd-stats-grid">
      {stats.map(({ icon: Icon, label, value }) => (
        <div key={label} className="pd-stat">
          <div className="pd-stat-icon"><Icon size={18} strokeWidth={1.8} /></div>
          <span className="pd-stat-value">{value}</span>
          <span className="pd-stat-label">{label}</span>
        </div>
      ))}
    </div>
  );
}

