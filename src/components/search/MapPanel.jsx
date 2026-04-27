import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bath, BedDouble, MapPin, MoveUpRight, Ruler, X } from 'lucide-react';
import Map, { FullscreenControl, Marker, NavigationControl, Popup } from 'react-map-gl/mapbox';
import { useNavigate } from 'react-router-dom';
import env from '../../config/env';
import { formatCompactPrice } from '../../utils/formatPrice';
import { flyToCoordinates } from '../../utils/mapHelpers';
import { getPropertyImageUrls } from '../../utils/propertyImages';
import SearchBar from './SearchBar';
import './MapPanel.css';

const baseLongitude = 73.98;
const baseLatitude = 18.28;
const isValidCoord = (value) => Number.isFinite(Number(value));

export default function MapPanel({ properties = [], activePropertyId = '', intent = 'sell' }) {
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const items = useMemo(() => properties.slice(0, 12).map((property, index) => {
    const hasCoords = isValidCoord(property.longitude) && isValidCoord(property.latitude);
    return {
      ...property,
      longitude: hasCoords ? Number(property.longitude) : baseLongitude + (index % 4) * 0.02,
      latitude: hasCoords ? Number(property.latitude) : baseLatitude + Math.floor(index / 4) * 0.018,
    };
  }), [properties]);

  const activeProperty = items.find((property) => property._id === activePropertyId);
  const [viewState, setViewState] = useState({
    longitude: activeProperty?.longitude || items[0]?.longitude || (baseLongitude + 0.03),
    latitude: activeProperty?.latitude || items[0]?.latitude || (baseLatitude + 0.02),
    zoom: activeProperty ? 13.2 : 10.5,
  });
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [isPopupDismissed, setIsPopupDismissed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
<<<<<<< Updated upstream

  // Reset dismissal when the hovered property changes
  useEffect(() => {
    setIsPopupDismissed(false);
  }, [activePropertyId]);

  const resolvedSelectedPropertyId = selectedPropertyId || (isPopupDismissed ? '' : activePropertyId);
  const selectedProperty = items.find((property) => property._id === resolvedSelectedPropertyId);
=======
  const selectedProperty = items.find((property) => property._id === selectedPropertyId);
>>>>>>> Stashed changes

  useEffect(() => {
    const map = mapRef.current?.getMap?.();

    if (activeProperty) {
      if (map) {
        flyToCoordinates(map, activeProperty, {
          zoom: 13.2,
          speed: 1.05,
          curve: 1.55,
          duration: 1550,
          essential: true,
          pitch: 8,
        });
      }
    } else if (!activePropertyId && items.length && map) {
      flyToCoordinates(map, items[0], {
        zoom: map.getZoom(),
        speed: 0.9,
        curve: 1.35,
        duration: 1100,
        essential: true,
      });
    }
  }, [activeProperty, activePropertyId, items]);

  useEffect(() => {
    if (!selectedProperty || !mapRef.current) return;

    const map = mapRef.current.getMap();
    const container = map.getContainer();
    const point = map.project([selectedProperty.longitude, selectedProperty.latitude]);

    const popupWidth = 300;
    const popupHeight = 290;
    const sidePadding = 20;
    const bottomGap = 28;
    const topReserved = (isFullscreen ? 110 : 16) + 16;

    const left = point.x - (popupWidth / 2);
    const right = point.x + (popupWidth / 2);
    const top = point.y - popupHeight - bottomGap;
    const bottom = point.y - bottomGap;

    let shiftX = 0;
    let shiftY = 0;

    if (left < sidePadding) {
      shiftX = left - sidePadding;
    } else if (right > container.clientWidth - sidePadding) {
      shiftX = right - (container.clientWidth - sidePadding);
    }

    if (top < topReserved) {
      shiftY = top - topReserved;
    } else if (bottom > container.clientHeight - sidePadding) {
      shiftY = bottom - (container.clientHeight - sidePadding);
    }

    if (shiftX !== 0 || shiftY !== 0) {
      const centerPoint = map.project(map.getCenter());
      const nextCenter = map.unproject([
        centerPoint.x + shiftX,
        centerPoint.y + shiftY,
      ]);

      map.easeTo({
        center: nextCenter,
        duration: 350,
      });
    }
  }, [isFullscreen, selectedProperty]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = document.fullscreenElement;
      const container = mapContainerRef.current;
      setIsFullscreen(Boolean(fullscreenElement && container && (fullscreenElement === container || container.contains(fullscreenElement))));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="map-container" ref={mapContainerRef}>
      {isFullscreen ? (
        <div className="map-expanded-search">
          <SearchBar intent={intent} />
        </div>
      ) : null}
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(event) => setViewState(event.viewState)}
        onDragStart={() => {
          setSelectedPropertyId('');
          setIsPopupDismissed(true);
        }}
        onClick={() => {
          setSelectedPropertyId('');
          setIsPopupDismissed(true);
        }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={env.mapboxAccessToken}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />
        {items.map((property) => (
          <Marker key={property._id} longitude={property.longitude} latitude={property.latitude} anchor="bottom">
            <button
              type="button"
              className={`marker-pin ${activePropertyId === property._id || selectedPropertyId === property._id ? 'active marker-pin-pulse' : ''}`}
              onClick={(event) => {
                event.stopPropagation();
                setSelectedPropertyId(property._id);
                setIsPopupDismissed(false);
                const map = mapRef.current?.getMap?.();
                if (map) {
                  flyToCoordinates(map, property, {
                    zoom: 13.4,
                    speed: 1,
                    curve: 1.48,
                    duration: 1350,
                    essential: true,
                    pitch: 6,
                  });
                }
              }}
            >
              <span className="marker-pin-glow" aria-hidden="true" />
              <img
                src={getPropertyImageUrls(property)[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=300&q=80'}
                alt={property.title}
                className="marker-image"
              />
              <span className="marker-price">INR {Math.round((property.price || 0) / 100000)}L</span>
            </button>
          </Marker>
        ))}
        {selectedProperty ? (
          <Popup
            longitude={selectedProperty.longitude}
            latitude={selectedProperty.latitude}
            anchor="bottom"
            offset={24}
            closeButton={false}
            closeOnClick={true}
            className="property-map-popup"
          >
<<<<<<< Updated upstream
            <div className="map-popup-card">
              <button type="button" className="map-popup-close" onClick={() => {
                setSelectedPropertyId('');
                setIsPopupDismissed(true);
              }} aria-label="Close property preview">
=======
            <div className="map-popup-card" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="map-popup-close" onClick={() => setSelectedPropertyId('')} aria-label="Close property preview">
>>>>>>> Stashed changes
                <X size={14} />
              </button>
              <img
                src={getPropertyImageUrls(selectedProperty)[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80'}
                alt={selectedProperty.title}
                className="map-popup-image"
              />
              <div className="map-popup-body">
                <div className="map-popup-topline">
                  <span className="map-popup-price">{formatCompactPrice(selectedProperty.price)}</span>
                  <span className="map-popup-type">{selectedProperty.propertyType}</span>
                </div>
                <h4 className="map-popup-title">{selectedProperty.title || `${selectedProperty.propertyType} in ${selectedProperty.locality || selectedProperty.city}`}</h4>
                <div className="map-popup-location">
                  <MapPin size={14} />
                  <span>{[selectedProperty.subLocality, selectedProperty.locality, selectedProperty.city].filter(Boolean).join(', ')}</span>
                </div>
                <div className="map-popup-features">
                  {selectedProperty.bedrooms ? <span><BedDouble size={14} /> {selectedProperty.bedrooms} BHK</span> : null}
                  {selectedProperty.bathrooms ? <span><Bath size={14} /> {selectedProperty.bathrooms} Bath</span> : null}
                  <span><Ruler size={14} /> {selectedProperty.totalArea || selectedProperty.plotArea || selectedProperty.carpetArea || '-'} {selectedProperty.areaUnit || 'sq.ft'}</span>
                </div>
                <button type="button" className="map-popup-action" onClick={() => navigate(`/property/${selectedProperty._id}`)}>
                  <span>View Details</span>
                  <MoveUpRight size={14} />
                </button>
              </div>
            </div>
          </Popup>
        ) : null}
      </Map>
      <div className="map-north-indicator" aria-label="North direction">
        <span className="map-north-arrow">↑</span>
        <span className="map-north-label">N</span>
      </div>
    </div>
  );
}
