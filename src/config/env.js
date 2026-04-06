export const env = {
  apiUrl: import.meta.env.VITE_API_URL || '/api/v1',
  mapboxAccessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '',
  msg91WidgetId: import.meta.env.VITE_MSG91_WIDGET_ID || '',
  msg91WidgetToken: import.meta.env.VITE_MSG91_AUTH_KEY || '',
};

export default env;
