import React from 'react';
import mapboxgl from 'mapbox-gl';
import env from '../../config/env';
import VILLAGES, { VILLAGE_MAP_CENTER } from '../../data/villages';
import useDebounce from '../../hooks/useDebounce';
import {
  buildVillageFeatureCollection,
  clearMarker,
  findVillageByName,
  flyToVillage,
  placeVillageMarker,
  searchVillages,
} from '../../utils/mapHelpers';
import './VillageSearchMap.css';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAP_SOURCE_ID = 'purandar-villages';
const MAP_LAYER_ID = 'purandar-villages-points';
const MAP_HIGHLIGHT_SOURCE_ID = 'purandar-selected-village';
const MAP_HIGHLIGHT_LAYER_ID = 'purandar-selected-village-layer';

function createEmptyFeatureCollection() {
  return { type: 'FeatureCollection', features: [] };
}

function updateGeoJsonSource(map, sourceId, data) {
  const source = map.getSource(sourceId);
  if (source) {
    source.setData(data);
  }
}

export default function VillageSearchMap({
  accessToken = env.mapboxAccessToken,
  initialVillage = '',
  onVillageSelect,
  zoom = 13,
  searchLimit = 8,
  className = '',
}) {
  const mapContainerRef = React.useRef(null);
  const mapRef = React.useRef(null);
  const selectedMarkerRef = React.useRef(null);
  const [query, setQuery] = React.useState(initialVillage);
  const [selectedVillage, setSelectedVillage] = React.useState(() => findVillageByName(initialVillage));
  const [isSuggestionOpen, setIsSuggestionOpen] = React.useState(false);
  const [notFoundMessage, setNotFoundMessage] = React.useState('');
  const debouncedQuery = useDebounce(query, 220);

  const suggestions = React.useMemo(() => searchVillages(debouncedQuery, { limit: searchLimit }), [debouncedQuery, searchLimit]);

  React.useEffect(() => {
    if (!accessToken || mapRef.current || !mapContainerRef.current) {
      return undefined;
    }

    mapboxgl.accessToken = accessToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [VILLAGE_MAP_CENTER.longitude, VILLAGE_MAP_CENTER.latitude],
      zoom: VILLAGE_MAP_CENTER.zoom,
      cooperativeGestures: true,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', () => {
      map.addSource(MAP_SOURCE_ID, {
        type: 'geojson',
        data: buildVillageFeatureCollection(VILLAGES),
      });

      map.addLayer({
        id: MAP_LAYER_ID,
        type: 'circle',
        source: MAP_SOURCE_ID,
        paint: {
          'circle-radius': 5.5,
          'circle-color': '#14532d',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.88,
        },
      });

      map.addSource(MAP_HIGHLIGHT_SOURCE_ID, {
        type: 'geojson',
        data: createEmptyFeatureCollection(),
      });

      map.addLayer({
        id: MAP_HIGHLIGHT_LAYER_ID,
        type: 'circle',
        source: MAP_HIGHLIGHT_SOURCE_ID,
        paint: {
          'circle-radius': 11,
          'circle-color': '#f97316',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.35,
        },
      });

      if (selectedVillage) {
        updateGeoJsonSource(map, MAP_HIGHLIGHT_SOURCE_ID, buildVillageFeatureCollection([selectedVillage]));
        selectedMarkerRef.current = placeVillageMarker(map, selectedVillage, null, {
          className: 'village-marker--primary',
        });
      }
    });

    mapRef.current = map;

    return () => {
      selectedMarkerRef.current = clearMarker(selectedMarkerRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, [accessToken, selectedVillage]);

  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) {
      return;
    }

    updateGeoJsonSource(
      map,
      MAP_HIGHLIGHT_SOURCE_ID,
      selectedVillage ? buildVillageFeatureCollection([selectedVillage]) : createEmptyFeatureCollection(),
    );

    selectedMarkerRef.current = placeVillageMarker(map, selectedVillage, selectedMarkerRef.current, {
      className: 'village-marker--primary',
    });
  }, [selectedVillage]);

  const handleSelectVillage = React.useCallback((village) => {
    const map = mapRef.current;
    setQuery(village.name);
    setSelectedVillage(village);
    setNotFoundMessage('');
    setIsSuggestionOpen(false);

    if (map) {
      flyToVillage(map, village, {
        zoom,
        speed: 1,
        curve: 1.5,
        duration: 1600,
        essential: true,
      });
    }

    onVillageSelect?.(village);
  }, [onVillageSelect, zoom]);

  const handleSubmit = React.useCallback((event) => {
    event.preventDefault();

    const exactMatch = findVillageByName(query);
    if (exactMatch) {
      handleSelectVillage(exactMatch);
      return;
    }

    const [bestMatch] = searchVillages(query, { limit: 1 });
    if (bestMatch) {
      handleSelectVillage(bestMatch);
      return;
    }

    setSelectedVillage(null);
    setNotFoundMessage(`No village found for "${query.trim()}". Try Saswad, Jejuri, Belsar, or Parinche.`);
  }, [handleSelectVillage, query]);

  return (
    <div className={`village-search-map ${className}`.trim()}>
      <form className="village-search-panel" onSubmit={handleSubmit}>
        <label className="village-search-label" htmlFor="village-search-input">Search Purandar village</label>
        <div className="village-search-row">
          <input
            id="village-search-input"
            type="text"
            value={query}
            placeholder="Start typing a village name"
            className="village-search-input"
            onChange={(event) => {
              setQuery(event.target.value);
              setNotFoundMessage('');
              setIsSuggestionOpen(true);
            }}
            onFocus={() => setIsSuggestionOpen(true)}
          />
          <button type="submit" className="village-search-button">Find village</button>
        </div>
        {isSuggestionOpen && debouncedQuery.trim() ? (
          <div className="village-search-dropdown">
            {suggestions.length ? suggestions.map((village) => (
              <button
                key={village.name}
                type="button"
                className={`village-search-option ${selectedVillage?.name === village.name ? 'is-selected' : ''}`}
                onClick={() => handleSelectVillage(village)}
              >
                <span>{village.name}</span>
                <span>{village.type}</span>
              </button>
            )) : (
              <div className="village-search-empty">No matching villages</div>
            )}
          </div>
        ) : null}
        {selectedVillage ? (
          <p className="village-search-meta">
            Selected: <strong>{selectedVillage.name}</strong> ({selectedVillage.type}) at {selectedVillage.latitude}, {selectedVillage.longitude}
          </p>
        ) : null}
        {notFoundMessage ? <p className="village-search-error">{notFoundMessage}</p> : null}
      </form>
      <div ref={mapContainerRef} className="village-search-map__canvas" />
    </div>
  );
}
