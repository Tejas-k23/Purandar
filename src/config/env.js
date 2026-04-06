export const env = {
  apiUrl: import.meta.env.VITE_API_URL || '/api/v1',
  mapboxAccessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '',
  msg91WidgetId: import.meta.env.VITE_MSG91_WIDGET_ID || '',
  msg91TokenAuth: import.meta.env.VITE_MSG91_TOKEN_AUTH || '',
  msg91ExposeMethods: String(import.meta.env.VITE_MSG91_EXPOSE_METHODS || '').toLowerCase() === 'true',
};

export default env;
