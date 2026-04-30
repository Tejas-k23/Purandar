import React from 'react';
import './SubscriptionPage.css';

export default function SubscriptionPage() {
  return (
    <div className="subscription-shell">
      <div className="subscription-card">
        <div className="subscription-header">
          <div>
            <p className="subscription-label">Launching Soon</p>
            <h1 className="subscription-title">Free Trial</h1>
          </div>
          <span className="subscription-badge">Launching Soon</span>
        </div>

        <p className="subscription-copy">
          Enjoy a short free trial package before paid plans become available. This is a limited launch offer so you can start listing your first property.
        </p>

        <div className="subscription-summary">
          <div>
            <p className="summary-label">Properties</p>
            <p className="summary-value">1 Property Listing</p>
            <p className="summary-label">Validity</p>
            <p className="summary-value summary-value--small">35 Days</p>
          </div>
          <div className="subscription-sidecard">
            <span className="summary-label">Price</span>
            <p className="price-value">₹0</p>
            <button type="button" disabled className="subscription-button">
              Buy now
            </button>
          </div>
        </div>

        <div className="subscription-footer">
          Paid packages will appear here soon
        </div>
      </div>
    </div>
  );
}
