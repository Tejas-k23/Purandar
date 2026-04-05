const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const toUrl = (item) => {
  if (isNonEmptyString(item)) return item;
  if (item && isNonEmptyString(item.url)) return item.url;
  return null;
};

export const getPropertyImageUrls = (property) => {
  const photos = Array.isArray(property?.photos) ? property.photos : [];
  const images = Array.isArray(property?.images) ? property.images : [];
  const combined = [...photos, ...images].map(toUrl).filter(Boolean);

  if (!combined.length) return [];

  const unique = [];
  const seen = new Set();
  for (const url of combined) {
    if (seen.has(url)) continue;
    seen.add(url);
    unique.push(url);
  }

  return unique;
};

