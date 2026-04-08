import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AuthProvider } from './store/authStore.jsx';
import registerServiceWorker from './pwa/registerServiceWorker.js';
import { initAnalytics } from './lib/firebase';
import { initMessaging } from './lib/firebaseMessaging';

registerServiceWorker();
initAnalytics();
initMessaging();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);


