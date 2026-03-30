import React, { useState } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import './MapPanel.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoidGVqYXNrdW1iaGFya2FyIiwiYSI6ImNtbjczZmFpNjA5aGcycHBkb241NjZxc3cifQ.WKiUvhVInqaURt9a24nZvw';

const mapLocations = [
    {
        id: 1,
        title: 'House by the sea',
        longitude: 18.8350,
        latitude: 42.2880,
        price: '$190,000.00',
        image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=150'
    },
    {
        id: 2,
        title: 'Apartment in a quiet area',
        longitude: 18.8700,
        latitude: 42.2820,
        price: '$130,000.00',
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=150'
    },
    {
        id: 3,
        title: 'Cozy cottage',
        longitude: 18.8450,
        latitude: 42.2950,
        price: '$119,000.00',
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=150'
    },
    {
        id: 4,
        title: 'Modern Villa with Pool',
        longitude: 18.8950,
        latitude: 42.2550,
        price: '$850,000.00',
        image: 'https://images.unsplash.com/photo-1600607687931-cebf0746e50e?auto=format&fit=crop&q=80&w=150'
    },
    {
        id: 5,
        title: 'Penthouse Apartment',
        longitude: 18.8400,
        latitude: 42.2900,
        price: '$280,000.00',
        image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=150'
    },
    {
        id: 6,
        title: 'Seaview Studio',
        longitude: 18.8800,
        latitude: 42.2780,
        price: '$65,000.00',
        image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=150'
    }
];

export default function MapPanel() {
    const [activePin, setActivePin] = useState(1);

    return (
        <div className="map-container">
            <Map
                initialViewState={{
                    longitude: 18.8400,
                    latitude: 42.2911,
                    zoom: 12.5
                }}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                mapboxAccessToken={MAPBOX_TOKEN}
                style={{ width: '100%', height: '100%' }}
            >
                <NavigationControl position="top-right" />

                {mapLocations.map((loc) => (
                    <Marker
                        key={loc.id}
                        longitude={loc.longitude}
                        latitude={loc.latitude}
                        anchor="bottom"
                    >
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                setActivePin(loc.id);
                            }}
                            className={`marker-pin ${activePin === loc.id ? 'active' : ''}`}
                        >
                            <img
                                src={loc.image}
                                alt={loc.title}
                                className="marker-image"
                            />
                            <span className="marker-price">
                                {loc.price.split('.')[0]}
                                <span className="marker-price-decimal">.{loc.price.split('.')[1]}</span>
                            </span>
                        </div>
                    </Marker>
                ))}
            </Map>
        </div>
    );
}
