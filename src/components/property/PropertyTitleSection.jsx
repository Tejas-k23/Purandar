import React, { useMemo } from 'react';
import { MapPin, Star } from 'lucide-react';

export default function PropertyTitleSection({ property = {} }) {
  const tags = useMemo(() => {
    const base = [
      property.intent === 'rent' ? 'For Rent' : 'For Sale',
      property.propertyType,
      ...(property.flatAmenities || []).slice(0, 2),
      ...(property.societyAmenities || []).slice(0, 1),
    ];

    return base.filter(Boolean);
  }, [property]);

  return (
    <div>
      <div className="pd-title-row">
        <div className="pd-title">
          <h1>{property.title || `${property.propertyType} in ${property.locality}`}</h1>
          <div className="pd-title-meta">
            <div className="pd-location">
              <MapPin size={15} />
              <span>{[property.subLocality, property.locality, property.city].filter(Boolean).join(', ')}</span>
            </div>
            <div className="pd-rating">
              <Star size={14} className="pd-rating-star" fill="var(--orange)" />
              <span className="pd-rating-value">4.8</span>
              <span className="pd-rating-count">MongoDB listing</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pd-tags">
        {tags.map((tag) => (
          <span key={tag} className="pd-tag">{tag}</span>
        ))}
      </div>
    </div>
  );
}


