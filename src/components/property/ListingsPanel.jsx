import React, { useState } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import PropertyCard from './PropertyCard';

const listings = [
    {
        id: 1,
        title: 'House by the sea',
        location: 'Budva, Montenegro',
        beds: 4,
        baths: 2,
        sqft: 190,
        price: '190,000.00',
        image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 2,
        title: 'Apartment in a quiet area',
        location: 'Becici, Montenegro',
        beds: 2,
        baths: 1,
        sqft: 120,
        price: '130,000.00',
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 3,
        title: 'Cozy cottage',
        location: 'Budva, Montenegro',
        beds: 3,
        baths: 2,
        sqft: 170,
        price: '119,000.00',
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 4,
        title: 'Modern Villa with Pool',
        location: 'Sveti Stefan, Montenegro',
        beds: 5,
        baths: 4,
        sqft: 350,
        price: '850,000.00',
        image: 'https://images.unsplash.com/photo-1600607687931-cebf0746e50e?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 5,
        title: 'Penthouse Apartment',
        location: 'Budva, Montenegro',
        beds: 3,
        baths: 2,
        sqft: 155,
        price: '280,000.00',
        image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 6,
        title: 'Seaview Studio',
        location: 'Rafailovici, Montenegro',
        beds: 1,
        baths: 1,
        sqft: 45,
        price: '65,000.00',
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
        <div className="w-full h-full flex flex-col bg-background p-4 lg:p-6 overflow-y-auto scrollbar-hide">

            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-[1.3rem] font-bold text-gray-900 leading-tight mb-1">Active Advertisements</h1>
                    <p className="text-gray-500 text-sm">Prices do not include taxes and additional fees.</p>
                </div>

                {/* Controls Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

                    {/* Tabs */}
                    <div className="flex items-center space-x-1 bg-gray-100/80 p-1.5 rounded-xl border border-gray-200/60 shadow-inner">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.label;
                            return (
                                <button
                                    key={tab.label}
                                    onClick={() => setActiveTab(tab.label)}
                                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive
                                            ? 'bg-gray-900 text-white shadow-md'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                                        }`}
                                >
                                    {tab.label}
                                    {tab.count && (
                                        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-md ${isActive ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-500'}`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Sort Dropdown */}
                    <button className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm">
                        <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                        <span>Sort by: Default</span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 pb-10">
                {listings.map((listing) => (
                    <PropertyCard key={listing.id} {...listing} />
                ))}
            </div>
        </div>
    );
}
