export const slugify = (value = '') => String(value || '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

export const unslugify = (value = '') => String(value || '')
  .replace(/-/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

export const toTitleCase = (value = '') => String(value || '')
  .toLowerCase()
  .split(' ')
  .map((word) => word ? word[0].toUpperCase() + word.slice(1) : '')
  .join(' ');
