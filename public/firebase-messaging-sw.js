/* eslint-disable no-undef */
/* Firebase Messaging Service Worker */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// TODO: Replace these with your Firebase config (same as VITE_FIREBASE_* values).
const firebaseConfig = {
  apiKey: 'AIzaSyCvsCxnalK_QonAXUXn7YlJ9xFt5W29Xgk',
  authDomain: 'purandar-web.firebaseapp.com',
  projectId: 'purandar-web',
  storageBucket: 'purandar-web.firebasestorage.app',
  messagingSenderId: '462198853743',
  appId: '1:462198853743:web:3287c29022d3dc52dbbd9a',
  measurementId: 'G-HE5GLZH8HX',
};

try {
  firebase.initializeApp(firebaseConfig);
} catch (error) {
  // Ignore duplicate initialization in SW scope
}

const messaging = firebase.messaging();

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
