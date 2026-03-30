import React from 'react';
import { MapPin, Edit, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import './MyProperties.css';

// Mock data for user's properties
const myProperties = [
    {
        id: 101,
        title: "2 BHK Apartment in Kothrud",
        price: "85 L",
        location: "Kothrud, Pune",
        status: "Active",
        views: 124,
        leads: 12,
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
        id: 102,
        title: "Commercial Shop near Station",
        price: "45 L",
        location: "Pune Station Road",
        status: "Pending Review",
        views: 0,
        leads: 0,
        image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    }
];

export default function MyProperties() {
    return (
        <div className="profile-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Properties</h1>
                    <p className="page-subtitle">Manage your listed properties and leads.</p>
                </div>
                <Link to="/post-property" className="btn btn-primary">
                    Post New Property
                </Link>
            </div>

            {myProperties.length > 0 ? (
                <div className="my-properties-list">
                    {myProperties.map((property) => (
                        <div key={property.id} className="my-property-card">
                            <div className="property-image-col">
                                <img src={property.image} alt={property.title} />
                                <span className={`status-badge ${property.status === 'Active' ? 'active' : 'pending'}`}>
                                    {property.status}
                                </span>
                            </div>
                            
                            <div className="property-info-col">
                                <div className="property-header">
                                    <h3 className="property-title">{property.title}</h3>
                                    <span className="property-price">₹ {property.price}</span>
                                </div>
                                
                                <div className="property-location">
                                    <MapPin className="w-4 h-4" />
                                    <span>{property.location}</span>
                                </div>

                                <div className="property-stats">
                                    <div className="stat-item">
                                        <span className="stat-label">Views:</span>
                                        <span className="stat-value">{property.views}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Leads:</span>
                                        <span className="stat-value">{property.leads}</span>
                                    </div>
                                </div>

                                <div className="property-actions">
                                    <button className="action-btn view-btn" title="View Details">
                                        <Eye className="w-4 h-4" /> View
                                    </button>
                                    <button className="action-btn edit-btn" title="Edit Property">
                                        <Edit className="w-4 h-4" /> Edit
                                    </button>
                                    <button className="action-btn delete-btn" title="Remove Property">
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <p>You haven't listed any properties yet.</p>
                    <Link to="/post-property" className="btn btn-primary mt-4">
                        Post Property
                    </Link>
                </div>
            )}
        </div>
    );
}
