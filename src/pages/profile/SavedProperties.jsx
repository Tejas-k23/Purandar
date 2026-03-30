import React from 'react';
import PropertyCard from '../../components/property/PropertyCard';
import './SavedProperties.css';

// Mock data for saved properties
const savedProperties = [
    {
        id: 1,
        title: "Modern 3 BHK in Wagholi",
        price: "75 L",
        location: "Wagholi, Pune East",
        beds: 3,
        baths: 3,
        sqft: "1,450",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        isVerified: true
    },
    {
        id: 2,
        title: "Premium Office Space",
        price: "1.2 Cr",
        location: "Baner, Pune West",
        beds: 0,
        baths: 2,
        sqft: "2,000",
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        isVerified: true
    }
];

export default function SavedProperties() {
    return (
        <div className="profile-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Saved Properties</h1>
                    <p className="page-subtitle">Properties you have marked as favourite.</p>
                </div>
            </div>

            {savedProperties.length > 0 ? (
                <div className="properties-grid">
                    {savedProperties.map((property) => (
                        <div key={property.id} className="saved-card-wrapper">
                            <PropertyCard {...property} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <p>You haven't saved any properties yet.</p>
                </div>
            )}
        </div>
    );
}
