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

const waitForWorkerActivation = (registration) => new Promise((resolve) => {
  const worker = registration.installing || registration.waiting || registration.active;
  if (!worker) {
    resolve(registration.active || null);
    return;
  }
  if (worker.state === 'activated') {
    resolve(worker);
    return;
  }
  worker.addEventListener('statechange', () => {
    if (worker.state === 'activated') {
      resolve(worker);
    }
  });
});

const sendConfigToServiceWorker = async (registration) => {
  if (!registration) return;
  const config = getFirebaseConfig();
  if (!config.apiKey || !config.projectId || !config.messagingSenderId) return;

  const payload = { type: 'FIREBASE_CONFIG', config };
  try {
    const worker = registration.active || await waitForWorkerActivation(registration);
    worker?.postMessage(payload);
    // eslint-disable-next-line no-console
    console.info('[Notify] Firebase config posted to messaging service worker.');
  } catch (_error) {
    // eslint-disable-next-line no-console
    console.warn('[Notify] Unable to post Firebase config to service worker.');
  }
};

const registerMessagingServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  const existingRegistration = await navigator.serviceWorker.getRegistration(PUSH_SCOPE);
  const registration = existingRegistration || await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: PUSH_SCOPE });
  await sendConfigToServiceWorker(registration);
  // eslint-disable-next-line no-console
  console.info('[Notify] Messaging service worker ready.', { scope: registration.scope });
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
    // eslint-disable-next-line no-console
    console.info('[Notify] FCM token generated.', {
      tokenPreview: `${token.slice(0, 12)}...`,
    });
  }
  return token || null;
};

export const requestNotifications = async () => {
  if (!firebaseApp) return null;
  const supported = await isSupported();
  if (!supported) return null;
  if (!VAPID_KEY) return null;

  const permission = await Notification.requestPermission();
  // eslint-disable-next-line no-console
  console.info('[Notify] Notification permission request result', permission);
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
