export function normalizeCoordinates(latitude, longitude) {
  const nextLatitude = Number(latitude);
  const nextLongitude = Number(longitude);

  if (!Number.isFinite(nextLatitude) || !Number.isFinite(nextLongitude)) {
    return null;
  }

  return {
    latitude: nextLatitude,
    longitude: nextLongitude,
  };
}

export function buildGoogleMapsSearchUrl({ latitude, longitude, query } = {}) {
  const coords = normalizeCoordinates(latitude, longitude);
  if (coords) {
    return `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`;
  }

  const text = String(query || '').trim();
  if (!text) {
    return '';
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}`;
}

export function buildGoogleMapsEmbedUrl({ latitude, longitude, query } = {}) {
  const coords = normalizeCoordinates(latitude, longitude);
  if (coords) {
    return `https://maps.google.com/maps?q=${coords.latitude},${coords.longitude}&z=14&output=embed`;
  }

  const text = String(query || '').trim();
  if (!text) {
    return '';
  }

  return `https://maps.google.com/maps?q=${encodeURIComponent(text)}&z=14&output=embed`;
}
