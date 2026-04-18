import React, { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import AppRoutes from './routes/AppRoutes';
import './App.css';
import { listenToForegroundMessages } from './lib/firebaseMessaging';
import { syncNotificationRegistration } from './services/notificationService';
import useAuth from './hooks/useAuth';

const NOTIFICATION_PROMPT_KEY = 'purandar:notification-prompted';

function AppShell() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    const unsubscribe = listenToForegroundMessages((payload) => {
      const title = payload?.notification?.title || 'Purandar Prime Propertys';
      const body = payload?.notification?.body || payload?.data?.body || '';
      if (Notification.permission === 'granted') {
        // eslint-disable-next-line no-new
        new Notification(title, { body });
      }
    });
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    const maybePromptNotifications = async () => {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      if (Notification.permission !== 'default') return;
      if (sessionStorage.getItem(NOTIFICATION_PROMPT_KEY) === 'true') return;

      sessionStorage.setItem(NOTIFICATION_PROMPT_KEY, 'true');
      try {
        await syncNotificationRegistration({
          role: isAuthenticated ? (user?.role || 'user') : 'guest',
          requestPermission: true,
        });
      } catch {
        // Ignore notification prompt failures.
      }
    };

    maybePromptNotifications();
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    const syncExistingPermission = async () => {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      if (Notification.permission !== 'granted') return;

      try {
        await syncNotificationRegistration({
          role: isAuthenticated ? (user?.role || 'user') : 'guest',
        });
      } catch {
        // Ignore background sync failures.
      }
    };

    syncExistingPermission();
  }, [isAuthenticated, user?.role]);

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
