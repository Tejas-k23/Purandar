import React from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import { MapPin, MapPinned } from 'lucide-react';
import env from '../../config/env';
import { buildGoogleMapsEmbedUrl, buildGoogleMapsSearchUrl } from '../../utils/googleMaps';

export default function PropertyMap({ property = {} }) {
  const fallbackLongitude = 73.98;
  const fallbackLatitude = 18.28;
  const longitude = Number.isFinite(property.longitude) ? property.longitude : fallbackLongitude;
  const latitude = Number.isFinite(property.latitude) ? property.latitude : fallbackLatitude;
  const hasCoords = Number.isFinite(property.longitude) && Number.isFinite(property.latitude);
  const hasDirectMapLink = /^https?:\/\//i.test(property.mapLink || '');
  const searchQuery = [property.flatNo, property.subLocality, property.locality, property.city, property.landmark].filter(Boolean).join(', ');
  const googleMapsUrl = hasDirectMapLink ? property.mapLink : buildGoogleMapsSearchUrl({
    latitude: hasCoords ? property.latitude : null,
    longitude: hasCoords ? property.longitude : null,
    query: searchQuery,
  });
  const googleEmbedUrl = hasDirectMapLink ? property.mapLink : buildGoogleMapsEmbedUrl({
    latitude: hasCoords ? property.latitude : null,
    longitude: hasCoords ? property.longitude : null,
    query: searchQuery,
  });
  const hasMapbox = Boolean(env.mapboxAccessToken) && hasCoords && !hasDirectMapLink;

  return (
    <div>
      <h2 className="pd-section-title"><MapPinned size={18} />Location in {property.city}</h2>
      <div className="pd-map-container" style={{ position: 'relative', overflow: 'hidden' }}>
        {hasMapbox ? (
          <Map
            initialViewState={{ longitude, latitude, zoom: hasCoords ? 13.5 : 11.5 }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={env.mapboxAccessToken}
            scrollZoom={true}
            cooperativeGestures={false}
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
        ) : (
          <iframe
            title="Property map"
            src={googleEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ width: '100%', height: '100%', border: 0 }}
          />
        )}
      </div>
      {googleMapsUrl ? (
        <div className="pd-map-actions">
          <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="pd-map-google-btn">
            <img src="https://www.google.com/images/branding/product/2x/maps_96dp.png" alt="" width="20" height="20" />
            <span>View on Google Maps</span>
          </a>
        </div>
      ) : null}
      <div className="pd-neighborhood-tags">
        {[property.locality, property.subLocality, property.landmark].filter(Boolean).map((tag) => (
          <span key={tag} className="pd-hood-tag">{tag}</span>
        ))}
      </div>
    </div>
  );
}
