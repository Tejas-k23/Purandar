import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { firebaseApp } from './firebase';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';
const PUSH_SCOPE = '/firebase-cloud-messaging-push-scope';
const TOKEN_STORAGE_KEY = 'fcmToken';

const getFirebaseConfig = () => ({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
});

const sendConfigToServiceWorker = async (registration) => {
  if (!registration) return;
  const config = getFirebaseConfig();
  if (!config.apiKey || !config.projectId || !config.messagingSenderId) return;

  const payload = { type: 'FIREBASE_CONFIG', config };
  if (registration.active) {
    registration.active.postMessage(payload);
    return;
  }

  try {
    const ready = await navigator.serviceWorker.ready;
    ready?.active?.postMessage(payload);
  } catch (_error) {
    // Ignore SW readiness issues
  }
};

const registerMessagingServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: PUSH_SCOPE });
  await sendConfigToServiceWorker(registration);
  return registration;
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
