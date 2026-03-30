import React from 'react';
import { MapPin, Star } from 'lucide-react';

export default function PropertyTitleSection({ property = {} }) {
    const {
        propertyType = 'Flat / Apartment',
        bedrooms = '',
        locality = 'Unknown Locality',
        subLocality = '',
        city = 'Unknown City',
        flatAmenities = [],
        overlooking = [],
    } = property;

    const title = bedrooms ? `${bedrooms} BHK ${propertyType}` : propertyType;
    const locationStr = [subLocality, locality, city].filter(Boolean).join(', ');
    
    // Use some amenities as tags
    const tags = [...flatAmenities.slice(0, 3), ...overlooking.slice(0, 2), 'Verified'];

    return (
        <div>
            <div className="pd-title-row">
                <div className="pd-title">
                    <h1>{title}</h1>
                    <div className="pd-title-meta">
                        <div className="pd-location">
                            <MapPin size={15} />
                            <span>{locationStr}</span>
                        </div>
                        <div className="pd-rating">
                            <Star size={14} className="pd-rating-star" fill="#f0b429" />
                            <span className="pd-rating-value">4.9</span>
                            <span className="pd-rating-count">(48 reviews)</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pd-tags">
                {tags.map(tag => (
                    <span key={tag} className="pd-tag">{tag}</span>
                ))}
            </div>
        </div>
    );
}
