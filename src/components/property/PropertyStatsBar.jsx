import React from 'react';
import { Bed, Bath, Ruler, CalendarDays } from 'lucide-react';

export default function PropertyStatsBar({ property = {} }) {
    const {
        bedrooms = '0',
        bathrooms = '0',
        totalArea = '0',
        areaUnit = 'sq.ft',
        propertyAge = 'N/A'
    } = property;

    const stats = [
        { icon: Bed, label: 'Bedrooms', value: `${bedrooms}` },
        { icon: Bath, label: 'Bathrooms', value: `${bathrooms}` },
        { icon: Ruler, label: 'Area', value: `${totalArea} ${areaUnit}` },
        { icon: CalendarDays, label: 'Age', value: `${propertyAge} yrs` },
    ];

    return (
        <div className="pd-stats-grid">
            {stats.map(({ icon: Icon, label, value }, i) => (
                <div key={i} className="pd-stat">
                    <div className="pd-stat-icon">
                        <Icon size={18} strokeWidth={1.8} />
                    </div>
                    <span className="pd-stat-value">{value}</span>
                    <span className="pd-stat-label">{label}</span>
                </div>
            ))}
        </div>
    );
}
