import React, { useEffect, useMemo, useState } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import { MapPin, X } from 'lucide-react';
import env from '../../config/env';
import './MapPickerModal.css';

const baseLongitude = 73.98;
const baseLatitude = 18.28;

export default function MapPickerModal({
  open = false,
  title = 'Select location on map',
  initialLocation,
  onClose,
  onSelect,
}) {
  const hasToken = Boolean(env.mapboxAccessToken);
  const initialView = useMemo(() => ({
    longitude: initialLocation?.longitude ?? baseLongitude,
    latitude: initialLocation?.latitude ?? baseLatitude,
    zoom: initialLocation ? 14 : 11.5,
  }), [initialLocation]);
  const [viewState, setViewState] = useState(initialView);
  const [selected, setSelected] = useState(initialLocation || null);

  useEffect(() => {
    if (open) {
      setViewState(initialView);
      setSelected(initialLocation || null);
    }
  }, [open, initialView, initialLocation]);

  if (!open) return null;

  return (
    <div className="map-picker-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="map-picker-modal">
        <div className="map-picker-header">
          <div>
            <h3>{title}</h3>
            <p>Click anywhere on the map to drop a pin.</p>
          </div>
          <button type="button" className="map-picker-close" onClick={onClose} aria-label="Close map picker">
            <X size={18} />
          </button>
        </div>

        {!hasToken ? (
          <div className="map-picker-empty">
            <p>Map selection is unavailable right now. Please try again later.</p>
            <button type="button" className="map-picker-btn" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="map-picker-body">
              <Map
                {...viewState}
                onMove={(event) => setViewState(event.viewState)}
                onClick={(event) => {
                  const { lng, lat } = event.lngLat;
                  setSelected({ longitude: lng, latitude: lat });
                }}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                mapboxAccessToken={env.mapboxAccessToken}
                style={{ width: '100%', height: '100%' }}
              >
                <NavigationControl position="top-right" />
                {selected ? (
                  <Marker longitude={selected.longitude} latitude={selected.latitude} anchor="bottom">
                    <div className="map-picker-marker">
                      <MapPin size={20} />
                    </div>
                  </Marker>
                ) : null}
              </Map>
            </div>

            <div className="map-picker-footer">
              <div className="map-picker-coords">
                {selected
                  ? `${selected.latitude.toFixed(6)}, ${selected.longitude.toFixed(6)}`
                  : 'No location selected'}
              </div>
              <div className="map-picker-actions">
                <button type="button" className="map-picker-btn secondary" onClick={onClose}>Cancel</button>
                <button
                  type="button"
                  className="map-picker-btn primary"
                  onClick={() => selected && onSelect?.(selected)}
                  disabled={!selected}
                >
                  Use Location
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
