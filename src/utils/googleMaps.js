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

const GOOGLE_MAPS_HOST_PATTERN = /(google\.[a-z.]+|goo\.gl)$/i;

export function extractGoogleMapsData(input = '') {
  const raw = String(input || '').trim();
  if (!raw) {
    return { mapLink: '', latitude: null, longitude: null };
  }

  const patterns = [
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&]query=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&]ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    /(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/,
  ];

  const findCoords = (value) => {
    for (const pattern of patterns) {
      const match = String(value || '').match(pattern);
      if (match) {
        const normalized = normalizeCoordinates(match[1], match[2]);
        if (normalized) return normalized;
      }
    }
    return null;
  };

  const direct = findCoords(raw);
  if (!/^https?:\/\//i.test(raw)) {
    return {
      mapLink: raw,
      latitude: direct?.latitude ?? null,
      longitude: direct?.longitude ?? null,
    };
  }

  try {
    const url = new URL(raw);
    const isGoogleMapsLink = GOOGLE_MAPS_HOST_PATTERN.test(url.hostname.replace(/^www\./i, ''));
    const extracted = findCoords(`${url.href} ${decodeURIComponent(url.pathname)} ${decodeURIComponent(url.search)}`);
    return {
      mapLink: isGoogleMapsLink ? raw : '',
      latitude: extracted?.latitude ?? null,
      longitude: extracted?.longitude ?? null,
    };
  } catch (_error) {
    return {
      mapLink: raw,
      latitude: direct?.latitude ?? null,
      longitude: direct?.longitude ?? null,
    };
  }
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
