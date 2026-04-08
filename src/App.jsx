import React, { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import AppRoutes from './routes/AppRoutes';
import './App.css';
import { listenToForegroundMessages } from './lib/firebaseMessaging';

function AppShell() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    const unsubscribe = listenToForegroundMessages((payload) => {
      const title = payload?.notification?.title || 'Purandar Estate';
      const body = payload?.notification?.body || payload?.data?.body || '';
      if (Notification.permission === 'granted') {
        // eslint-disable-next-line no-new
        new Notification(title, { body });
      }
    });
    return () => unsubscribe?.();
  }, []);

  return (
    <div className="app-container">
      <div className="main-wrapper">
        {!isAdminRoute ? <Navbar /> : null}
        <div className="main-content">
          <AppRoutes />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;

