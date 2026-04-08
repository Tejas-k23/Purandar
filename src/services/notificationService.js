import api from './api';

const BROWSER_ID_KEY = 'browserId';

export const getOrCreateBrowserId = () => {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(BROWSER_ID_KEY);
  if (!id) {
    id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(BROWSER_ID_KEY, id);
  }
  return id;
};

export const notificationService = {
  subscribe(payload) {
    return api.post('/notifications/subscribe', payload);
  },

  unsubscribe(token) {
    return api.post('/notifications/unsubscribe', { token });
  },

  updatePreferences(payload) {
    return api.patch('/notifications/preferences', payload);
  },

  getMyNotifications() {
    return api.get('/notifications/me');
  },

  markRead(notificationId) {
    return api.patch(`/notifications/${notificationId}/read`);
  },
};

export default notificationService;
