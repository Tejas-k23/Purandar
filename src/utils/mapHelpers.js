import mapboxgl from 'mapbox-gl';
import { VILLAGES } from '../data/villages';

const DEFAULT_ZOOM = 13;
const DEFAULT_MAX_RESULTS = 8;

export function normalizeVillageName(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isSubsequenceMatch(source, query) {
  let queryIndex = 0;

  for (let sourceIndex = 0; sourceIndex < source.length && queryIndex < query.length; sourceIndex += 1) {
    if (source[sourceIndex] === query[queryIndex]) {
      queryIndex += 1;
    }
  }

  return queryIndex === query.length;
}

export function scoreVillageMatch(village, query) {
  const normalizedQuery = normalizeVillageName(query);
  const normalizedName = normalizeVillageName(village?.name);

  if (!normalizedQuery || !normalizedName) {
    return -1;
  }

  if (normalizedName === normalizedQuery) {
    return 1000;
  }

  if (normalizedName.startsWith(normalizedQuery)) {
    return 800 - (normalizedName.length - normalizedQuery.length);
  }

  if (normalizedName.includes(normalizedQuery)) {
    return 600 - normalizedName.indexOf(normalizedQuery);
  }

  const nameTokens = normalizedName.split(' ');
  const tokenStartMatch = nameTokens.findIndex((token) => token.startsWith(normalizedQuery));
  if (tokenStartMatch >= 0) {
    return 500 - tokenStartMatch;
  }

  if (isSubsequenceMatch(normalizedName.replace(/\s/g, ''), normalizedQuery.replace(/\s/g, ''))) {
    return 250 - Math.max(normalizedName.length - normalizedQuery.length, 0);
  }

  return -1;
}

export function searchVillages(query, options = {}) {
  const { limit = DEFAULT_MAX_RESULTS, villages = VILLAGES } = options;
  const normalizedQuery = normalizeVillageName(query);

  if (!normalizedQuery) {
    return [];
  }

  return villages
    .map((village) => ({
      village,
      score: scoreVillageMatch(village, normalizedQuery),
    }))
    .filter((item) => item.score >= 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.village.name.localeCompare(right.village.name);
    })
    .slice(0, limit)
    .map((item) => item.village);
}

export function findVillageByName(name, villages = VILLAGES) {
  const normalizedQuery = normalizeVillageName(name);
  if (!normalizedQuery) {
    return null;
  }

  return villages.find((village) => normalizeVillageName(village.name) === normalizedQuery) || null;
}

export function getVillageCoordinates(name, villages = VILLAGES) {
  const village = findVillageByName(name, villages);
  return village ? { latitude: village.latitude, longitude: village.longitude } : null;
}

export function toLngLat(target) {
  if (!target) {
    return null;
  }

  const longitude = Number(target.longitude);
  const latitude = Number(target.latitude);

  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    return null;
  }

  return [longitude, latitude];
}

export function flyToCoordinates(map, target, options = {}) {
  const center = toLngLat(target);
  if (!map || !center) {
    return false;
  }

  map.flyTo({
    center,
    zoom: options.zoom ?? DEFAULT_ZOOM,
    speed: options.speed ?? 0.9,
    curve: options.curve ?? 1.42,
    essential: options.essential ?? true,
    duration: options.duration ?? 1400,
    easing: options.easing,
    offset: options.offset ?? [0, 0],
    pitch: options.pitch,
    bearing: options.bearing,
  });

  return true;
}

export function flyToVillage(map, village, options = {}) {
  return flyToCoordinates(map, village, options);
}

function buildMarkerElement({ label, className = '', isSelected = false }) {
  const element = document.createElement('button');
  element.type = 'button';
  element.className = ['village-marker', className, isSelected ? 'is-selected' : ''].filter(Boolean).join(' ');
  element.setAttribute('aria-label', label);
  element.innerHTML = '<span class="village-marker__pulse"></span><span class="village-marker__dot"></span>';
  return element;
}

export function placeVillageMarker(map, village, currentMarker = null, options = {}) {
  if (!map || !village) {
    currentMarker?.remove();
    return null;
  }

  currentMarker?.remove();

  const marker = new mapboxgl.Marker({
    element: buildMarkerElement({
      label: `${village.name} marker`,
      className: options.className,
      isSelected: options.isSelected ?? true,
    }),
    anchor: options.anchor ?? 'bottom',
  })
    .setLngLat([village.longitude, village.latitude]);

  if (options.popupHTML) {
    marker.setPopup(new mapboxgl.Popup({ offset: 16 }).setHTML(options.popupHTML));
  }

  if (typeof options.onClick === 'function') {
    marker.getElement().addEventListener('click', options.onClick);
  }

  marker.addTo(map);
  return marker;
}

export function clearMarker(marker) {
  marker?.remove();
  return null;
}

export function buildVillageFeatureCollection(villages = VILLAGES) {
  return {
    type: 'FeatureCollection',
    features: villages.map((village) => ({
      type: 'Feature',
      properties: {
        name: village.name,
        type: village.type,
      },
      geometry: {
        type: 'Point',
        coordinates: [village.longitude, village.latitude],
      },
    })),
  };
}
