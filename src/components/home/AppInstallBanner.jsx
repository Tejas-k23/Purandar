import React from 'react';
import { Download, Share2, Smartphone, Sparkles } from 'lucide-react';
import usePwaInstallPrompt from '../../hooks/usePwaInstallPrompt';

export default function AppInstallBanner() {
  const {
    canInstall,
    isInstalled,
    needsIosHelp,
    isInstalling,
    promptInstall,
    showIosHelp,
    message,
  } = usePwaInstallPrompt();

  return (
    <section className="app-banner">
      <div className="app-banner-shell">
        <div className={`app-banner-icon ${isInstalled ? 'is-installed' : ''}`}>
          <Smartphone size={22} strokeWidth={1.9} />
        </div>

        <div className="app-banner-copy">
          <div className="app-banner-topline">
            <span className="app-banner-badge">{message.badge}</span>
            <span className="app-banner-hint">
              <Sparkles size={14} />
              Faster access
            </span>
          </div>
          <h2>{isInstalled ? <>Purandar Prime Properties is <span className="heading-accent heading-accent--dark">installed</span></> : <><span className="heading-accent heading-accent--dark">Install</span> Purandar Prime Properties</>}</h2>
          <p>{isInstalled ? message.secondary : message.description}</p>
        </div>

        <div className="app-banner-actions">
          <button
            type="button"
            className={`store-btn ${message.primaryDisabled ? 'store-btn-disabled' : ''}`}
            onClick={promptInstall}
            disabled={message.primaryDisabled}
          >
            {needsIosHelp ? <Share2 size={16} /> : <Download size={16} />}
            {message.primaryLabel}
          </button>
          {!showIosHelp ? <span className="store-meta-title">{isInstalling ? 'Waiting for browser confirmation...' : message.secondary}</span> : null}
        </div>

        {showIosHelp ? (
          <div className="app-banner-steps" role="note" aria-live="polite">
            <div className="app-banner-step">
              <span className="app-banner-step-index">1</span>
              <span>Open this site in Safari.</span>
            </div>
            <div className="app-banner-step">
              <span className="app-banner-step-index">2</span>
              <span>Tap Share, then <strong>Add to Home Screen</strong>.</span>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
