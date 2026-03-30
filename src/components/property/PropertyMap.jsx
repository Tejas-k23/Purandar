import React from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import { MapPin } from 'lucide-react';

const MAPBOX_TOKEN = 'pk.eyJ1IjoidGVqYXNrdW1iaGFya2FyIiwiYSI6ImNtbjczZmFpNjA5aGcycHBkb241NjZxc3cifQ.WKiUvhVInqaURt9a24nZvw';

export default function PropertyMap({ property = {} }) {
    const {
        locality = 'Koregaon Park',
        city = 'Pune',
        landmark = 'Osho Ashram',
    } = property;

    // Center coordinates for Koregaon Park, Pune (approx)
    const longitude = 73.8906;
    const latitude = 18.5362;

    const neighborhoodTags = [
        `Near ${landmark}`,
        '5 min from main road',
        'Close to tech park',
        'Prestigious locality'
    ];

    return (
        <div>
            <h2 className="pd-section-title">Location in {city}</h2>

            <div className="pd-map-container" style={{ position: 'relative', overflow: 'hidden' }}>
                <Map
                    initialViewState={{
                        longitude,
                        latitude,
                        zoom: 14
                    }}
                    mapStyle="mapbox://styles/mapbox/streets-v12"
                    mapboxAccessToken={MAPBOX_TOKEN}
                    scrollZoom={true}
                    cooperativeGestures={true}
                    style={{ width: '100%', height: '100%' }}
                >
                    <NavigationControl position="top-right" />
                    
                    <Marker
                        longitude={longitude}
                        latitude={latitude}
                        anchor="bottom"
                    >
                        <div className="pd-map-marker">
                            <div className="pd-marker-inner">
                                <MapPin size={20} color="white" fill="var(--indigo-600)" />
                            </div>
                            <div className="pd-marker-pulse" />
                        </div>
                    </Marker>
                </Map>
            </div>

            <div className="pd-neighborhood-tags">
                {neighborhoodTags.map(tag => (
                    <span key={tag} className="pd-hood-tag">
                        📍 {tag}
                    </span>
                ))}
            </div>
        </div>
    );
}
