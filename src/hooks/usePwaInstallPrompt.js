import { useEffect, useMemo, useState } from 'react';

function isStandaloneMode() {
  if (typeof window === 'undefined') return false;

  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function detectIos() {
  if (typeof window === 'undefined') return false;

  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export default function usePwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(isStandaloneMode);
  const [isIos, setIsIos] = useState(detectIos);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowIosHelp(false);
      setIsInstalling(false);
    };

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (event) => {
      setIsInstalled(event.matches || window.navigator.standalone === true);
    };

    setIsIos(detectIos());
    setIsInstalled(isStandaloneMode());

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleDisplayModeChange);
    } else {
      mediaQuery.addListener(handleDisplayModeChange);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);

      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handleDisplayModeChange);
      } else {
        mediaQuery.removeListener(handleDisplayModeChange);
      }
    };
  }, []);

  const canInstall = !isInstalled && Boolean(deferredPrompt);
  const needsIosHelp = !isInstalled && isIos && !deferredPrompt;

  const promptInstall = async () => {
    if (isInstalling) return;
    if (canInstall && deferredPrompt) {
      setIsInstalling(true);

      try {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
      } finally {
        setDeferredPrompt(null);
        setIsInstalling(false);
      }

      return;
    }

    if (needsIosHelp) {
      setShowIosHelp((current) => !current);
    }
  };

  const message = useMemo(() => {
    if (isInstalled) {
      return {
        badge: 'Installed',
        title: 'Purandar Prime Properties is ready on your device',
        description: 'Launch it like an app for faster access to listings, favourites, and enquiries.',
        primaryLabel: 'App Added',
        primaryDisabled: true,
        secondary: 'You can open it directly from your home screen or apps list.',
      };
    }

    if (canInstall) {
      return {
        badge: 'Install App',
        title: 'Download Purandar Prime Properties as an app',
        description: 'Install the PWA for quicker launch, a cleaner full-screen view, and better repeat visits.',
        primaryLabel: isInstalling ? 'Preparing...' : 'Install Now',
        primaryDisabled: isInstalling,
        secondary: 'No Play Store needed. Your browser will install it directly.',
      };
    }

    if (needsIosHelp) {
      return {
        badge: 'Add to Home Screen',
        title: 'Install Purandar Prime Properties on iPhone or iPad',
        description: 'Safari can add this website to your home screen as an app in just a few taps.',
        primaryLabel: showIosHelp ? 'Hide Steps' : 'Show Steps',
        primaryDisabled: false,
        secondary: 'Tap Share in Safari, then choose Add to Home Screen.',
      };
    }

    return {
      badge: 'App Access',
      title: 'Keep Purandar Prime Properties ready for your next visit',
      description: 'Once your browser allows install, this banner will let users add the app in one tap.',
      primaryLabel: 'Check Again',
      primaryDisabled: true,
      secondary: 'Install prompts usually appear after HTTPS deployment and a fresh visit.',
    };
  }, [canInstall, isInstalled, isInstalling, needsIosHelp, showIosHelp]);

  return {
    canInstall,
    isInstalled,
    isInstalling,
    needsIosHelp,
    promptInstall,
    showIosHelp,
    message,
  };
}
