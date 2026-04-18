import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Sparkles, Share2 } from 'lucide-react';
import usePwaInstallPrompt from '../../hooks/usePwaInstallPrompt';
import './PwaInstallPopup.css';

const PWA_DISMISSED_KEY = 'purandar:pwa-popup-dismissed';

export default function PwaInstallPopup() {
  const {
    canInstall,
    isInstalled,
    needsIosHelp,
    promptInstall,
    showIosHelp,
  } = usePwaInstallPrompt();

  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem(PWA_DISMISSED_KEY) === 'true';
  });

  useEffect(() => {
    // Show popup after a delay if eligible
    if ((canInstall || needsIosHelp) && !isInstalled && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000); // 5 second delay before showing
      return () => clearTimeout(timer);
    }
  }, [canInstall, needsIosHelp, isInstalled, isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Remember dismissal for 7 days
    localStorage.setItem(PWA_DISMISSED_KEY, 'true');
    setIsDismissed(true);
  };

  const handleInstall = () => {
    promptInstall();
    if (!needsIosHelp) {
      setIsVisible(false);
    }
  };

  if (!isVisible || isInstalled) return null;

  return (
    <div className={`pwa-popup-overlay ${showIosHelp ? 'ios-help-expanded' : ''}`}>
      <div className="pwa-popup-content">
        <button type="button" className="pwa-popup-close" onClick={handleDismiss} aria-label="Dismiss">
          <X size={18} />
        </button>

        <div className="pwa-popup-header">
          <div className="pwa-popup-icon-box">
            <Smartphone size={24} className="pwa-popup-icon" />
            <Sparkles size={14} className="pwa-popup-sparkle" />
          </div>
          <div className="pwa-popup-text">
            <h3>Install Our App</h3>
            <p>Get the best experience on your mobile device</p>
          </div>
        </div>

        <div className="pwa-popup-benefits">
          <div className="pwa-benefit-item">
            <div className="pwa-benefit-dot" />
            <span>Faster browsing & Offline access</span>
          </div>
          <div className="pwa-benefit-item">
            <div className="pwa-benefit-dot" />
            <span>Instant property notifications</span>
          </div>
        </div>

        <div className="pwa-popup-actions">
          <button type="button" className="pwa-install-btn" onClick={handleInstall}>
            {needsIosHelp ? <Share2 size={18} /> : <Download size={18} />}
            <span>{needsIosHelp ? (showIosHelp ? 'Following steps...' : 'Add to Home Screen') : 'Install Now'}</span>
          </button>
        </div>

        {showIosHelp ? (
          <div className="pwa-ios-steps">
            <div className="pwa-ios-step">
              <span className="pwa-step-num">1</span>
              <span>Tap the <strong>Share</strong> button in Safari</span>
            </div>
            <div className="pwa-ios-step">
              <span className="pwa-step-num">2</span>
              <span>Scroll down and select <strong>Add to Home Screen</strong></span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
