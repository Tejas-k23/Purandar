import React, { useState } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import PropertyCard from './PropertyCard';
import './ListingsPanel.css';

const listings = [
    {
        id: 1,
        title: 'Premium 3 BHK Flat',
        location: 'Saswad, Purandar',
        beds: 3,
        baths: 2,
        sqft: 1250,
        price: '45.50 Lac',
        isVerified: true,
        image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 2,
        title: 'Modern 2 BHK Apartment',
        location: 'Belsar, Purandar',
        beds: 2,
        baths: 2,
        sqft: 980,
        price: '32.00 Lac',
        isVerified: true,
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 3,
        title: 'Luxury Villa with Garden',
        location: 'Jejuri, Purandar',
        beds: 4,
        baths: 3,
        sqft: 2400,
        price: '1.15 Cr',
        isVerified: false,
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 4,
        title: 'Spacious 3 BHK Row House',
        location: 'Narayanpur, Purandar',
        beds: 3,
        baths: 3,
        sqft: 1850,
        price: '68.00 Lac',
        isVerified: true,
        image: 'https://images.unsplash.com/photo-1600607687931-cebf0746e50e?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 5,
        title: 'Prime Residential Plot',
        location: 'Saswad, Purandar',
        beds: 0,
        baths: 0,
        sqft: 2000,
        price: '28.50 Lac',
        isVerified: false,
        image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 6,
        title: 'Commercial Shop / Office',
        location: 'Market Yard, Saswad',
        beds: 0,
        baths: 1,
        sqft: 450,
        price: '35.00 Lac',
        isVerified: true,
        image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800'
    }
];

export default function ListingsPanel() {
    const [activeTab, setActiveTab] = useState('All');

    const tabs = [
        { label: 'All', count: '' },
        { label: 'Sale', count: '1200' },
        { label: 'Long-term rent', count: '890' }
    ];

    return (
        <div className="listings-panel scrollbar-hide">

            {/* Header section */}
            <div className="listings-header">
                <div className="header-text-group">
                    <h1>Properties in Purandar, Pune</h1>
                    <p className="listing-count-subtitle">
                        <span className="count-highlight">{listings.length * 15}</span> Properties found
                    </p>
                </div>

                {/* Controls Row */}
                <div className="listings-controls">
                    {/* Tabs */}
                    <div className="listings-tabs-container">
                        <div className="listings-tabs">
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab.label;
                                return (
                                    <button
                                        key={tab.label}
                                        onClick={() => setActiveTab(tab.label)}
                                        className={`tab-button ${isActive ? 'active' : ''}`}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sort Dropdown */}
                    <button className="btn-sort">
                        <SlidersHorizontal className="w-4 h-4" />
                        <span>Sort: Newest</span>
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="listings-grid">
                {listings.map((listing) => (
                    <PropertyCard key={listing.id} {...listing} />
                ))}
            </div>
        </div>
    );
}
