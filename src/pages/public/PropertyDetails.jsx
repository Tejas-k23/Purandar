import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Share2, Heart, ShieldCheck, ChevronRight,
    TrendingUp, Phone
} from 'lucide-react';
import PropertyGallery from '../../components/property/PropertyGallery';
import PropertyTitleSection from '../../components/property/PropertyTitleSection';
import PropertyStatsBar from '../../components/property/PropertyStatsBar';
import PropertyDescription from '../../components/property/PropertyDescription';
import PropertyInfoPanel from '../../components/property/PropertyInfoPanel';
import PropertyMap from '../../components/property/PropertyMap';
import SimilarProperties from '../../components/property/SimilarProperties';
import './PropertyDetails.css';

/* ─── Mock data that mirrors the PostProperty form shape ─────────────── */
const mockProperty = {
    // Step 1 — Basic
    intent: 'sell',
    category: 'residential',
    propertyType: 'Flat / Apartment',

    // Step 2 — Location
    city: 'Pune',
    locality: 'Koregaon Park',
    subLocality: 'Lane 5',
    landmark: 'Osho Ashram',
    flatNo: 'B-402',
    totalFloors: '12',
    floorNo: '4',

    // Step 3 — Property Profile
    bedrooms: '4',
    bathrooms: '3',
    balconies: '2',
    totalArea: '320',
    areaUnit: 'sq.ft',
    carpetArea: '275',
    plotArea: '',
    furnishing: 'Semi-Furnished',
    availability: 'Ready to Move',
    possessionMonth: '',
    possessionYear: '',
    propertyAge: '1-5',
    ownership: 'Freehold',
    price: '45000000',
    priceNegotiable: true,
    securityDeposit: '',
    maintenance: '8500',

    // Step 5 — Amenities
    societyAmenities: [
        'Lift', 'CCTV', 'Security', 'Gymnasium', 'Swimming Pool',
        'Club House', 'Power Backup', 'Visitor Parking', 'Garden',
        "Children's Play Area", 'Gas Pipeline', 'Rain Water Harvesting',
    ],
    flatAmenities: [
        'Air Conditioner', 'Modular Kitchen', 'Geyser', 'RO System',
        'Intercom', 'WiFi',
    ],
    facing: 'North-East',
    overlooking: ['Garden', 'Pool'],
    waterSupply: 'Corporation',
    gatedCommunity: 'Yes',
};

export default function PropertyDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div className="pd-page">
            {/* Breadcrumb */}
            <div className="pd-breadcrumb-bar">
                <nav className="pd-breadcrumb">
                    <Link to="/">Home</Link>
                    <span className="pd-breadcrumb-sep"><ChevronRight size={12} /></span>
                    <Link to="/buy">Buy</Link>
                    <span className="pd-breadcrumb-sep"><ChevronRight size={12} /></span>
                    <span className="pd-breadcrumb-current">Luxury Villa by the Sea</span>
                </nav>
            </div>

            <div className="pd-layout">
                {/* ─── Left Column ─────────────────────── */}
                <div className="pd-main">
                    <button onClick={() => navigate(-1)} className="pd-back-btn">
                        <ArrowLeft size={16} />
                        <span>Back to listings</span>
                    </button>

                    {/* Gallery */}
                    <PropertyGallery />

                    {/* Title */}
                    <div className="pd-card pd-delay-1">
                        <PropertyTitleSection property={mockProperty} />
                    </div>

                    {/* Key Stats */}
                    <div className="pd-card pd-delay-2">
                        <PropertyStatsBar property={mockProperty} />
                    </div>

                    {/* Description */}
                    <div className="pd-card pd-delay-3">
                        <PropertyDescription property={mockProperty} />
                    </div>

                    {/* ── Property Details (all form fields) ── */}
                    <div className="pd-card pd-delay-4">
                        <PropertyInfoPanel property={mockProperty} />
                    </div>

                    {/* Map */}
                    <div className="pd-card pd-delay-5">
                        <PropertyMap property={mockProperty} />
                    </div>
                </div>

                {/* ─── Right Sidebar ────────────────────── */}
                <div className="pd-sidebar">
                    {/* Price Card */}
                    <div className="pd-price-card pd-delay-1">
                        <div className="pd-price-header">
                            <div>
                                <div className="pd-price-label">Full Price</div>
                                <div className="pd-price-amount">
                                    ₹4,50,00,000<span>.00</span>
                                </div>
                                <div className="pd-price-per-sqft">₹14,063 / sq ft &nbsp;·&nbsp; Negotiable</div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="pd-icon-btn">
                                    <Share2 size={18} />
                                </button>
                                <button className="pd-icon-btn pd-icon-btn--heart">
                                    <Heart size={18} />
                                </button>
                            </div>
                        </div>

                        {/* EMI Mini */}
                        <div className="pd-emi-row">
                            <div className="pd-emi-info">
                                <span className="pd-emi-label">Est. EMI</span>
                                <span className="pd-emi-value">₹35,420/mo</span>
                            </div>
                            <div className="pd-emi-details">
                                20 yrs · 8.5% p.a.
                            </div>
                        </div>

                        <div className="pd-cta-group">
                            <button className="pd-cta-primary">
                                Buy Full Property
                            </button>
                            <button className="pd-cta-secondary">
                                Invest in Fractions
                            </button>
                        </div>

                        <div className="pd-trust">
                            <div className="pd-trust-badge">
                                <div className="pd-trust-icon">
                                    <ShieldCheck size={16} />
                                </div>
                                <span className="pd-trust-label">Verified on Blockchain</span>
                            </div>
                            <p className="pd-trust-text">
                                Every property on Purandar is fully vetted, legally protected,
                                and tokenized on the Ethereum blockchain for transparency.
                            </p>
                        </div>
                    </div>

                    {/* Contact Card */}
                    <div className="pd-contact-card pd-delay-2">
                        <h3>Want to learn more?</h3>
                        <p>Chat with our real estate experts about this property and investment opportunities.</p>
                        <button className="pd-contact-btn">
                            <Phone size={16} />
                            Contact Agent
                        </button>
                    </div>

                    {/* Investment Highlights */}
                    <div className="pd-highlights-card pd-delay-3">
                        <h3>
                            <TrendingUp size={18} color="var(--indigo-600)" />
                            Investment Highlights
                        </h3>
                        <div className="pd-highlight-item">
                            <div className="pd-highlight-dot" />
                            <span className="pd-highlight-text">Property value appreciated 12.4% YoY in this locality</span>
                        </div>
                        <div className="pd-highlight-item">
                            <div className="pd-highlight-dot" />
                            <span className="pd-highlight-text">Rental yield of 3.8% — higher than city average</span>
                        </div>
                        <div className="pd-highlight-item">
                            <div className="pd-highlight-dot" />
                            <span className="pd-highlight-text">Upcoming metro connectivity within 1.5 km radius</span>
                        </div>
                        <div className="pd-highlight-item">
                            <div className="pd-highlight-dot" />
                            <span className="pd-highlight-text">Smart home features add 8–10% resale premium</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Similar Properties */}
            <SimilarProperties />

            {/* Mobile Fixed CTA */}
            <div className="pd-mobile-cta">
                <div className="pd-m-cta-price">
                    <div className="pd-m-cta-label">Total Price</div>
                    <div className="pd-m-cta-amount">₹4.50 Cr</div>
                </div>
                <button className="pd-m-cta-btn">
                    <Phone size={16} />
                    <span>Contact Agent</span>
                </button>
            </div>
        </div>
    );
}
