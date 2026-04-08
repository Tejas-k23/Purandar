import React from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import { MapPin, MapPinned } from 'lucide-react';
import env from '../../config/env';

export default function PropertyMap({ property = {} }) {
  const fallbackLongitude = 73.98;
  const fallbackLatitude = 18.28;
  const longitude = Number.isFinite(property.longitude) ? property.longitude : fallbackLongitude;
  const latitude = Number.isFinite(property.latitude) ? property.latitude : fallbackLatitude;
  const hasCoords = Number.isFinite(property.longitude) && Number.isFinite(property.latitude);

  return (
    <div>
      <h2 className="pd-section-title"><MapPinned size={18} />Location in {property.city}</h2>
      <div className="pd-map-container" style={{ position: 'relative', overflow: 'hidden' }}>
        <Map
          initialViewState={{ longitude, latitude, zoom: hasCoords ? 13.5 : 11.5 }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={env.mapboxAccessToken}
          scrollZoom={true}
          cooperativeGestures={true}
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="top-right" />
          <Marker longitude={longitude} latitude={latitude} anchor="bottom">
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
        {[property.locality, property.subLocality, property.landmark].filter(Boolean).map((tag) => (
          <span key={tag} className="pd-hood-tag">{tag}</span>
        ))}
      </div>
    </div>
  );
}
