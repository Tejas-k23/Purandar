import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

const hasConfig = Object.values(firebaseConfig).some((value) => Boolean(value));

export const firebaseApp = hasConfig
  ? (getApps()[0] || initializeApp(firebaseConfig))
  : null;

export const initAnalytics = async () => {
  if (!firebaseApp) return null;
  if (typeof window === 'undefined') return null;
  if (!firebaseConfig.measurementId) return null;
  const supported = await isSupported();
  if (!supported) return null;
  return getAnalytics(firebaseApp);
};

export default firebaseApp;
