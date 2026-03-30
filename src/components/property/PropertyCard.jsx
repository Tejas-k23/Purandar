import React, { useState } from 'react';
import { MapPin, ArrowUpRight, Heart, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './PropertyCard.css';

export default function PropertyCard({ id, image, title, location, beds, baths, sqft, price, isVerified }) {
    const navigate = useNavigate();
    const [isSaved, setIsSaved] = useState(false);

    return (
        <div className="property-card" onClick={() => navigate(`/property/${id}`)}>
            <div className="property-image-container">
                <img
                    src={image}
                    alt={title}
                    className="property-image"
                />
                
                {/* Badges & Actions Overlay */}
                <div className="card-top-overlay">
                    {isVerified && (
                        <div className="verified-badge">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verified</span>
                        </div>
                    )}
                    <button 
                        className={`save-btn ${isSaved ? 'saved' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsSaved(!isSaved);
                        }}
                    >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                </div>

                <div className="property-overlay-icon">
                    <ArrowUpRight className="w-4 h-4 text-gray-900" />
                </div>
            </div>

            <div className="property-details">
                <div className="price-tag">
                    <span className="price-currency">₹</span>
                    <span className="price-value">{price}</span>
                </div>

                <h3 className="property-title">{title}</h3>
                
                <div className="property-location">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{location}</span>
                </div>

                <div className="property-features">
                    {beds > 0 && (
                        <>
                            <span className="feature-item"><span className="feature-val">{beds}</span> BHK</span>
                            <span className="feature-dot">•</span>
                        </>
                    )}
                    <span className="feature-item"><span className="feature-val">{sqft}</span> sqft</span>
                </div>
            </div>
        </div>
    );
}
