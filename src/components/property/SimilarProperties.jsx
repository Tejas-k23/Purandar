import React from 'react';
import { MapPin, Bed, Ruler, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const similar = [
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80',
        price: '₹3,20,00,000',
        name: 'Modern Sea-Front Apartment',
        location: 'Kotor, Montenegro',
        beds: 3,
        area: '210 sqft',
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
        price: '₹5,80,00,000',
        name: 'Hilltop Heritage Mansion',
        location: 'Tivat, Montenegro',
        beds: 5,
        area: '480 sqft',
    },
    {
        id: 4,
        image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80',
        price: '₹2,75,00,000',
        name: 'Cozy Coastal Villa',
        location: 'Herceg Novi, Montenegro',
        beds: 2,
        area: '160 sqft',
    },
];

export default function SimilarProperties() {
    const navigate = useNavigate();

    return (
        <section className="pd-similar-section">
            {/* Divider */}
            <div className="pd-section-divider" />

            <div className="pd-similar-header">
                <h2 className="pd-similar-title">Similar Properties</h2>
                <a href="/buy" className="pd-similar-link" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    View all <ArrowRight size={14} />
                </a>
            </div>

            <div className="pd-similar-grid">
                {similar.map(p => (
                    <div
                        key={p.id}
                        className="pd-similar-card"
                        onClick={() => navigate(`/property/${p.id}`)}
                    >
                        <div className="pd-similar-card-img">
                            <img src={p.image} alt={p.name} />
                        </div>
                        <div className="pd-similar-card-body">
                            <div className="pd-similar-card-price">{p.price}</div>
                            <div className="pd-similar-card-name">{p.name}</div>
                            <div className="pd-similar-card-loc">
                                <MapPin size={12} color="var(--indigo-600)" />
                                {p.location}
                            </div>
                            <div className="pd-similar-card-meta">
                                <span>
                                    <Bed size={12} color="var(--indigo-600)" />
                                    {p.beds} Beds
                                </span>
                                <span>
                                    <Ruler size={12} color="var(--indigo-600)" />
                                    {p.area}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
