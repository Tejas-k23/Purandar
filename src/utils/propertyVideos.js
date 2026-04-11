const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

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

export const getPropertyVideoUrl = (rawUrl = '') => toLegacyPath(rawUrl);
