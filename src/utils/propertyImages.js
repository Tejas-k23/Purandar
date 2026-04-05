const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const isUsableUrl = (value) => {
  if (!isNonEmptyString(value)) return false;
  const trimmed = value.trim();
  if (trimmed.startsWith('blob:')) return false;
  if (trimmed.startsWith('file:')) return false;
  if (trimmed.startsWith('data:')) return false;
  return true;
};

const toUrl = (item) => {
  if (isNonEmptyString(item)) return item;
  if (item && isNonEmptyString(item.url)) return item.url;
  return null;
};

export const getPropertyImageUrls = (property) => {
  const photos = Array.isArray(property?.photos) ? property.photos : [];
  const images = Array.isArray(property?.images) ? property.images : [];
  const combined = [...photos, ...images].map(toUrl).filter(isUsableUrl);

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
