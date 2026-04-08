/* eslint-disable no-undef */
/* Firebase Messaging Service Worker */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

let firebaseInitialized = false;
let messaging = null;

const initializeFirebase = (config) => {
  if (!config || firebaseInitialized) return;
  try {
    firebase.initializeApp(config);
    firebaseInitialized = true;
  } catch (error) {
    // Ignore duplicate initialization in SW scope
  }
};

const ensureMessaging = () => {
  if (messaging || !firebaseInitialized) return;
  messaging = firebase.messaging();
  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || 'Purandar Estate';
    const options = {
      body: payload.notification?.body || payload.data?.body || 'You have a new notification.',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      data: payload.data || {},
    };

    self.registration.showNotification(title, options);
  });
};

self.addEventListener('message', (event) => {
  const { type, config } = event.data || {};
  if (type !== 'FIREBASE_CONFIG') return;
  initializeFirebase(config);
  ensureMessaging();
});
