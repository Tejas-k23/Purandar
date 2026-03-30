import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function PropertyDescription({ property = {} }) {
    const [expanded, setExpanded] = useState(false);
    
    const {
        locality = 'this area',
        city = 'Pune',
        propertyType = 'property',
        bedrooms = '4'
    } = property;

    const fullText = `This exceptional ${bedrooms} BHK ${propertyType} is situated in the prime locality of ${locality}, ${city}. Designed with modern urban living in mind, it features high-quality finishes, spacious living areas, and an abundance of natural light. Residents enjoy premium amenities and a strategic location that offers excellent connectivity to major business hubs, educational institutions, and healthcare facilities. Whether you're looking for a comfortable family home or a high-yield investment opportunity, this property offers unmatched value in today's market.`;

    const shortText = fullText.slice(0, 240) + '...';

    return (
        <div>
            <h2 className="pd-section-title">About this property</h2>
            <p className="pd-description-text">
                {expanded ? fullText : shortText}
            </p>
            <button
                onClick={() => setExpanded(e => !e)}
                className="pd-read-more-btn"
            >
                {expanded ? (
                    <>Show less <ChevronUp size={14} /></>
                ) : (
                    <>Read more <ChevronDown size={14} /></>
                )}
            </button>
        </div>
    );
}
