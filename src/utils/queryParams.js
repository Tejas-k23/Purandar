const budgetRanges = {
  under50l: { minPrice: '', maxPrice: '5000000', budget: 'under50l' },
  from50lto1cr: { minPrice: '5000000', maxPrice: '10000000', budget: 'from50lto1cr' },
  from1crto2cr: { minPrice: '10000000', maxPrice: '20000000', budget: 'from1crto2cr' },
  from2crto5cr: { minPrice: '20000000', maxPrice: '50000000', budget: 'from2crto5cr' },
  above5cr: { minPrice: '50000000', maxPrice: '', budget: 'above5cr' },
};

const areaRanges = {
  under500: { minArea: '', maxArea: '500', area: 'under500' },
  from500to1000: { minArea: '500', maxArea: '1000', area: 'from500to1000' },
  from1000to2000: { minArea: '1000', maxArea: '2000', area: 'from1000to2000' },
  from2000to5000: { minArea: '2000', maxArea: '5000', area: 'from2000to5000' },
  above5000: { minArea: '5000', maxArea: '', area: 'above5000' },
};

export const sanitizeQueryParams = (params = {}) => Object.fromEntries(
  Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null),
);

export const buildSearchQueryString = (params = {}) => {
  const searchParams = new URLSearchParams(sanitizeQueryParams(params));
  return searchParams.toString();
};

export const parseSearchParams = (searchParams) => {
  const entries = Object.fromEntries(searchParams.entries());
  return {
    city: entries.city || '',
    locality: entries.locality || '',
    propertyType: entries.propertyType || '',
    bedrooms: entries.bedrooms || '',
    budget: entries.budget || '',
    area: entries.area || '',
    minPrice: entries.minPrice || '',
    maxPrice: entries.maxPrice || '',
    minArea: entries.minArea || '',
    maxArea: entries.maxArea || '',
    intent: entries.intent || '',
    tenantPreference: entries.tenantPreference || '',
    sort: entries.sort || 'newest',
  };
};

export const getBudgetParams = (value = '') => budgetRanges[value] || {};
export const getAreaParams = (value = '') => areaRanges[value] || {};

export const buildPropertyApiParams = (filters = {}) => sanitizeQueryParams({
  city: filters.city,
  locality: filters.locality,
  propertyType: filters.propertyType,
  bedrooms: filters.bedrooms,
  minPrice: filters.minPrice || getBudgetParams(filters.budget).minPrice,
  maxPrice: filters.maxPrice || getBudgetParams(filters.budget).maxPrice,
  minArea: filters.minArea || getAreaParams(filters.area).minArea,
  maxArea: filters.maxArea || getAreaParams(filters.area).maxArea,
  intent: filters.intent,
  tenantPreference: filters.tenantPreference,
  sort: filters.sort || 'newest',
  limit: filters.limit,
});
