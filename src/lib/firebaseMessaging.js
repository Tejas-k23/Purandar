import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { firebaseApp } from './firebase';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';
const PUSH_SCOPE = '/firebase-cloud-messaging-push-scope';
const TOKEN_STORAGE_KEY = 'fcmToken';

const registerMessagingServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  return navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: PUSH_SCOPE });
};

export const initMessaging = async () => {
  if (!firebaseApp) return null;
  const supported = await isSupported();
  if (!supported) return null;
  if (!VAPID_KEY) return null;
  if (Notification.permission !== 'granted') return null;

  const registration = await registerMessagingServiceWorker();
  const messaging = getMessaging(firebaseApp);
  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration || undefined,
  });
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
  return token || null;
};

export const requestNotifications = async () => {
  if (!firebaseApp) return null;
  const supported = await isSupported();
  if (!supported) return null;
  if (!VAPID_KEY) return null;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const token = await initMessaging();
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('[FCM] Token', token);
  }
  return token;
};

export const listenToForegroundMessages = (callback) => {
  if (!firebaseApp) return () => {};
  let unsubscribe = () => {};

  isSupported().then((supported) => {
    if (!supported) return;
    const messaging = getMessaging(firebaseApp);
    unsubscribe = onMessage(messaging, callback);
  });

  return () => unsubscribe?.();
};

export const getStoredFcmToken = () => (
  typeof window !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null
);
