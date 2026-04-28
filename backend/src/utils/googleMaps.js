const GOOGLE_MAPS_HOST_PATTERN = /(google\.[a-z.]+|goo\.gl)$/i;

const toNumberOrNull = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const clampLatitude = (value) => (value >= -90 && value <= 90 ? value : null);
const clampLongitude = (value) => (value >= -180 && value <= 180 ? value : null);

const buildResult = ({ mapLink = '', latitude = null, longitude = null } = {}) => ({
  mapLink: String(mapLink || '').trim(),
  latitude: clampLatitude(toNumberOrNull(latitude)),
  longitude: clampLongitude(toNumberOrNull(longitude)),
});

const findCoordinatesInText = (value = '') => {
  const patterns = [
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&]query=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&]ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    /(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/,
  ];

  for (const pattern of patterns) {
    const match = String(value).match(pattern);
    if (match) {
      const latitude = clampLatitude(toNumberOrNull(match[1]));
      const longitude = clampLongitude(toNumberOrNull(match[2]));
      if (latitude !== null && longitude !== null) {
        return { latitude, longitude };
      }
    }
  }

  return null;
};

export const extractGoogleMapsData = (input = '') => {
  const raw = String(input || '').trim();
  if (!raw) {
    return buildResult();
  }

  const directCoordinates = findCoordinatesInText(raw);
  if (!/^https?:\/\//i.test(raw)) {
    return buildResult({
      mapLink: raw,
      latitude: directCoordinates?.latitude ?? null,
      longitude: directCoordinates?.longitude ?? null,
    });
  }

  try {
    const url = new URL(raw);
    const isGoogleMapsLike = GOOGLE_MAPS_HOST_PATTERN.test(url.hostname.replace(/^www\./i, ''));
    const coords = findCoordinatesInText(`${url.href} ${decodeURIComponent(url.pathname)} ${decodeURIComponent(url.search)}`);

    return buildResult({
      mapLink: isGoogleMapsLike ? raw : '',
      latitude: coords?.latitude ?? null,
      longitude: coords?.longitude ?? null,
    });
  } catch (_error) {
    return buildResult({
      mapLink: raw,
      latitude: directCoordinates?.latitude ?? null,
      longitude: directCoordinates?.longitude ?? null,
    });
  }
};
