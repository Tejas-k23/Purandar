const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const isUsableUrl = (value) => {
  if (!isNonEmptyString(value)) return false;
  const trimmed = value.trim();
  if (trimmed.startsWith('blob:')) return false;
  if (trimmed.startsWith('file:')) return false;
  if (trimmed.startsWith('data:')) return false;
  return true;
};

const toLegacyPath = (value) => {
  if (!isNonEmptyString(value)) return value;
  if (value.includes('/propertys/properties/')) return value;
  if (value.includes('/properties/')) {
    return value.replace('/properties/', '/propertys/properties/');
  }
  if (value.startsWith('properties/')) {
    return value.replace('properties/', 'propertys/properties/');
  }
  return value;
};

const toUrl = (item) => {
  if (isNonEmptyString(item)) return item;
  if (item && isNonEmptyString(item.url)) return item.url;
  return null;
};

export const getPropertyImageUrls = (property) => {
  const photos = Array.isArray(property?.photos) ? property.photos : [];
  const images = Array.isArray(property?.images) ? property.images : [];
  const combined = [...photos, ...images]
    .map(toUrl)
    .filter(isUsableUrl)
    .map(toLegacyPath);

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
