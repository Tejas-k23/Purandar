export const env = {
  apiUrl: import.meta.env.VITE_API_URL || '/api/v1',
  mapboxAccessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '',
};

export default env;
