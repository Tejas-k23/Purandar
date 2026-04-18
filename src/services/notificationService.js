import api from './api';
import { initMessaging, requestNotifications } from '../lib/firebaseMessaging';

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

export const syncNotificationRegistration = async ({
  role = 'guest',
  requestPermission = false,
} = {}) => {
  if (typeof window === 'undefined' || !('Notification' in window)) {

    return { ok: false, reason: 'unsupported', permission: 'unsupported', token: null };
  }

  const permissionBefore = Notification.permission;


  let token = null;
  if (requestPermission) {
    token = await requestNotifications();
  } else if (permissionBefore === 'granted') {
    token = await initMessaging();
  }

  const permissionAfter = Notification.permission;


  if (!token) {

    return { ok: false, reason: 'no_token', permission: permissionAfter, token: null };
  }

  await notificationService.subscribe({
    token,
    role,
    browserId: getOrCreateBrowserId(),
    platform: 'web-pwa',
    permission: permissionAfter,
  });



  return { ok: true, reason: 'subscribed', permission: permissionAfter, token };
};

export default notificationService;
